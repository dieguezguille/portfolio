export default class Governor {
  static readonly tiers = [
    { name: "high", dpr: 1.5, divisor: 2, packets: 1 },
    { name: "medium", dpr: 1, divisor: 2, packets: 1 },
    { name: "low", dpr: 1, divisor: 3, packets: 0.5 },
  ] as const;

  private calm = 0;
  private count = 0;
  private readonly failures = new Uint8Array(Governor.tiers.length);
  private readonly samples = new Float32Array(60);
  tier = 0;

  get current() {
    return Governor.tiers[this.tier] ?? Governor.tiers[0];
  }

  sample(delta: number) {
    if (delta <= 0 || delta > 250) return false;
    this.samples[this.count++] = delta;
    if (this.count < this.samples.length) return false;
    this.count = 0;
    let total = 0;
    for (const value of this.samples) total += value;
    const average = total / this.samples.length;
    if (average > 22 && this.tier < Governor.tiers.length - 1) {
      this.failures[this.tier] = (this.failures[this.tier] ?? 0) + 1;
      this.tier += 1;
      this.calm = 0;
      return true;
    }
    this.calm = average < 18 ? this.calm + 1 : 0;
    if (this.tier > 0 && this.calm >= 5 && (this.failures[this.tier - 1] ?? 0) < 2) {
      this.tier -= 1;
      this.calm = 0;
      return true;
    }
    return false;
  }
}
