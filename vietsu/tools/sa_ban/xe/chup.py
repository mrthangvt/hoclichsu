"""Chụp 3 góc (trước-trái, bên, trên) cho một hay nhiều GLB đặt cạnh nhau. python3 chup.py ra.png a.glb b.glb ..."""
import bpy, sys, math, mathutils
out, files = sys.argv[1], sys.argv[2:]
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.samples = 24; sc.cycles.device = 'CPU'
sc.render.resolution_x, sc.render.resolution_y = 900, 560; sc.render.film_transparent = False
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (0.72, 0.74, 0.78, 1); w.node_tree.nodes['Background'].inputs[1].default_value = 0.9
x = 0; objs = []
for f in files:
    bpy.ops.import_scene.gltf(filepath=f)
    for o in bpy.context.selected_objects:
        if o.parent is None: o.location.x += x
    x += 6
bpy.ops.mesh.primitive_plane_add(size=200); g = bpy.context.object; mg = bpy.data.materials.new('g'); mg.diffuse_color = (0.5, 0.48, 0.42, 1); g.data.materials.append(mg)
sun = bpy.data.lights.new('s', 'SUN'); sun.energy = 3.5; so = bpy.data.objects.new('s', sun); sc.collection.objects.link(so); so.rotation_euler = (math.radians(50), 0, math.radians(35))
cam = bpy.data.cameras.new('c'); cam.lens = 45; co = bpy.data.objects.new('c', cam); sc.collection.objects.link(co); sc.camera = co
cx = (len(files) - 1) * 3
views = {'truoc': (cx - 9, -14 - 2*len(files), 6), 'ben': (cx + 16 + 3*len(files), 0, 3), 'tren': (cx + 0.01, -0.01, 22 + 4*len(files))}
for k, p in views.items():
    co.location = p; d = mathutils.Vector((cx, 0, 1.2)) - co.location; co.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = out.replace('.png', f'_{k}.png'); bpy.ops.render.render(write_still=True)
