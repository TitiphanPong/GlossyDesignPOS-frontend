import assert from 'node:assert/strict';
import test from 'node:test';
import { createActionCenterPoller, type VisibilityStateLike } from './action-center-polling';

type Listener = () => void;

class FakeEventTarget {
  private readonly listeners = new Map<string, Set<Listener>>();

  addEventListener(type: string, listener: Listener) {
    const listeners = this.listeners.get(type) ?? new Set<Listener>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: Listener) {
    this.listeners.get(type)?.delete(listener);
  }

  emit(type: string) {
    for (const listener of this.listeners.get(type) ?? []) listener();
  }

  listenerCount(type: string) {
    return this.listeners.get(type)?.size ?? 0;
  }
}

class FakeDocument extends FakeEventTarget {
  visibilityState: VisibilityStateLike = 'visible';
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(done => {
    resolve = done;
  });
  return { promise, resolve };
}

function createFakeTimers() {
  let nextId = 1;
  const callbacks = new Map<number, () => void>();
  return {
    setTimeoutFn(callback: () => void) {
      const id = nextId++;
      callbacks.set(id, callback);
      return id as unknown as ReturnType<typeof setTimeout>;
    },
    clearTimeoutFn(handle: ReturnType<typeof setTimeout>) {
      callbacks.delete(handle as unknown as number);
    },
    runNext() {
      const entry = callbacks.entries().next().value as [number, () => void] | undefined;
      assert.ok(entry, 'expected a scheduled polling timer');
      callbacks.delete(entry[0]);
      entry[1]();
    },
    get size() {
      return callbacks.size;
    },
  };
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

test('polling waits for the active request and never overlaps focus or timer refreshes', async () => {
  const documentTarget = new FakeDocument();
  const windowTarget = new FakeEventTarget();
  const timers = createFakeTimers();
  const requests = [deferred(), deferred()];
  let calls = 0;

  const poller = createActionCenterPoller({
    documentTarget,
    windowTarget,
    fetchActionCenter: async () => requests[calls++].promise,
    setTimeoutFn: timers.setTimeoutFn,
    clearTimeoutFn: timers.clearTimeoutFn,
  });

  poller.start();
  assert.equal(calls, 1);
  assert.equal(timers.size, 0, 'next poll is not scheduled while a request is active');

  windowTarget.emit('focus');
  assert.equal(calls, 1, 'focus reuses the active request');

  requests[0].resolve();
  await flushMicrotasks();
  assert.equal(timers.size, 1);

  timers.runNext();
  assert.equal(calls, 2);
  windowTarget.emit('focus');
  assert.equal(calls, 2, 'focus cannot overlap a timer-started request');

  requests[1].resolve();
  await flushMicrotasks();
  poller.stop();
});

test('polling pauses while hidden and refreshes promptly when the document becomes visible', async () => {
  const documentTarget = new FakeDocument();
  const windowTarget = new FakeEventTarget();
  const timers = createFakeTimers();
  let calls = 0;

  const poller = createActionCenterPoller({
    documentTarget,
    windowTarget,
    fetchActionCenter: async () => {
      calls += 1;
    },
    setTimeoutFn: timers.setTimeoutFn,
    clearTimeoutFn: timers.clearTimeoutFn,
  });

  poller.start();
  await flushMicrotasks();
  assert.equal(calls, 1);
  assert.equal(timers.size, 1);

  documentTarget.visibilityState = 'hidden';
  documentTarget.emit('visibilitychange');
  assert.equal(timers.size, 0, 'background tab has no polling timer');

  documentTarget.visibilityState = 'visible';
  documentTarget.emit('visibilitychange');
  assert.equal(calls, 2, 'visibility return triggers an immediate refresh');
  await flushMicrotasks();
  assert.equal(timers.size, 1);

  poller.stop();
});

test('manual refetch remains available while hidden and still deduplicates an active request', async () => {
  const documentTarget = new FakeDocument();
  const windowTarget = new FakeEventTarget();
  const timers = createFakeTimers();
  const first = deferred();
  const second = deferred();
  let calls = 0;

  const poller = createActionCenterPoller({
    documentTarget,
    windowTarget,
    fetchActionCenter: async () => (calls++ === 0 ? first.promise : second.promise),
    setTimeoutFn: timers.setTimeoutFn,
    clearTimeoutFn: timers.clearTimeoutFn,
  });

  poller.start();
  first.resolve();
  await flushMicrotasks();
  documentTarget.visibilityState = 'hidden';
  documentTarget.emit('visibilitychange');

  const manual = poller.refetch();
  assert.equal(calls, 2, 'manual refresh is not blocked by hidden visibility');
  assert.strictEqual(poller.refetch(), manual, 'concurrent manual refresh reuses the active request');

  second.resolve();
  await manual;
  assert.equal(timers.size, 0, 'hidden state remains unscheduled after manual refresh');
  poller.stop();
});

test('stop aborts the active request, clears timers, and removes visibility/focus listeners', () => {
  const documentTarget = new FakeDocument();
  const windowTarget = new FakeEventTarget();
  const timers = createFakeTimers();
  let signal: AbortSignal | undefined;

  const poller = createActionCenterPoller({
    documentTarget,
    windowTarget,
    fetchActionCenter: async currentSignal => {
      signal = currentSignal;
      await new Promise<void>(() => undefined);
    },
    setTimeoutFn: timers.setTimeoutFn,
    clearTimeoutFn: timers.clearTimeoutFn,
  });

  poller.start();
  assert.equal(documentTarget.listenerCount('visibilitychange'), 1);
  assert.equal(windowTarget.listenerCount('focus'), 1);
  assert.equal(signal?.aborted, false);

  poller.stop();
  assert.equal(signal?.aborted, true);
  assert.equal(timers.size, 0);
  assert.equal(documentTarget.listenerCount('visibilitychange'), 0);
  assert.equal(windowTarget.listenerCount('focus'), 0);
});
