import { createUnknownCustomer, Customer, isUnknown, registry } from '.';

describe('Customer', () => {
  const data = {
    name: 'John Doe',
    billingPlan: 'basic',
    paymentHistory: [{ year: 2024, month: 9, amount: 100 }],
  };

  it('should be built based on a data object', () => {
    const customer = new Customer(data);

    expect(customer.name).toEqual('John Doe');
    expect(customer.billingPlan).toEqual('basic');
    expect(customer.paymentHistory).toEqual([{ year: 2024, month: 9, amount: 100 }]);
  });

  it('should allow changing the billing plan', () => {
    const customer = new Customer(data);

    customer.billingPlan = 'premium';

    expect(customer.billingPlan).toEqual('premium');
  });

  describe('isUnknown', () => {
    it('should return false', () => {
      const customer = new Customer(data);
      expect(customer.isUnknown).toBe(false);
    });
  });
});

describe('createUnknownCustomer', () => {
  it('should return an object with isUnknown set to true', () => {
    const unknownCustomer = createUnknownCustomer();
    expect(unknownCustomer.isUnknown).toBe(true);
  });

  it('should return "occupant" as name for an unknown customer', () => {
    const unknownCustomer = createUnknownCustomer();
    expect(unknownCustomer.name).toBe('occupant');
  });

  it('should return "basic" as billing plan for an unknown customer', () => {
    const unknownCustomer = createUnknownCustomer();
    expect(unknownCustomer.billingPlan).toBe(registry.billingPlans.basic);
  });

  it('should return a total of zero weeks delinquent last year', () => {
    const unknownCustomer = createUnknownCustomer();
    expect(unknownCustomer.paymentHistory.weeksDelinquentInLastYear).toBe(0);
  });
});

describe('isUnknown', () => {
  describe('arg is string', () => {
    it('should return true if the argument is "unknown"', () => {
      expect(isUnknown('unknown')).toBe(true);
    });

    it('should return false if the argument is not "unknown"', () => {
      expect(isUnknown('John Doe')).toBe(false);
    });
  });

  describe('arg is object', () => {
    it('should return true if the argument is "unknown"', () => {
      expect(isUnknown({ isUnknown: true })).toBe(true);
    });

    it('should return false if the argument is not "unknown"', () => {
      expect(isUnknown({ isUnknown: false })).toBe(false);
    });
  });
});
