// Simple deterministic RNG (Xorshift)
export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next() {
    this.state ^= this.state << 13;
    this.state ^= this.state >>> 17;
    this.state ^= this.state << 5;
    return (this.state >>> 0) / 0x100000000;
  }

  int(max: number): number {
    return Math.floor(this.next() * max);
  }

  choice<T>(arr: T[]): T {
    return arr[this.int(arr.length)];
  }
}
