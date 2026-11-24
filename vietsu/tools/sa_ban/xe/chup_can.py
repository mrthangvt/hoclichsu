import bpy, sys, math, mathutils
out, files = sys.argv[1], sys.argv[2:]
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.samples = 20
sc.render.resolution_x, sc.render.resolution_y = 640, 400
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (0.75, 0.77, 0.8, 1)
sun = bpy.data.lights.new('s', 'SUN'); sun.energy = 3.5; so = bpy.data.objects.new('s', sun); sc.collection.objects.link(so); so.rotation_euler = (math.radians(50), 0, math.radians(35))
bpy.ops.mesh.primitive_plane_add(size=200)
cam = bpy.data.cameras.new('c'); cam.lens = 40; co = bpy.data.objects.new('c', cam); sc.collection.objects.link(co); sc.camera = co
x=0
for f in files:
    bpy.ops.import_scene.gltf(filepath=f)
    for o in bpy.context.selected_objects:
        if o.parent is None: o.location.x += x
    for k, (p, t) in {'phai': ((x+9, 2, 2.6), (x, 0.3, 1.5)), 'trai': ((x-9, -2, 2.6), (x, 0.3, 1.5)), 'truoc': ((x+4, -11, 3.5), (x, 0, 1.2))}.items():
        co.location = p; d = mathutils.Vector(t) - co.location; co.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = f'{out}_{x//40}_{k}.png'; bpy.ops.render.render(write_still=True)
    x += 40
