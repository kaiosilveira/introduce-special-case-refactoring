import { NullPaymentHistory } from '.';

describe('NullPaymentHistory', () => {
  it('should has zero weeks as delinquent in the last year', () => {
    const paymentHistory = new NullPaymentHistory();
    expect(paymentHistory.weeksDelinquentInLastYear).toBe(0);
  });
});
