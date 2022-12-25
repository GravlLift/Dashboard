export function kelvinToFahrenheit(kelvin: number, round?: true) {
  const f = kelvin * (9 / 5) - 459.67;
  return round ? Math.round(f) : f;
}

export function millimetersToInches(mm: number): number {
  return mm / 25.4;
}

export function metersPerSecondToMilesPerHour(mps: number): number {
  return mps * 2.237;
}
