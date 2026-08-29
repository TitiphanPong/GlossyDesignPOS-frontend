export type VisibilityStateLike = 'hidden' | 'visible' | 'prerender' | 'unloaded';

type EventTargetLike = {
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
};

type DocumentLike = EventTargetLike & {
  visibilityState: VisibilityStateLike;
};

type TimerHandle = ReturnType<typeof setTimeout>;

type ActionCenterPollerOptions = {
  fetchActionCenter: (signal: AbortSignal) => Promise<void>;
  documentTarget: DocumentLike;
  windowTarget: EventTargetLike;
  intervalMs?: number;
  setTimeoutFn?: (callback: () => void, delay: number) => TimerHandle;
  clearTimeoutFn?: (handle: TimerHandle) => void;
};

export type ActionCenterPoller = {
  start(): void;
  stop(): void;
  refetch(): Promise<void>;
};

export function createActionCenterPoller({
  fetchActionCenter,
  documentTarget,
  windowTarget,
  intervalMs = 30_000,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
}: ActionCenterPollerOptions): ActionCenterPoller {
  let started = false;
  let timer: TimerHandle | null = null;
  let inFlight: Promise<void> | null = null;
  let activeController: AbortController | null = null;

  const clearTimer = () => {
    if (timer === null) return;
    clearTimeoutFn(timer);
    timer = null;
  };

  const scheduleNext = () => {
    clearTimer();
    if (!started || documentTarget.visibilityState === 'hidden') return;
    timer = setTimeoutFn(() => {
      timer = null;
      void runFetch();
    }, intervalMs);
  };

  const runFetch = (): Promise<void> => {
    if (inFlight) return inFlight;

    const controller = new AbortController();
    activeController = controller;
    const request = fetchActionCenter(controller.signal).finally(() => {
      if (activeController === controller) activeController = null;
      if (inFlight === request) inFlight = null;
      scheduleNext();
    });
    inFlight = request;
    return request;
  };

  const refreshIfVisible = () => {
    if (!started || documentTarget.visibilityState === 'hidden') return;
    clearTimer();
    void runFetch();
  };

  const handleVisibilityChange = () => {
    if (documentTarget.visibilityState === 'hidden') {
      clearTimer();
      return;
    }
    refreshIfVisible();
  };

  const handleFocus = () => refreshIfVisible();

  return {
    start() {
      if (started) return;
      started = true;
      documentTarget.addEventListener('visibilitychange', handleVisibilityChange);
      windowTarget.addEventListener('focus', handleFocus);
      void runFetch();
    },
    stop() {
      if (!started) return;
      started = false;
      clearTimer();
      documentTarget.removeEventListener('visibilitychange', handleVisibilityChange);
      windowTarget.removeEventListener('focus', handleFocus);
      activeController?.abort();
      activeController = null;
    },
    refetch() {
      clearTimer();
      return runFetch();
    },
  };
}
