/* Việt Sử V5.5 — theo yêu cầu chủ dự án (23/11/2026):
   Sơ đồ triều đại có thêm "Các đời vua": mỗi triều bao nhiêu vị vua, tên, năm trị vì,
   và một dải "Toàn cảnh các triều đại" để chuyển nhanh giữa các triều.
   Nguồn: Đại Việt sử ký toàn thư (đến 1656), Việt Nam sử lược (Tây Sơn, Nguyễn).
   Năm ghi theo năm lên ngôi – năm thôi trị vì; một số năm có sách chép lệch 1 năm. */
(function(){
'use strict';
const $=id=>document.getElementById(id);

// [miếu hiệu / tôn hiệu, tên húy, năm, ghi chú]
const DYN=[
 {id:'hongbang',alias:['vanlang','xichquy'],name:'Hồng Bàng – Văn Lang',span:'2879–258 TCN (niên đại truyền thuyết)',count:'Kinh Dương Vương, Lạc Long Quân và 18 đời Hùng Vương',legend:true,
  kings:[['Kinh Dương Vương','Lộc Tục','—','Vua nước Xích Quỷ theo truyền thuyết'],['Lạc Long Quân','Sùng Lãm','—','Truyền thuyết'],['Hùng Vương (18 đời)','không rõ tên','—','Sử cũ chép 18 đời, chưa có chứng cứ cùng thời']]},
 {id:'thuc',alias:['aulac'],name:'Âu Lạc (Thục)',span:'257–208 TCN',count:1,kings:[['An Dương Vương','Thục Phán','257–208 TCN','Đóng đô ở Cổ Loa']]},
 {id:'namviet',alias:[],name:'Nhà Triệu (Nam Việt)',span:'207–111 TCN',count:5,note:'Sử cũ chép thành một kỷ; nhiều nhà sử học hiện đại không coi là triều đại của người Việt.',
  kings:[['Vũ Đế','Triệu Đà','207–137 TCN'],['Văn Vương','Triệu Hồ','137–125 TCN'],['Minh Vương','Triệu Anh Tề','125–113 TCN'],['Ai Vương','Triệu Hưng','113–112 TCN'],['Thuật Dương Vương','Triệu Kiến Đức','112–111 TCN']]},
 {id:'trung-vuong',alias:[],name:'Trưng Vương',span:'40–43',count:1,kings:[['Trưng Vương','Trưng Trắc (cùng em là Trưng Nhị)','40–43','Đóng đô ở Mê Linh']]},
 {id:'tien-ly',alias:['vanxuan','trieu-viet-vuong','hau-ly'],name:'Vạn Xuân (Tiền Lý)',span:'544–602',count:3,
  kings:[['Lý Nam Đế','Lý Bí (Lý Bôn)','544–548'],['Triệu Việt Vương','Triệu Quang Phục','548–571'],['Hậu Lý Nam Đế','Lý Phật Tử','571–602']]},
 {id:'khuc-duong',alias:['khuc'],name:'Họ Khúc – Dương Đình Nghệ',span:'905–937',count:'4 người cầm quyền (tiết độ sứ, chưa xưng vua)',
  kings:[['Tiết độ sứ','Khúc Thừa Dụ','905–907'],['Tiết độ sứ','Khúc Hạo','907–917'],['Tiết độ sứ','Khúc Thừa Mỹ','917–930'],['Tiết độ sứ','Dương Đình Nghệ','931–937']]},
 {id:'ngo',alias:['su-quan'],name:'Nhà Ngô',span:'939–965',count:'3 vua (và Dương Tam Kha tiếm ngôi)',
  kings:[['Tiền Ngô Vương','Ngô Quyền','939–944'],['Dương Bình Vương','Dương Tam Kha','944–950','Tiếm ngôi, không tính vào chính thống'],['Thiên Sách Vương','Ngô Xương Ngập','951–954','Cùng em trị vì'],['Nam Tấn Vương','Ngô Xương Văn','950–965']]},
 {id:'dinh',alias:[],name:'Nhà Đinh',span:'968–980',count:2,kings:[['Đinh Tiên Hoàng','Đinh Bộ Lĩnh','968–979','Quốc hiệu Đại Cồ Việt, đô Hoa Lư'],['Phế Đế','Đinh Toàn','979–980']]},
 {id:'tienle',alias:[],name:'Nhà Tiền Lê',span:'980–1009',count:3,kings:[['Lê Đại Hành','Lê Hoàn','980–1005'],['Lê Trung Tông','Lê Long Việt','1005','Ở ngôi 3 ngày'],['Lê Ngọa Triều','Lê Long Đĩnh','1005–1009']]},
 {id:'ly',alias:[],name:'Nhà Lý',span:'1009–1225',count:9,
  kings:[['Thái Tổ','Lý Công Uẩn','1009–1028','Dời đô ra Thăng Long (1010)'],['Thái Tông','Lý Phật Mã','1028–1054'],['Thánh Tông','Lý Nhật Tôn','1054–1072','Đặt quốc hiệu Đại Việt (1054)'],['Nhân Tông','Lý Càn Đức','1072–1127'],['Thần Tông','Lý Dương Hoán','1128–1138'],['Anh Tông','Lý Thiên Tộ','1138–1175'],['Cao Tông','Lý Long Cán','1175–1210'],['Huệ Tông','Lý Hạo Sảm','1210–1224'],['Chiêu Hoàng','Lý Phật Kim','1224–1225','Nữ hoàng duy nhất; nhường ngôi cho Trần Cảnh']]},
 {id:'tran',alias:[],name:'Nhà Trần',span:'1226–1400',count:12,
  kings:[['Thái Tông','Trần Cảnh','1226–1258'],['Thánh Tông','Trần Hoảng','1258–1278'],['Nhân Tông','Trần Khâm','1278–1293'],['Anh Tông','Trần Thuyên','1293–1314'],['Minh Tông','Trần Mạnh','1314–1329'],['Hiến Tông','Trần Vượng','1329–1341'],['Dụ Tông','Trần Hạo','1341–1369','Sau đó Dương Nhật Lễ tiếm ngôi (1369–1370)'],['Nghệ Tông','Trần Phủ','1370–1372'],['Duệ Tông','Trần Kính','1372–1377'],['Phế Đế','Trần Hiện','1377–1388'],['Thuận Tông','Trần Ngung','1388–1398'],['Thiếu Đế','Trần An','1398–1400']]},
 {id:'ho',alias:[],name:'Nhà Hồ',span:'1400–1407',count:2,kings:[['Hồ Quý Ly','Hồ Quý Ly','1400','Quốc hiệu Đại Ngu, nhường ngôi cho con'],['Hồ Hán Thương','Hồ Hán Thương','1401–1407']]},
 {id:'hau-tran',alias:['hautran'],name:'Nhà Hậu Trần',span:'1407–1414',count:2,kings:[['Giản Định Đế','Trần Ngỗi','1407–1409'],['Trùng Quang Đế','Trần Quý Khoáng','1409–1414']]},
 {id:'le-so',alias:['leso'],name:'Nhà Lê sơ',span:'1428–1527',count:'10 vua (và Lê Nghi Dân)',
  kings:[['Thái Tổ','Lê Lợi','1428–1433'],['Thái Tông','Lê Nguyên Long','1433–1442'],['Nhân Tông','Lê Bang Cơ','1442–1459'],['Lạng Sơn Vương','Lê Nghi Dân','1459–1460','Sử cũ không xếp vào chính thống'],['Thánh Tông','Lê Tư Thành','1460–1497','Ban hành Quốc triều hình luật'],['Hiến Tông','Lê Tranh (Lê Huy)','1497–1504'],['Túc Tông','Lê Thuần','1504','Ở ngôi 6 tháng'],['Uy Mục Đế','Lê Tuấn','1505–1509'],['Tương Dực Đế','Lê Oanh','1509–1516'],['Chiêu Tông','Lê Y','1516–1522'],['Cung Hoàng','Lê Xuân','1522–1527']]},
 {id:'mac',alias:[],name:'Nhà Mạc',span:'1527–1592 (ở Thăng Long)',count:'5 vua ở Thăng Long',note:'Sau 1592, họ Mạc còn giữ Cao Bằng đến 1677: Mạc Kính Chỉ, Mạc Kính Cung, Mạc Kính Khoan, Mạc Kính Vũ.',
  kings:[['Thái Tổ','Mạc Đăng Dung','1527–1529','Nhường ngôi cho con, làm Thái thượng hoàng'],['Thái Tông','Mạc Đăng Doanh','1530–1540'],['Hiến Tông','Mạc Phúc Hải','1540–1546'],['Tuyên Tông','Mạc Phúc Nguyên','1546–1561'],['Mạc Mậu Hợp','Mạc Mậu Hợp','1562–1592','Mất Thăng Long năm 1592']]},
 {id:'le-trung-hung',alias:['letrung'],name:'Nhà Lê trung hưng',span:'1533–1789',count:16,note:'Thực quyền phần lớn thuộc chúa Trịnh (Đàng Ngoài); Đàng Trong do các chúa Nguyễn cai quản.',
  kings:[['Trang Tông','Lê Ninh','1533–1548'],['Trung Tông','Lê Huyên','1548–1556'],['Anh Tông','Lê Bang','1556–1573'],['Thế Tông','Lê Duy Đàm','1573–1599'],['Kính Tông','Lê Duy Tân','1600–1619'],['Thần Tông','Lê Duy Kỳ','1619–1643; 1649–1662','Hai lần ở ngôi'],['Chân Tông','Lê Duy Hựu','1643–1649'],['Huyền Tông','Lê Duy Vũ','1663–1671'],['Gia Tông','Lê Duy Hợi','1672–1675'],['Hy Tông','Lê Duy Hợp','1676–1705'],['Dụ Tông','Lê Duy Đường','1705–1729'],['Hôn Đức Công','Lê Duy Phường','1729–1732'],['Thuần Tông','Lê Duy Tường','1732–1735'],['Ý Tông','Lê Duy Thận','1735–1740'],['Hiển Tông','Lê Duy Diêu','1740–1786'],['Chiêu Thống (Mẫn Đế)','Lê Duy Kỳ','1786–1789']]},
 {id:'tayson',alias:[],name:'Nhà Tây Sơn',span:'1778–1802',count:3,
  kings:[['Thái Đức Hoàng đế','Nguyễn Nhạc','1778–1793','Đóng đô ở Quy Nhơn'],['Quang Trung','Nguyễn Huệ','1788–1792','Đại phá quân Thanh (1789)'],['Cảnh Thịnh','Nguyễn Quang Toản','1792–1802']]},
 {id:'nguyenvn',alias:[],name:'Nhà Nguyễn',span:'1802–1945',count:13,
  kings:[['Gia Long','Nguyễn Phúc Ánh','1802–1819'],['Minh Mạng','Nguyễn Phúc Đảm','1820–1840','Đổi quốc hiệu Đại Nam (1838)'],['Thiệu Trị','Nguyễn Phúc Miên Tông','1841–1847'],['Tự Đức','Nguyễn Phúc Hồng Nhậm','1848–1883'],['Dục Đức','Nguyễn Phúc Ưng Chân','1883','Ở ngôi 3 ngày'],['Hiệp Hòa','Nguyễn Phúc Hồng Dật','1883'],['Kiến Phúc','Nguyễn Phúc Ưng Đăng','1883–1884'],['Hàm Nghi','Nguyễn Phúc Ưng Lịch','1884–1885','Ra chiếu Cần vương'],['Đồng Khánh','Nguyễn Phúc Ưng Kỷ','1885–1889'],['Thành Thái','Nguyễn Phúc Bửu Lân','1889–1907'],['Duy Tân','Nguyễn Phúc Vĩnh San','1907–1916'],['Khải Định','Nguyễn Phúc Bửu Đảo','1916–1925'],['Bảo Đại','Nguyễn Phúc Vĩnh Thụy','1926–1945','Thoái vị ngày 30/8/1945']]}
];
const BY=Object.create(null);
DYN.forEach(d=>{BY[d.id]=d;d.alias.forEach(a=>BY[a]=d);});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SHORT={hongbang:'truyền thuyết','khuc-duong':'4 người',ngo:'3 vua','le-so':'10 vua',mac:'5 vua'};
const short=d=>typeof d.count==='number'?d.count+' vua':(SHORT[d.id]||'');
const countText=d=>typeof d.count==='number'?d.count+' đời vua':d.count;
const target=d=>(typeof details!=='undefined'&&details[d.id])?d.id:(d.alias.find(a=>typeof details!=='undefined'&&details[a])||'');

function block(d){
 const kings=d.kings.map((k,i)=>`<li class="vs55-king${k[3]&&/^(Tiếm|Sử cũ không xếp)/.test(k[3])?' vs55-aside':''}"><span class="vs55-n">${i+1}</span><div><b>${esc(k[0])}</b><span class="vs55-name">${esc(k[1])}</span><span class="vs55-year">${esc(k[2])}</span>${k[3]?`<small>${esc(k[3])}</small>`:''}</div></li>`).join('');
 const strip=DYN.map(x=>{const t=target(x);const on=x===d;return `<button type="button" class="vs55-chip${on?' on':''}"${t&&!on?` data-vs55-open="${esc(t)}"`:''}${on?' aria-current="true"':''}${t||on?'':' disabled'}><b>${esc(x.name)}</b><small>${esc(short(x))}</small></button>`;}).join('');
 return `<section class="vs55" aria-label="Các đời vua ${esc(d.name)}">
 <div class="vs55-head"><span class="vs55-tag">CÁC ĐỜI VUA</span><h3>${esc(d.name)}</h3><p><b>${esc(countText(d))}</b> · ${esc(d.span)}</p>${d.note?`<p class="vs55-note">${esc(d.note)}</p>`:''}${d.legend?'<p class="vs55-note">Phần truyền thuyết: chỉ ghi theo sử cũ, không phải niên đại đã xác thực.</p>':''}</div>
 <ol class="vs55-kings">${kings}</ol>
 <p class="vs55-src">Nguồn: Đại Việt sử ký toàn thư; Việt Nam sử lược (Trần Trọng Kim). Năm trị vì tính theo năm lên ngôi; một số sách chép lệch một năm.</p>
 <div class="vs55-all"><h4>Toàn cảnh các triều đại Việt Nam</h4><div class="vs55-strip">${strip}</div></div>
 </section>`;
}
function inject(){
 if(typeof window.modalType!=='function'||window.modalType()!=='dynasty')return;
 if(typeof tab==='undefined'||tab!=='mindmap')return;
 const d=BY[typeof active==='string'?active:''];if(!d)return;
 const body=$('modalbody');if(!body||body.querySelector('.vs55'))return;
 // Đặt ngay sau khung tiêu đề đầu tiên để không phải cuộn xuống dưới mới thấy.
 const first=body.querySelector(':scope > .panel, :scope > section, :scope > div');
 if(first)first.insertAdjacentHTML('afterend',block(d));else body.insertAdjacentHTML('afterbegin',block(d));
}
function init(){
 if(typeof window.renderModal==='function'){const old=window.renderModal;window.renderModal=function(){const r=old.apply(this,arguments);inject();return r;};}
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-vs55-open]');if(!b)return;
  e.preventDefault();const id=b.getAttribute('data-vs55-open');
  if(typeof window.openItem==='function'){window.openItem(id);if(typeof window.changeTab==='function')window.changeTab('mindmap');}
 });
 document.documentElement.dataset.vietsuRelease='5.5';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
