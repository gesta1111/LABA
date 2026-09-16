/** Нормальное распределение (Бокс — Мюллер). */
export function gaussian(mean = 0, std = 1): number {
  const u1 = Math.max(Number.EPSILON, Math.random());
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + std * z;
}
