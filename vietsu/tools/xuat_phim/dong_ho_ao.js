/* Đồng hồ ảo cho công cụ xuất phim (chỉ dùng trên máy, không thuộc website).
   Máy chủ may_chu.py chèn tệp này vào ĐẦU <head> của trang sa bàn, trước mọi mã của sa bàn, nên:
   - performance.now / requestAnimationFrame / setTimeout của trang do công cụ điều khiển: mỗi bước đúng 1/30 giây
     (THREE.Clock, setAnimationLoop, bộ dẫn chuyện đều chạy theo đồng hồ này) → khung hình đều nhau dù máy vẽ nhanh hay chậm.
   - Math.random có hạt giống cố định (?hat=) → mỗi lần xuất, lính, thuyền, hố bom đặt giống nhau.
   - Kích thước khung vẽ cố định (?w=&h=), tỉ lệ điểm ảnh 1 → khung vẽ đúng 1080×1920 (hoặc 3840×2160) dù cửa sổ nhỏ.
   Không sửa mã gốc của sa bàn. */
(function(){
  'use strict';
  const Q=new URLSearchParams(location.search);
  const W=+Q.get('w')||1080, H=+Q.get('h')||1920, FPS=+Q.get('fps')||30;

  /* ---- kích thước khung vẽ ---- */
  for(const [k,v] of [['innerWidth',W],['innerHeight',H],['outerWidth',W],['outerHeight',H],['devicePixelRatio',1]])
    try{Object.defineProperty(window,k,{get:()=>v,configurable:true})}catch(e){}

  /* ---- số ngẫu nhiên có hạt giống (mulberry32) ---- */
  let seed=(+Q.get('hat')||1972)>>>0;
  Math.random=function(){seed=(seed+0x6D2B79F5)>>>0;let t=seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296};

  /* ---- đồng hồ: "thuc" (đang tải, chạy theo giờ thật) → "ao" (công cụ bấm từng bước) ---- */
  const nowThuc=performance.now.bind(performance);
  const rafThuc=window.requestAnimationFrame.bind(window);
  const stThuc=window.setTimeout.bind(window), ctThuc=window.clearTimeout.bind(window);
  const XP={W,H,FPS,mode:'thuc',t:0,buoc:0,nowThuc};
  let goc=0;                                   // mốc giờ thật lúc chuyển sang đồng hồ ảo
  performance.now=function(){return XP.mode==='ao'?goc+XP.t*1000:nowThuc()};

  let rafQ=[],rafId=0,hen=false;
  function xaRaf(ts){hen=false;const q=rafQ;rafQ=[];for(const [,cb] of q){try{cb(ts)}catch(e){console.error(e)}}}
  window.requestAnimationFrame=function(cb){const id=++rafId;rafQ.push([id,cb]);if(XP.mode==='thuc'&&!hen){hen=true;rafThuc(xaRaf)}return id};
  window.cancelAnimationFrame=function(id){rafQ=rafQ.filter(x=>x[0]!==id)};

  /* hẹn giờ của trang (vd. đạn xe tăng nổ sau 0,5–0,9 s): ở chế độ ảo, tính theo giây ảo */
  let hq=[],hid=1e6;
  window.setTimeout=function(cb,ms,...a){if(XP.mode!=='ao')return stThuc(cb,ms,...a);const id=++hid;hq.push({id,at:XP.t+(+ms||0)/1000,cb,a});return id};
  window.clearTimeout=function(id){if(id>1e6){hq=hq.filter(x=>x.id!==id);return}ctThuc(id)};

  /* chuyển sang đồng hồ ảo: từ đây trang chỉ chạy khi công cụ gọi XP.buocToi() */
  XP.chiemDongHo=function(){if(XP.mode==='ao')return;goc=nowThuc();XP.t=0;XP.mode='ao'};
  /* tiến 1 khung: tăng giờ ảo 1/FPS, chạy hẹn giờ đến hạn, rồi chạy vòng vẽ (setAnimationLoop) đúng một lần */
  XP.buocToi=function(){XP.t=++XP.buoc/FPS;
    const den=hq.filter(x=>x.at<=XP.t+1e-9);if(den.length){hq=hq.filter(x=>x.at>XP.t+1e-9);for(const h of den){try{h.cb(...h.a)}catch(e){console.error(e)}}}
    xaRaf(goc+XP.t*1000)};
  /* nhường luồng cho trình duyệt (bộ mã hoá, tải tệp) mà không bị hãm khi thẻ ở nền như setTimeout */
  const mc=new MessageChannel();let cho=[];mc.port1.onmessage=()=>{const c=cho;cho=[];c.forEach(f=>f())};
  XP.nhuong=()=>new Promise(r=>{cho.push(r);mc.port2.postMessage(0)});
  window.__XP=XP;

  /* ---- giao diện trang quay: ẩn mọi nút, nhãn của sa bàn; khung vẽ hiện vừa cửa sổ đúng tỉ lệ ---- */
  const css=`body>*:not(#c):not(#load):not(#xp-bang){display:none!important}
    #c{inset:auto!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%);height:100vh!important;width:auto!important;aspect-ratio:${W}/${H};max-width:100vw}
    html,body{background:#000!important}
    #xp-bang{position:fixed;left:8px;bottom:8px;z-index:99;font:13px/1.4 system-ui,sans-serif;color:#fff;background:rgba(0,0,0,.72);padding:8px 10px;border-radius:8px;max-width:46vw;white-space:pre-wrap}`;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  /* tải bộ quay sau khi trang đã chạy */
  addEventListener('DOMContentLoaded',()=>{const s=document.createElement('script');s.type='module';s.src='/xuat_phim/quay.js';document.body.appendChild(s)});
})();
