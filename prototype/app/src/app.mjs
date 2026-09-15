const workspace=document.querySelector('#workspace');
const dialog=document.querySelector('#run-dialog');
const dialogBody=document.querySelector('#run-dialog-body');
const toast=document.querySelector('.app-toast');
const steps=['产品设置','目标人群','市场环境','方案设计','运行设置'];
const state={step:0,scheme:'B',result:'summary',section:'lab',product:'白桃气泡水',category:'饮料',quarter:'2025 Q2',audience:'18–35 岁城市消费者',market:'华东线上市场',duration:90,running:false,description:'0糖0脂、天然果味，年轻人的日常饮品选择。',metric:'销量',season:'夏季',competition:'中',agents:'100,000',age:35,social:true,competitive:true,lifestyle:['健康生活','价格敏感','社交活跃'],channels:['小红书','抖音']};
let toastTimer,runTimer;

const schemes={A:{price:6,channel:'小红书',message:'健康轻盈',sales:126,conversion:7.1,repeat:29,roi:2.1,color:'pink'},B:{price:8,channel:'小红书',message:'高级天然',sales:142,conversion:8.7,repeat:36,roi:2.8,color:'blue'},C:{price:8,channel:'抖音',message:'夏日解渴',sales:131,conversion:7.9,repeat:33,roi:2.5,color:'green'}};

function notify(message){clearTimeout(toastTimer);toast.textContent=message;toast.classList.add('is-visible');toastTimer=setTimeout(()=>toast.classList.remove('is-visible'),2600);}
const selected=()=>schemes[state.scheme];
const e=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function stepper(){return `<div class="experiment-stepper" role="tablist" aria-label="实验步骤">${steps.map((label,index)=>`<button role="tab" aria-selected="${state.step===index}" class="${state.step===index?'is-active':''}" data-step="${index}"><span>${index+1}</span>${label}</button>`).join('')}</div>`;}
function schemeCards(){return `<div class="scheme-header"><h3>实验方案（最多 3 个方案对比）</h3><button class="outline-button" data-action="add-scheme">＋ 添加方案</button></div><div class="scheme-grid">${Object.entries(schemes).map(([id,item])=>`<button class="scheme-card ${state.scheme===id?'is-selected':''}" data-scheme="${id}" aria-pressed="${state.scheme===id}"><span>方案 ${id}</span><strong>¥${item.price}</strong><small>${e(item.channel)}<i class="dot ${item.color}"></i></small><small>${e(item.message)}</small></button>`).join('')}</div>`;}

