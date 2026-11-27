import bpy, sys, math, mathutils, os
f, out = sys.argv[1], sys.argv[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.samples = 8
sc.render.resolution_x, sc.render.resolution_y = 220, 300
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (0.8, 0.82, 0.85, 1)
bpy.ops.import_scene.gltf(filepath=f)
arm = [o for o in bpy.data.objects if o.type == 'ARMATURE'][0]
bpy.ops.mesh.primitive_plane_add(size=20)
sun = bpy.data.lights.new('s', 'SUN'); sun.energy = 3; so = bpy.data.objects.new('s', sun); sc.collection.objects.link(so); so.rotation_euler = (math.radians(45), 0, math.radians(30))
cam = bpy.data.cameras.new('c'); cam.lens = 35; co = bpy.data.objects.new('c', cam); sc.collection.objects.link(co); sc.camera = co
co.location = (2.6, -3.6, 1.6); d = mathutils.Vector((0, 0, 0.85)) - co.location; co.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
ad = arm.animation_data
for t in ad.nla_tracks: t.mute = True
acts = sorted({s.action for t in ad.nla_tracks for s in t.strips}, key=lambda a: a.name)
os.makedirs(out, exist_ok=True); names = []
for a in acts:
    ad.action = a
    try: ad.action_slot = a.slots[0]
    except Exception: pass
    f0, f1 = a.frame_range
    for k, fr in enumerate((f0, (f0 + f1) / 2, f1)):
        sc.frame_set(int(fr)); sc.render.filepath = f'{out}/{a.name}_{k}.png'; bpy.ops.render.render(write_still=True)
    names.append(a.name)
print('ACTS', names)
