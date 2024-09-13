import { registry } from './customer';

// client 1
export function getCustomerNameOrDefault(site) {
  const aCustomer = site.customer;
  // ... lots of intervening code ...
  let customerName;
  if (aCustomer === 'unknown') customerName = 'occupant';
  else customerName = aCustomer.name;

  return customerName;
}

// client 2
export function getCustomerPlanOrDefault(aCustomer) {
  const plan = aCustomer === 'unknown' ? registry.billingPlans.basic : aCustomer.billingPlan;
  return plan;
}

// client 3
export function getWeeksDelinquentInLastYear(aCustomer) {
  const weeksDelinquent =
    aCustomer === 'unknown' ? 0 : aCustomer.paymentHistory.weeksDelinquentInLastYear;

  return weeksDelinquent;
}
