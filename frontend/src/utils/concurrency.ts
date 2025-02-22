export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class Lock {
  _locked = false;
  _callbacks: (() => void)[] = [];

  get locked(): boolean {
    return this._locked;
  }

  async acquire(): Promise<void> {
    if (this._locked) {
      await this.wait();
    }
    this._locked = true;
  }

  release() {
    this._locked = false;
    this._callbacks.forEach((cb) => cb());
    this._callbacks = [];
  }

  async wait(): Promise<boolean> {
    if (!this._locked) return false;

    return await new Promise((resolve) => {
      this._callbacks.push(() => resolve(true));
    });
  }
}
