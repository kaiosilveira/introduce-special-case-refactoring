import {
  getCustomerNameOrDefault,
  getCustomerPlanOrDefault,
  updateCustomerBillingPlan,
  getWeeksDelinquentInLastYear,
  slightlyDifferentGetCustomerNameOrDefault,
} from '.';
import { registry, Customer, UnknownCustomer } from './customer';
import { Site } from './site';

describe('client code', () => {
  describe('getCustomerNameOrDefault', () => {
    it('should return "occupant" if customer is unknown', () => {
      const aSite = new Site({ customer: 'unknown' });
      const name = getCustomerNameOrDefault(aSite);
      expect(name).toBe('occupant');
    });

    it('should return the customer name if customer is known', () => {
      const aSite = new Site({ customer: new Customer({ name: 'John Doe' }) });
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
      const customer = new Customer({ billingPlan: registry.billingPlans.premium });
      const aSite = new Site({ customer });
      const plan = getCustomerPlanOrDefault(aSite.customer);
      expect(plan).toBe(registry.billingPlans.premium);
    });
  });

  describe('updateCustomerBillingPlan', () => {
    it('should update the customer billing plan if customer is known', () => {
      const aCustomer = new Customer({ billingPlan: registry.billingPlans.basic });
      const newPlan = registry.billingPlans.premium;

      const updatedCustomer = updateCustomerBillingPlan(aCustomer, newPlan);

      expect(updatedCustomer.billingPlan).toBe(newPlan);
    });

    it('should not update the customer billing plan if customer is unknown', () => {
      const aCustomer = new UnknownCustomer();
      const newPlan = registry.billingPlans.premium;

      const updatedCustomer = updateCustomerBillingPlan(aCustomer, newPlan);

      expect(updatedCustomer.billingPlan).toBe(aCustomer.billingPlan);
    });
  });

  describe('getWeeksDelinquentInLastYear', () => {
    it('should return 0 if customer is unknown', () => {
      const aSite = new Site({ customer: 'unknown' });
      const weeksDelinquent = getWeeksDelinquentInLastYear(aSite.customer);
      expect(weeksDelinquent).toBe(0);
    });

    it('should return the weeks delinquent if customer is known', () => {
      const customer = new Customer({ paymentHistory: { weeksDelinquentInLastYear: 10 } });
      const aSite = new Site({ customer });
      const weeksDelinquent = getWeeksDelinquentInLastYear(aSite.customer);
      expect(weeksDelinquent).toBe(10);
    });
  });

  describe('slightlyDifferentGetCustomerNameOrDefault', () => {
    it('should return "unknown occupant" if customer is unknown', () => {
      const aSite = new Site({ customer: 'unknown' });
      const name = slightlyDifferentGetCustomerNameOrDefault(aSite);
      expect(name).toBe('unknown occupant');
    });

    it('should return the customer name if customer is known', () => {
      const aSite = new Site({ customer: new Customer({ name: 'John Doe' }) });
      const name = slightlyDifferentGetCustomerNameOrDefault(aSite);
      expect(name).toBe('John Doe');
    });
  });
});
