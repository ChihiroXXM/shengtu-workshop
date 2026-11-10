/* Online install shell only. No service worker, telemetry or user-data upload. */
(()=>{
 'use strict';
 if(location.protocol!=='https:'&&!(location.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(location.hostname)))return;
 let installEvent=null;
 const standalone=()=>matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true;
 const apple=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const iosBrowser=()=>/CriOS|FxiOS|EdgiOS|OPiOS/.test(navigator.userAgent);
 function sync(){
  const label=document.querySelector('#webInstallLabel');if(label)label.textContent=standalone()?'已安装到桌面':'安装到桌面';
  const action=document.querySelector('#webInstallAction');if(action)action.hidden=!installEvent||standalone();
 }
 function openInstall(){
  document.querySelector('#uiMore')?.removeAttribute('open');
  let text;
  if(standalone())text='现在已在独立窗口中打开，可以继续使用。';
  else if(apple())text=iosBrowser()?'先用 Safari 打开当前网址，再点分享 → 加入主屏幕；如有“作为网页 App 打开”，请保持开启。':'点 Safari 的分享按钮 → 加入主屏幕；如有“作为网页 App 打开”，请保持开启。';
  else if(installEvent)text='点击下方安装，完成后可以从桌面图标打开。';
  else text='打开浏览器菜单，选择“安装应用”或“添加到主屏幕”。没有这项时，可以继续用当前网页。';
  openModal(mHead('安装到桌面','')+'<div class="m-body"><p>'+text+'</p><p class="hint" style="margin-top:14px">第一次从旧 HTML 换到这个网址：先在旧版导出备份 ZIP，再到这里的备份与恢复中导入。资料保存在当前设备的浏览器里，不会自动同步。</p><p class="hint" style="margin-top:10px">此版需要联网打开和生成；安装后仍使用你自己的接口。</p></div><div class="m-foot" style="flex-wrap:wrap"><button type="button" class="gbtn" id="webInstallBackup">备份与恢复</button><button type="button" class="gbtn" id="webInstallClose">关闭</button><button type="button" class="gbtn solid" id="webInstallAction"'+(!installEvent||standalone()?' hidden':'')+'>安装</button></div>');
  document.querySelector('#mBox')?.setAttribute('data-web-install-dialog','');
  document.querySelector('#webInstallClose').onclick=closeModal;
  document.querySelector('#webInstallBackup').onclick=()=>{closeModal();openBackup();};
  document.querySelector('#webInstallAction').onclick=async()=>{
   const event=installEvent,button=document.querySelector('#webInstallAction');if(!event)return;
   button.disabled=true;installEvent=null;
   try{await event.prompt();const choice=await event.userChoice;if(choice?.outcome==='accepted')closeModal();else{button.hidden=true;toast('已取消安装，可以继续使用网页');}}
   catch{button.hidden=true;toast('请从浏览器菜单选择安装或加入主屏幕');}
   finally{if(button.isConnected)button.disabled=false;sync();}
  };
 }
 function mount(){
  const menu=document.querySelector('#uiMoreMenu');if(!menu||document.querySelector('#webInstallEntry'))return;
  const button=document.createElement('button');button.id='webInstallEntry';button.type='button';button.className='gbtn uq-menu-item';
  button.innerHTML=uiIcon('09-08')+'<span id="webInstallLabel">安装到桌面</span>';button.onclick=event=>{event.preventDefault();event.stopPropagation();openInstall();};button.addEventListener('pointerdown',event=>event.stopPropagation());menu.prepend(button);sync();
 }
 addEventListener('beforeinstallprompt',event=>{event.preventDefault();installEvent=event;mount();sync();});
 addEventListener('appinstalled',()=>{installEvent=null;sync();});
 matchMedia('(display-mode: standalone)').addEventListener?.('change',sync);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
 // Boot creates the More menu asynchronously. Observe only until its first mount.
 const observer=new MutationObserver(()=>{mount();if(document.querySelector('#webInstallEntry'))observer.disconnect();});
 if(!document.querySelector('#webInstallEntry'))observer.observe(document.documentElement,{childList:true,subtree:true});
})();
