import bpy,sys
src,dst=sys.argv[sys.argv.index('--')+1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=src)
ob=[o for o in bpy.data.objects if o.type=='MESH'][0]
bpy.context.view_layer.objects.active=ob;ob.select_set(True)
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
me=ob.data;print('verts',len(me.vertices),'polys',len(me.polygons),'dims',[round(v,3) for v in ob.dimensions])
for m in me.materials:
    print('mat',m.name,[n.type+':'+(n.image.name if getattr(n,'image',None) else '') for n in m.node_tree.nodes])
bpy.ops.export_scene.gltf(filepath=dst,export_format='GLB',use_selection=True,export_yup=True,export_apply=True,export_image_format='NONE',export_materials='EXPORT')