function productStep(){return `<div class="setup-grid"><section class="panel product-panel"><h3>产品信息</h3><div class="product-form"><div class="bottle"><img src="../public/assets/visual-v2/peach-sparkling-water.avif" width="360" height="480" alt="白桃气泡水产品渲染图"></div><div class="fields"><label>产品名称<input maxlength="120" data-field="product" value="${e(state.product)}"></label><label>产品描述<textarea rows="3" maxlength="2000" data-field="description">${e(state.description)}</textarea></label><div class="field-row"><label>产品类别<select data-field="category">${['饮料','食品','个护'].map(x=>`<option ${state.category===x?'selected':''}>${x}</option>`).join('')}</select></label><label>上市时间<select data-field="quarter">${['2025 Q1','2025 Q2','2025 Q3'].map(x=>`<option ${state.quarter===x?'selected':''}>${x}</option>`).join('')}</select></label></div></div></div></section><section class="panel schemes-panel">${schemeCards()}</section></div>`;}
function audienceStep(){return `<div class="setup-grid"><section class="panel form-panel"><span class="panel-kicker">目标人群</span><h3>谁会看到并购买这款产品？</h3><label>核心人群<input data-field="audience" value="${e(state.audience)}"></label><label>年龄范围<div class="range-value"><input type="range" min="18" max="55" value="${state.age}" data-action="age-range"><output>18–${state.age} 岁</output></div></label><fieldset><legend>生活方式标签</legend><div class="tag-picker"><button class="is-selected">健康生活</button><button class="is-selected">价格敏感</button><button>户外运动</button><button class="is-selected">社交活跃</button><button>精致育儿</button></div></fieldset></section><section class="panel audience-preview"><div class="large-avatar photo-avatar" role="img" aria-label="示例消费者肖像"></div><h3>预计覆盖 100,000 个消费者 Agent</h3><p>样本人群会按年龄、城市、消费能力、兴趣与社交关系进行分层。</p><div><b>62%<small>女性</small></b><b>71%<small>一二线城市</small></b><b>48%<small>健康关注者</small></b></div></section></div>`;}
function marketStep(){return `<div class="setup-grid"><section class="panel form-panel"><span class="panel-kicker">市场环境</span><h3>定义产品进入的真实场景</h3><label>目标市场<input data-field="market" value="${e(state.market)}"></label><div class="field-row"><label>季节<select data-field="season"><option>春季</option><option selected>夏季</option><option>秋季</option></select></label><label>竞争强度<select data-field="competition"><option>低</option><option selected>中</option><option>高</option></select></label></div><fieldset><legend>渠道</legend><div class="tag-picker"><button class="is-selected">小红书</button><button class="is-selected">抖音</button><button>天猫</button><button>线下便利店</button></div></fieldset></section><section class="panel market-map"><div class="map-orbit"><span>上海</span><i>杭州</i><b>南京</b><em>苏州</em></div><h3>华东城市消费网络</h3><p>示例环境包含渠道触点、竞争品牌与消费者社交扩散关系。</p></section></div>`;}
function designStep(){return `<section class="panel design-panel"><span class="panel-kicker">方案设计</span><h3>把变量放在同一张实验桌上</h3>${schemeCards()}<div class="comparison-table"><div><b>变量</b><b>方案 A</b><b>方案 B</b><b>方案 C</b></div><div><span>价格</span><span>¥6</span><span>¥8</span><span>¥8</span></div><div><span>传播渠道</span><span>小红书</span><span>小红书</span><span>抖音</span></div><div><span>核心信息</span><span>健康轻盈</span><span>高级天然</span><span>夏日解渴</span></div><div><span>视觉方向</span><span>清爽粉</span><span>高质蓝</span><span>活力绿</span></div></div></section>`;}
function runStep(){return `<div class="setup-grid"><section class="panel form-panel"><span class="panel-kicker">运行设置</span><h3>确认实验规模与周期</h3><label>仿真周期<div class="range-value"><input type="range" min="30" max="180" step="30" value="${state.duration}" data-action="duration"><output>${state.duration} 天</output></div></label><label>消费者 Agent 数量<select data-field="agents"><option>10,000</option><option selected>100,000</option><option>500,000</option></select></label><label class="check-row"><input type="checkbox" data-boolean="social" ${state.social?'checked':''}> 启用社交关系扩散</label><label class="check-row"><input type="checkbox" data-boolean="competitive" ${state.competitive?'checked':''}> 启用竞品动态响应</label></section><section class="panel run-summary"><span class="panel-kicker">实验摘要</span><h3>${e(state.product)}</h3><dl><div><dt>目标人群</dt><dd>${e(state.audience)}</dd></div><div><dt>市场</dt><dd>${e(state.market)}</dd></div><div><dt>方案</dt><dd>A / B / C 并行对比</dd></div><div><dt>周期</dt><dd>${state.duration} 天</dd></div></dl><button class="primary-button run-button" data-action="run">开始仿真 →</button></section></div>`;}
function setupContent(){return [productStep,audienceStep,marketStep,designStep,runStep][state.step]();}

