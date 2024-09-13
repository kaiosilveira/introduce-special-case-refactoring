import { registry, isUnknown } from './customer';

// client 1
export function getCustomerNameOrDefault(site) {
  const aCustomer = site.customer;
  // ... lots of intervening code ...
  return aCustomer.name;
}

// client 2
export function getCustomerPlanOrDefault(aCustomer) {
  const plan = aCustomer.billingPlan;
  return plan;
}

// client 3
export function updateCustomerBillingPlan(aCustomer, newPlan) {
  aCustomer.billingPlan = newPlan;
  return aCustomer;
}

// client 4
export function getWeeksDelinquentInLastYear(aCustomer) {
  const weeksDelinquent = isUnknown(aCustomer)
    ? 0
    : aCustomer.paymentHistory.weeksDelinquentInLastYear;

  return weeksDelinquent;
}

// client 5
export function slightlyDifferentGetCustomerNameOrDefault(site) {
  const aCustomer = site.customer;
  // ... lots of intervening code ...
  const customerName = isUnknown(aCustomer) ? 'unknown occupant' : aCustomer.name;
  return customerName;
}
