export const registry = {
  billingPlans: {
    basic: 'basic',
    premium: 'premium',
  },
};

export class Customer {
  constructor(data) {
    this._billingPlan = data.billingPlan;
    this._paymentHistory = data.paymentHistory;
    this._name = data.name;
  }

  get name() {
    return this._name;
  }

  get billingPlan() {
    return this._billingPlan;
  }

  set billingPlan(arg) {
    this._billingPlan = arg;
  }

  get paymentHistory() {
    return this._paymentHistory;
  }
}
