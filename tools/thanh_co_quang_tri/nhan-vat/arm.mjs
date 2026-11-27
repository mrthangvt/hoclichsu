import {io} from './lib.mjs';const doc=await io.read(process.argv[2]);const a=doc.getRoot().listMeshes()[0].listPrimitives()[0].getAttribute('POSITION').getArray();
let ymin=1e9,ymax=-1e9;for(let i=1;i<a.length;i+=3){ymin=Math.min(ymin,a[i]);ymax=Math.max(ymax,a[i])}const H=ymax-ymin;
// điểm xa nhất mỗi bên (đầu ngón tay), và điểm nách: |x| lớn nhất ở độ cao vai
for(const sg of [1,-1]){let bx=0,by=0;for(let i=0;i<a.length;i+=3){if(a[i]*sg>bx){bx=a[i]*sg;by=a[i+1]}}
 // vai: tìm x lớn nhất của thân ở độ cao 0.80H
 const ysh=ymin+.81*H;let xs=0;for(let i=0;i<a.length;i+=3)if(Math.abs(a[i+1]-ysh)<.01*H&&a[i]*sg>xs)xs=a[i]*sg;
 console.log(process.argv[2].split('/').pop(),sg,'H',H.toFixed(3),'hand',bx.toFixed(3),((by-ymin)/H).toFixed(3),'angle',(Math.atan2(ysh-by,bx-.11*H)*180/Math.PI).toFixed(1))}
