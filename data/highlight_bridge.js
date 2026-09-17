(()=>{
const HS=window.HighlightSync;if(!HS)return;
const markId=q=>q?(q.markId||q.id):null;
markedPool=()=>all.filter(q=>HS.has(markId(q)));
updateMarkedCount=function(){const o=document.getElementById('scope')?.querySelector('option[value="highlighted"]');if(o)o.textContent=`★ Highlighted — ${markedPool().length}`};
markUI=function(){const b=document.getElementById('markbtn'),q=(typeof deck!=='undefined'&&deck.length)?deck[i]:null,on=!!q&&HS.has(markId(q));if(!b)return;b.textContent=on?'★ Highlighted':'☆ Highlight';b.style.borderColor=on?'var(--amber)':'';b.style.color=on?'var(--amber)':'';b.title='Shared across devices · M'};
markCurrent=async function(){if(typeof deck==='undefined'||!deck.length||!deck[i])return;await HS.toggle(markId(deck[i]));updateMarkedCount();markUI();pace()};
const b=document.getElementById('markbtn');if(b)b.onclick=markCurrent;
HS.onChange(()=>{updateMarkedCount();markUI();pace()});
HS.init();
})();
