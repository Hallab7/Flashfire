export const STEP_MS = 1000 / 60;

export class FixedStepRunner {
  private accumulatorMs = 0;

  constructor(
    private readonly stepMs = STEP_MS,
    private readonly maxFrameMs = 100,
  ) {}

  advance(deltaMs: number, simulate: (stepMs: number) => void): number {
    this.accumulatorMs += Math.min(Math.max(deltaMs, 0), this.maxFrameMs);
    let steps = 0;
    while (this.accumulatorMs >= this.stepMs) {
      simulate(this.stepMs);
      this.accumulatorMs -= this.stepMs;
      steps += 1;
    }
    return steps;
  }

  reset(): void {
    this.accumulatorMs = 0;
  }
}
