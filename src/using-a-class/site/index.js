import { UnknownCustomer } from '../customer';

export class Site {
  constructor({ customer }) {
    this._customer = customer;
  }

  get customer() {
    return this._customer === 'unknown' ? new UnknownCustomer() : this._customer;
  }
}
