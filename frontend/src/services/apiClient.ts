/**
 * Simulates network latency for mock service calls so components can be
 * written against async data-fetching patterns (loading states, etc.)
 * exactly as they would against a real FastAPI backend later.
 */
export function withLatency<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}
