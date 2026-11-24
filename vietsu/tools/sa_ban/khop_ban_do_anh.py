import numpy as np, cv2, json, math
from PIL import Image, ImageDraw
# điểm khống chế: (tên, x, y trên ảnh 563108e9, vĩ độ, kinh độ — trung tâm thị xã, gần đúng)
P=[('Can Tho',1126,879,10.034,105.788),('Soc Trang',1337.5,1251,9.603,105.974),('Tra Vinh',1595,969,9.935,106.345),
   ('Truc Giang (Ben Tre)',1615,702.5,10.241,106.376),('Vinh Long',1254,715,10.253,105.972),('My Tho',1572.5,615,10.3628,106.3591),
   ('Go Cong',1820,620,10.365,106.674),('Cai Lay',1382.5,599,10.407,106.117),('Cho Gao',1651.5,642.5,10.353,106.465),
   ('Moc Hoa',1225,365,10.774,105.936),('Long Xuyen',893,666,10.386,105.435),('Rach Gia',618,929,10.012,105.081)]
lat0=10.3; 
def xy(la,lo): return np.array([(lo-106)*111.32*math.cos(math.radians(lat0)), (la-lat0)*110.6])  # km
src=np.array([xy(p[3],p[4]) for p in P],np.float64); dst=np.array([[p[1],p[2]] for p in P],np.float64)
H,_=cv2.findHomography(src,dst,0)
Hi=np.linalg.inv(H)
res=[]
for p,s,d in zip(P,src,dst):
    q=Hi@np.array([d[0],d[1],1]); q=q[:2]/q[2]; e=np.linalg.norm(q-s); res.append((p[0],round(e,1)))
print('sai so (km):',res); print('trung binh %.1f km, lon nhat %.1f km'%(np.mean([r[1] for r in res]),max(r[1] for r in res)))
# leave-one-out để biết sai số thật khi dùng ảnh làm nền
loo=[]
for i in range(len(P)):
    m=[j for j in range(len(P)) if j!=i]; Hm,_=cv2.findHomography(src[m],dst[m],0); q=np.linalg.inv(Hm)@np.array([*dst[i],1]); q=q[:2]/q[2]; loo.append(np.linalg.norm(q-src[i]))
print('kiem cheo bo-1: trung binh %.1f km, lon nhat %.1f km'%(np.mean(loo),max(loo)))
# vẽ khung sa bàn (tầng chiến dịch, tầng nội đô) + điểm lên ảnh
im=Image.open('/mnt/user-data/uploads/563108e9-image.png').convert('RGB'); d=ImageDraw.Draw(im)
def proj(la,lo): v=H@np.array([*xy(la,lo),1]); return (v[0]/v[2],v[1]/v[2])
def box(s,w,n,e,col,lab):
    pts=[proj(s,w),proj(s,e),proj(n,e),proj(n,w),proj(s,w)]; d.line(pts,fill=col,width=5); d.text((pts[3][0]+8,pts[3][1]+8),lab,fill=col)
box(10.40,106.25,11.25,107.45,(220,0,0),'TANG CHIEN DICH sa ban')
box(10.72,106.62,10.84,106.78,(0,0,200),'NOI DO')
for p,s,dd in zip(P,src,dst):
    x,y=proj(p[3],p[4]); d.ellipse([x-9,y-9,x+9,y+9],outline=(220,0,0),width=4); d.line([(x,y),(dd[0],dd[1])],fill=(220,0,0),width=3)
for nm,la,lo in [('Sai Gon (Dinh Doc Lap)',10.777,106.695),('Tan An',10.535,106.413),('Bien Hoa',10.946,106.82),('Cu Chi',10.973,106.493)]:
    x,y=proj(la,lo); d.rectangle([x-8,y-8,x+8,y+8],fill=(0,0,200)); d.text((x+12,y-6),nm,fill=(0,0,200))
im.save('khop.jpg',quality=85)
json.dump({'H':H.tolist(),'diem':P},open('khop.json','w'))
