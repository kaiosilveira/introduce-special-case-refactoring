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

  get isUnknown() {
    return false;
  }
}

export function createUnknownCustomer() {
  return {
    isUnknown: true,
    name: 'occupant',
    billingPlan: registry.billingPlans.basic,
    paymentHistory: {
      weeksDelinquentInLastYear: 0,
    },
  };
}

export function isUnknown(arg) {
  return typeof arg === 'string' ? arg === 'unknown' : arg.isUnknown;
}
