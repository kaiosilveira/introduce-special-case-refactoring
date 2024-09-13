import { createUnknownCustomer } from '../customer';

export class Site {
  constructor({ customer }) {
    this._customer = customer;
  }

  get customer() {
    return this._customer === 'unknown' ? createUnknownCustomer() : this._customer;
  }
}
