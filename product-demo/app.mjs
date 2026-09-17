import '../src/posthog.mjs';
import {defaultConfig,cleanConfig,validateConfig,escapeHtml as e,csvReport,CHANNELS,MESSAGES,MODEL_VERSION} from './model.mjs';
import {loadStore,saveStore,LIMIT} from './store.mjs';
const $=s=>document.querySelector(s),main=$('#content'),modal=$('#modal');
let storage;try {storage=window.localStorage;} catch {storage=null;}
const loaded=loadStore(storage);let data=loaded.data,storageBlocked=!!loaded.warning;
let chosen='B',lastRunId='',metric='units',query='',worker=null,toastTimer,confirmAction=null;
const money=v=>'¥'+Number(v).toLocaleString('zh-CN',{maximumFractionDigits:2});
const number=v=>Number(v).toLocaleString('zh-CN');
const date=v=>{const d=new Date(v);return Number.isNaN(d.valueOf())?'日期未知':d.toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});};
const button=(text,action,primary=false)=>`<button class="btn ${primary?'primary':''}" data-action="${action}">${text}</button>`;
const link=(text,href,primary=false)=>`<a class="btn ${primary?'primary':''}" href="${e(href)}">${text}</a>`;
function notify(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}
function notice(text){$('#notice').hidden=!text;$('#notice').textContent=text;}
function persist(){const ok=!storageBlocked && saveStore(storage,data);$('#save-state').textContent=ok?'已保存到本机':'仅在内存中';if(!ok)notice(loaded.warning||'浏览器不允许保存或空间不足。请导出设置和报告；刷新可能丢失本次修改。');return ok;}
if(loaded.warning){notice(loaded.warning);$('#save-state').textContent='仅在内存中';}
function openDialog(html){$('#modal-content').innerHTML=html;if(!modal.open)modal.showModal();}
function confirm(title,text,fn){confirmAction=fn;openDialog(`<h2 id="modal-title">${e(title)}</h2><p>${e(text)}</p><div class="actions">${button('取消','dismiss')}<button class="btn primary" data-action="confirm">确认</button></div>`);}
function errorDialog(message){openDialog(`<h2 id="modal-title">暂时无法完成</h2><p class="error-text">${e(message)}</p><div class="actions">${button('知道了','dismiss')}</div>`);}
function head(title,description,actions='',kicker='EXPERIMENT LAB'){return `<div class="page-head"><div><span class="eyebrow">${kicker}</span><h1 tabindex="-1">${e(title)}</h1><p>${e(description)}</p></div><div class="actions">${actions}</div></div>`;}
function field(label,key,{type='text',options,min,max,step=1,scheme,help}={}) {
  const value=scheme===undefined?data.draft[key]:data.draft.schemes[scheme][key];
  const attr=`data-field="${key}" ${scheme===undefined?'':`data-scheme="${scheme}"`}`;
  let input=options?`<select ${attr}>${options.map(item=>{const [v,t]=Array.isArray(item)?item:[item,item];return `<option value="${e(v)}" ${String(v)===String(value)?'selected':''}>${e(t)}</option>`;}).join('')}</select>`:
    type==='textarea'?`<textarea ${attr} rows="3" required maxlength="500">${e(value)}</textarea>`:
    `<input ${attr} type="${type}" value="${e(value)}" ${type==='text'?'required maxlength="80"':`min="${min}" max="${max}" step="${step}" required`}>`;
  return `<label class="field">${e(label)}${input}${help?`<small>${e(help)}</small>`:''}</label>`;
}
function previewSchemes(){return `<div class="scheme-previews">${data.draft.schemes.map(s=>`<article class="scheme-preview"><header><i class="scheme-mark ${e(s.id)}"></i>方案 ${e(s.id)}</header><b>${money(s.price)}</b><p>${e(s.channel)}</p><p>${e(s.message)}</p><p>预算 ${money(s.budget)}</p></article>`).join('')}</div>`;}
function empty(title,text,cta){return `<div class="empty"><div class="empty-icon" aria-hidden="true">▦</div><h2>${e(title)}</h2><p>${e(text)}</p>${cta}</div>`;}
function runRows(){const runs=data.runs.filter(r=>r.config.product.toLowerCase().includes(query.toLowerCase()));return runs.length?`<div class="table-wrap"><table><thead><tr><th>实验名称</th><th>状态</th><th>合成消费者</th><th>运行时间</th><th>操作</th></tr></thead><tbody>${runs.map(r=>`<tr><td><strong><a href="#/results/${e(r.id)}">${e(r.config.product)}</a></strong><small>${e(r.config.market)} · ${r.config.days} 天 · 3 个方案</small></td><td><span class="pill">已完成 · 规则演示</span></td><td>${number(r.config.population)}</td><td>${e(date(r.createdAt))}</td><td><a class="text-button" href="#/results/${e(r.id)}">查看报告 →</a><button class="text-button" data-delete="${e(r.id)}" aria-label="删除 ${e(r.config.product)} 的报告">删除</button></td></tr>`).join('')}</tbody></table></div>`:empty(query?'没有匹配的实验':'还没有运行过实验',query?'换一个产品名称试试。':'先定义一个问题，再让三个方案在相同条件下比较。',query?'':link('建立第一个实验 →','#/setup/1',true));}
function experiments(reportsOnly=false){
  const total=data.runs.length;
  return head(reportsOnly?'结果报告':'实验中心',reportsOnly?'每次运行都是独立快照。修改草稿不会改变已完成的报告。':'让每一个市场假设，先经过一次可复现的数字实验。',button('导入设置','import')+button('＋ 新建实验','new',true))+
    (!reportsOnly?`<section class="hero-panel panel"><div><span class="pill">PRODUCT DEMO · 可运行的规则演示</span><h2>一个问题，三个方案。<br>先实验，再讨论。</h2><p>设置产品、人群与市场条件，运行透明规则模型。设置、结果、消费者详情是三个独立页面。</p><div class="actions">${link('继续实验设置 →','#/setup/1',true)}${button('运行白桃气泡水示例','sample')}</div></div><img class="hero-art" src="../public/assets/visual-v2/hero-world.avif" alt="消费者数字世界示意"></section><div class="stats"><section class="panel stat"><span>已完成实验</span><strong>${total.toString().padStart(2,'0')}</strong><small>当前浏览器内的报告</small></section><section class="panel stat"><span>当前对照方案</span><strong>03</strong><small>使用相同随机人群</small></section><section class="panel stat"><span>草稿实验周期</span><strong>${number(data.draft.days)} <small>天</small></strong><small>可修改后重新运行</small></section></div>`:'')+
    `<div class="section-head"><h2>${reportsOnly?'全部报告':'最近实验'} <small> / ${total}</small></h2><input class="search" id="search" type="search" aria-label="搜索实验名称" placeholder="搜索实验名称…" value="${e(query)}"></div><section class="panel" id="run-list">${runRows()}</section>`;
}
const stepNames=['产品设置','目标人群','市场环境','方案设计','运行设置'];
function setupStep(step){const c=data.draft;
  if(step===1)return `<div class="setup-grid"><section><h2>产品信息</h2><div class="product-fields"><div class="bottle"><img src="../public/assets/visual-v2/peach-sparkling-water.avif" alt="白桃气泡水示例配图，不随产品名称改变"></div><div class="fields">${field('产品名称','product')}${field('产品描述','description',{type:'textarea'})}${field('产品类别','category',{options:['饮料','食品','个护'],help:'名称、描述、类别用于记录，不进行文本语义建模。'})}</div></div></section><section><div class="chart-head"><h2>实验方案</h2><a class="text-button" href="#/setup/4">编辑方案 →</a></div>${previewSchemes()}<div class="info-box"><h3>这页只做一件事：设置实验</h3><p>先完成 5 步设置。运行后进入独立结果页，不会在设置下面提前放一份固定答案。</p></div></section></div>`;
  if(step===2)return `<div class="setup-grid"><section class="fields"><h2>谁参与这个实验？</h2>${field('目标人群','audience',{options:['健康生活','价格敏感','综合人群'],help:'影响价格敏感度和健康内容偏好。'})}${field('合成消费者数量','population',{options:[[1000,'1,000 人 · 快速尝试'],[5000,'5,000 人 · 标准实验'],[10000,'10,000 人 · 较大样本']]})}<div class="info-box"><h3>不是一万份真实消费者访谈</h3><p>系统按随机种子生成带有价格接受度、内容偏好和渠道亲和度的虚拟个体。</p></div></section><section class="panel-pad"><span class="eyebrow">SYNTHETIC CONSUMERS</span><strong class="big-number" data-population>${number(c.population)}</strong><h2>相同人群，公平对照</h2><p class="muted">A、B、C 使用同一组随机输入。只改一个方案，不会改变其他方案的结果。</p></section></div>`;
  if(step===3)return `<div class="setup-grid"><section class="fields"><h2>定义市场环境</h2>${field('目标市场名称','market',{help:'用于标记实验，不代表接入该地区真实数据。'})}${field('季节','season',{options:['春季','夏季','秋季','冬季']})}${field('竞争强度（0 至 1）','competition',{type:'number',min:0,max:1,step:.1,help:'数值越高，规则模型中的触达率和购买概率越低。'})}</section><div class="info-box"><h3>条件不是装饰</h3><p>本演示中，季节影响饮品场景因子，竞争强度影响触达和转化，投放预算影响曝光。</p><p>这些关系是人工设定的教学假设，还没有用真实市场数据校准。</p></div></div>`;
  if(step===4)return `<h2 style="margin-bottom:20px">三个方案，在同一张实验桌上</h2><div class="scheme-editors">${c.schemes.map((s,i)=>`<section class="scheme-editor"><h3><i class="scheme-mark ${e(s.id)}"></i>方案 ${e(s.id)}</h3><div class="fields">${field('售价（元）','price',{type:'number',min:1,max:100,step:.1,scheme:i})}${field('单位成本（元）','cost',{type:'number',min:0,max:100,step:.1,scheme:i})}${field('总投放预算（元）','budget',{type:'number',min:100,max:1000000,step:100,scheme:i})}${field('渠道','channel',{options:CHANNELS,scheme:i})}${field('核心内容','message',{options:MESSAGES,scheme:i})}</div></section>`).join('')}</div><div class="info-box">建议一次只改一个变量，例如只调整方案 B 的售价，再比较新旧报告。成本可以高于售价，届时报告会如实展示亏损。</div>`;
  const errors=validateConfig(c);
  return `${errors.length?`<div class="errors" role="alert">${errors.map(e).join('<br>')}</div>`:''}<div class="setup-grid"><section class="fields"><h2>确认运行设置</h2>${field('仿真周期（天）','days',{type:'number',min:30,max:180,help:'每 7 天计算一次，最后不足一周按实际天数折算。'})}${field('随机种子','seed',{type:'number',min:1,max:999999,help:'同样的种子和参数，得到完全相同的结果。'})}<label class="check"><input type="checkbox" data-field="repeat" ${c.repeat?'checked':''}>启用复购行为</label></section><section><h2>实验摘要</h2><dl class="summary-list"><div><dt>产品</dt><dd>${e(c.product)}</dd></div><div><dt>人群</dt><dd>${e(c.audience)} · ${number(c.population)} 人</dd></div><div><dt>市场</dt><dd>${e(c.market)} · ${e(c.season)}</dd></div><div><dt>对照方案</dt><dd>A / B / C</dd></div><div><dt>模型</dt><dd>${MODEL_VERSION}</dd></div></dl><div class="info-box">在浏览器工作线程中真正计算，而不是播放进度条。运行完成后会保存参数和结果快照，仅限本机。</div></section></div>`;
}
function setup(step){return head('新品上市模拟','改变条件，观察结果。草稿自动保存在当前浏览器。',button('导出设置','export-config'))+`<section class="panel" data-page="setup"><nav class="stepper" aria-label="实验步骤">${stepNames.map((t,i)=>`<a href="#/setup/${i+1}" ${step===i+1?'aria-current="step"':''}><span>${i+1}</span>${t}</a>`).join('')}</nav><form id="config-form" class="setup-body">${setupStep(step)}</form><div class="setup-footer">${step>1?link('← 上一步',`#/setup/${step-1}`):link('← 实验中心','#/experiments')}<small>设置 → 运行 → 独立报告 → 消费者详情</small>${button(step===5?'开始仿真 →':'保存并继续 →',step===5?'run':'next',true)}</div></section>`;}
function chart(run){const max=Math.max(1,...run.results.map(r=>r.units)),w=540,h=215,x=d=>45+d/run.config.days*480,y=v=>185-v/max*155;
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="A、B、C 三个方案的累计销量；完整数值见下方对比表"><g>${[0,.25,.5,.75,1].map(f=>`<path d="M45 ${y(max*f)}H525" stroke="#e8edf7" stroke-dasharray="3 3"/><text x="36" y="${y(max*f)+3}" text-anchor="end">${Math.round(max*f)}</text>`).join('')}</g>${run.results.map((r,i)=>`<path d="M45 185 ${r.trend.map(t=>`L${x(t.day)} ${y(t.units)}`).join(' ')}" fill="none" stroke="${['#f17f98','#377cfa','#51bc8a'][i]}" stroke-width="2.5"/>`).join('')}${[0,.25,.5,.75,1].map(f=>`<text x="${x(run.config.days*f)}" y="207" text-anchor="middle">第${Math.round(run.config.days*f)}天</text>`).join('')}</svg>`;
}
function results(run){
  if(lastRunId!==run.id){chosen=run.winner;lastRunId=run.id;metric='units';}const r=run.results.find(s=>s.id===chosen)||run.results[0];
  const vals=run.results.map(s=>s[metric]),max=Math.max(1,...vals),labels={units:'销量',conversion:'转化率',roas:'ROAS'};
  return head('仿真结果',`${run.config.product} · ${run.config.days} 天 · ${date(run.createdAt)}`,button('下载 CSV','csv')+button('下载 HTML 报告','html'), 'SIMULATION RESULTS')+
    `<section data-page="results"><div class="report-banner"><span>未校准的规则演示，不是市场预测。${number(run.config.population)} 个合成消费者，三个方案独立对照。</span><button class="text-button" data-action="reuse">复用本次设置 →</button></div><div class="tabs" aria-label="选择方案">${run.results.map(s=>`<button data-select="${s.id}" aria-pressed="${chosen===s.id}"><i class="scheme-mark ${s.id}"></i>方案 ${s.id}${s.id===run.winner?' · 投放后毛利最高':''}</button>`).join('')}</div>
    <div class="kpis">${[['累计销量',number(r.units),'实际模拟订单数量'],['购买转化率',r.conversion+'%','购买人数 ÷ 合成消费者数'],['复购率',r.repeatRate+'%','复购人数 ÷ 购买人数'],['投放后毛利',money(r.profit),'营收 − 商品成本 − 投放'],['广告回报 ROAS',r.roas+'×','营收 ÷ 投放预算']].map(([t,v,n])=>`<article class="panel kpi"><span>${t}</span><strong>${v}</strong><small>${n}</small></article>`).join('')}</div>
    <div class="chart-grid"><section class="panel panel-pad"><div class="chart-head"><h2>销量趋势（累计）</h2><div class="legend">${['A','B','C'].map(id=>`<span><i class="scheme-mark ${id}"></i>${id}</span>`).join('')}</div></div>${chart(run)}</section><section class="panel panel-pad"><h2 style="margin-bottom:15px">方案对比</h2><div class="metric-toggle" aria-label="对比指标">${Object.entries(labels).map(([k,v])=>`<button data-metric="${k}" aria-pressed="${metric===k}">${v}</button>`).join('')}</div><div class="bars" role="img" aria-label="${labels[metric]}：${run.results.map(s=>`方案 ${s.id} ${s[metric]}`).join('，')}">${run.results.map(s=>`<div class="bar-wrap"><b>${number(s[metric])}${metric==='conversion'?'%':metric==='roas'?'×':''}</b><div class="bar ${s.id}" style="height:${Math.max(1,s[metric]/max*150)}px"></div></div>`).join('')}</div><div class="bar-labels"><span>方案 A</span><span>方案 B</span><span>方案 C</span></div></section></div>
    <section class="panel consumer-strip"><div class="avatars" aria-hidden="true"><span class="avatar">林</span><span class="avatar">陈</span><span class="avatar">周</span></div><div><h3>结果背后，发生了什么？</h3><p>进入独立详情页，查看 8 个合成样本的实际模拟轨迹。</p></div>${link('查看消费者详情 →',`#/consumer/${run.id}/${r.id}/0`)}</section>
    <div class="section-head"><h2>完整对照表</h2><span class="muted" style="font-size:11px">种子 ${run.config.seed} · ${e(run.modelVersion)}</span></div><section class="panel table-wrap"><table><thead><tr><th>方案</th><th>价格</th><th>触达人数</th><th>购买人数</th><th>销量</th><th>营收</th><th>投放后毛利</th><th>ROAS</th></tr></thead><tbody>${run.results.map((s,i)=>`<tr><td><i class="scheme-mark ${s.id}"></i>方案 ${s.id}</td><td>${money(run.config.schemes[i].price)}</td><td>${number(s.reached)}</td><td>${number(s.buyers)}</td><td>${number(s.units)}</td><td>${money(s.revenue)}</td><td>${money(s.profit)}</td><td>${s.roas}×</td></tr>`).join('')}</tbody></table></section><div class="info-box"><h3>怎样读这个结果？</h3><p>方案 ${e(run.winner)} 在这次规则实验中的投放后毛利最高${Math.max(...run.results.map(s=>s.profit))<0?'，但三个方案都在亏损':''}。这不是投放建议。先检查模型假设，再用真实数据校准。</p><p>产品名称、描述、类别、市场名称只是标签。模型未实现自由文本理解、社交传播、竞品智能体或真实数据接入。</p></div></section>`;
}
function consumer(run,schemeId,index){const s=run.results.find(r=>r.id===schemeId);if(!s||!s.people[index])return missing();const person=s.people[index],price=run.config.schemes.find(r=>r.id===s.id).price;
 return `<a class="back-link" href="#/results/${e(run.id)}">← 返回本次结果报告</a>`+head('消费者详情',`${run.config.product} · 方案 ${s.id} · 独立行为详情页`,link('查看结果报告',`#/results/${run.id}`),'CONSUMER EXPLORER')+`<section data-page="consumer"><div class="report-banner">这些是规则生成的合成样本，不是真实个人或真实访谈；轨迹来自本次运行，不是预先写好的故事。</div><div class="persona-picker" aria-label="选择合成样本">${s.people.map((p,i)=>`<a class="btn" href="#/consumer/${run.id}/${s.id}/${i}" ${i===index?'aria-current="page" style="border-color:#315dff;color:#315dff"':''}>${e(p.name)}</a>`).join('')}</div><div class="profile-grid"><aside class="panel profile-card"><div class="avatar large" aria-hidden="true">${e(person.name[0])}</div><h2>${e(person.name)}</h2><p>${person.age} 岁 · 合成样本 #${person.id+1}</p><span class="pill">非真实消费者</span><dl class="summary-list" style="margin-top:20px"><div><dt>价格接受度参数</dt><dd>${money(person.tolerance)}</dd></div><div><dt>健康偏好参数</dt><dd>${person.health}/100</dd></div><div><dt>本次购买次数</dt><dd>${person.orders}</dd></div></dl></aside><section class="panel panel-pad"><div class="chart-head"><h2>实际模拟行为轨迹</h2><span class="pill">${run.config.days} 天</span></div>${person.events.length?`<ol class="timeline">${person.events.map(ev=>`<li><b>Day ${ev.day}</b><span>${ev.kind==='reach'?`首次被 ${e(run.config.schemes.find(r=>r.id===s.id).channel)} 触达`:ev.kind==='buy'?`首次购买 · ${money(price)}`:`再次购买 · ${money(price)}`}</span></li>`).join('')}</ol>`:`<div class="empty"><h3>本次没有产生触达或购买</h3><p>没有行为同样是实验结果，不会为每个样本编造一条购买故事。</p></div>`}<div class="info-box"><h3>为何有人买，有人不买？</h3><p>价格接受度、内容偏好、曝光概率和固定随机输入共同决定行为。同一个样本在另一个方案下可能有不同轨迹。</p><p>这里没有生成式访谈，也没有计算好友传播网络。</p></div></section></div></section>`;
}
function missing(){return `<section class="panel failure" data-page="missing"><h1 tabindex="-1">这里没有可读取的报告</h1><p>报告只保存在生成它的浏览器。复制本机报告地址不会把数据分享给别人。</p>${link('返回实验中心','#/experiments',true)}</section>`;}
function route(){const parts=location.hash.replace(/^#\/?/,'').split('/');return {page:parts[0]||'experiments',parts};}
function currentRun(){return data.runs.find(r=>r.id===route().parts[1]);}
function render(focus=false){const {page,parts}=route();let html,title,nav=page;
  if(page==='experiments'||page==='reports'){title=page==='reports'?'结果报告':'实验中心';html=experiments(page==='reports');}
  else if(page==='setup'){const step=Number(parts[1]||1);title='实验设置';html=Number.isInteger(step)&&step>=1&&step<=5?setup(step):missing();}
  else if(page==='results'||page==='consumer'){const run=currentRun();title=page==='results'?'结果报告':'消费者详情';nav='reports';html=run?(page==='results'?results(run):consumer(run,parts[2]||run.winner,Number(parts[3]||0))):missing();}
  else {title='页面未找到';html=missing();}
  main.innerHTML=html;main.dataset.view=page;$('#crumb').textContent=title;document.title=title+' · World Agent';
  document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===nav)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  document.body.classList.remove('nav-open');$('#menu').setAttribute('aria-expanded','false');
  if(focus){window.scrollTo({top:0});main.querySelector('h1')?.focus({preventScroll:true});}
}
function download(content,name,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);notify('已生成下载文件。');}
function reportHtml(run){return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(run.config.product)} · 规则演示报告</title><style>body{font:15px/1.8 system-ui,sans-serif;max-width:950px;margin:40px auto;padding:20px;color:#172541}h1{font-size:28px}table{width:100%;border-collapse:collapse}th,td{padding:12px;text-align:left;border:1px solid #dce3f0}th{background:#edf3ff}.note{padding:16px;background:#fff8e9}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f5f7fc;padding:20px}small{color:#596b8b}.scroll{overflow:auto}</style><h1>${e(run.config.product)}：实验报告</h1><p class="note">${e(run.disclaimer)}</p><p>生成时间：${e(run.createdAt)} · 模型：${e(run.modelVersion)} · 种子：${run.config.seed}</p><div class="scroll"><table><thead><tr><th>方案</th><th>销量</th><th>购买转化率</th><th>复购率</th><th>投放后毛利</th><th>ROAS</th></tr></thead><tbody>${run.results.map(r=>`<tr><td>${r.id}</td><td>${r.units}</td><td>${r.conversion}%</td><td>${r.repeatRate}%</td><td>${money(r.profit)}</td><td>${r.roas}×</td></tr>`).join('')}</tbody></table></div><h2>如何理解结果</h2><p>方案 ${e(run.winner)} 在本次规则实验中投放后毛利最高。所有参数和概率均未经真实业务数据校准。这不是投放建议。</p><p>投放后毛利 = 销量 ×（售价 − 单位成本）− 总投放预算；ROAS = 营收 ÷ 总投放预算。未计入税费、履约成本等其他费用。</p><h2>可复现的实验设置</h2><pre>${e(JSON.stringify(run.config,null,2))}</pre><small>World Agent · 产品演示报告 · 不包含真实消费者信息。</small></html>`;}
function cancelRun(){if(worker){worker.terminate();worker=null;notify('计算已取消，没有生成报告。');}if(modal.open)modal.close();}
function startRun(input){if(worker)return;let config;try{config=cleanConfig(input);}catch(err){errorDialog(err.message);return;}if(data.runs.length>=LIMIT){errorDialog(`当前浏览器已保存 ${LIMIT} 份报告。请先下载并删除不再需要的报告。`);return;}
  openDialog(`<div class="run-mark" aria-hidden="true">W</div><h2 id="modal-title">正在计算三个对照方案</h2><p>${number(config.population)} 个合成消费者 · ${config.days} 天。进度来自实际计算完成的方案数量。</p><progress id="run-progress" max="100" value="0" aria-label="计算进度"></progress><p id="run-label" role="status">0 / 3 个方案已完成</p><div class="actions">${button('取消计算','cancel-run')}</div>`);
  try{worker=new Worker(new URL('./worker.mjs',import.meta.url),{type:'module'});}catch(err){worker=null;errorDialog('无法启动浏览器工作线程：'+err.message);return;}
  worker.onmessage=({data:message})=>{
    if(message.type==='progress'){$('#run-progress').value=message.progress;$('#run-label').textContent=`${Math.round(message.progress/100*3)} / 3 个方案已完成`;}
    if(message.type==='error'){worker.terminate();worker=null;errorDialog(message.message);}
    if(message.type==='complete'){worker.terminate();worker=null;const run={...message.run,id:crypto.randomUUID(),createdAt:new Date().toISOString()};data.runs.unshift(run);persist();modal.close();location.hash=`/results/${run.id}`;notify('计算完成，已生成独立结果报告。');}
  };
  worker.onerror=()=>{if(worker)worker.terminate();worker=null;errorDialog('计算线程发生错误。草稿仍然保留，请刷新重试。');};worker.postMessage(config);
}
document.addEventListener('input',event=>{
  const el=event.target;if(el.id==='search'){query=el.value;$('#run-list').innerHTML=runRows();return;}
  const key=el.dataset.field;if(!key)return;
  const target=el.dataset.scheme===undefined?data.draft:data.draft.schemes[Number(el.dataset.scheme)];
  if(!target||!Object.hasOwn(target,key))return;
  target[key]=el.type==='checkbox'?el.checked:typeof target[key]==='number'?Number(el.value):el.value;persist();
  if(key==='population'&&$('[data-population]'))$('[data-population]').textContent=number(target[key]);
});
document.addEventListener('submit',event=>{if(event.target.id==='config-form')event.preventDefault();});
document.addEventListener('click',event=>{
  if(event.target.closest('.skip')){event.preventDefault();main.focus();return;}
  const el=event.target.closest('button');if(!el)return;
  if(el.id==='menu'){const open=document.body.classList.toggle('nav-open');el.setAttribute('aria-expanded',String(open));return;}
  if(el.dataset.select){chosen=el.dataset.select;render();return;}
  if(el.dataset.metric){metric=el.dataset.metric;render();return;}
  if(el.dataset.delete){const id=el.dataset.delete;confirm('删除这份本机报告？','只删除当前浏览器内的这份报告，不删除草稿。建议先下载报告。',()=>{data.runs=data.runs.filter(r=>r.id!==id);persist();render();});return;}
  const action=el.dataset.action;
  if(action==='dismiss'){modal.close();confirmAction=null;}
  if(action==='confirm'){const fn=confirmAction;confirmAction=null;modal.close();fn?.();}
  if(action==='next'){if(!$('#config-form').reportValidity())return;persist();location.hash=`/setup/${Math.min(5,Number(route().parts[1]||1)+1)}`;}
  if(action==='run'){if($('#config-form').reportValidity())startRun(data.draft);}
  if(action==='sample')startRun(defaultConfig());
  if(action==='cancel-run')cancelRun();
  if(action==='new')confirm('建立新的实验？','当前草稿会替换为白桃气泡水模板，已经完成的报告会保留。',()=>{data.draft=defaultConfig();persist();location.hash='/setup/1';render(true);});
  if(action==='reuse'){const r=currentRun();if(r)confirm('复用这次实验设置？','这会替换当前草稿，但不会修改原始报告。',()=>{data.draft=cleanConfig(r.config);persist();location.hash='/setup/1';});}
  if(action==='export-config'){try{download(JSON.stringify({version:1,modelVersion:MODEL_VERSION,config:cleanConfig(data.draft)},null,2),'world-agent-settings.json','application/json');}catch(err){errorDialog(err.message);}}
  if(action==='import'){$('#import-file').value='';$('#import-file').click();}
  if(action==='csv'||action==='html'){const r=currentRun();if(!r)return;if(action==='csv')download(csvReport(r),'world-agent-'+r.id+'.csv','text/csv;charset=utf-8');else download(reportHtml(r),'world-agent-'+r.id+'.html','text/html;charset=utf-8');}
});
$('#import-file').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try {if(file.size>65536)throw new Error('设置文件不能超过 64 KB。');const parsed=JSON.parse(await file.text()),config=cleanConfig(parsed.config??parsed);confirm('导入实验设置？','只读取有效配置字段，不导入报告或执行任何代码。当前草稿会被替换。',()=>{data.draft=config;persist();location.hash='/setup/1';render(true);notify('设置已导入。');});}catch(err){errorDialog('导入失败：'+err.message);}});
modal.addEventListener('cancel',()=>{if(worker)cancelRun();confirmAction=null;});
window.addEventListener('hashchange',()=>{if(worker)cancelRun();render(true);});
window.addEventListener('storage',event=>{if(event.key==='world-agent-product-demo-v1'){storageBlocked=true;notice('另一个标签页已修改存档。为避免覆盖，当前标签页暂停保存；请导出需要的草稿后刷新。');$('#save-state').textContent='保存已暂停';}});
render();
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.body.classList.contains('nav-open')){document.body.classList.remove('nav-open');$('#menu').setAttribute('aria-expanded','false');$('#menu').focus();}});
