import bpy, sys, glob
for f in sys.argv[sys.argv.index('--')+1:]:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=f)
    print('==', f)
    for o in bpy.data.objects:
        d = o.dimensions
        extra = ''
        if o.type == 'MESH': extra = f'verts={len(o.data.vertices)} faces={len(o.data.polygons)} vg={len(o.vertex_groups)} mats={[m.name for m in o.data.materials]}'
        if o.type == 'ARMATURE': extra = f'bones={len(o.data.bones)} first={[b.name for b in o.data.bones][:6]}'
        print(o.type, o.name, [round(x,2) for x in d], [round(x,2) for x in o.location], [round(x,2) for x in o.rotation_euler], [round(x,3) for x in o.scale], extra)
    print('actions', [a.name for a in bpy.data.actions])
