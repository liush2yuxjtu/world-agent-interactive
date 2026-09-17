import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createBusinessWorldTestHarness, createMockClock, createMockFetch, createMockFunction,
  createMockStorage, createMockWorldRepository, defaultExperimentInput,
} from './mocks/index.mjs';

test('mock function records calls and supports once/default behavior', async () => {
  const fn = createMockFunction(async (value) => value * 2).mockResolvedValueOnce(99);
  assert.equal(await fn(3), 99);
  assert.equal(await fn(4), 8);
  assert.deepEqual(fn.calls, [[3], [4]]);
  fn.reset();
  assert.equal(fn.calls.length, 0);
});

test('mock clock deterministically runs due timers', () => {
  const clock = createMockClock('2026-09-17T00:00:00Z');
  const events = [];
  clock.setTimeout(() => events.push('later'), 1000);
  clock.advance(999);
  assert.deepEqual(events, []);
  clock.advance(1);
  assert.deepEqual(events, ['later']);
  assert.equal(clock.iso(), '2026-09-17T00:00:01.000Z');
});

test('mock storage behaves like Web Storage and can inject failures', () => {
  const storage = createMockStorage({ mode: 'baseline' });
  storage.setItem('count', 2);
  assert.equal(storage.getItem('count'), '2');
  storage.failOnce(new Error('quota'));
  assert.throws(() => storage.setItem('x', 1), /quota/);
  storage.reset();
  assert.deepEqual(storage.entries(), { mode: 'baseline' });
});

test('mock repository supports CRUD, audit and one-shot faults', async () => {
  const repo = createMockWorldRepository({ entities: [{ id: 'p1', name: 'Peach' }] });
  assert.equal((await repo.getEntity('p1')).name, 'Peach');
  await repo.upsertEntity({ id: 'p1', name: 'Peach Plus' });
  assert.equal((await repo.getEntity('p1')).name, 'Peach Plus');
  assert.equal((await repo.listAudit())[0].type, 'entity.upserted');
  repo.failOnce(new Error('db down'));
  await assert.rejects(() => repo.listEntities(), /db down/);
});

test('mock fetch matches routes, records requests and rejects unmocked network', async () => {
  const fetch = createMockFetch([
    { method: 'GET', url: '/api/world', response: { status: 200, body: { ok: true } } },
    { method: 'POST', url: /\/api\/runs$/, handler: ({ body }) => ({ status: 201, body: { received: JSON.parse(body) } }) },
  ]);
  assert.deepEqual(await (await fetch('/api/world')).json(), { ok: true });
  const posted = await fetch('/api/runs', { method: 'POST', body: JSON.stringify({ price: 8 }) });
  assert.deepEqual(await posted.json(), { received: { price: 8 } });
  await assert.rejects(() => fetch('/real-network'), /Unmocked request/);
  assert.equal(fetch.calls.length, 3);
});

test('full Business World flow is deterministic and approval gated', async () => {
  const h = createBusinessWorldTestHarness();
  const input = defaultExperimentInput();
  const plan = await h.businessWorld.plan_experiment(input);
  assert.equal(plan.calibrated, false);
  h.approval.denyNext();
  assert.equal((await h.businessWorld.run_experiment(input)).status, 'denied');
  h.approval.approveNext();
  const run = await h.businessWorld.run_experiment(input);
  assert.equal(run.status, 'completed');
  assert.equal(run.runId, 'bwm_test_0001');
  assert.equal(run.calibrated, false);
  assert.equal((await h.businessWorld.get_run({ runId: run.runId })).winner.id, run.winner.id);
  const reliability = await h.businessWorld.check_reliability({ runId: run.runId });
  assert.equal(reliability.reliableForRealMarketPrediction, false);
  assert.deepEqual(h.businessWorld.calls.map((item) => item.tool), ['plan_experiment', 'run_experiment', 'run_experiment', 'get_run', 'check_reliability']);
  assert.equal(h.telemetry.events.length, 5);
});

test('test harness reset clears mutable state without replacing handles', async () => {
  const h = createBusinessWorldTestHarness({ env: { MODE: 'test' } });
  h.localStorage.setItem('draft', 'yes');
  h.env.set('MODE', 'changed');
  await h.repository.upsertEntity({ id: 'x', name: 'X' });
  h.logger.warn('warning');
  h.reset();
  assert.equal(h.localStorage.getItem('draft'), null);
  assert.equal(h.env.get('MODE'), 'test');
  assert.deepEqual(await h.repository.listEntities(), []);
  assert.equal(h.logger.entries.length, 0);
  assert.equal(h.ids.next(), 'bwm_test_0001');
});
