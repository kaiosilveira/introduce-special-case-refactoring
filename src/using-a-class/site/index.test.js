import { Site } from '.';

describe('Site', () => {
  it('should have a customer', () => {
    const aSite = new Site({ customer: { name: 'John Doe' } });
    expect(aSite.customer).toEqual({ name: 'John Doe' });
  });
});