function lineChart(){
 const lines=[{cls:'b',points:[[48,184],[158,157],[268,126],[378,96],[488,62],[610,30]]},{cls:'a',points:[[48,184],[158,170],[268,149],[378,125],[488,101],[610,75]]},{cls:'c',points:[[48,184],[158,179],[268,166],[378,152],[488,134],[610,111]]}];
 return `<svg class="line-chart" viewBox="0 0 640 220" preserveAspectRatio="none" role="img" aria-label="示例：三个方案的十二周累计销量"><g class="grid-lines"><path d="M48 20H620M48 61H620M48 102H620M48 143H620M48 184H620"/><path d="M48 20V184M158 20V184M268 20V184M378 20V184M488 20V184M610 20V184"/></g><g class="chart-labels"><text x="4" y="24">200万</text><text x="4" y="65">150万</text><text x="4" y="106">100万</text><text x="11" y="147">50万</text><text x="27" y="188">0</text></g>${lines.map(l=>`<path class="line ${l.cls}" d="M${l.points.map(p=>p.join(' ')).join(' L')}"/>${l.points.map(([x,y])=>`<circle class="line ${l.cls}" cx="${x}" cy="${y}" r="2.8"/>`).join('')}`).join('')}<g class="chart-labels"><text x="40" y="207">第1周</text><text x="147" y="207">第2周</text><text x="257" y="207">第4周</text><text x="367" y="207">第8周</text><text x="475" y="207">第10周</text><text x="585" y="207">第12周</text></g></svg>`;
}
function summaryResult(){const item=selected();return `<div class="result-grid"><section class="panel chart-card"><div class="card-title"><h3>销量趋势（累计）</h3><span class="legend"><i class="blue"></i>方案 B <i class="pink"></i>方案 A <i class="green"></i>方案 C</span></div>${lineChart()}</section><section class="panel bars-card"><h3>方案对比（关键指标）</h3><div class="metric-switch"><button class="is-active">销量</button><button>转化率</button><button>复购率</button><button>ROI</button></div><div class="bars"><button data-scheme="A" class="${state.scheme==='A'?'is-selected':''}"><b>126万</b><i class="pink" style="height:72%"></i><span>方案 A</span></button><button data-scheme="B" class="${state.scheme==='B'?'is-selected':''}"><b>142万</b><i class="blue" style="height:90%"></i><span>方案 B</span></button><button data-scheme="C" class="${state.scheme==='C'?'is-selected':''}"><b>131万</b><i class="green" style="height:78%"></i><span>方案 C</span></button></div></section></div><div class="insight-grid"><section class="panel consumer-card"><span class="panel-kicker">消费者视角</span><div class="consumer-head"><div class="profile-avatar photo-avatar" role="img" aria-label="示例消费者肖像"></div><div><h3>林小雨 <small>25岁</small></h3><p>上海｜白领</p><p>兴趣：健身、健康饮食、社交分享</p></div></div><blockquote>“这个 0 糖气泡水看起来很清爽，下次去便利店试试！”</blockquote><div class="tag-picker compact"><button>健康生活</button><button>价格敏感:中</button><button>社交活跃</button><button>品牌尝新</button><button>小红书重度用户</button></div></section><section class="panel journey-card"><span class="panel-kicker">行为轨迹（示例）</span><ol><li><b>Day 1</b> 在小红书看到产品种草内容</li><li><b>Day 3</b> 搜索品牌并查看用户评论</li><li><b>Day 7</b> 在线购买（¥${item.price}）</li><li><b>Day 14</b> 分享购买体验</li><li><b>Day 28</b> 再次购买</li></ol></section><section class="panel network-card"><span class="panel-kicker">社交关系与影响</span><div class="network"><span class="network-main photo-avatar" role="img" aria-label="核心消费者"></span>${Array.from({length:12},(_,i)=>`<i style="--i:${i}"><span class="photo-avatar" style="--person:${i}"></span></i>`).join('')}</div><p>影响了 <b>12</b> 位好友<br>其中 <b>3</b> 位产生购买</p></section></div>`;}
function alternateResult(){const copy={audience:['人群分析','25–34 岁、上海与杭州的健康生活人群对“0 糖 + 天然果味”反应最强。'],market:['市场表现','方案 B 在第 6 周开始拉开差距，增长主要来自内容种草后的搜索与复购。'],social:['社交传播','核心用户平均影响 12 位好友，内容分享带来的间接购买占 18%。'],finance:['财务分析','示例方案 B 的 ROI 为 2.8，仅用于交互展示，未经真实市场验证。'],compare:['对比洞察','方案 A 转化快但复购偏低；方案 C 传播广但客单价贡献较弱。']}[state.result];return `<section class="panel alternate-result"><div class="alternate-icon">✦</div><span class="panel-kicker">${copy[0]}</span><h3>${copy[1]}</h3><p>点击不同方案可查看同一维度下的结果变化。当前选中：方案 ${state.scheme}。</p><div class="evidence-bars"><span style="--value:88%">方案 B <b>88</b></span><span style="--value:74%">方案 C <b>74</b></span><span style="--value:69%">方案 A <b>69</b></span></div></section>`;}
function results(){const item=selected();const tabs=[['summary','总览'],['audience','人群分析'],['market','市场表现'],['social','社交传播'],['finance','财务分析'],['compare','对比洞察']];return `<section class="results"><div class="results-heading"><div><h2>仿真结果 <small class="demo-badge">示例数据 · 未校准</small></h2><div class="result-tabs" role="tablist">${tabs.map(([id,label])=>`<button role="tab" aria-selected="${state.result===id}" data-result="${id}" class="${state.result===id?'is-active':''}">${label}</button>`).join('')}</div></div><div><button class="outline-button" data-action="download">⇩ 下载报告</button><button class="outline-button" data-action="share">♧ 分享</button><select aria-label="选择实验"><option>实验：${e(state.product)}上市模拟</option></select></div></div><div class="kpi-grid"><article><span>预计销量（${state.duration}天）</span><strong>${(item.sales*10000).toLocaleString('en-US')}<small> 瓶</small></strong><em>↑ ${state.scheme==='B'?18:state.scheme==='A'?11:14}%</em></article><article><span>购买转化率</span><strong>${item.conversion}%</strong><em>↑ 2.3%</em></article><article><span>复购率</span><strong>${item.repeat}%</strong><em>↑ 12%</em></article><article><span>社交传播人数</span><strong>${state.scheme==='B'?'1,200,000':'940,000'}</strong><em>↑ 48%</em></article><article><span>预计 ROI</span><strong>${item.roi}</strong><small>示例基准 1.9</small></article></div>${state.result==='summary'?summaryResult():alternateResult()}</section>`;}

