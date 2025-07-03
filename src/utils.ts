// src/utils.ts

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function obtainWindow(windowName: string): Promise<Window> {
  const GMAX_RETRIES = 10;
  for (let i = 0; i < GMAX_RETRIES; i++) {
    try {
      const w = await new Promise<Window>((resolve, reject) =>
        overwolf.windows.obtainDeclaredWindow(windowName, (res) => {
          if (res.success && res.window) {
            // THE FINAL FIX: Convert to 'unknown' first, then to 'Window'.
            // This tells TypeScript we are 100% sure and taking responsibility.
            resolve(res.window as unknown as Window);
          } else {
            reject(res);
          }
        })
      );
      return w;
    } catch (e) {
      await sleep(1000);
    }
  }
  throw new Error(`Can't obtain window ${windowName}`);
}