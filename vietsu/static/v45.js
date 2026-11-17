/* V4.5 — một bộ chọn ảnh cho mục Nhân vật và Popup; tranh mẫu không phải chân dung thật. */
(function(){
'use strict';
const ROOT='static/avatar-v45/';
const FEMALE=new Set(['auco','mychau','trungtrac','trungnhi','batrieu','buithixuan','ylan','lychieuhoang']);
const MIL_FEMALE=new Set(['trungtrac','trungnhi','batrieu','buithixuan']);
const ROYAL_FEMALE=new Set(['auco','mychau','ylan','lychieuhoang']);
const VN=new Set('hungdao nhantong quangtrung leloi gialong hochiminh vonguyengiap ngothisi kinhduong laclongquan auco hungvuong anduong caolo mychau trungtrac trungnhi batrieu sinhiep lybi trieuquangphuc lyphattu khucthuadu khuchao duongdinhnghe ngoquyen dinhbolinh lehoan lythaito lythuongkiet tranthaitong tranthudo hoquyly tranngoi tranquykhoang nguyentrai lethanhtong macdangdung trinhtung thigsach phamtuu maithucloan phunghung nguyenbac phamculuong tohienthanh trannhatduat tranquangkhai tranquangdieu buithixuan ngothinham minhmang nguyenphuong vanhanh lephunghieu duongtuminh thancanhphuc ylan lychieuhoang levanthinh nguyenbinhkhiem phungkhackhoan lequydon lehuutrac phanboichau huynhthuckhang phamvandong hoangvanthai lynhantong'.split(' '));
const CN=new Set('hotatliet qinthuyhoang sohan tamquoc thoduong genghis hongwu thanhdrama bao'.split(' '));
const KEEP_ORIGINAL=new Set(['hochiminh','vonguyengiap','phanboichau','huynhthuckhang','phamvandong','hoangvanthai']);
const TEMPLATES={emperor:'emperor',official:'official',warrior:'warrior',queen:'queen',femaleWarrior:'female-warrior',woman:'woman'};
const esc=s=>typeof safe==='function'?safe(String(s)):String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function category(id,p){
 const role=String(p?.role||'').toLowerCase();
 if(MIL_FEMALE.has(id))return 'femaleWarrior';
 if(ROYAL_FEMALE.has(id))return 'queen';
 if(FEMALE.has(id)||/(nữ tướng|hoàng hậu|công chúa|nguyên phi|hoàng thái hậu|quý phi|vương phi)/u.test(role))return 'woman';
 if(/(hoàng đế|vua |nhà vua|hoàng thái tử|vua nước|chúa trịnh)/u.test(role)||['lythaito','nhantong','lynhantong','tranngoi','hungvuong','gialong'].includes(id))return 'emperor';
 if(/(tướng|tiết chế|quân sự|đô đốc|khởi nghĩa|chỉ huy|quân đội|đại hãn)/u.test(role))return 'warrior';
 return 'official';
}
function resolve(id,p){
 // User-approved per-character portraits outrank the thematic default.
 const own=window.V45_IMAGE_OVERRIDES?.[id]||null;
 if(own?.approved===true && typeof own.url==='string'&&/^(https:\/\/|\/|data:image\/(webp|png|jpeg);base64,)/.test(own.url))return {src:own.url,type:'specific'};
 // Non-Vietnamese portraits remain as in V4.4.
 if(!VN.has(id)||KEEP_ORIGINAL.has(id))return {src:p?.avatar||'',type:'legacy'};
 return {src:ROOT+TEMPLATES[category(id,p)]+'-256.webp',type:'template'};
}
function mark(id,p){
 const a=resolve(id,p), initial=esc((p?.name||'?').trim().charAt(0));
 const img=a.src?'<img src="'+esc(a.src)+'" alt="'+(a.type==='template'?'Minh họa đại diện (không phải chân dung xác thực): ':'Chân dung: ')+esc(p?.name||id)+'" loading="lazy" decoding="async" onerror="this.remove();this.parentNode.querySelector(\'.v45-initial\').hidden=false">':'';
 return '<span class="v25-char-avatar v45-avatar" title="'+(a.type==='template'?'Hình minh họa mặc định, không phải chân dung người thật':'Ảnh nhân vật')+'">'+img+'<span class="v45-initial" '+(a.src?'hidden':'')+'>'+initial+'</span></span>';
}
function render(){
 const grid=document.getElementById('v25CharacterGrid');if(!grid||typeof persons==='undefined')return;
 const q=(document.getElementById('v25CharacterSearch')?.value||'').toLocaleLowerCase('vi');
 const rows=Object.entries(persons).filter(([id,p])=>p?.name&&[p.name,p.period||'',p.role||''].join(' ').toLocaleLowerCase('vi').includes(q)).sort((a,b)=>a[1].name.localeCompare(b[1].name,'vi'));
 const vi=rows.filter(([id])=>VN.has(id)),cn=rows.filter(([id])=>CN.has(id)),other=rows.filter(([id])=>!VN.has(id)&&!CN.has(id));
 const counter=document.getElementById('v25CharacterCount');if(counter)counter.textContent=rows.length+' nhân vật';
 const card=([id,p])=>'<button class="v25-char-card" onclick="openItem(\''+esc(id)+'\')" title="Mở hồ sơ '+esc(p.name)+'">'+mark(id,p)+'<span class="v25-char-info"><b>'+esc(p.name)+'</b><small>'+esc(p.period||'Đang cập nhật niên đại')+'</small><em>'+esc(p.role||'Nhân vật lịch sử')+'</em></span></button>';
 const column=(title,list)=>'<section class="v30-character-column"><h2 class="v30-character-title">'+title+'<small>'+list.length+' hồ sơ</small></h2><div class="v30-character-list">'+(list.length?list.map(card).join(''):'<p class="v30-empty">Không có nhân vật phù hợp.</p>')+'</div></section>';
 grid.innerHTML='<div class="v30-character-layout">'+column('🇻🇳 Việt Nam',vi)+column('🇨🇳 Trung Quốc',cn)+'</div>'+(other.length?'<section class="v30-character-other"><h2 class="v30-character-title">🌍 Nhân vật khác <small>'+other.length+' hồ sơ</small></h2><div class="v30-character-list">'+other.map(card).join('')+'</div></section>':'');
}
function popup(){
 const body=document.getElementById('modalbody');
 if(!body||typeof modalType!=='function'||modalType()!=='person'||typeof active!=='string'||typeof persons==='undefined')return;
 const p=persons[active];if(!p)return;
 const a=resolve(active,p);if(!a.src)return;
 body.querySelectorAll('.v36-profile-preview, .avatar > img').forEach(img=>{
   img.src=a.src;img.alt=(a.type==='template'?'Hình minh họa vai trò, không phải chân dung xác thực: ':'Ảnh nhân vật: ')+p.name;
   img.classList.add('v45-profile-image');img.loading='lazy';img.decoding='async';
   img.onerror=()=>{img.onerror=null;if(p.avatar&&p.avatar!==a.src)img.src=p.avatar;else img.style.display='none'};
 });
}
function init(){
 window.V45Avatar={resolve,category,templates:TEMPLATES};
 window.v25RenderCharacters=render;
 if(typeof renderModal==='function'){const prev=renderModal;renderModal=function(){const r=prev.apply(this,arguments);popup();return r}}
 render();popup();document.documentElement.dataset.vietsuVersion='4.5';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();