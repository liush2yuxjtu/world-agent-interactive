import '../../src/posthog.mjs';
import {createTokenStore} from './store.mjs';
import {CATEGORIES,exportCSS} from './tokens.mjs';
import {shell,overview,catalog,components,accessibility,sourceView,inspector,pageInfo,e} from './views.mjs';
import {button} from '../../src/components.mjs';
import {icon} from '../../src/icons.mjs';
const root=document.querySelector('#app');
let store;
const state={page:'overview',selected:'--color-brand',query:'',view:'grid',component:'Buttons',scenario:'B',autoSave:true,inspectorOpen:innerWidth>1100};
let returnFocus=null,toastTimer=null;
function route(){return location.hash.replace(/^#\//,'')||'overview';}
function toast(text){clearTimeout(toastTimer);const target=document.querySelector('#toast-root');target.innerHTML=`<div class="ds-toast">${icon('check')}<span>${e(text)}</span></div>`;toastTimer=setTimeout(()=>target.replaceChildren(),3200);}
function closeDialog(){const dialog=document.querySelector('#dialog-root dialog');if(dialog){dialog.close();document.querySelector('#dialog-root').replaceChildren();if(returnFocus?.isConnected)returnFocus.focus();}}
function openDialog(title,body){closeDialog();returnFocus=document.activeElement;document.querySelector('#dialog-root').innerHTML=`<dialog class="ds-dialog" aria-labelledby="dialog-title"><header><h2 id="dialog-title">${e(title)}</h2><button class="ds-icon-button" data-action="close-dialog" aria-label="Close dialog">${icon('close')}</button></header><div class="ds-dialog-body">${body}</div></dialog>`;const dialog=document.querySelector('dialog');dialog.showModal();dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog();});dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)closeDialog();}});}
async function copy(text){try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(text);toast('Copied to clipboard');}catch{openDialog('Copy this value',`<p>Your browser did not allow clipboard access. Select and copy the value below.</p><textarea class="ds-copy-fallback" readonly aria-label="Value to copy">${e(text)}</textarea>`);const t=document.querySelector('.ds-copy-fallback');t.focus();t.select();}}
function download(content,type,name){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);toast(`${name} exported`);}
function mainHTML(){if(state.query.trim())return catalog(store,{...state,page:'tokens'});if(state.page==='overview')return overview(store,state);if(state.page==='components')return components(store,state);if(state.page==='accessibility')return accessibility(store,state);if(state.page==='source')return sourceView(store,state);if(CATEGORIES.some(c=>c.id===state.page)||state.page==='tokens')return catalog(store,state);return `<div class="ds-empty"><h1>That page isn’t in the system.</h1><a class="ds-button ds-button--dark" href="#/overview">Back to overview</a></div>`;}
function syncDrawer(){
 const modal=innerWidth<=1100&&state.inspectorOpen;
 for(const selector of ['.ds-sidebar','.ds-topbar','.ds-main']){const el=document.querySelector(selector);if(el)el.inert=modal;}
 const panel=document.querySelector('#inspector');if(panel){panel.setAttribute('role',modal?'dialog':'complementary');if(modal)panel.setAttribute('aria-modal','true');else panel.removeAttribute('aria-modal');}
}
function updateInspector(){document.querySelector('#inspector').innerHTML=inspector(store,state);document.body.classList.toggle('ds-inspector-open',state.inspectorOpen);document.querySelectorAll('[data-token-card]').forEach(card=>{const chosen=card.dataset.tokenCard===state.selected;card.classList.toggle('is-selected',chosen);card.querySelector('.ds-token-open').setAttribute('aria-pressed',String(chosen));});syncDrawer();}
function renderContent(){document.querySelector('#content').innerHTML=mainHTML();updateInspector();}
function render(){const y=window.scrollY;root.innerHTML=shell(store,state);renderContent();document.title=`${pageInfo[state.page]?.[0]||'Design System'} · World Agent`;window.scrollTo(0,y);}
function applyToken(value){try{store.set(state.selected,value);const y=window.scrollY;renderContent();window.scrollTo(0,y);toast('Preview updated · source file unchanged');}catch(error){const target=document.querySelector('#editor-error');if(target){target.textContent=error.message;document.querySelector('#draft-value')?.setAttribute('aria-invalid','true');}else toast(error.message);}}
const actions={
 inspect:el=>{state.selected=el.dataset.name;state.inspectorOpen=true;updateInspector();if(innerWidth<=1100){returnFocus=el;document.querySelector('#draft-value')?.focus({preventScroll:true});}},
 'close-inspector':()=>{state.inspectorOpen=false;document.body.classList.remove('ds-inspector-open');syncDrawer();if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});},
 'toggle-inspector':()=>{state.inspectorOpen=!state.inspectorOpen;updateInspector();},
 'copy-reference':el=>copy(`var(${el.dataset.name})`),
 'copy-value':el=>copy(store.get(el.dataset.name).current),
 'export-css':()=>download(exportCSS(store.tokens,store.overrides),'text/css;charset=utf-8','tokens.css'),
 'export-json':()=>download(JSON.stringify({source:'src/tokens.css',version:'1.0',tokens:Object.fromEntries(store.tokens.map(t=>[t.name,{value:store.get(t.name).current,category:t.category}]))},null,2),'application/json','tokens.json'),
 'reset-token':el=>{store.reset(el.dataset.name);renderContent();toast('Token restored to its source value');},
 'reset-all':()=>openDialog('Reset all preview changes?',`<p>This clears your design-system drafts in this browser. It does not change <code>src/tokens.css</code> or any product data.</p><div class="ds-dialog-actions"><button class="ds-button" data-action="close-dialog">Keep changes</button><button class="ds-button ds-button--dark" data-action="confirm-reset">Reset previews</button></div>`),
 'confirm-reset':()=>{store.reset();closeDialog();renderContent();toast('All previews restored to the source');},
 'view':el=>{state.view=el.dataset.view;renderContent();},
 'clear-search':()=>{state.query='';document.querySelector('#token-search').value='';renderContent();document.querySelector('#token-search').focus();},
 'component-tab':el=>{state.component=el.dataset.tab;renderContent();document.querySelector(`[data-tab="${state.component}"]`)?.focus({preventScroll:true});},
 'scenario':el=>{state.scenario=el.dataset.id;renderContent();},
 'switch':el=>{state.autoSave=!state.autoSave;el.setAttribute('aria-checked',String(state.autoSave));toast(state.autoSave?'Example switch enabled':'Example switch disabled');},
 'sample-action':()=>toast('This component is interactive. No data was submitted.'),
 'sample-toast':()=>toast('Your experiment is saved · component demonstration'),
 'sample-modal':()=>openDialog('A moment for clarity',`<div data-token-scope><h3>Review your next step.</h3><p>A focused dialog gives a decision room to breathe. Press Escape or the close button to return to the component gallery.</p><div class="ds-dialog-actions">${button('Got it',{action:'close-dialog'})}</div></div>`),
 'preview-run':()=>{openDialog('Simulation preview',`<div class="ds-run-demo" data-token-scope>${icon('globe')}<h3>Exploring the next possibility.</h3><p>This is a component demo, not a market prediction.</p><progress value="0" max="100" aria-label="Demo progress"></progress></div>`);let n=0;const timer=setInterval(()=>{const progress=document.querySelector('.ds-run-demo progress');if(!progress){clearInterval(timer);return;}n+=25;progress.value=n;if(n===100){clearInterval(timer);document.querySelector('.ds-run-demo h3').textContent='Preview complete.';document.querySelector('.ds-run-demo').insertAdjacentHTML('beforeend',button('Done',{action:'close-dialog'}));}},250);},
 'play-motion':()=>{const track=document.querySelector('.ds-motion-playground');track.classList.remove('is-playing');requestAnimationFrame(()=>requestAnimationFrame(()=>track.classList.add('is-playing')));},
 'close-dialog':closeDialog
};
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(el&&!el.disabled&&actions[el.dataset.action]){event.preventDefault();actions[el.dataset.action](el);}});
document.addEventListener('input',event=>{if(event.target.id==='token-search'){state.query=event.target.value;renderContent();}else if(event.target.id==='color-picker'){document.querySelector('#draft-value').value=event.target.value;}});
document.addEventListener('change',event=>{if(event.target.id==='color-picker')applyToken(event.target.value);});
document.addEventListener('submit',event=>{if(event.target.id==='token-editor'){event.preventDefault();applyToken(new FormData(event.target).get('value'));}});
document.addEventListener('keydown',event=>{
 if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if(innerWidth<=1100&&state.inspectorOpen)actions['close-inspector']();document.querySelector('#token-search')?.focus();return;}
 if(event.key==='Escape'&&!document.querySelector('dialog')){if(state.query){actions['clear-search']();}else if(innerWidth<=1100&&state.inspectorOpen)actions['close-inspector']();}
 if(event.key==='Tab'&&innerWidth<=1100&&state.inspectorOpen&&!document.querySelector('dialog')){const focusable=[...document.querySelectorAll('#inspector button:not(:disabled),#inspector input,#inspector a')];const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
 const tab=event.target.closest('[role="tab"]');if(tab&&['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){const tabs=[...tab.parentElement.querySelectorAll('[role="tab"]')];const i=tabs.indexOf(tab);const index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;event.preventDefault();tabs[index].click();}
});
window.addEventListener('hashchange',()=>{state.page=route();state.query='';if(innerWidth<=1100)state.inspectorOpen=false;closeDialog();render();window.scrollTo(0,0);});
try{store=await createTokenStore();state.page=route();render();}catch(error){root.innerHTML=`<main class="ds-boot"><h1>The token source couldn’t be loaded.</h1><p>${e(error.message)}</p><p>Run this project with <code>npm run dev</code> and open its local URL. It is a multi-file frontend, not a file:// page.</p><button class="ds-button" onclick="location.reload()">Try again</button></main>`;console.error(error);}

window.addEventListener('resize',syncDrawer);
