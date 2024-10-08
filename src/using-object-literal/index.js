import { registry, isUnknown } from './customer';

// client 1
export function getCustomerNameOrDefault(site) {
  const aCustomer = site.customer;
  // ... lots of intervening code ...
  const customerName = aCustomer.name;
  return customerName;
}

// client 2
export function getCustomerPlanOrDefault(aCustomer) {
  const plan = aCustomer.billingPlan;
  return plan;
}

// client 3
export function getWeeksDelinquentInLastYear(aCustomer) {
  const weeksDelinquent = aCustomer.paymentHistory.weeksDelinquentInLastYear;
  return weeksDelinquent;
}
