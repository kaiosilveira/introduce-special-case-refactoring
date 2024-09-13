import { registry, Customer, UnknownCustomer } from '.';
import { NullPaymentHistory } from './payment-history';

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

  it('should not be unknown', () => {
    const customer = new Customer(data);
    expect(customer.isUnknown).toBe(false);
  });
});

describe('UnknownCustomer', () => {
  it('should be unknown', () => {
    const customer = new UnknownCustomer();
    expect(customer.isUnknown).toBe(true);
  });

  it('should return "occupant" as name', () => {
    const customer = new UnknownCustomer();
    expect(customer.name).toBe('occupant');
  });

  it('should return "basic" as billing plan', () => {
    const customer = new UnknownCustomer();
    expect(customer.billingPlan).toBe(registry.billingPlans.basic);
  });

  it('should ignore set operations to billingPlan', () => {
    const customer = new UnknownCustomer();

    customer.billingPlan = registry.billingPlans.premium;
    expect(customer.billingPlan).toBe(registry.billingPlans.basic);
  });

  it('should return a null payment history', () => {
    const customer = new UnknownCustomer();
    expect(customer.paymentHistory).toBeInstanceOf(NullPaymentHistory);
  });
});
