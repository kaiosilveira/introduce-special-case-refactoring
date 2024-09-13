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

export class UnknownCustomer {
  get isUnknown() {
    return true;
  }

  get name() {
    return 'occupant';
  }

  get billingPlan() {
    return registry.billingPlans.basic;
  }

  set billingPlan(_arg) {}
}

export function isUnknown(arg) {
  if (!(arg instanceof Customer || arg instanceof UnknownCustomer || arg === 'unknown'))
    throw new Error(`investigate bad value: <${arg}>`);

  return arg.isUnknown || arg === 'unknown';
}
