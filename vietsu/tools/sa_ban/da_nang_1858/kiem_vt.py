import json, numpy as np, math
Z=np.load('Z12.npy'); W=np.load('W12.npy'); R=np.load('R12.npy')
TAM=(-1392.03,2444.53); HALF=16000; M=2048; px=2*HALF/M
def ij(x,n): return int((HALF-(n-TAM[1]))/px), int((x-TAM[0]+HALF)/px)
def h(x,n): j,i=ij(x,n); return float(Z[j,i])
def w(x,n): j,i=ij(x,n); return bool(W[j,i])
v=json.load(open('vitri.json'))
for k,p in v.items():
    x,n=p['x'],p['n']; ok=not w(x,n)
    if not ok and not k.startswith('cua'):
        best=None
        for r in range(10,800,10):
            for a in range(0,360,10):
                xx=x+r*math.cos(math.radians(a)); nn=n+r*math.sin(math.radians(a))
                if not w(xx,nn) and h(xx,nn)>0.6: best=(xx,nn); break
            if best: break
        if best: p['x'],p['n']=round(best[0]),round(best[1])
    p['h']=round(h(p['x'],p['n']),2); p['trong']=math.hypot(p['x']-TAM[0],p['n']-TAM[1])<9417
    print(k,(x,n),'->',(p['x'],p['n']),p['h'],'trong' if p['trong'] else 'NGOAI')
for n in [0,-500,-1000,-1614,-2074,-2500,-3000,-3500,-4000]:
    xs=[x for x in range(0,3500,10) if w(x,n) ]
    print('song n',n, (min(xs),max(xs)) if xs else None)
json.dump(v,open('vitri.json','w'),ensure_ascii=False,indent=1)
