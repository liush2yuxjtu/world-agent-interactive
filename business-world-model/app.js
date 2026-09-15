const scenarios={
  baseline:{forecast:'$45.8M',delta:'Current expected outcome',note:'Baseline scenario',impact:'+$0.0M',headcount:'+$0.0M',change:'Baseline model'},
  plan:{forecast:'$48.6M',delta:'+6.1% vs baseline',note:'Plan scenario',impact:'+$2.8M',headcount:'+$2.8M',change:'+$2.8M vs baseline'},
  downside:{forecast:'$42.9M',delta:'−6.3% vs baseline',note:'Downside scenario',impact:'−$2.9M',headcount:'−$1.4M',change:'−$2.9M vs baseline'}
};

const entities={
  revenue:{title:'Q4 revenue',type:'Outcome · Revenue metric',value:'$48.6M',change:'+$2.8M vs baseline',state:'Simulated',stateClass:'simulated-state',confidence:'82%',time:'Q4 FY26',source:'Revenue model v7',definition:'Expected recognized revenue for Q4 under the selected operating scenario, including new business and renewals.'},
  pipeline:{title:'Qualified pipeline',type:'Observed · Opportunity value',value:'$72.4M',change:'+9.4% over 8 weeks',state:'Observed',stateClass:'observed-state',confidence:'Source verified',time:'As of Sep 15',source:'Salesforce',definition:'Open opportunities that meet qualification criteria and are eligible to contribute to the Q4 revenue model.'},
  capacity:{title:'Sales capacity',type:'Observed · Workforce capacity',value:'148 AEs',change:'+4 since Aug 31',state:'Observed',stateClass:'observed-state',confidence:'Source verified',time:'Current roster',source:'Workday',definition:'Active account executives with selling capacity in the modeled North America go-to-market scope.'},
  coverage:{title:'Pipeline coverage',type:'Inferred · Coverage ratio',value:'3.1×',change:'0.4× below target',state:'Inferred',stateClass:'inferred-state',confidence:'91%',time:'Q4 FY26',source:'Model · 7 signals',definition:'Qualified pipeline divided by modeled revenue requirement for the selected segment and time horizon.'},
  conversion:{title:'Win probability',type:'Inferred · Conversion likelihood',value:'27.8%',change:'+1.7 pts vs prior',state:'Inferred',stateClass:'inferred-state',confidence:'86%',time:'Rolling 12 cohorts',source:'Model · 12 cohorts',definition:'Modeled probability that currently qualified opportunities convert within the selected revenue horizon.'},
  renewal:{title:'Renewal base',type:'Observed · Contract value',value:'$18.9M',change:'96% data coverage',state:'Observed',stateClass:'observed-state',confidence:'Source verified',time:'Q4 renewal cohort',source:'Snowflake · Finance mart',definition:'Contracted recurring revenue entering a renewal event during Q4 within the modeled account scope.'},
  headcount:{title:'+12 enterprise AEs',type:'Simulation · Operating intervention',value:'+$2.8M',change:'Median revenue impact',state:'Simulated',stateClass:'simulated-state',confidence:'74%',time:'90-day horizon',source:'Scenario model v7',definition:'Simulated incremental enterprise selling capacity, assuming hiring lands by Oct 7 and ramp follows the observed cohort range.'}
};

const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
let activeScenario='plan';

function applyScenario(name){
  activeScenario=name;
  const s=scenarios[name];
  $$('.scenario-button').forEach(button=>button.classList.toggle('is-active',button.dataset.scenario===name));
  $('#forecast-value').textContent=s.forecast;
  $('#forecast-delta').textContent=s.delta;
  $('#node-forecast').textContent=s.forecast;
  $('#node-forecast-note').textContent=s.note;
  $('#headcount-impact').textContent=s.headcount;
  $('#causal-impact').textContent=s.impact;
  entities.revenue.value=s.forecast;
  entities.revenue.change=s.change;
  entities.headcount.value=s.headcount;
  if($('.entity-node[data-entity="revenue"]').classList.contains('is-selected')) renderInspector('revenue');
  if($('.entity-node[data-entity="headcount"]').classList.contains('is-selected')) renderInspector('headcount');
}

function renderInspector(key){
  const entity=entities[key];
  if(!entity)return;
  $$('.entity-node').forEach(node=>node.classList.toggle('is-selected',node.dataset.entity===key));
  $('#inspector-title').textContent=entity.title;
  $('#inspector-type').textContent=entity.type;
  $('#inspector-value').textContent=entity.value;
  $('#inspector-change').textContent=entity.change;
  $('#inspector-confidence').textContent=entity.confidence;
  $('#inspector-time').textContent=entity.time;
  $('#inspector-source').textContent=entity.source;
  $('#inspector-definition').textContent=entity.definition;
  $('#inspector-state').innerHTML=`<span class="state-badge ${entity.stateClass}">${entity.state}</span>`;
}

function showToast(){
  const toast=$('#toast');
  toast.classList.add('is-visible');
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>toast.classList.remove('is-visible'),2200);
}

$$('.scenario-button').forEach(button=>button.addEventListener('click',()=>applyScenario(button.dataset.scenario)));
$$('.entity-node').forEach(node=>node.addEventListener('click',()=>renderInspector(node.dataset.entity)));
$('#run-scenario').addEventListener('click',()=>{
  const button=$('#run-scenario');
  const original=button.textContent;
  button.disabled=true;
  button.textContent='Recalculating…';
  setTimeout(()=>{button.disabled=false;button.textContent=original;showToast();},650);
});

applyScenario(activeScenario);
renderInspector('revenue');
