import './posthog.mjs';
const header=document.querySelector('[data-header]');
const toast=document.querySelector('.wa-toast');
const modal=document.querySelector('#product-video');
let toastTimer;

function notify(message){
  clearTimeout(toastTimer);
  toast.textContent=message;
  toast.classList.add('is-visible');
  toastTimer=setTimeout(()=>toast.classList.remove('is-visible'),2800);
}

document.addEventListener('click',event=>{
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='video')modal.showModal();
  if(action==='close')modal.close();
  if(action==='login')notify('演示账号无需登录，点击“免费试用”即可进入。');
  if(action==='contact')notify('演示模式：商务联系入口已记录。');
  if(action==='menu'){
    const button=event.target.closest('button');
    const open=header.classList.toggle('is-menu-open');
    button.setAttribute('aria-expanded',String(open));
  }
  if(event.target.closest('a[href^="#"]'))header.classList.remove('is-menu-open');
});

modal.addEventListener('click',event=>{
  if(event.target===modal){
    const box=modal.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)modal.close();
  }
});

const observer=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting)entry.target.classList.add('is-revealed');
},{threshold:.14});
document.querySelectorAll('.wa-section,.wa-people,.wa-technology,.wa-cta').forEach(section=>observer.observe(section));
addEventListener('scroll',()=>header.classList.toggle('is-scrolled',scrollY>16),{passive:true});
