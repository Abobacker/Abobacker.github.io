(()=>{
const HS=window.HighlightSync;
const marked=()=>HS?HS.filter(all):[];
function countUI(){let o=scope.querySelector('option[value="highlighted"]');if(o)o.textContent=`★ Highlighted — ${marked().length}`}
function markUI(){let b=document.getElementById('markbtn'),id=qid.textContent,on=!!HS&&HS.has(id);if(!b)return;b.textContent=on?'★ Highlighted':'☆ Highlight';b.style.borderColor=on?'var(--amber)':'';b.style.color=on?'var(--amber)':''}
async function toggle(){let id=qid.textContent;if(!/^([GS])\d+$/.test(id)||!HS)return;await HS.toggle(id);countUI();markUI();pace()}
window.addEventListener('DOMContentLoaded',()=>{
  const first=scope.querySelector('option');const opt=document.createElement('option');opt.value='highlighted';opt.textContent=`★ Highlighted — ${marked().length}`;first.after(opt);
  const b=document.getElementById('markbtn');if(b){b.title='Save this question to the shared revision list (M)';b.onclick=toggle}
  const basePick=pick;pick=function(){return scope.value==='highlighted'?marked():basePick()};
  const baseDraw=draw;draw=function(reset=1){baseDraw(reset);markUI()};
  const baseStart=startRun;startRun=function(){if(!examPreset()&&scope.value==='highlighted'&&!marked().length){question.textContent='No highlighted questions yet. Highlight questions during a revision, then choose ★ Highlighted.';answer.textContent='';return}baseStart()};
  const basePace=pace;pace=function(){basePace();document.getElementById('pace').insertAdjacentHTML('beforeend',`<span class="tag">★ <b>${marked().length}</b> shared</span>`)};
  start.onclick=startRun;again.onclick=startRun;document.getElementById('order').onchange=pace;
  document.addEventListener('keydown',e=>{if(e.target.matches('input,select'))return;if(e.key.toLowerCase()==='m')toggle()});
  if(HS){HS.onChange(()=>{countUI();markUI();pace()});HS.init()}
  pace();markUI();
});
})();
