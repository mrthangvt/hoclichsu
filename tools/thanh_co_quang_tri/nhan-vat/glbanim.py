import json,struct,sys
import numpy as np
def load(f):
    b=open(f,'rb').read();L=struct.unpack('<I',b[12:16])[0];j=json.loads(b[20:20+L]);off=20+L
    BL=struct.unpack('<I',b[off:off+4])[0];bin_=b[off+8:off+8+BL];return j,bin_
CT={5126:('f4',4),5123:('u2',2),5121:('u1',1),5122:('i2',2),5120:('i1',1)}
NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def acc(j,bin_,i):
    a=j['accessors'][i];bv=j['bufferViews'][a['bufferView']];dt,sz=CT[a['componentType']];n=NC[a['type']]
    o=bv.get('byteOffset',0)+a.get('byteOffset',0);arr=np.frombuffer(bin_,dtype=np.dtype(dt),count=a['count']*n,offset=o).reshape(a['count'],n).astype('f8')
    if a.get('normalized'):
        arr/= {5122:32767,5120:127,5123:65535,5121:255}[a['componentType']]
    return arr
def clip(j,bin_,name,keep_pos=('Hips',),rename=None):
    an=[a for a in j['animations'] if a['name']==name][0];tracks=[];dur=0
    for ch in an['channels']:
        s=an['samplers'][ch['sampler']];node=j['nodes'][ch['target']['node']]['name'];path=ch['target']['path']
        if path=='scale':continue
        bone=node.replace(':','')
        if path=='translation' and not any(k in node for k in keep_pos):continue
        t=acc(j,bin_,s['input'])[:,0];v=acc(j,bin_,s['output'])
        dur=max(dur,float(t[-1]))
        tracks.append({'name':bone+('.quaternion' if path=='rotation' else '.position'),'type':'quaternion' if path=='rotation' else 'vector','times':[round(x,4) for x in t.tolist()],'values':[round(x,5) for x in v.flatten().tolist()]})
    return {'name':rename or name,'duration':dur,'tracks':tracks}
if __name__=='__main__':
    j,b=load(sys.argv[1]);print([a['name'] for a in j['animations']])