function labView(){return `<div class="page-heading"><div><span class="panel-kicker">EXPERIMENT LAB</span><h1>新品上市模拟</h1><p>在线市场中模拟新产品的上市表现，支持多方案对比和长期影响分析。</p></div><button class="primary-button" data-action="run">开始仿真 →</button></div><section class="experiment panel" data-current-step="${state.step}">${stepper()}<div class="step-content">${setupContent()}</div><div class="step-actions"><button class="outline-button" data-action="previous" ${state.step===0?'disabled':''}>← 上一步</button><span>草稿保存在本机</span><button class="primary-button" data-action="next">${state.step===4?'运行实验':'保存并继续 →'}</button></div></section>${results()}`;}
function placeholderView(){const pages={home:['首页','查看最近实验和关键指标'],consumer:['消费者世界','探索人群画像与社交关系'],templates:['实验模板','从成熟场景快速开始'],mine:['我的实验','管理草稿、运行中和已完成实验'],market:['市场洞察','发现品类与人群变化'],data:['数据中心','管理实验所需的数据资产'],reports:['报告','查看并分享仿真证据'],settings:['设置','管理团队与实验偏好']};const [title,desc]=pages[state.section];return `<div class="page-heading"><div><span class="panel-kicker">WORLD AGENT</span><h1>${title}</h1><p>${desc}</p></div><button class="primary-button" data-nav="lab">返回实验中心 →</button></div><section class="panel empty-view"><div>✦</div><h2>${title}演示视图</h2><p>这个入口已经可以点击。当前交付重点是“新品上市模拟”的完整实验路径。</p><button class="primary-button" data-nav="lab">打开新品上市模拟</button></section>`;}
function render(){
  const shell=document.querySelector('.app-shell');
  shell.querySelectorAll(':scope > .results, :scope > .insight-grid').forEach(el=>el.remove());
  workspace.innerHTML=state.section==='lab'?labView():placeholderView();
  const results=workspace.querySelector('.results');
  const insights=results?.querySelector('.insight-grid');
  if(results) shell.append(results);
  if(insights) shell.append(insights);
  shell.classList.toggle('is-lab',state.section==='lab');
  enhance();
  document.title=`${state.section==='lab'?'新品上市模拟':workspace.querySelector('h1')?.textContent} · World Agent`;
}

function startRun(){clearInterval(runTimer);state.running=true;dialogBody.innerHTML=`<div class="run-progress"><span class="run-mark">W</span><span class="panel-kicker">WORLD AGENT</span><h2>正在加载示例实验</h2><p>这是交互演示，不是实时市场预测或真实 Agent 运行。</p><progress max="100" value="0"></progress><small>0%</small></div>`;dialog.showModal();let value=0;runTimer=setInterval(()=>{value+=20;const progress=dialogBody.querySelector('progress');if(!progress){clearInterval(runTimer);return;}progress.value=value;dialogBody.querySelector('small').textContent=`${value}%`;if(value===100){clearInterval(runTimer);state.running=false;dialogBody.innerHTML=`<div class="run-complete"><span>✓</span><h2>示例已载入</h2><p>方案 B 的综合表现最佳，预计销量 142 万瓶。</p><button class="primary-button" data-action="view-results">查看结果</button></div>`;}},280);}

