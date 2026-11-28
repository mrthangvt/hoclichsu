/* Học Lịch Sử V6.3 — Không gian lịch sử trên điện thoại: bản đồ toàn màn hình (từ đầu trang tới thanh menu dưới),
   danh sách địa điểm là một ngăn kéo cố định trong khung điện thoại, có bộ lọc và thanh cuộn riêng.
   Chỉ bật khi đang hiện thanh menu điện thoại và đang ở mục Không gian lịch sử; máy tính giữ nguyên bố cục cũ. */
(function(){'use strict';
const $=s=>document.querySelector(s);
let dangBat=false,hen=0;

const laDienThoai=()=>{const n=$('.mobile-sections');return !!n&&getComputedStyle(n).display!=='none';};
const dangOKhongGian=()=>{const s=document.getElementById('spacesHistory');return !!s&&getComputedStyle(s).display!=='none'&&s.getClientRects().length>0;};
const banDo=()=>window.HLS_BAN_DO&&window.HLS_BAN_DO.map&&window.HLS_BAN_DO.map();

function soDiem(){
 const sel=document.getElementById('v23SceneFilter'),k=sel?sel.value:'all';
 const ds=typeof V23_SCENES!=='undefined'?V23_SCENES.filter(x=>k==='all'||x.kind===k):[];
 return ds.length;
}

/* Thanh tóm tắt ở đáy (thu gọn) / đầu ngăn danh sách (mở) */
function taoThanh(){
 const ds=$('.v23-map-list');if(!ds||document.getElementById('v63Thanh'))return;
 const t=document.createElement('div');t.id='v63Thanh';t.className='v63-thanh';
 t.innerHTML='<span class="v63-keo" aria-hidden="true"></span><div class="v63-chu"><strong>Không gian lịch sử 3D</strong><small id="v63So"></small></div>'+
  '<button type="button" id="v63Nut" class="v63-nut" aria-expanded="false" aria-controls="v23SpaceCards"></button>';
 ds.prepend(t);
 document.getElementById('v63Nut').addEventListener('click',()=>moDanhSach(!document.body.classList.contains('v63-mo')));
 // Vuốt lên để mở, vuốt xuống để đóng
 let y0=null;
 t.addEventListener('touchstart',e=>{y0=e.touches[0].clientY;},{passive:true});
 t.addEventListener('touchend',e=>{if(y0==null)return;const d=e.changedTouches[0].clientY-y0;y0=null;if(d<-30)moDanhSach(true);else if(d>30)moDanhSach(false);},{passive:true});
 t.addEventListener('click',e=>{if(e.target.closest('button'))return;moDanhSach(!document.body.classList.contains('v63-mo'));});
 // Chọn một thẻ trong danh sách: đóng ngăn, bay tới điểm và mở thẻ trên bản đồ
 const the=document.getElementById('v23SpaceCards');
 if(the)the.addEventListener('click',e=>{
  if(!dangBat)return;
  const b=e.target.closest('.v23-space-card');if(!b)return;
  const m=/x\.id===?'([^']+)'/.exec(b.getAttribute('onclick')||'');
  if(!m||!window.HLS_BAN_DO||!banDo())return;           // bản đồ SVG dự phòng: giữ cách cũ
  e.stopPropagation();e.preventDefault();
  moDanhSach(false);
  setTimeout(()=>window.HLS_BAN_DO.chon(m[1]),260);
 },true);
 capNhatChu();
}
function capNhatChu(){
 const so=document.getElementById('v63So'),nut=document.getElementById('v63Nut');
 const mo=document.body.classList.contains('v63-mo');
 if(so)so.textContent=soDiem()+' địa điểm · '+(mo?'Chọn để xem trên bản đồ':'Bấm pin để khám phá');
 if(nut){nut.textContent=mo?'Bản đồ ↓':'Danh sách ↑';nut.setAttribute('aria-expanded',String(mo));}
}
function moDanhSach(mo){
 document.body.classList.toggle('v63-mo',!!mo&&dangBat);
 const the=document.getElementById('v23SpaceCards');if(the&&mo)the.scrollTop=0;
 capNhatChu();
}

function doKichThuoc(){
 const tren=$('.top'),duoi=$('.mobile-sections');
 const r=document.documentElement.style;
 r.setProperty('--v63-tren',Math.max(0,Math.round(tren?tren.getBoundingClientRect().bottom:0))+'px');
 r.setProperty('--v63-duoi',Math.round(duoi?duoi.getBoundingClientRect().height:0)+'px');
}

function capNhat(){
 hen=0;
 const bat=laDienThoai()&&dangOKhongGian();
 if(bat&&!dangBat)window.scrollTo(0,0);
 dangBat=bat;
 document.body.classList.toggle('v63-kg',bat);
 if(!bat)document.body.classList.remove('v63-mo');
 if(bat){taoThanh();doKichThuoc();capNhatChu();}
 const m=banDo();
 if(m){
  // Toàn màn hình: trang không cuộn nữa → 1 ngón kéo bản đồ; ngoài chế độ này giữ cử chỉ hợp tác.
  try{bat?m.cooperativeGestures.disable():m.cooperativeGestures.enable();}catch(_){}
  requestAnimationFrame(()=>m.resize());
 }
}
const henCapNhat=()=>{if(!hen)hen=requestAnimationFrame(capNhat);};

function caiDat(){
 const main=$('.main');
 if(main)for(const s of main.children)new MutationObserver(henCapNhat).observe(s,{attributes:true,attributeFilter:['style','class','hidden']});
 new MutationObserver(henCapNhat).observe(document.body,{attributes:true,attributeFilter:['class']});
 window.addEventListener('resize',henCapNhat);
 window.addEventListener('orientationchange',()=>setTimeout(henCapNhat,300));
 // Bộ lọc đổi số điểm
 const cu=window.v23RenderMap;
 if(typeof cu==='function')window.v23RenderMap=function(){const r=cu.apply(this,arguments);capNhatChu();return r;};
 // Bản đồ MapLibre nạp xong sau → áp lại cử chỉ
 let n=0;const cho=setInterval(()=>{if(banDo()||++n>60){clearInterval(cho);henCapNhat();}},500);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('v63-mo'))moDanhSach(false);});
 henCapNhat();
}
if(document.readyState==='complete')setTimeout(caiDat,450);else window.addEventListener('load',()=>setTimeout(caiDat,450));
})();
