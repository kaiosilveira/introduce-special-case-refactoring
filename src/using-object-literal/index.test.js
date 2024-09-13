import {
  getCustomerNameOrDefault,
  getCustomerPlanOrDefault,
  getWeeksDelinquentInLastYear,
} from '.';
import { Site } from './site';
import { registry } from './customer';

describe('client code', () => {
  describe('getCustomerNameOrDefault', () => {
    it('should return "occupant" if customer is unknown', () => {
      const aSite = new Site({ customer: 'unknown' });
      const name = getCustomerNameOrDefault(aSite);
      expect(name).toBe('occupant');
    });

    it('should return the customer name if customer is known', () => {
      const aSite = new Site({ customer: { name: 'John Doe' } });
      const name = getCustomerNameOrDefault(aSite);
      expect(name).toBe('John Doe');
    });
  });

  describe('getCustomerPlanOrDefault', () => {
    it('should return the basic plan if customer is unknown', () => {
      const aSite = new Site({ customer: 'unknown' });
      const plan = getCustomerPlanOrDefault(aSite.customer);
      expect(plan).toBe(registry.billingPlans.basic);
    });

    it('should return the customer billing plan if customer is known', () => {
      const aSite = new Site({ customer: { billingPlan: registry.billingPlans.premium } });
      const plan = getCustomerPlanOrDefault(aSite.customer);
      expect(plan).toBe(registry.billingPlans.premium);
    });
  });

  describe('getWeeksDelinquentInLastYear', () => {
    it('should return 0 if customer is unknown', () => {
      const aSite = new Site({ customer: 'unknown' });
      const weeksDelinquent = getWeeksDelinquentInLastYear(aSite.customer);
      expect(weeksDelinquent).toBe(0);
    });

    it('should return the weeks delinquent if customer is known', () => {
      const aSite = new Site({ customer: { paymentHistory: { weeksDelinquentInLastYear: 10 } } });
      const weeksDelinquent = getWeeksDelinquentInLastYear(aSite.customer);
      expect(weeksDelinquent).toBe(10);
    });
  });
});