document.addEventListener('click',event=>{
  const nav=event.target.closest('[data-nav]')?.dataset.nav;
  if(nav){state.section=nav;document.querySelectorAll('[data-nav]').forEach(button=>button.classList.toggle('is-active',button.dataset.nav===nav));document.body.classList.remove('nav-open');render();return;}
  const step=event.target.closest('[data-step]')?.dataset.step;if(step!==undefined){state.step=Number(step);render();return;}
  const scheme=event.target.closest('[data-scheme]')?.dataset.scheme;if(scheme){state.scheme=scheme;render();return;}
  const result=event.target.closest('[data-result]')?.dataset.result;if(result){state.result=result;render();return;}
  const tag=event.target.closest('.tag-picker button');if(tag){tag.classList.toggle('is-selected');return;}
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='next'){if(state.step<4){state.step++;render();}else startRun();}
  if(action==='previous'&&state.step>0){state.step--;render();}
  if(action==='run')startRun();
  if(action==='close-dialog'){clearInterval(runTimer);state.running=false;dialog.close();}
  if(action==='view-results'){dialog.close();document.querySelector('.results')?.scrollIntoView({behavior:'smooth'});notify('已显示示例结果，非实时市场预测。');}
  if(action==='toggle-nav')document.body.classList.toggle('nav-open');
  if(action==='download')notify('演示报告已准备：正式版本将导出 PDF。');
  if(action==='share')notify('这是分享入口演示，尚未复制或发布链接。');
  if(action==='add-scheme')notify('当前演示已使用 3 个方案上限。');
});
document.addEventListener('input',event=>{
  const field=event.target.dataset.field;if(field)state[field]=event.target.value;
  if(event.target.dataset.action==='age-range'){event.target.nextElementSibling.value=`18–${event.target.value} 岁`;state.audience=`18–${event.target.value} 岁城市消费者`;}
  if(event.target.dataset.action==='duration'){state.duration=Number(event.target.value);event.target.nextElementSibling.value=`${state.duration} 天`;const dd=document.querySelector('.run-summary dl>div:last-child dd');if(dd)dd.textContent=`${state.duration} 天`;}
});
dialog.addEventListener('cancel',()=>{clearInterval(runTimer);state.running=false;});
restore();
render();
function applyRoute(){
 const route=location.hash.replace('#','');
 const routeSteps={product:0,pricing:3,creative:3,channel:2,market:2};
 if(Object.hasOwn(routeSteps,route)){state.section='lab';state.step=routeSteps[route];render();}
}
applyRoute();
addEventListener('hashchange',applyRoute);

