import bpy,sys,glob
U='/mnt/user-data/uploads/'
fs=sorted(glob.glob(U+'dong-tac/_nguon_fbx/*.fbx'))+[U+'_KHO-CHUNG/nhan-vat/_moi/Pistol Aim.fbx',U+'_KHO-CHUNG/nhan-vat/_moi/Waving (1).fbx',U+'_KHO-CHUNG/nhan-vat/LinhQDVN1972/Sitting Idle.fbx',U+'_KHO-CHUNG/nhan-vat/LinhQDVN1972/Male Sitting Pose.fbx']+sorted(glob.glob('/home/claude/v13/in/lb/standing*.fbx'))
for f in fs:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    try: bpy.ops.import_scene.fbx(filepath=f)
    except Exception as e: print('ERR',f,e); continue
    arm=[o for o in bpy.data.objects if o.type=='ARMATURE']
    a=bpy.data.actions[0] if bpy.data.actions else None
    hz=None
    if arm and a:
        bpy.context.scene.frame_set(int(a.frame_range[0])); hz=(arm[0].matrix_world@arm[0].pose.bones['mixamorig:Hips'].head).z if 'mixamorig:Hips' in arm[0].pose.bones else None
    print('RES',f.split('/')[-1], a.frame_range[:] if a else None, len(arm[0].data.bones) if arm else 0, round(hz,3) if hz else None, [o.type for o in bpy.data.objects if o.type=='MESH'])
