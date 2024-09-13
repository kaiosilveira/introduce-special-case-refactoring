import { Site } from '.';
import { UnknownCustomer } from '../customer';

describe('Site', () => {
  it('should have a customer', () => {
    const aSite = new Site({ customer: { name: 'John Doe' } });
    expect(aSite.customer).toEqual({ name: 'John Doe' });
  });

  it('should return an unknown customer if no customer is provided', () => {
    const aSite = new Site({ customer: 'unknown' });
    expect(aSite.customer).toBeInstanceOf(UnknownCustomer);
  });
});
