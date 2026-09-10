(()=>{
const KEY='micro-blitz-highlighted';
function load(){try{return new Set(JSON.parse(localStorage.getItem(KEY)||'[]'))}catch{return new Set()}}
let marks=load();
const marked=()=>all.filter(q=>marks.has(q.id));
function save(){try{localStorage.setItem(KEY,JSON.stringify([...marks]))}catch{}}
function countUI(){let o=scope.querySelector('option[value="highlighted"]');if(o)o.textContent=`★ Highlighted — ${marked().length}`}
function markUI(){let b=document.getElementById('markbtn'),id=qid.textContent,on=marks.has(id);if(!b)return;b.textContent=on?'★ Highlighted':'☆ Highlight';b.style.borderColor=on?'var(--amber)':'';b.style.color=on?'var(--amber)':''}
function toggle(){let id=qid.textContent;if(!/^([GS])\d+$/.test(id))return;if(marks.has(id))marks.delete(id);else marks.add(id);save();countUI();markUI();pace()}
window.addEventListener('DOMContentLoaded',()=>{
  const first=scope.querySelector('option');const opt=document.createElement('option');opt.value='highlighted';opt.textContent=`★ Highlighted — ${marked().length}`;first.after(opt);
  const b=document.createElement('button');b.id='markbtn';b.textContent='☆ Highlight';b.title='Save this question for later revisions (M)';document.querySelector('.controls').insertBefore(b,status);b.onclick=toggle;
  const basePick=pick;pick=function(){return scope.value==='highlighted'?marked():basePick()};
  const baseDraw=draw;draw=function(reset=1){baseDraw(reset);markUI()};
  const baseStart=startRun;startRun=function(){if(!examPreset()&&scope.value==='highlighted'&&!marked().length){question.textContent='No highlighted questions yet. Highlight questions during a revision, then choose ★ Highlighted.';answer.textContent='';return}baseStart()};
  const basePace=pace;pace=function(){basePace();document.getElementById('pace').insertAdjacentHTML('beforeend',`<span class="tag">★ <b>${marked().length}</b> saved</span>`)};
  start.onclick=startRun;again.onclick=startRun;document.getElementById('order').onchange=pace;
  document.addEventListener('keydown',e=>{if(e.target.matches('input,select'))return;if(e.key.toLowerCase()==='m')toggle()});
  pace();markUI();
});
})();
