import { Site } from '.';

describe('Site', () => {
  it('should have a customer', () => {
    const aSite = new Site({ customer: { name: 'John Doe' } });
    expect(aSite.customer).toEqual({ name: 'John Doe' });
  });

  it('should return an unknown customer if the customer is unknown', () => {
    const aSite = new Site({ customer: 'unknown' });
    expect(aSite.customer.isUnknown).toBe(true);
  });
});
