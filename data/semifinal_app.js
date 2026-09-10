const $=id=>document.getElementById(id),all=window.BLITZ_QUESTIONS||[],C=window.BLITZ_CHAPTERS||[];
const pools={G:all.filter(q=>q.id[0]==='G'),S:all.filter(q=>q.id[0]==='S')};
const themes={light:'#f5f7fa',dark:'#07090d',amoled:'#000'};
const MARK_KEY='micro-blitz-highlighted';
function loadMarks(){try{return new Set(JSON.parse(localStorage.getItem(MARK_KEY)||'[]'))}catch{return new Set()}}
let marks=loadMarks();
function saveMarks(){try{localStorage.setItem(MARK_KEY,JSON.stringify([...marks]))}catch{}}
function markedPool(){return all.filter(q=>marks.has(q.id))}
function updateMarkedCount(){let o=$('scope').querySelector('option[value="highlighted"]');if(o)o.textContent=`★ Highlighted — ${markedPool().length}`}
function markUI(){let b=$('markbtn'),q=deck[i],on=!!q&&marks.has(q.id);if(!b)return;b.textContent=on?'★ Highlighted':'☆ Highlight';b.style.borderColor=on?'var(--amber)':'';b.style.color=on?'var(--amber)':''}
function markCurrent(){if(!deck.length||!deck[i])return;let id=deck[i].id;if(marks.has(id))marks.delete(id);else marks.add(id);saveMarks();updateMarkedCount();markUI();pace()}
function theme(v){if(!themes[v])v='dark';document.documentElement.dataset.theme=v;$('theme').value=v;$('themeMeta').content=themes[v];try{localStorage.setItem('micro-blitz-theme',v)}catch{}}
function initTheme(){let v='dark';try{v=localStorage.getItem('micro-blitz-theme')||'dark'}catch{}theme(v)}
function num(id){return+id.slice(1)}
function inside(c,q){return c&&c.start[0]===q.id[0]&&num(q.id)>=num(c.start)&&num(q.id)<=num(c.end)}
function chap(q){return C.find(c=>inside(c,q))}
function options(){scope.innerHTML=`<option value="all">All minimum questions — 228</option><option value="highlighted">★ Highlighted — ${markedPool().length}</option><option value="general">General microbiology — G1–G66</option><option value="systematic">Systematic bacteriology — S1–S162</option>${C.map(c=>`<option value="c${c.n}">${String(c.n).padStart(2,'0')} · ${c.title} — ${c.start}–${c.end}</option>`).join('')}`}
function pick(){let v=scope.value;if(v==='all')return [...all];if(v==='highlighted')return markedPool();if(v==='general')return [...pools.G];if(v==='systematic')return [...pools.S];let c=C.find(x=>'c'+x.n===v);return all.filter(q=>inside(c,q))}
function shuffle(a){for(let j=a.length-1;j>0;j--){let k=Math.floor(Math.random()*(j+1));[a[j],a[k]]=[a[k],a[j]]}return a}
function sample(a,n){return shuffle([...a]).slice(0,Math.min(n,a.length))}
const EXAMS={oral44:[4,4],oral48:[4,8],oral416:[4,16],oral816:[8,16],oral08:[0,8],oral016:[0,16]};
function examPreset(){return EXAMS[$('runmode').value]||null}
function targetCount(){let e=examPreset();return e?e[0]+e[1]:(pick().length||1)}
function buildDeck(){let e=examPreset(),d;if(e){let[g,s]=e;d=[...sample(pools.G,g),...sample(pools.S,s)]}else d=pick();if($('order').value==='random')return shuffle(d);return d.sort((a,b)=>all.indexOf(a)-all.indexOf(b))}
let sync=0;
function fromMin(){if(sync)return;sync=1;let n=targetCount(),m=Math.max(.1,+minutes.value||20);secq.value=(m*60/n).toFixed(1);sync=0;pace()}
function fromSec(){if(sync)return;sync=1;let n=targetCount(),s=Math.max(.2,+secq.value||6);minutes.value=(s*n/60).toFixed(1);sync=0;pace()}
function pace(){let n=targetCount(),s=Math.max(.2,+secq.value||6),h=s/2,e=examPreset(),ord=$('order').value==='random'?'random order':'source order';$('pace').innerHTML=`<span class="tag"><b>${n}</b> prompts</span><span class="tag"><b>${s.toFixed(1)} s</b> each</span><span class="tag">${h.toFixed(1)} s recall + ${h.toFixed(1)} s reveal</span><span class="tag">≈ <b>${(s*n/60).toFixed(1)} min</b></span><span class="tag">${e?`<b>${e[0]} General + ${e[1]} Systematic</b> · fresh draw`:ord}</span><span class="tag">★ <b>${markedPool().length}</b> saved</span>`}
let deck=[],i=0,run=0,paused=0,reveal=0,elapsed=0,last=0,raf=0,slot=6,hints=1;
function fmt(s){s=Math.max(0,Math.ceil(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function draw(reset=1){if(!deck.length)return;if(reset){elapsed=0;reveal=0}let q=deck[i],c=chap(q);qid.textContent=q.id;chapter.textContent=c?`${String(c.n).padStart(2,'0')} · ${c.title}`:'';question.textContent=q.q;answer.textContent=q.a;content.classList.toggle('revealed',reveal);phase.textContent=reveal?'Reveal':'Recall';phase.style.color=reveal?'var(--green)':'var(--blue)';hint.classList.toggle('on',reveal&&hints);if(c){hlens.textContent=c.lens;htext.textContent=c.hooks[all.indexOf(q)%c.hooks.length]}else{hlens.textContent='';htext.textContent=''}status.textContent=`${i+1} / ${deck.length}`;markUI();visual()}
function visual(){fill.style.width=Math.min(100,elapsed/slot*100)+'%';fill.style.background=reveal?'var(--green)':'var(--blue)';clock.textContent=fmt((deck.length-i-1)*slot+Math.max(0,slot-elapsed))}
function frame(t){if(!run||paused)return;if(!last)last=t;elapsed+=(t-last)/1000;last=t;if(!reveal&&elapsed>=slot/2){reveal=1;draw(0)}if(elapsed>=slot){i++;if(i>=deck.length){finish();return}elapsed=0;reveal=0;last=t;draw();raf=requestAnimationFrame(frame);return}visual();raf=requestAnimationFrame(frame)}
function startRun(){deck=buildDeck();if(!deck.length){question.textContent='No highlighted questions yet. Highlight questions during a revision, then choose ★ Highlighted.';answer.textContent='';return}i=0;slot=Math.max(.5,+secq.value||6);hints=$('hints').checked;run=1;paused=0;last=0;elapsed=0;reveal=0;end.classList.remove('on');$('run').style.display='flex';pause.textContent='Pause';draw();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)}
function move(d){if(!run)return;i+=d;if(i<0)i=0;if(i>=deck.length)return finish();elapsed=0;reveal=0;last=performance.now();draw()}
function pauseRun(){if(!run)return;paused=!paused;pause.textContent=paused?'Resume':'Pause';if(!paused){last=0;raf=requestAnimationFrame(frame)}}
function finish(){run=0;paused=0;cancelAnimationFrame(raf);$('run').style.display='none';end.classList.add('on');let e=examPreset(),ord=$('order').value==='random'?'random order':'source order';endsummary.textContent=e?`${e[0]+e[1]}-question oral set complete: ${e[0]} General + ${e[1]} Systematic. Run again for a fresh draw.`:`${deck.length} prompts swept in ${ord}. ${markedPool().length} highlighted for later.`}
function hintToggle(){hints=!hints;$('hints').checked=hints;hint.classList.toggle('on',reveal&&hints)}
function modeChange(){let e=examPreset();scope.disabled=!!e;start.textContent=e?`Generate ${e[0]} + ${e[1]}`:'Start blitz';fromSec()}
scope.onchange=fromMin;$('runmode').onchange=modeChange;$('order').onchange=pace;minutes.oninput=fromMin;secq.oninput=fromSec;$('theme').onchange=e=>theme(e.target.value);$('hints').onchange=()=>{hints=$('hints').checked;hint.classList.toggle('on',reveal&&hints)};
start.onclick=startRun;again.onclick=startRun;pause.onclick=pauseRun;prev.onclick=()=>move(-1);next.onclick=()=>move(1);hintbtn.onclick=hintToggle;$('markbtn').onclick=markCurrent;
document.addEventListener('keydown',e=>{if(e.target.matches('input,select'))return;if(e.code==='Space'){e.preventDefault();pauseRun()}else if(e.key==='ArrowRight')move(1);else if(e.key==='ArrowLeft')move(-1);else if(e.key.toLowerCase()==='h')hintToggle();else if(e.key.toLowerCase()==='m')markCurrent()});
options();initTheme();modeChange();if(all.length!==228)question.textContent=`Data load error: expected 228 prompts, found ${all.length}.`;