/* App enhancements share the original module state. No server or forecast is implied. */
function restore(){
  try{
    const saved=JSON.parse(localStorage.getItem('world-agent-clickthrough-pages-v1')||'null');
    if(saved?.version===3){
      for(const key of ['product','category','quarter','audience','market','description','season','competition','agents'])if(typeof saved.state?.[key]==='string')state[key]=saved.state[key].slice(0,500);
      if(['A','B','C'].includes(saved.state?.scheme))state.scheme=saved.state.scheme;
      if([30,60,90,120,150,180].includes(saved.state?.duration))state.duration=saved.state.duration;
      if(Number.isInteger(saved.state?.age)&&saved.state.age>=18&&saved.state.age<=55)state.age=saved.state.age;
      for(const key of ['social','competitive'])if(typeof saved.state?.[key]==='boolean')state[key]=saved.state[key];
      for(const key of ['lifestyle','channels'])if(Array.isArray(saved.state?.[key]))state[key]=saved.state[key].filter(x=>typeof x==='string').slice(0,8);
      for(const id of ['A','B','C'])if(saved.schemes?.[id]){
        const x=saved.schemes[id];
        if(Number.isFinite(x.price)&&x.price>0&&x.price<=9999)schemes[id].price=x.price;
        for(const k of ['channel','message'])if(typeof x[k]==='string')schemes[id][k]=x[k].slice(0,80);
      }
    }
  }catch{}
  const params=new URLSearchParams(location.hash.slice(1));
  if(['A','B','C'].includes(params.get('scheme')))state.scheme=params.get('scheme');
}
function persist(){try{localStorage.setItem('world-agent-clickthrough-pages-v1',JSON.stringify({version:3,state,schemes}));}catch{}}
function enhance(){
  persist();
  const metricMap={销量:['sales','万'],转化率:['conversion','%'],复购率:['repeat','%'],ROI:['roi','']};
  const [key,unit]=metricMap[state.metric]||metricMap.销量;
  const max=Math.max(...Object.values(schemes).map(x=>x[key]));
  document.querySelectorAll('.metric-switch button').forEach(b=>{b.classList.toggle('is-active',b.textContent===state.metric);b.setAttribute('aria-pressed',String(b.textContent===state.metric));});
  document.querySelectorAll('.bars button').forEach(b=>{
    const n=schemes[b.dataset.scheme][key];b.querySelector('b').textContent=n+unit;
    b.querySelector('i').style.setProperty('height',`${n/max*68}%`,'important');
    b.setAttribute('aria-label',`方案 ${b.dataset.scheme}，${state.metric} ${n}${unit}`);b.setAttribute('aria-pressed',String(state.scheme===b.dataset.scheme));
  });
  document.querySelectorAll('.scheme-card').forEach(b=>{const x=schemes[b.dataset.scheme];b.title='选择方案 '+b.dataset.scheme;b.querySelector('small').firstChild.textContent=x.channel;b.querySelector('small:last-child').textContent=x.message;});
  const table=document.querySelector('.comparison-table');
  if(table){for(const [index,key] of [[1,'price'],[2,'channel'],[3,'message']])for(const [j,id] of ['A','B','C'].entries())table.children[index].children[j+1].textContent=(key==='price'?'¥':'')+schemes[id][key];}
  for(const field of ['season','competition','agents']){const select=document.querySelector(`[data-field="${field}"]`);if(select)select.value=state[field];}
  document.querySelectorAll('.tag-picker button').forEach(b=>{
    const kind=state.step===1?'lifestyle':state.step===2?'channels':null;
    if(kind&&!b.closest('.compact'))b.classList.toggle('is-selected',state[kind].includes(b.textContent));
    b.setAttribute('aria-pressed',String(b.classList.contains('is-selected')));
  });
  document.querySelectorAll('.app-sidebar [data-nav]').forEach(b=>b.classList.toggle('is-active',b.dataset.nav===state.section));
  if(state.section!=='lab')document.querySelector('.empty-view')?.replaceWith(sectionView());
}
function sectionView(){
  const el=document.createElement('section');el.className='panel reference-section';
  const cards=()=>Object.entries(schemes).map(([id,x])=>`<button class="reference-list-item" data-open-scheme="${id}"><b>方案 ${id} · ${e(state.product)}</b><span>¥${x.price} · ${e(x.channel)} · ${e(x.message)}</span><small>示例销量 ${x.sales} 万瓶 · 查看实验 →</small></button>`).join('');
  const views={
    home:`<h2>实验概览</h2><p>当前本机草稿与预置方案，所有指标为演示数据。</p><div class="reference-card-grid">${cards()}</div>`,
    mine:`<h2>我的实验</h2><p>本机草稿 · ${e(state.product)} · ${state.duration} 天</p><div class="reference-card-grid">${cards()}</div>`,
    templates:`<h2>从模板开始</h2><p>选择模板会更新当前实验的名称，不产生真实预测。</p>${['新品上市','价格测试','渠道对比'].map(x=>`<button class="reference-list-item" data-template="${x}"><b>${x}</b><span>使用模板 →</span></button>`).join('')}`,
    consumer:`<h2>消费者世界</h2><p>合成消费者样例，不代表真实个人。</p><div class="reference-card-grid">${['林小雨 · 健康生活','陈明 · 理性消费','周悦 · 社交分享'].map(x=>`<button class="reference-list-item" data-person="${x}"><b>${x}</b><span>查看消费者画像与行为 →</span></button>`).join('')}</div>`,
    market:`<h2>市场洞察</h2><p>${e(state.market)} · 预置十二周趋势，未经过真实数据校准。</p>${lineChart()}`,
    data:`<h2>数据中心</h2><table><thead><tr><th>数据集</th><th>状态</th><th>来源</th></tr></thead><tbody><tr><td>产品与实验设置</td><td>本机草稿</td><td>当前浏览器</td></tr><tr><td>市场仿真指标</td><td>未校准</td><td>预置演示数据</td></tr><tr><td>消费者样例</td><td>合成</td><td>界面示例</td></tr></tbody></table>`,
    reports:`<h2>实验报告</h2><p>${e(state.product)} · 三方案对比 · 示例数据</p><button class="primary-button" data-action="download">下载 CSV 报告</button>`,
    settings:`<h2>本机设置</h2><p>草稿仅存储在当前浏览器，不上传到服务器。</p><button class="outline-button" data-action="reset-draft">重置演示草稿</button>`
  };
  el.innerHTML=views[state.section]||views.home;return el;
}
function showPanel(title,body){
  clearInterval(runTimer);state.running=false;if(dialog.open)dialog.close();
  dialogBody.innerHTML=`<div class="reference-dialog-content"><h2>${e(title)}</h2>${body}</div>`;dialog.showModal();
}
function exportReport(){
  const quote=x=>'"'+String(x).replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';
  const rows=[['World Agent demo report','Uncalibrated fixture, not a forecast'],['Product',state.product],['Duration requested (days)',state.duration],['Metrics','Preloaded demo fixtures; editing inputs does not recalculate forecasts'],['Scheme','Price','Channel','Message','Sales bottles','Conversion %','Repeat %','ROI'],...Object.entries(schemes).map(([id,x])=>[id,x.price,x.channel,x.message,x.sales*10000,x.conversion,x.repeat,x.roi])];
  const url=URL.createObjectURL(new Blob(['\ufeff'+rows.map(row=>row.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='world-agent-demo-report.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);notify('已导出 CSV 示例报告，非真实市场预测。');
}
document.addEventListener('click',event=>{
  const b=event.target.closest('button,a');if(!b)return;
  const action=b.dataset.action,stop=()=>{event.preventDefault();event.stopImmediatePropagation();};
  if(b.closest('.metric-switch')){stop();state.metric=b.textContent;enhance();return;}
  if(b.closest('.tag-picker')){
    stop();b.classList.toggle('is-selected');b.setAttribute('aria-pressed',String(b.classList.contains('is-selected')));
    const kind=state.step===1?'lifestyle':state.step===2?'channels':null;
    if(kind&&!b.closest('.compact'))state[kind]=[...b.parentElement.querySelectorAll('.is-selected')].map(x=>x.textContent);persist();return;
  }
  if(action==='download'){stop();exportReport();return;}
  if(action==='share'){
    stop();const x=selected();const summary=`World Agent · 示例方案 ${state.scheme}\n产品：${state.product}\n价格：¥${x.price}\n渠道：${x.channel}\n信息：${x.message}\n预置示例销量：${x.sales} 万瓶\n未校准的演示数据，非真实市场预测。`;
    showPanel('分享方案摘要',`<p>复制文本即可分享。没有上传草稿或发布公开链接。</p><label>方案摘要<textarea class="share-value" readonly>${e(summary)}</textarea></label><button class="primary-button" data-action="copy-share">复制摘要</button>`);return;
  }
  if(action==='copy-share'){
    stop();const input=dialog.querySelector('.share-value');input.select();
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(input.value).then(()=>notify('摘要已复制。')).catch(()=>notify('请复制已选中的摘要。'));
    else notify('请复制已选中的摘要。');return;
  }
  if(action==='add-scheme'){
    stop();showPanel('编辑对比方案',`<p>最多三个方案。编辑输入不会将预置指标变成真实预测。</p><form id="scheme-editor">${Object.entries(schemes).map(([id,x])=>`<fieldset><legend>方案 ${id}</legend><label>价格（元）<input name="${id}-price" type="number" min="0.01" max="9999" step="0.01" required value="${x.price}"></label><label>渠道<input name="${id}-channel" maxlength="80" required value="${e(x.channel)}"></label><label>核心信息<input name="${id}-message" maxlength="80" required value="${e(x.message)}"></label></fieldset>`).join('')}<button class="primary-button" type="submit">保存方案</button></form>`);return;
  }
  if(action==='reset-draft'){stop();showPanel('重置草稿','<p>清除当前浏览器中的实验设置，并恢复预置示例。</p><button class="primary-button" data-action="confirm-reset">确认重置</button>');return;}
  if(action==='confirm-reset'){
    stop();try{localStorage.removeItem('world-agent-clickthrough-pages-v1');}catch{}
    Object.assign(state,{product:'白桃气泡水',category:'饮料',quarter:'2025 Q2',audience:'18–35 岁城市消费者',market:'华东线上市场',duration:90,scheme:'B',step:0,section:'lab',metric:'销量',description:'0糖0脂、天然果味，年轻人的日常饮品选择。',age:35,season:'夏季',competition:'中',agents:'100,000',social:true,competitive:true,lifestyle:['健康生活','价格敏感','社交活跃'],channels:['小红书','抖音']});
    Object.assign(schemes.A,{price:6,channel:'小红书',message:'健康轻盈'});Object.assign(schemes.B,{price:8,channel:'小红书',message:'高级天然'});Object.assign(schemes.C,{price:8,channel:'抖音',message:'夏日解渴'});dialog.close();render();return;
  }
  if(b.dataset.openScheme){stop();state.scheme=b.dataset.openScheme;state.section='lab';state.step=0;render();return;}
  if(b.dataset.template){stop();state.product=b.dataset.template==='新品上市'?'白桃气泡水':b.dataset.template==='价格测试'?'价格策略实验':'渠道对比实验';state.section='lab';state.step=0;render();return;}
  if(b.dataset.person){stop();showPanel(b.dataset.person,'<p>合成消费者画像 · 演示数据</p><p>关注健康、价格与社交推荐；浏览内容、比较产品、购买后分享。</p><button class="primary-button" data-nav="lab">查看关联实验</button>');return;}
  if(b.dataset.nav&&dialog.open)dialog.close();
  if(b.getAttribute('aria-label')==='通知'){stop();showPanel('通知','<p>没有服务器通知。</p><p>当前正在浏览本地演示数据，实验不会连接真实市场服务。</p>');return;}
  if(b.getAttribute('aria-label')==='账号菜单'){stop();showPanel('演示账号','<p>张三 · 品牌经理</p><p>这是公开演示身份，没有登录凭据，也不会建立真实账户。</p><button class="outline-button" data-nav="settings">打开本机设置</button>');return;}
},true);
document.addEventListener('submit',event=>{
  if(event.target.id!=='scheme-editor')return;event.preventDefault();const form=new FormData(event.target);
  for(const id of ['A','B','C'])Object.assign(schemes[id],{price:Number(form.get(id+'-price')),channel:String(form.get(id+'-channel')).trim(),message:String(form.get(id+'-message')).trim()});persist();dialog.close();render();notify('方案设置已保存；图表仍为未校准的示例数据。');
});
document.addEventListener('input',event=>{
  if(event.target.dataset.action==='age-range')state.age=Number(event.target.value);
  if(event.target.matches('[data-field],[data-action="duration"],[data-action="age-range"]'))persist();
});
document.addEventListener('change',event=>{const k=event.target.dataset.boolean;if(k){state[k]=event.target.checked;persist();}});
document.querySelector('.app-search input')?.addEventListener('keydown',event=>{
  if(event.key!=='Enter')return;event.preventDefault();const term=event.target.value.trim();
  const items=[['lab','新品上市模拟 '+state.product],['consumer','消费者世界 林小雨'],['reports','报告 CSV'],['market','市场洞察'],['data','数据中心']].filter(([,label])=>!term||label.toLowerCase().includes(term.toLowerCase()));
  showPanel('搜索结果',items.length?items.map(([id,label])=>`<button class="reference-list-item" data-nav="${id}">${e(label)} →</button>`).join(''):'<p>没有匹配项。试试“消费者”“报告”或产品名称。</p>');
});
window.worldAgentSnapshot=()=>JSON.parse(JSON.stringify({state,schemes}));
addEventListener('message',event=>{
  if(event.source!==parent||event.data?.type!=='world-agent-route')return;
  const stepsByRoute={product:0,pricing:3,creative:3,channel:2,market:2};
  state.section='lab';state.step=stepsByRoute[event.data.route]??0;render();
});
