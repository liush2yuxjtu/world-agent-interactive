import {icon} from './icons.mjs';
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function button(label,{variant='primary',size='md',disabled=false,loading=false,action='',iconName=''}={}){
 const v=['primary','secondary','outline','ghost'].includes(variant)?variant:'primary';
 const sz=['sm','md','lg'].includes(size)?size:'md';
 return `<button type="button" class="wa-button wa-button--${v} wa-button--${sz}" ${disabled||loading?'disabled':''} ${loading?'aria-busy="true"':''} ${action?`data-action="${escapeHTML(action)}"`:''}>${loading?'<span class="wa-spinner" aria-hidden="true"></span>':iconName?icon(iconName):''}${escapeHTML(label)}</button>`;
}
export function badge(text,tone='brand'){return `<span class="wa-badge wa-badge--${['brand','success','warning','error'].includes(tone)?tone:'brand'}">${escapeHTML(text)}</span>`;}
