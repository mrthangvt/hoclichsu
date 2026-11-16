"""Xuất dữ liệu web từ ThanhCoQuangTri_1972_GD8.blend (chạy trong Blender: Scripting → Run Script).

Tạo trong OUT các file CHƯA nén: static.glb, thuvien.glb, rai.json, thuyen.glb, qdnd.glb, vnch.glb.
Sau đó nén và chép vào repo:
    for f in static thuvien thuyen qdnd vnch; do gltf-transform meshopt OUT/$f.glb vietsu/static/khong-gian/thanh-co-quang-tri/models/$f.glb; done
    cp OUT/rai.json vietsu/static/khong-gian/thanh-co-quang-tri/data/
KHÔNG dùng `gltf-transform optimize` (làm mất UV và tên vật liệu).
"""
import bpy, os, json

OUT = '/Volumes/xMABUx/99_CA_NHAN/Hoc-lich-su/ThanhCoQT_web/demo8'
os.makedirs(OUT, exist_ok=True)
vl = bpy.context.view_layer


def lc_find(lc, name):
    if lc.name == name:
        return lc
    for c in lc.children:
        r = lc_find(c, name)
        if r:
            return r


def select(objs):
    for o in vl.objects:
        o.select_set(False)
    for o in objs:
        o.hide_set(False)
        o.select_set(True)
    vl.objects.active = objs[0]


COMMON = dict(export_format='GLB', use_selection=True, export_apply=True, export_yup=True,
              export_texcoords=True, export_normals=True)

# ---------- 1. Cảnh tĩnh ----------
T = bpy.data.objects['DiaHinh_ChienTruong']
T.data.color_attributes.active_color = T.data.color_attributes['Col']
H = bpy.data.objects['HoBom_VienDat_GD5']
H.data.color_attributes.active_color = H.data.color_attributes['Scorch']
names = ['BaoCat_CongSu', 'CayChay', 'Cong_Hau_Bac', 'Cong_Huu_Tay', 'Cong_Ta_Dong', 'DamGo_XaSat', 'DatXa_ChanTroi',
         'DayThepGai', 'DiaHinh_ChienTruong', 'MatNuoc_Song_Hao', 'MayBay_CuongKich_1', 'MayBay_CuongKich_2',
         'ThapNuoc_Thep', 'XacXeTang_0', 'XacXeTang_0_thap', 'XacXeTang_1', 'XacXeTang_1_thap',
         'TuongThanh_Vo_GD4', 'TuongThanh_MangSap_GD4', 'CongTien_Than', 'CongTien_ChiTiet', 'CongTien_MaiDuoi',
         'CongTien_MaiTren', 'CongTien_BoNoc', 'HoBom_VienDat_GD5', 'ThapSat_QuanSat_GD5', 'ThapSat_QuanSat_GD5_SanGo',
         'ThapSat_Gay_GD5', 'ThapSat_Gay_GD5_SanGo']
names += ['NhaDan_1972']
names += [o.name for o in bpy.data.objects if o.name.startswith('NhaDoNat_')
          or (o.name.startswith('XeTang_VNCH_') and not o.name.endswith('lua_phao'))]
select([bpy.data.objects[n] for n in names])
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'static.glb'), export_animations=False,
                          export_image_format='NONE', export_vertex_color='ACTIVE', **COMMON)

# ---------- 2. Thư viện đổ nát + danh sách instance (rai.json) ----------
lc = lc_find(vl.layer_collection, '09_GD5_ThuVien')
lc.exclude = False
for ch in lc.children:
    ch.exclude = False
select(list(bpy.data.collections['09_GD5_ThuVien'].all_objects))
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'thuvien.glb'), export_animations=False,
                          export_image_format='NONE', export_vertex_color='ACTIVE', **COMMON)
lc.exclude = True
dg = bpy.context.evaluated_depsgraph_get()
ob = bpy.data.objects['RaiDoNat_GD5']
idx, lst, items = {}, [], []
for inst in dg.object_instances:
    if inst.is_instance and inst.parent and inst.parent.original == ob:
        n = inst.object.original.name
        if n not in idx:
            idx[n] = len(lst)
            lst.append(n)
        loc, q, s = inst.matrix_world.decompose()
        items.append([idx[n], round(loc.x, 2), round(loc.y, 2), round(loc.z, 2),
                      round(q.x, 3), round(q.y, 3), round(q.z, 3), round(q.w, 3), round(s.x, 3)])
json.dump({'names': lst, 'items': items}, open(os.path.join(OUT, 'rai.json'), 'w'), separators=(',', ':'))

# ---------- 3. Thuyền + mái chèo ----------
B, P = bpy.data.objects['Thuyen'], bpy.data.objects['MaiCheo']
keep = {o: o.location.copy() for o in (B, P)}
for o in (B, P):
    o.location = (0, 0, 0)
select([B, P])
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'thuyen.glb'), export_animations=False,
                          export_image_format='WEBP', **COMMON)
for o, l in keep.items():
    o.location = l

# ---------- 4. Nhân vật QĐND (mẫu mới từ NhanVat_Mixamo, rig Rig_QDND_Moi) + toàn bộ clip (NLA tracks) ----------
# Rig_QDND_Moi có hệ trục xương khác rig VNCH, nên mỗi phe xuất kèm bộ clip riêng.
# Clip của rig mới được chuyển từ rig cũ bằng text block "retarget_qdnd.py" trong file .blend.
lc = lc_find(vl.layer_collection, '00_ThuVien_NhanVat')
lc.exclude = False
rig = bpy.data.objects['Rig_QDND_Moi']
select([rig] + list(rig.children))
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'qdnd.glb'), export_animations=True,
                          export_animation_mode='NLA_TRACKS', export_skins=True,
                          export_image_format='WEBP', export_image_quality=82, **COMMON)

# ---------- 5. Nhân vật VNCH + clip riêng ----------
rig = bpy.data.objects['Rig_VNCH']
select([rig] + list(rig.children))
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'vnch.glb'), export_animations=True,
                          export_animation_mode='NLA_TRACKS', export_skins=True, export_image_format='WEBP', **COMMON)
lc.exclude = True
print('Xong:', sorted(os.listdir(OUT)))
