import { registry, Customer } from '.';

describe('Customer', () => {
  const data = {
    name: 'John Doe',
    billingPlan: registry.billingPlans.basic,
    paymentHistory: [{ year: 2024, month: 9, amount: 100 }],
  };

  it('should be built based on a data object', () => {
    const customer = new Customer(data);

    expect(customer.name).toEqual('John Doe');
    expect(customer.billingPlan).toEqual(registry.billingPlans.basic);
    expect(customer.paymentHistory).toEqual([{ year: 2024, month: 9, amount: 100 }]);
  });

  it('should allow changing the billing plan', () => {
    const customer = new Customer(data);

    const newBillingPlan = registry.billingPlans.premium;
    customer.billingPlan = newBillingPlan;

    expect(customer.billingPlan).toEqual(newBillingPlan);
  });
});
