/**
 * Concurrency-limited batch processing utilities.
 *
 * Prevents network flooding when fetching data for 1000+ stocks
 * by limiting how many requests run in parallel.
 */

/**
 * Process items with bounded concurrency (like p-map).
 * At most `concurrency` mapper calls run simultaneously.
 */
export async function pMap<T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const i = nextIndex++
      results[i] = await mapper(items[i], i)
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  )
  await Promise.all(workers)
  return results
}

/**
 * Like pMap but uses Promise.allSettled semantics —
 * never rejects, returns { status, value/reason } for each item.
 */
export async function pMapSettled<T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
  concurrency: number,
): Promise<PromiseSettledResult<R>[]> {
  return pMap(
    items,
    async (item, i) => {
      try {
        const value = await mapper(item, i)
        return { status: 'fulfilled' as const, value }
      } catch (reason) {
        return { status: 'rejected' as const, reason }
      }
    },
    concurrency,
  )
}
