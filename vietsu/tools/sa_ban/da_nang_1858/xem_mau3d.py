import bpy, sys, math, mathutils
args = sys.argv[sys.argv.index('--')+1:]
f, out = args[0], args[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
import sys; sys.path.insert(0,"/tmp"); from imp import nap
nap(f)
if False:
    with bpy.data.libraries.load(f) as (src, dst): dst.objects = src.objects
    for o in dst.objects:
        if o: bpy.context.scene.collection.objects.link(o)
else: pass
objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
import numpy as np
mn = np.array([1e9]*3); mx = -mn
for o in objs:
    for c in o.bound_box:
        w = o.matrix_world @ mathutils.Vector(c); mn = np.minimum(mn, w); mx = np.maximum(mx, w)
print('bbox', mn, mx, [o.name for o in objs], [o.type for o in bpy.context.scene.objects])
ctr = (mn + mx) / 2; size = (mx - mn).max()
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.samples = 8; sc.render.resolution_x = 400; sc.render.resolution_y = 400
sc.world = bpy.data.worlds.new('w'); sc.world.color = (0.8, 0.8, 0.8)
ld = bpy.data.lights.new('l', 'SUN'); ld.energy = 4; lo = bpy.data.objects.new('l', ld); sc.collection.objects.link(lo); lo.rotation_euler = (0.6, 0.3, 0.5)
cam = bpy.data.objects.new('c', bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.type = 'ORTHO'; cam.data.ortho_scale = size * 1.1
for name, d in [('front_negY', (0, -1, 0)), ('top', (0, 0, 1)), ('side_posX', (1, 0, 0))]:
    dv = mathutils.Vector(d); cam.location = mathutils.Vector(ctr) + dv * size * 2
    cam.rotation_euler = (-dv).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = f'{out}_{name}.png'; bpy.ops.render.render(write_still=True)
