export class Site {
  constructor({ customer }) {
    this._customer = customer;
  }

  get customer() {
    return this._customer;
  }
}
