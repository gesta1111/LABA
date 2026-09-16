export function nextBackoffMs(attempt: number, baseMs = 1000, maxMs = 30000): number {
  const exp = Math.min(maxMs, baseMs * 2 ** Math.max(0, attempt - 1));
  const jitter = Math.random() * 250;
  return Math.min(maxMs, exp + jitter);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
