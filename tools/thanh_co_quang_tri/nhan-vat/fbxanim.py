import bpy,sys
for f in sys.argv[sys.argv.index('--')+1:]:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=f,automatic_bone_orientation=False)
    arm=[o for o in bpy.data.objects if o.type=='ARMATURE'][0];act=arm.animation_data.action
    sc=bpy.context.scene;fr=act.frame_range;W=arm.matrix_world
    out='/home/claude/nv/anim/'+f.split('/')[-1].replace('.fbx','').replace(' ','_').replace('(','').replace(')','')+'.glb'
    for o in bpy.data.objects:
        if o.type!='ARMATURE':o.select_set(False)
    rep=[]
    for t in [fr[0],(fr[0]+fr[1])/2,fr[1]]:
        sc.frame_set(int(t));pb=arm.pose.bones
        g=lambda n:[round(v,2) for v in (W@pb[n].head)]
        rep.append((int(t),'hips',g('mixamorig:Hips'),'head',g('mixamorig:Head'),'Rhand',g('mixamorig:RightHand'),'Lhand',g('mixamorig:LeftHand'),'Lfoot',g('mixamorig:LeftFoot')))
    print('==',out.split('/')[-1],'frames',fr[:],'fps',sc.render.fps);[print('  ',r) for r in rep]
    bpy.ops.export_scene.gltf(filepath=out,export_format='GLB',export_animations=True,export_skins=True,export_yup=True,export_force_sampling=True,export_animation_mode='ACTIVE_ACTIONS')
