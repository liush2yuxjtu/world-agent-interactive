import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const intentUrl=new URL('../intent/eve-price-experiment-chat/index.html',import.meta.url);
const featureUrl=new URL('../assistant/index.html',import.meta.url);
const evalUrl=new URL('../evals/eve-price-experiment-chat.json',import.meta.url);
const [intent,feature,evalSpec]=await Promise.all([
  readFile(intentUrl,'utf8'),
  readFile(featureUrl,'utf8'),
  readFile(evalUrl,'utf8').then(JSON.parse),
]);

const required=[
  '聊天，就像在“委托一个实验”',
  '白桃气泡水，¥6 还是 ¥8 更好？',
  '你批准后我才运行。',
  '待批准实验',
  '批准并运行',
  'run_experiment',
  'get_run',
  'check_reliability',
  '现实销量仍需真实数据校准',
  'Eve useEveAgent + AI Elements Conversation, Message, Confirmation, Tool',
];

test('Eve chat implementation matches the committed visual intent exactly',()=>{
  assert.equal(feature,intent);
});

test('visual intent contains the complete approval-first Eve interaction contract',()=>{
  for(const text of required) assert.ok(intent.includes(text),`missing: ${text}`);
  const approveHandler=intent.indexOf("approve.addEventListener('click'");
  assert.ok(approveHandler>0);
  for(const tool of ['run_experiment','get_run','check_reliability']){
    assert.ok(intent.indexOf(tool)>approveHandler,`${tool} must only appear in the post-approval flow`);
  }
});

test('visual intent clearly separates model evidence from real-market claims',()=>{
  assert.ok(intent.includes('示例数字不是现实预测'));
  assert.ok(intent.includes('仅演示界面'));
  assert.ok(intent.includes('不等于。现在是未校准机制模型'));
});

test('visual intent is self-contained and responsive',()=>{
  assert.ok(intent.includes("default-src 'none'"));
  assert.ok(intent.includes('@media(max-width:860px)'));
  assert.ok(intent.includes('@media(max-width:520px)'));
  assert.ok(!/<(?:script|link|img)[^>]+(?:src|href)=["']https?:/i.test(intent));
});

test('feature eval spec is executable as a deterministic contract',()=>{
  assert.equal(evalSpec.feature,'eve-price-experiment-chat');
  assert.equal(evalSpec.cases.length,4);
  for(const item of evalSpec.cases){
    for(const text of item.must_include||item.prompts||[]) assert.ok(intent.includes(text),`${item.id}: missing ${text}`);
    if(item.tool_order){
      const positions=item.tool_order.map(tool=>intent.indexOf(tool));
      assert.ok(positions.every(x=>x>0));
      assert.deepEqual([...positions].sort((a,b)=>a-b),positions);
    }
  }
});
