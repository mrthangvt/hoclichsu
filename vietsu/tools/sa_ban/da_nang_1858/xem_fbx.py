import bpy,sys
f=sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=f)
for o in bpy.data.objects:
    s=o.type+' '+o.name
    if o.type=='MESH': s+=f' v={len(o.data.vertices)} f={len(o.data.polygons)} vg={len(o.vertex_groups)} dims={tuple(round(x,2) for x in o.dimensions)} par={o.parent.name if o.parent else None}'
    if o.type=='ARMATURE': s+=f' bones={len(o.data.bones)} '+','.join(b.name for b in o.data.bones)[:900]+f' anim={o.animation_data.action.name if o.animation_data and o.animation_data.action else None}'
    print(s, 'scale',tuple(round(x,3) for x in o.scale), 'rot', tuple(round(x,2) for x in o.rotation_euler))
print('actions',[(a.name,a.frame_range[:]) for a in bpy.data.actions])
