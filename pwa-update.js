/* Compare a small static version file; refreshing always needs an explicit click. */
(()=>{
 'use strict';
 const current=document.querySelector('meta[name="atelier-version"]')?.content;
 if(!current||!/^https?:$/.test(location.protocol))return;
 let checking=false,lastCheck=0,pending='',dismissed='',notice=null;
 const styles=document.createElement('style');
 styles.textContent='#atelierUpdateNotice{position:fixed;z-index:2000;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 16px);width:min(360px,calc(100vw - 24px));padding:14px;border:1px solid var(--border-strong,#aaa);border-radius:12px;background:var(--modal,#f5f4f2);color:var(--text,#303030);box-shadow:0 4px 20px #0003;font:14px/1.5 system-ui;box-sizing:border-box}#atelierUpdateNotice p{margin:0 0 10px}#atelierUpdateNotice .update-actions{display:flex;justify-content:flex-end;gap:8px}#atelierUpdateNotice button{min-height:44px;padding:8px 14px;border:1px solid var(--border-strong,#aaa);border-radius:8px;background:var(--field,#eee);color:inherit;font:inherit}html[data-mobile-shell] #atelierUpdateNotice{bottom:calc(var(--mobile-tabs-height,65px) + 12px)}';
 document.head.append(styles);
 function blocked(){
  if(typeof jobs!=='undefined'&&jobs.some(j=>j.status==='run'))return '正在生成，完成后再点更新。';
  const modal=document.querySelector('#modal');
  if(modal?.classList.contains('open')&&modal._dirty)return '编辑还没有保存，请先存好或取消编辑，再点更新。';
  if(document.querySelector('#uiGalleryDialog[open]'))return '请先完成当前编辑，再点更新。';
  if(typeof asBusy==='function'&&asBusy())return '助手还在回复，完成后再点更新。';
  return '';
 }
 function show(version){
  pending=version;
  if(notice)return;
  notice=document.createElement('section');notice.id='atelierUpdateNotice';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');
  const message=document.createElement('p');message.textContent='有新版本，更新后继续使用。';
  const actions=document.createElement('div');actions.className='update-actions';
  const later=document.createElement('button');later.id='atelierUpdateLater';later.type='button';later.textContent='稍后';
  later.onclick=()=>{dismissed=pending;notice.remove();notice=null;};
  const update=document.createElement('button');update.id='atelierUpdateNow';update.type='button';update.textContent='更新';
  update.onclick=()=>{
   const reason=blocked();if(reason){message.textContent=reason;return;}
   try{
    // Existing main controls persist their values through their normal change handlers.
    const focused=document.activeElement;
    if(focused?.matches('input,textarea,select'))focused.dispatchEvent(new Event('change',{bubbles:true}));
    const draft=document.querySelector('#prompt');
    if(draft&&typeof P!=='undefined'&&draft.value!==P.prompt){draft.dispatchEvent(new Event('input',{bubbles:true}));}
    if(typeof imageSyncActiveParams==='function')imageSyncActiveParams();
    if(typeof P!=='undefined'&&typeof LS!=='undefined'&&LS.set('gw-p',P)===false){message.textContent='当前设置未保存，请先备份再更新。';return;}
    const url=new URL(location.href);url.searchParams.set('atelier-update',pending);location.replace(url.href);
   }catch{message.textContent='暂时无法更新，请稍后重试。';}
  };
  actions.append(later,update);notice.append(message,actions);document.body.append(notice);
 }
 async function check(){
  if(document.hidden||checking||Date.now()-lastCheck<60000)return;
  checking=true;lastCheck=Date.now();
  try{
   const url=new URL('version.json',document.baseURI);url.searchParams.set('t',String(Date.now()));
   const res=await fetch(url,{cache:'no-store',credentials:'omit'});
   if(!res.ok)return;
   const value=(await res.json()).version;
   if(typeof value!=='string'||!/^[a-zA-Z0-9._-]{1,80}$/.test(value))return;
   if(value!==current&&value!==dismissed)show(value);
  }catch{}finally{checking=false;}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check,{once:true});else check();
 addEventListener('focus',check);addEventListener('online',check);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
 setInterval(check,5*60*1000);
})();
