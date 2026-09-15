import {parseTokens,propertyFor,restoreOverrides,safeValue} from './tokens.mjs';
const KEY='world-agent-design-system-overrides-v1';
export async function createTokenStore(){
 const url=new URL('../../src/tokens.css',import.meta.url);
 const response=await fetch(url,{cache:'no-store'});
 if(!response.ok)throw new Error(`Unable to read tokens.css (HTTP ${response.status}).`);
 const source=await response.text(),tokens=parseTokens(source);
 let overrides={},storageAvailable=true;
 try{overrides=restoreOverrides(JSON.parse(localStorage.getItem(KEY)),tokens,(p,v)=>CSS.supports(p,v));}catch{storageAvailable=false;}
 const preview=document.createElement('style');preview.id='token-preview-overrides';document.head.append(preview);
 const listeners=new Set();
 function publish(){preview.textContent='[data-token-scope] {\n'+Object.entries(overrides).map(([n,v])=>`  ${n}: ${v};`).join('\n')+'\n}';for(const fn of listeners)fn();}
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(overrides));}catch{storageAvailable=false;}publish();}
 publish();
 return {
  tokens,source,sourceURL:url,
  get storageAvailable(){return storageAvailable;},
  get overrides(){return {...overrides};},
  get changedCount(){return Object.keys(overrides).length;},
  get(name){const t=tokens.find(t=>t.name===name);return t?{...t,current:overrides[name]??t.value,changed:name in overrides}:null;},
  set(name,value){const t=tokens.find(t=>t.name===name);if(!t)throw new Error('Unknown token.');if(!safeValue(value)||!CSS.supports(propertyFor(t),value))throw new Error(`Enter a valid ${propertyFor(t)} value. URLs and CSS declarations are not allowed.`);if(value.trim()===t.value)delete overrides[name];else overrides[name]=value.trim();persist();},
  reset(name){if(name)delete overrides[name];else overrides={};persist();},
  subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}
 };
}
