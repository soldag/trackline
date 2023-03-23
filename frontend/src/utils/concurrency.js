export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class Lock {
  constructor() {
    this._callbacks = [];
    this._locked = false;
  }

  get locked() {
    return this._locked;
  }

  async acquire() {
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

  async wait() {
    if (!this._locked) return;

    return await new Promise((resolve) => {
      this._callbacks.push(resolve);
    });
  }
}
