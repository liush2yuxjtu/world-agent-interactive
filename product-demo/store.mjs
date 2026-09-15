import {defaultConfig,cleanConfig} from './model.mjs';
export const STORAGE_KEY='world-agent-product-demo-v1';
export const LIMIT=20;
export function loadStore(storage) {
  const fallback={version:1,draft:defaultConfig(),runs:[]};
  try {
    const raw=storage.getItem(STORAGE_KEY);if(!raw) return {data:fallback,warning:''};
    const parsed=JSON.parse(raw);
    if(parsed.version!==1 || !Array.isArray(parsed.runs) || parsed.runs.length>LIMIT) throw new Error('存档格式无效');
    // Validate a completed result by recomputing neither values nor timestamps.
    for(const r of parsed.runs) {
      cleanConfig(r.config);
      if(typeof r.id!=='string' || !/^[a-zA-Z0-9-]{1,80}$/.test(r.id) || !Array.isArray(r.results) || r.results.length!==3 || typeof r.createdAt!=='string') throw new Error('报告格式无效');
      if(!['A','B','C'].includes(r.winner) || typeof r.modelVersion!=='string' || typeof r.disclaimer!=='string') throw new Error('模型信息无效');
      r.results.forEach((s,index)=>{
        if(s.id!==['A','B','C'][index] || !['units','buyers','repeaters','reached','revenue','profit','conversion','repeatRate','roas'].every(k=>Number.isFinite(s[k])) || !Array.isArray(s.trend) || !Array.isArray(s.people)) throw new Error('报告内容无效');
        if(s.trend.length>26 || s.people.length!==8) throw new Error('报告规模无效');
        for(const t of s.trend) if(!Number.isFinite(t.day)||!Number.isFinite(t.units)) throw new Error('趋势无效');
        for(const p of s.people) {
          if(typeof p.name!=='string'||p.name.length>80||!['id','age','tolerance','health','orders'].every(k=>Number.isFinite(p[k]))||!Array.isArray(p.events)||p.events.length>27) throw new Error('样本无效');
          for(const v of p.events) if(!Number.isFinite(v.day)||!['reach','buy','repeat'].includes(v.kind)) throw new Error('轨迹无效');
        }
      });
    }
    // Drafts can intentionally be incomplete; merge known fields, never extra keys.
    const draft=defaultConfig();
    if(parsed.draft && typeof parsed.draft==='object') for(const key of Object.keys(draft)) {
      if(key==='schemes') {if(Array.isArray(parsed.draft.schemes) && parsed.draft.schemes.length===3) draft.schemes=draft.schemes.map((s,i)=>({...s,...Object.fromEntries(Object.keys(s).map(k=>[k,parsed.draft.schemes[i]?.[k]??s[k]]))}));}
      else if(typeof parsed.draft[key]===typeof draft[key]) draft[key]=parsed.draft[key];
    }
    return {data:{version:1,draft,runs:parsed.runs},warning:''};
  } catch {return {data:fallback,warning:'本地存档无法读取。本次先在内存中工作；原存档不会自动覆盖，请先导出当前设置。'};}
}
export function saveStore(storage,data) {try {storage.setItem(STORAGE_KEY,JSON.stringify(data));return true;} catch {return false;}}
