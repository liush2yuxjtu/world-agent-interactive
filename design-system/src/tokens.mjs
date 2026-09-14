/** Pure token helpers shared between the browser and Node tests. */
export const CATEGORIES=[
 {id:'colors',label:'Color',description:'Purpose before pigment.',icon:'target'},
 {id:'typography',label:'Typography',description:'A clear voice, at every scale.',icon:'report'},
 {id:'spacing',label:'Spacing',description:'Give every idea room to breathe.',icon:'expand'},
 {id:'radii',label:'Radii',description:'Soft edges. Consistent character.',icon:'scan'},
 {id:'elevation',label:'Elevation',description:'Depth that communicates hierarchy.',icon:'cube'},
 {id:'motion',label:'Motion',description:'A little movement, a lot of clarity.',icon:'play'},
 {id:'layout',label:'Layout',description:'The structure behind the experience.',icon:'menu'}
];
export function categoryOf(name){
 if(name.startsWith('--color-'))return 'colors';
 if(/^--(font|text|weight)-/.test(name))return 'typography';
 if(name.startsWith('--space-'))return 'spacing';
 if(name.startsWith('--radius-'))return 'radii';
 if(/^--(shadow|focus)-/.test(name))return 'elevation';
 if(/^--(duration|ease)-/.test(name))return 'motion';
 return 'layout';
}
export function splitDeclarations(text){
 const result=[];let current='',quote='',depth=0,escaped=false;
 for(const c of text){
  if(escaped){current+=c;escaped=false;continue;}
  if(c==='\\'){current+=c;escaped=true;continue;}
  if(quote){current+=c;if(c===quote)quote='';continue;}
  if(c==='"'||c==="'"){quote=c;current+=c;continue;}
  if(c==='(')depth++;if(c===')')depth--;
  if(c===';'&&depth===0){result.push(current);current='';}else current+=c;
 }
 if(current.trim())result.push(current);return result;
}
/** This version deliberately reads flat :root token declarations, not component-local variables. */
export function parseTokens(css){
 const clean=css.replace(/\/\*[\s\S]*?\*\//g,'');
 const blocks=[...clean.matchAll(/:root\s*\{([^{}]*)\}/g)];
 if(!blocks.length)throw new Error('No flat :root declaration block found in tokens.css.');
 const map=new Map();
 for(const block of blocks)for(const declaration of splitDeclarations(block[1])){
  const match=declaration.match(/^\s*(--[\w-]+)\s*:\s*([\s\S]*?)\s*$/);
  if(match&&match[2])map.set(match[1],{name:match[1],value:match[2],category:categoryOf(match[1])});
 }
 if(!map.size)throw new Error('The stylesheet contains no custom properties.');
 return [...map.values()];
}
export function titleFor(name){return name.replace(/^--(color|space|radius|shadow|duration|ease|text|font|weight)-/,'').replace(/^--/,'').split('-').map(s=>s[0].toUpperCase()+s.slice(1)).join(' ');}
export function propertyFor(token){const n=typeof token==='string'?token:token.name;
 if(n.startsWith('--color-'))return 'color';if(n.startsWith('--font-'))return 'font-family';
 if(n.startsWith('--text-'))return 'font-size';if(n.startsWith('--weight-'))return 'font-weight';
 if(n.startsWith('--space-'))return 'gap';if(n.startsWith('--radius-'))return 'border-radius';
 if(/^--(shadow|focus)-/.test(n))return 'box-shadow';if(n.startsWith('--duration-'))return 'transition-duration';
 if(n.startsWith('--ease-'))return 'transition-timing-function';return 'width';
}
export function safeValue(value){return typeof value==='string'&&value.trim().length>0&&value.length<=350&&!/[{};<>@]/.test(value)&&!/(url\s*\(|expression\s*\(|!important)/i.test(value);}
export function hexRGB(value){const m=String(value).trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);if(!m)return null;const h=m[1].length===3?[...m[1]].map(c=>c+c).join(''):m[1];return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));}
export function luminance(rgb){const linear=rgb.map(v=>{const s=v/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4;});return linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;}
export function contrast(a,b){const x=hexRGB(a),y=hexRGB(b);if(!x||!y)return null;const l1=luminance(x),l2=luminance(y);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);}
export function contrastGrade(ratio){return ratio===null?'Not evaluated':ratio>=7?'AAA':ratio>=4.5?'AA':ratio>=3?'Large text only':'Below AA';}
export function exportCSS(tokens,overrides={}){return '/* World Agent design tokens — exported from the live Design System. */\n:root {\n'+tokens.map(t=>`  ${t.name}: ${overrides[t.name]??t.value};`).join('\n')+'\n}\n';}
export function filterTokens(tokens,query,category='all'){const q=query.trim().toLowerCase();return tokens.filter(t=>(category==='all'||t.category===category)&&(!q||`${t.name} ${t.value} ${titleFor(t.name)}`.toLowerCase().includes(q)));}
export function restoreOverrides(data,tokens,supports=()=>true){const out={};if(!data||typeof data!=='object'||Array.isArray(data))return out;for(const t of tokens){const v=data[t.name];if(safeValue(v)&&supports(propertyFor(t),v)&&v.trim()!==t.value)out[t.name]=v.trim();}return out;}
