import {
  registry,
  getCustomerNameOrDefault,
  getCustomerPlanOrDefault,
  getWeeksDelinquentInLastYear,
  enrichSite,
  isUnknown,
} from '.';

describe('client code', () => {
  describe('getCustomerNameOrDefault', () => {
    it('should return "occupant" if customer is unknown', () => {
      const aSite = { customer: 'unknown' };
      const name = getCustomerNameOrDefault(aSite);
      expect(name).toBe('occupant');
    });

    it('should return the customer name if customer is known', () => {
      const aSite = { customer: { name: 'John Doe' } };
      const name = getCustomerNameOrDefault(aSite);
      expect(name).toBe('John Doe');
    });
  });

  describe('getCustomerPlanOrDefault', () => {
    it('should return the basic plan if customer is unknown', () => {
      const aSite = { customer: 'unknown' };
      const plan = getCustomerPlanOrDefault(aSite);
      expect(plan).toBe(registry.billingPlans.basic);
    });

    it('should return the customer billing plan if customer is known', () => {
      const aSite = { customer: { billingPlan: registry.billingPlans.premium } };
      const plan = getCustomerPlanOrDefault(aSite);
      expect(plan).toBe(registry.billingPlans.premium);
    });
  });

  describe('getWeeksDelinquentInLastYear', () => {
    it('should return 0 if customer is unknown', () => {
      const aSite = { customer: 'unknown' };
      const weeksDelinquent = getWeeksDelinquentInLastYear(aSite);
      expect(weeksDelinquent).toBe(0);
    });

    it('should return the weeks delinquent if customer is known', () => {
      const aSite = { customer: { paymentHistory: { weeksDelinquentInLastYear: 10 } } };
      const weeksDelinquent = getWeeksDelinquentInLastYear(aSite);
      expect(weeksDelinquent).toBe(10);
    });
  });
});

describe('enrichSite', () => {
  it('should return a customer with the isUnknown flag set to true if customer is unknown', () => {
    const aSite = { customer: 'unknown' };
    const enrichedSite = enrichSite(aSite);
    expect(enrichedSite.customer.isUnknown).toBe(true);
  });

  it('should return a customer with the isUnknown flag set to false if customer is known', () => {
    const aSite = { customer: { name: 'John Doe' } };
    const enrichedSite = enrichSite(aSite);
    expect(enrichedSite.customer.isUnknown).toBe(false);
  });

  it('should set the unknown customer name to "occupant"', () => {
    const aSite = { customer: 'unknown' };
    const enrichedSite = enrichSite(aSite);
    expect(enrichedSite.customer.name).toBe('occupant');
  });
});

describe('isUnknown', () => {
  it('should return true if customer is unknown', () => {
    expect(isUnknown('unknown')).toBe(true);
  });

  it('should return false if customer is known', () => {
    expect(isUnknown({ name: 'John Doe', isUnknown: false })).toBe(false);
  });
});
