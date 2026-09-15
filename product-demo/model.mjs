/** Transparent, uncalibrated rule model. No remote API, trained AI, or market forecast. */
export const MODEL_VERSION = 'rules-1.0.0';
export const CHANNELS = ['小红书', '抖音', '线下便利店'];
export const MESSAGES = ['健康轻盈', '高级天然', '夏日解渴'];
export function defaultConfig() {
  return {product:'白桃气泡水', description:'0 糖、天然果味，面向年轻消费者的日常饮品。', category:'饮料',
    audience:'健康生活', population:5000, market:'华东城市', competition:0.4, season:'夏季',
    days:90, seed:42, repeat:true,
    schemes:[{id:'A',price:6,cost:3,budget:5000,channel:'小红书',message:'健康轻盈'},
      {id:'B',price:8,cost:3,budget:5000,channel:'小红书',message:'高级天然'},
      {id:'C',price:8,cost:3,budget:5000,channel:'抖音',message:'夏日解渴'}]};
}
const numberIn=(v,min,max)=>typeof v==='number' && Number.isFinite(v) && v>=min && v<=max;
export function validateConfig(c) {
  const errors=[];
  if(!c || typeof c!=='object') return ['配置必须是一个对象'];
  for(const [key,label,max] of [['product','产品名称',80],['description','产品描述',500],['market','目标市场',80]])
    if(typeof c[key]!=='string' || !c[key].trim() || c[key].length>max) errors.push(`${label}不能为空，最多 ${max} 字`);
  if(!['饮料','食品','个护'].includes(c.category)) errors.push('请选择有效的产品类别');
  if(!['健康生活','价格敏感','综合人群'].includes(c.audience)) errors.push('请选择有效的人群');
  if(![1000,5000,10000].includes(c.population)) errors.push('合成消费者数量应为 1000、5000 或 10000');
  if(!numberIn(c.competition,0,1)) errors.push('竞争强度须在 0 和 1 之间');
  if(!['春季','夏季','秋季','冬季'].includes(c.season)) errors.push('请选择有效的季节');
  if(!Number.isInteger(c.days) || !numberIn(c.days,30,180)) errors.push('实验周期须为 30 至 180 天的整数');
  if(!Number.isInteger(c.seed) || !numberIn(c.seed,1,999999)) errors.push('随机种子须为 1 至 999999 的整数');
  if(typeof c.repeat!=='boolean') errors.push('复购设置无效');
  if(!Array.isArray(c.schemes) || c.schemes.length!==3) errors.push('需要 A、B、C 三个对照方案');
  else c.schemes.forEach((s,i)=>{
    if(!s || s.id!==['A','B','C'][i]) {errors.push('方案顺序须为 A、B、C');return;}
    if(!numberIn(s.price,1,100)) errors.push(`方案 ${s.id}：价格须为 1 至 100 元`);
    if(!numberIn(s.cost,0,100)) errors.push(`方案 ${s.id}：单位成本须为 0 至 100 元`);
    if(!numberIn(s.budget,100,1000000)) errors.push(`方案 ${s.id}：总投放预算须为 100 至 1,000,000 元`);
    if(!CHANNELS.includes(s.channel) || !MESSAGES.includes(s.message)) errors.push(`方案 ${s.id}：渠道或内容无效`);
  });
  return errors;
}
// Copy only known fields. Imported object prototypes and extra keys never enter app state.
export function cleanConfig(input) {
  const errors=validateConfig(input); if(errors.length) throw new Error(errors.join('；'));
  const c=defaultConfig(); for(const key of Object.keys(c)) if(key!=='schemes') c[key]=input[key];
  c.schemes=input.schemes.map(s=>({id:s.id,price:s.price,cost:s.cost,budget:s.budget,channel:s.channel,message:s.message}));
  return c;
}
// Common random numbers keep scenario comparisons paired and independently reproducible.
function uniform(seed,person,week,stream) {
  let x=(seed ^ Math.imul(person+1,0x9e3779b1) ^ Math.imul(week+1,0x85ebca6b) ^ Math.imul(stream+1,0xc2b2ae35))>>>0;
  x=Math.imul(x^(x>>>16),0x7feb352d);x=Math.imul(x^(x>>>15),0x846ca68b);
  return ((x^(x>>>16))>>>0)/4294967296;
}
const round=(v)=>Math.round(v*100)/100;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export function simulateScheme(config, scheme) {
  const errors=validateConfig(config);if(errors.length) throw new Error(errors.join('；'));
  const n=config.population,weeks=Math.ceil(config.days/7),weekly=new Array(weeks).fill(0),people=[];
  let buyers=0,repeaters=0,reached=0,units=0;
  const seasonal=config.season==='夏季'?1.15:config.season==='冬季'?.85:1;
  for(let i=0;i<n;i++) {
    const budgetTolerance=4+uniform(config.seed,i,0,1)*12;
    const health=uniform(config.seed,i,0,2), channelAffinity=.7+uniform(config.seed,i,0,3+CHANNELS.indexOf(scheme.channel))*.6;
    const preference=config.audience==='健康生活'?health*.6+.4:config.audience==='价格敏感'?health*.5:health;
    const appeal=scheme.message==='健康轻盈'?.85+preference*.3:scheme.message==='高级天然'?.8+preference*.35:seasonal;
    const sensitivity=config.audience==='价格敏感'?1.5:1;
    const willingness=1/(1+Math.exp((scheme.price-budgetTolerance)/(2/sensitivity)));
    const exposure=clamp((.1+.25*Math.sqrt(scheme.budget/n))*channelAffinity*(1-.4*config.competition),.02,.9);
    const conversion=clamp(.28*willingness*appeal*seasonal*(1-.3*config.competition),.001,.7);
    let orders=0;const events=[];
    for(let w=0;w<weeks;w++) {
      const day=Math.min(config.days,(w+1)*7),fraction=Math.min(7,config.days-w*7)/7;
      const seen=uniform(config.seed,i,w,10)<exposure*fraction;
      if(seen && !events.some(e=>e.kind==='reach')) events.push({day,kind:'reach'});
      const bought=orders===0 ? seen && uniform(config.seed,i,w,11)<conversion : config.repeat && uniform(config.seed,i,w,12)<conversion*.55*fraction;
      if(bought) {orders++;weekly[w]++;events.push({day,kind:orders===1?'buy':'repeat'});}
    }
    reached+=Number(events.some(e=>e.kind==='reach'));buyers+=Number(orders>0);repeaters+=Number(orders>1);units+=orders;
    if(i<8) people.push({id:i,name:['林小雨','陈一诺','周子涵','许安宁','吴星辰','李沐阳','王知夏','赵予安'][i],
      age:20+Math.floor(uniform(config.seed,i,0,20)*25),tolerance:round(budgetTolerance),health:round(preference*100),orders,events});
  }
  let sum=0;const trend=weekly.map((value,i)=>({day:Math.min(config.days,(i+1)*7),units:sum+=value}));
  const revenue=round(units*scheme.price),profit=round(units*(scheme.price-scheme.cost)-scheme.budget);
  return {id:scheme.id,units,buyers,repeaters,reached,revenue,profit,conversion:round(buyers/n*100),
    repeatRate:buyers?round(repeaters/buyers*100):0,roas:round(revenue/scheme.budget),trend,people};
}
export function runSimulation(input,onProgress=()=>{}) {
  const config=cleanConfig(input),results=[];
  config.schemes.forEach((s,i)=>{results.push(simulateScheme(config,s));onProgress(Math.round((i+1)/3*100));});
  const winner=[...results].sort((a,b)=>b.profit-a.profit)[0].id;
  return {modelVersion:MODEL_VERSION,config,results,winner,disclaimer:'未校准的规则演示，不是市场预测；不含真实消费者、实时数据或大模型。'};
}
export function escapeHtml(v) {return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function csvReport(run) {
  const cell=v=>'"'+String(v).replace(/^[\s]*[=+@-]/,"'$&").replace(/"/g,'""')+'"';
  const rows=[['产品','方案','销量（件）','购买人数','转化率（%）','复购率（%）','营收（元）','投放后毛利（元）','ROAS','模型','说明']];
  run.results.forEach(r=>rows.push([run.config.product,r.id,r.units,r.buyers,r.conversion,r.repeatRate,r.revenue,r.profit,r.roas,run.modelVersion,run.disclaimer]));
  return '\ufeff'+rows.map(row=>row.map(cell).join(',')).join('\r\n');
}
