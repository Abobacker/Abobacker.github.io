const $=id=>document.getElementById(id),all=window.BLITZ_QUESTIONS||[],C=window.BLITZ_CHAPTERS||[];
const pools={G:all.filter(q=>q.id[0]==='G'),S:all.filter(q=>q.id[0]==='S'),M:all.filter(q=>q.id[0]==='M'),P:all.filter(q=>q.id[0]==='P'),V:all.filter(q=>q.id[0]==='V')};
const themes={light:'#f5f7fa',dark:'#07090d',amoled:'#000'};
function theme(v){if(!themes[v])v='dark';document.documentElement.dataset.theme=v;$('theme').value=v;$('themeMeta').content=themes[v];try{localStorage.setItem('micro-final-theme',v)}catch{}}
function initTheme(){let v='dark';try{v=localStorage.getItem('micro-final-theme')||localStorage.getItem('micro-blitz-theme')||'dark'}catch{}theme(v)}
function num(id){return +id.slice(1)}function inside(c,q){return c&&c.start[0]===q.id[0]&&num(q.id)>=num(c.start)&&num(q.id)<=num(c.end)}function chap(q){return C.find(c=>inside(c,q))}
function options(){
  const old=C.filter(c=>c.n<=12).map(c=>`<option value="c${c.n}">${String(c.n).padStart(2,'0')} · ${c.title} — ${c.start}–${c.end}</option>`).join('');
  const newer=C.filter(c=>c.n>12).map(c=>`<option value="c${c.n}">${String(c.n).padStart(2,'0')} · ${c.title} — ${c.start}–${c.end}</option>`).join('');
  scope.innerHTML='<option value="all">All final minimums — 338</option><option value="general">I · General microbiology — 66</option><option value="systematic">II · Systematic bacteriology — 162</option><option value="mycology">III · Mycology — 19</option><option value="parasitology">IV · Parasitology — 43</option><option value="virology">V · Virology — 48</option><optgroup label="Bacteriology sub-sections">'+old+'</optgroup><optgroup label="Final-block sub-sections">'+newer+'</optgroup>'
}
function pick(){
 let v=scope.value;if(v==='all')return [...all];if(v==='general')return [...pools.G];if(v==='systematic')return [...pools.S];if(v==='mycology')return [...pools.M];if(v==='parasitology')return [...pools.P];if(v==='virology')return [...pools.V];
 let c=C.find(x=>'c'+x.n===v);return all.filter(q=>inside(c,q))
}
function shuffle(a){for(let j=a.length-1;j>0;j--){let k=Math.floor(Math.random()*(j+1));[a[j],a[k]]=[a[k],a[j]]}return a}
function sample(a,n){return shuffle([...a]).slice(0,Math.min(n,a.length))}
const PRESETS={gs44:[4,4,0,0,0],gs48:[4,8,0,0,0],gs08:[0,8,0,0,0],gs016:[0,16,0,0,0]};
const mixIds=['gcount','scount','mcount','pcount','vcount'], mixPrefixes=['G','S','M','P','V'];
function mixCounts(){return mixIds.map((id,i)=>Math.max(0,Math.min(pools[mixPrefixes[i]].length,Math.floor(+$(id).value||0))))}
function targetCount(){return $('runmode').value==='mix'?Math.max(1,mixCounts().reduce((a,b)=>a+b,0)):(pick().length||1)}
function buildDeck(){
 let d;if($('runmode').value==='mix'){d=[];mixCounts().forEach((n,i)=>d.push(...sample(pools[mixPrefixes[i]],n)))}else d=pick();
 if($('order').value==='random')return shuffle(d);return d.sort((a,b)=>all.indexOf(a)-all.indexOf(b))
}
let sync=0;
function fromMin(){if(sync)return;sync=1;let n=targetCount(),m=Math.max(.1,+minutes.value||30);secq.value=(m*60/n).toFixed(1);sync=0;pace()}
function fromSec(){if(sync)return;sync=1;let n=targetCount(),s=Math.max(.2,+secq.value||6);minutes.value=(s*n/60).toFixed(1);sync=0;pace()}
function pace(){
 let n=targetCount(),s=Math.max(.2,+secq.value||6),h=s/2,ord=$('order').value==='random'?'random order':'source order';
 let mode=$('runmode').value==='mix'?'random block mix':ord;
 $('pace').innerHTML=`<span class="tag"><b>${n}</b> prompts</span><span class="tag"><b>${s.toFixed(1)} s</b> each</span><span class="tag">${h.toFixed(1)} s recall + ${h.toFixed(1)} s reveal</span><span class="tag">≈ <b>${(s*n/60).toFixed(1)} min</b></span><span class="tag">${mode}</span>`
}
let deck=[],i=0,run=0,paused=0,reveal=0,elapsed=0,last=0,raf=0,slot=6,hints=1;
function fmt(s){s=Math.max(0,Math.ceil(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function draw(reset=1){if(!deck.length)return;if(reset){elapsed=0;reveal=0}let q=deck[i],c=chap(q);qid.textContent=q.id;chapter.textContent=c?`${String(c.n).padStart(2,'0')} · ${c.title}`:blockName(q.id[0]);question.textContent=q.q;answer.textContent=q.a;content.classList.toggle('revealed',reveal);phase.textContent=reveal?'Reveal':'Recall';phase.style.color=reveal?'var(--green)':'var(--blue)';hint.classList.toggle('on',reveal&&hints);if(c){hlens.textContent=c.lens;htext.textContent=c.hooks[all.indexOf(q)%c.hooks.length]}else{hlens.textContent='';htext.textContent=''}status.textContent=`${i+1} / ${deck.length}`;visual()}
function blockName(p){return {G:'I · General microbiology',S:'II · Systematic bacteriology',M:'III · Mycology',P:'IV · Parasitology',V:'V · Virology'}[p]||''}
function visual(){fill.style.width=Math.min(100,elapsed/slot*100)+'%';fill.style.background=reveal?'var(--green)':'var(--blue)';clock.textContent=fmt((deck.length-i-1)*slot+Math.max(0,slot-elapsed))}
function frame(t){if(!run||paused)return;if(!last)last=t;elapsed+=(t-last)/1000;last=t;if(!reveal&&elapsed>=slot/2){reveal=1;draw(0)}if(elapsed>=slot){i++;if(i>=deck.length){finish();return}elapsed=0;reveal=0;last=t;draw();raf=requestAnimationFrame(frame);return}visual();raf=requestAnimationFrame(frame)}
function startRun(){deck=buildDeck();if(!deck.length){question.textContent='Choose at least one question in the random mix.';return}i=0;slot=Math.max(.5,+secq.value||6);hints=$('hints').checked;run=1;paused=0;last=0;elapsed=0;reveal=0;end.classList.remove('on');$('run').style.display='flex';pause.textContent='Pause';draw();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)}
function move(d){if(!run)return;i+=d;if(i<0)i=0;if(i>=deck.length)return finish();elapsed=0;reveal=0;last=performance.now();draw()}
function pauseRun(){if(!run)return;paused=!paused;pause.textContent=paused?'Resume':'Pause';if(!paused){last=0;raf=requestAnimationFrame(frame)}}
function finish(){run=0;paused=0;cancelAnimationFrame(raf);$('run').style.display='none';end.classList.add('on');let ord=$('order').value==='random'?'random order':'source order';if($('runmode').value==='mix'){let c=mixCounts();endsummary.textContent=`${deck.length}-question random final set complete: G ${c[0]} · S ${c[1]} · M ${c[2]} · P ${c[3]} · V ${c[4]}. Run again for a fresh draw.`}else endsummary.textContent=`${deck.length} prompts swept in ${ord}.`}
function hintToggle(){hints=!hints;$('hints').checked=hints;hint.classList.toggle('on',reveal&&hints)}
function modeChange(){let mix=$('runmode').value==='mix';scope.disabled=mix;$('mixpanel').classList.toggle('on',mix);start.textContent=mix?'Generate exam set':'Start final blitz';fromSec()}
function presetChange(){let p=PRESETS[$('preset').value];if(p){mixIds.forEach((id,i)=>$(id).value=p[i])}fromSec()}
function customMixChange(){$('preset').value='custom';fromSec()}
scope.onchange=fromMin;$('runmode').onchange=modeChange;$('order').onchange=pace;minutes.oninput=fromMin;secq.oninput=fromSec;$('theme').onchange=e=>theme(e.target.value);
$('hints').onchange=()=>{hints=$('hints').checked;hint.classList.toggle('on',reveal&&hints)};$('preset').onchange=presetChange;document.querySelectorAll('.mixcount').forEach(x=>x.oninput=customMixChange);
start.onclick=startRun;again.onclick=startRun;pause.onclick=pauseRun;prev.onclick=()=>move(-1);next.onclick=()=>move(1);hintbtn.onclick=hintToggle;
document.addEventListener('keydown',e=>{if(e.target.matches('input,select'))return;if(e.code==='Space'){e.preventDefault();pauseRun()}else if(e.key==='ArrowRight')move(1);else if(e.key==='ArrowLeft')move(-1);else if(e.key.toLowerCase()==='h')hintToggle()});
options();initTheme();modeChange();if(all.length!==338)question.textContent=`Data load error: expected 338 prompts, found ${all.length}.`;
