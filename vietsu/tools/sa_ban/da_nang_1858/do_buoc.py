import json,base64,numpy as np,sys
for ten in sys.argv[1:]:
  d=json.load(open(f'goi/nv/x_{ten}.json')); q=d['q']
  for cn in ('di','chay','khieng','vac'):
    c=d['clips'].get(cn)
    if not c: continue
    F=[np.frombuffer(base64.b64decode(p),dtype=np.int16).astype(np.float32).reshape(-1,3)*q for p in c['pos']]
    n=len(F); fps=c['fps']; v=[]
    for i in range(n):
      a,b=F[i],F[(i+1)%n]; ymin=min(a[:,1].min(),b[:,1].min())
      m=(a[:,1]<ymin+0.03)&(b[:,1]<ymin+0.03)
      if m.sum()>5: v.append(-np.median(b[m,2]-a[m,2])*fps)
    v=np.array(v); print(ten,cn,'khung',n,'fps',fps,'chu ky %.2fs'%(n/fps),'v chân %.2f m/s'%np.median(v[v>0.2]) if (v>0.2).any() else v)
