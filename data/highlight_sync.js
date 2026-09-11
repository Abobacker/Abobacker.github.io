(()=>{
const LOCAL_KEY='micro-blitz-highlighted';
const MIGRATION_KEY='micro-blitz-shared-migrated-v1';
const URL='https://szywejxqheerokgrfglr.supabase.co';
const KEY='sb_publishable_ErnZd7V2lwH0mPwMkUpxCg_IbFecey8';
let marks=new Set();
let listeners=[];
function valid(id){return /^[GSMPV]\d+$/.test(id)}
function loadLocal(){try{return new Set((JSON.parse(localStorage.getItem(LOCAL_KEY)||'[]')||[]).filter(valid))}catch{return new Set()}}
function saveLocal(){try{localStorage.setItem(LOCAL_KEY,JSON.stringify([...marks]))}catch{}}
function notify(){saveLocal();listeners.forEach(fn=>{try{fn(new Set(marks))}catch{}})}
async function req(path,opts={}){
 const headers={apikey:KEY,'Content-Type':'application/json',...(opts.headers||{})};
 const r=await fetch(URL+'/rest/v1/'+path,{...opts,headers});
 if(!r.ok)throw new Error('Shared highlight sync failed: '+r.status);
 if(r.status===204)return null;
 const t=await r.text();return t?JSON.parse(t):null;
}
async function pushUnion(ids){
 const rows=[...new Set(ids)].filter(valid).map(question_id=>({question_id}));
 if(!rows.length)return;
 await req('shared_highlights?on_conflict=question_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(rows)});
}
async function pull(){
 try{
  const data=await req('shared_highlights?select=question_id&order=question_id');
  marks=new Set((data||[]).map(x=>x.question_id).filter(valid));notify();return true;
 }catch(e){console.warn(e);return false}
}
async function init(){
 marks=loadLocal();notify();
 let migrated=false;try{migrated=localStorage.getItem(MIGRATION_KEY)==='1'}catch{}
 try{
  if(!migrated){await pushUnion(marks);try{localStorage.setItem(MIGRATION_KEY,'1')}catch{}}
  await pull();
 }catch(e){console.warn(e)}
 setInterval(()=>{if(document.visibilityState==='visible')pull()},15000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')pull()});
}
async function toggle(id){
 if(!valid(id))return;
 const adding=!marks.has(id);
 if(adding)marks.add(id);else marks.delete(id);notify();
 try{
  if(adding)await pushUnion([id]);
  else await req('shared_highlights?question_id=eq.'+encodeURIComponent(id),{method:'DELETE',headers:{Prefer:'return=minimal'}});
 }catch(e){console.warn(e);await pull()}
}
marks=loadLocal();
window.HighlightSync={has:id=>marks.has(id),count:()=>marks.size,values:()=>[...marks],filter:items=>items.filter(q=>marks.has(q.id)),toggle,pull,onChange(fn){listeners.push(fn);return()=>listeners=listeners.filter(x=>x!==fn)},init};
})();
