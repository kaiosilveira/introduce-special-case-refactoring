import _ from 'lodash';

export const registry = {
  billingPlans: {
    basic: 'basic',
    premium: 'premium',
  },
};

// client 1
export function getCustomerNameOrDefault(inputSite) {
  const aSite = enrichSite(inputSite);
  const aCustomer = aSite.customer;
  // ... lots of intervening code ...
  const customerName = aCustomer.name;
  return customerName;
}

// client 2
export function getCustomerPlanOrDefault(inputSite) {
  const aSite = enrichSite(inputSite);
  const aCustomer = aSite.customer;
  const plan = isUnknown(aCustomer) ? registry.billingPlans.basic : aCustomer.billingPlan;
  return plan;
}

// client 3
export function getWeeksDelinquentInLastYear(inputSite) {
  const aSite = enrichSite(inputSite);
  const aCustomer = aSite.customer;
  const weeksDelinquent = isUnknown(aCustomer)
    ? 0
    : aCustomer.paymentHistory.weeksDelinquentInLastYear;

  return weeksDelinquent;
}

export function enrichSite(inputSite) {
  const result = _.cloneDeep(inputSite);
  const unknownCustomer = {
    isUnknown: true,
    name: 'occupant',
    billingPlan: registry.billingPlans.basic,
  };

  if (isUnknown(result.customer)) result.customer = unknownCustomer;
  else result.customer.isUnknown = false;
  return result;
}

export function isUnknown(aCustomer) {
  if (aCustomer === 'unknown') return true;
  else return aCustomer.isUnknown;
}
