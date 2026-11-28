/* Học Lịch Sử V4.11 — ôn tập/thi thử, không gửi dữ liệu cá nhân lên máy chủ. */
(function () {
  'use strict';
  const META = {
    10: {label:'Lịch sử 10',topics:[['ls','Lịch sử và Sử học'],['role','Vai trò của Sử học'],['civil','Văn minh thế giới cổ – trung đại'],['industrial','Cách mạng công nghiệp'],['sea','Văn minh Đông Nam Á'],['vietnam','Văn minh trên đất Việt Nam'],['ethnic','Cộng đồng các dân tộc Việt Nam']]},
    11: {label:'Lịch sử 11',topics:[['capital','Cách mạng tư sản và chủ nghĩa tư bản'],['socialism','Chủ nghĩa xã hội từ 1917'],['sea','Đông Nam Á thời cận – hiện đại'],['defense','Bảo vệ Tổ quốc và giải phóng dân tộc'],['reform','Các cuộc cải cách lịch sử'],['islands','Biển Đông và chủ quyền biển đảo']]},
    12: {label:'Lịch sử 12',topics:[['socialism','Chủ nghĩa xã hội từ 1917'],['defense','Chiến tranh bảo vệ và giải phóng dân tộc'],['world','Thế giới trong và sau Chiến tranh lạnh']]}
  };
  const questions = [...(window.VS_EXAM_Q10 || []),...(window.VS_EXAM_Q11 || []),...(window.VS_EXAM_Q12 || [])];
  const $ = id => document.getElementById(id);
  const make = (tag, cls, content) => { const n = document.createElement(tag); if (cls) n.className = cls; if (content !== undefined) n.textContent = String(content); return n; };
  const labels = ['A','B','C','D'];
  let grade=10, current=null, interval=null, complete=null, finishedReview=false;
  let elapsed=0, startedAt=0;
  const VALID = questions.length === 93 &&
    questions.every(q => q && META[q.grade] && META[q.grade].topics.some(t=>t[0]===q.topic) &&
      Array.isArray(q.options) && q.options.length===4 && new Set(q.options).size===4 &&
      Number.isInteger(q.answer) && q.answer>=0 && q.answer<4 && q.question && q.explanation &&
      Number.isInteger(q.page) && q.page>0 && q.page <= ({10:39,11:26,12:21})[q.grade]);
  function getBank() {
    const topic=$('topicSelect').value;
    return questions.filter(q=>q.grade===grade && (topic==='all'||q.topic===topic));
  }
  function shuffle(arr) {const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function selectGrade(g) {
    grade=g;
    document.querySelectorAll('.grade-card').forEach(b=>{const selected=Number(b.dataset.grade)===grade;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
    const sel=$('topicSelect');sel.replaceChildren(new Option('Tất cả chủ đề','all'));
    META[grade].topics.forEach(([v,l])=>sel.add(new Option(l,v)));
    sel.value='all';
    countOptions();
    $('sourceHint').textContent=grade===12?'Bộ PDF lớp 12 hiện chỉ có 3 chủ đề: chưa phải toàn bộ chương trình 12.':'Nội dung được biên soạn mới dựa trên tài liệu tham khảo đã cung cấp.';
  }
  function countOptions() {
    const total=getBank().length, select=$('countSelect'), prev=select.value||'10';
    const values=[5,10,15,20,25,30].filter(v=>v<=total);
    select.replaceChildren(...values.map(v=>new Option(v+' câu',String(v))),new Option('Toàn bộ '+total+' câu','all'));
    select.value=[...select.options].some(o=>o.value===prev)?prev:(values.includes(10)?'10':'all');
    $('available').textContent=total+' câu hỏi khả dụng';
  }
  function toggleMode() {
    $('timeField').hidden=$('modeSelect').value!=='exam';
    $('modeHelp').textContent=$('modeSelect').value==='exam'
      ? 'Thi thử: giữ kín đáp án khi làm, chấm điểm sau khi nộp; hết giờ tự nộp.'
      : 'Ôn tập: biết đúng/sai ngay sau mỗi lần chọn, xem giải thích và nguồn.';
  }
  function initGrades(){
    const region=$('gradeCards');
    for (const g of [10,11,12]){
      const b=make('button','grade-card');b.type='button';b.dataset.grade=String(g);
      b.setAttribute('aria-label','Chọn Lịch sử lớp '+g);
      b.append(make('strong','','LỚP '+g),make('small','',g===10?'7 chủ đề':g===11?'6 chủ đề':'3 chủ đề'),make('span','qcount',questions.filter(q=>q.grade===g).length+' câu hỏi'));
      b.addEventListener('click',()=>selectGrade(g));region.append(b);
    }
    selectGrade(10);
  }
  function topicLabel(q){return META[q.grade].topics.find(t=>t[0]===q.topic)?.[1] || q.topic;}
  function sourceLabel(q){return 'Nguồn tham khảo: tài liệu ôn Sử lớp '+q.grade+', trang PDF '+q.page+' (câu hỏi biên soạn lại).';}
  function start() {
    if(!VALID) { $('error').textContent='Ngân hàng câu hỏi chưa được tải đầy đủ hoặc dữ liệu không hợp lệ.';return; }
    const source=getBank();
    const n=$('countSelect').value==='all'?source.length:Number($('countSelect').value);
    if(!n||!source.length)return;
    if(interval)clearInterval(interval);
    const mode=$('modeSelect').value;
    const minutes=mode==='exam'?Number($('timeSelect').value):0;
    current={grade,topic:$('topicSelect').value,mode,items:shuffle(source).slice(0,Math.min(n,source.length)),answers:{},pos:0,seconds:minutes*60,limit:minutes*60,submitted:false};
    complete=null;finishedReview=false;startedAt=Date.now();elapsed=0;
    $('setup').classList.add('hidden');$('results').classList.add('hidden');$('quiz').classList.remove('hidden');
    $('timer').classList.toggle('hidden',minutes===0);
    render();
    if(minutes>0) interval=setInterval(()=>{
      if(!current||current.submitted)return;
      current.seconds=Math.max(0,current.seconds-1);tick();
      if(current.seconds===0)finish(true);
    },1000);
    $('quiz').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function tick() {
    const s=current?.seconds||0;
    $('timer').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
    $('timer').classList.toggle('warn',s<=60);
  }
  function choose(answer) {
    if(!current||current.submitted)return;
    const q=current.items[current.pos];
    if(current.mode==='study'&&Object.hasOwn(current.answers,q.id))return;
    current.answers[q.id]=answer;
    render();
  }
  function showFeedback(q,chosen) {
    const ok=chosen===q.answer;
    const feedback=make('div','feedback'+(ok?'':' bad'));
    feedback.setAttribute('role','status');
    feedback.append(make('strong','',ok?'✓ Đúng rồi!':'✕ Chưa chính xác'),make('p','',ok?'Đáp án: '+labels[q.answer]+'. '+q.options[q.answer]:'Đáp án đúng: '+labels[q.answer]+'. '+q.options[q.answer]),make('p','',q.explanation),make('small','source',sourceLabel(q)));
    $('questionPane').append(feedback);
  }
  function renderNav(){
    const palette=$('questionNav');palette.replaceChildren();
    current.items.forEach((q,i)=>{
      const b=make('button','num',i+1);b.type='button';b.setAttribute('aria-label','Đến câu '+(i+1));
      b.classList.toggle('current',i===current.pos);
      if(Object.hasOwn(current.answers,q.id)){
        const a=current.answers[q.id];
        b.classList.add(current.mode==='study'?(a===q.answer?'correct':'wrong'):'answered');
      }
      b.addEventListener('click',()=>{current.pos=i;render();});palette.append(b);
    });
  }
  function render(){
    if(!current)return;
    const q=current.items[current.pos],answered=Object.hasOwn(current.answers,q.id);
    $('currentIndex').textContent='Câu '+(current.pos+1)+'/'+current.items.length;
    $('currentTopic').textContent=topicLabel(q);
    const done=Object.keys(current.answers).length;
    $('answeredCount').textContent=done+'/'+current.items.length+' câu đã làm';
    $('progressFill').style.width=Math.round(done*100/current.items.length)+'%';
    $('examModeTag').textContent=current.mode==='exam'?'THI THỬ':'ÔN TẬP';
    $('questionPane').replaceChildren(make('h2','question',q.question));
    const group=make('div','options');
    q.options.forEach((option,i)=>{
      const b=make('button','option');b.type='button';b.setAttribute('aria-pressed',String(answered&&current.answers[q.id]===i));
      b.append(make('span','letter',labels[i]),make('span','',option));
      if(answered){
        if(current.answers[q.id]===i)b.classList.add('selected');
        if(current.mode==='study'){
          b.disabled=true;
          if(i===q.answer)b.classList.add('correct');
          else if(i===current.answers[q.id])b.classList.add('wrong');
        }
      }
      b.addEventListener('click',()=>choose(i));group.append(b);
    });
    $('questionPane').append(group);
    if(current.mode==='study'&&answered)showFeedback(q,current.answers[q.id]);
    $('prevButton').disabled=current.pos===0;
    $('nextButton').textContent=current.pos===current.items.length-1?'Về câu đầu':'Câu tiếp →';
    $('finishButton').textContent=current.mode==='exam'?'Nộp bài & chấm điểm':'Xem kết quả ôn tập';
    $('finishButton').disabled=done===0;
    renderNav();tick();
  }
  function finish(auto) {
    if(!current||current.submitted)return;
    const count=Object.keys(current.answers).length;
    if(!auto&&current.mode==='exam'&&count<current.items.length){
      if(!window.confirm('Anh/chị mới làm '+count+'/'+current.items.length+' câu. Vẫn nộp bài để chấm điểm?'))return;
    }
    current.submitted=true;
    if(interval){clearInterval(interval);interval=null;}
    const correct=current.items.filter(q=>current.answers[q.id]===q.answer).length;
    const total=current.items.length,wrong=count-correct,blank=total-count;
    const score=Math.round((correct/total)*1000)/100;
    complete={correct,total,wrong,blank,score};
    elapsed=Math.round((Date.now()-startedAt)/1000);
    $('quiz').classList.add('hidden');$('results').classList.remove('hidden');
    $('scoreValue').textContent=score.toLocaleString('vi-VN',{minimumFractionDigits:1,maximumFractionDigits:2});
    $('correctValue').textContent=correct+' câu';
    $('wrongValue').textContent=wrong+' câu';
    $('blankValue').textContent=blank+' câu';
    $('resultHeadline').textContent=(auto?'Đã hết giờ — tự động nộp bài. ':current.mode==='exam'?'Đã chấm bài thi thử. ':'Đã tổng kết lượt ôn tập. ')+(score>=8?'Kết quả tốt!':score>=5?'Tiếp tục luyện thêm nhé.':'Hãy xem phần giải thích để củng cố kiến thức.');
    $('resultDesc').textContent='Lớp '+current.grade+' · '+(current.topic==='all'?'Tất cả chủ đề':topicLabel(current.items[0]))+' · '+total+' câu · '+Math.floor(elapsed/60)+' phút '+elapsed%60+' giây';
    showResults();
    saveHistory();
    $('results').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function showResults() {
    const list=$('reviewList');list.replaceChildren();
    current.items.forEach((q,i)=>{
      const chosen=current.answers[q.id],attempted=chosen!==undefined,ok=chosen===q.answer;
      const detail=make('details','review-item');
      const summary=make('summary',ok?'result-ok':attempted?'result-bad':'', (ok?'✓ ':attempted?'✕ ':'— ')+'Câu '+(i+1)+'. '+q.question);
      detail.append(summary);
      detail.append(make('p','answerline','Đã chọn: '+(attempted?labels[chosen]+'. '+q.options[chosen]:'Chưa trả lời')));
      detail.append(make('p','answerline result-ok','Đáp án đúng: '+labels[q.answer]+'. '+q.options[q.answer]));
      detail.append(make('p','',q.explanation),make('small','source',sourceLabel(q)));
      list.append(detail);
    });
  }
  function history() {
    try {const x=JSON.parse(localStorage.getItem('vietsu-exams-v411')||'[]');return Array.isArray(x)?x:[];}catch(_){return [];}
  }
  function saveHistory(){
    const row={at:new Date().toISOString(),grade:current.grade,mode:current.mode,correct:complete.correct,total:complete.total,score:complete.score};
    try{localStorage.setItem('vietsu-exams-v411',JSON.stringify([row,...history()].slice(0,20)));}catch(_){}
    showHistory();
  }
  function showHistory(){
    const list=$('historyList');list.replaceChildren();
    const rows=history();
    if(!rows.length){list.append(make('p','note','Chưa có lượt làm bài nào được lưu trên thiết bị này.'));return;}
    for(const row of rows.slice(0,8)){
      const date=new Date(row.at);
      const el=make('div','history-row');
      el.append(make('span','', 'Lớp '+row.grade+' · '+(row.mode==='exam'?'Thi thử':'Ôn tập')+' · '+(Number.isNaN(date.getTime())?'':date.toLocaleString('vi-VN'))), make('strong','',row.correct+'/'+row.total+' câu · '+row.score+'/10'));
      list.append(el);
    }
  }
  function reset() {
    if(interval){clearInterval(interval);interval=null;}
    current=null;complete=null;$('quiz').classList.add('hidden');$('results').classList.add('hidden');$('setup').classList.remove('hidden');
    $('setup').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function init() {
    if(!VALID){$('error').textContent='Không thể khởi tạo ngân hàng: cần đủ 93 câu hợp lệ (33 lớp 10, 30 lớp 11, 30 lớp 12).';$('startButton').disabled=true;return;}
    initGrades();
    $('topicSelect').addEventListener('change',countOptions);
    $('modeSelect').addEventListener('change',toggleMode);
    $('startButton').addEventListener('click',start);
    $('prevButton').addEventListener('click',()=>{if(current&&current.pos>0){current.pos--;render();}});
    $('nextButton').addEventListener('click',()=>{if(current){current.pos=(current.pos+1)%current.items.length;render();}});
    $('finishButton').addEventListener('click',()=>finish(false));
    $('exitButton').addEventListener('click',()=>{if(window.confirm('Thoát lượt làm bài hiện tại? Các đáp án chưa nộp sẽ không được lưu.'))reset();});
    $('againButton').addEventListener('click',start);
    $('newButton').addEventListener('click',reset);
    $('clearHistory').addEventListener('click',()=>{if(window.confirm('Xóa kết quả thi đã lưu trên thiết bị này?')){try{localStorage.removeItem('vietsu-exams-v411');}catch(_){}showHistory();}});
    toggleMode();showHistory();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
