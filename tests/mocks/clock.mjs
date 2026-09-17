export function createMockClock(start = '2026-09-17T00:00:00.000Z') {
  let now = new Date(start).getTime();
  let nextId = 1;
  const timers = new Map();
  const runDue = () => {
    for (;;) {
      const due = [...timers.entries()]
        .filter(([, timer]) => timer.at <= now)
        .sort((a, b) => a[1].at - b[1].at || a[0] - b[0]);
      if (!due.length) return;
      for (const [id, timer] of due) {
        timers.delete(id);
        timer.callback();
      }
    }
  };
  return {
    now: () => now,
    date: () => new Date(now),
    iso: () => new Date(now).toISOString(),
    setTimeout(callback, delay = 0) {
      const id = nextId++;
      timers.set(id, { at: now + Math.max(0, Number(delay) || 0), callback });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    advance(ms) { now += Math.max(0, Number(ms) || 0); runDue(); return now; },
    set(value) { now = new Date(value).getTime(); runDue(); },
    pending: () => timers.size,
    reset() { now = new Date(start).getTime(); timers.clear(); nextId = 1; },
  };
}
