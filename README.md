[![Continuous Integration](https://github.com/kaiosilveira/introduce-special-case-refactoring/actions/workflows/ci.yml/badge.svg)](https://github.com/kaiosilveira/introduce-special-case-refactoring/actions/workflows/ci.yml)

ℹ️ _This repository is part of my Refactoring catalog based on Fowler's book with the same title. Please see [kaiosilveira/refactoring](https://github.com/kaiosilveira/refactoring) for more details._

---

# Introduce Special Case

**Formerly: Introduce Null Object**

<table>
<thead>
<th>Before</th>
<th>After</th>
</thead>
<tbody>
<tr>
<td>

```javascript
if (aCustomer === 'unknown') customerName = 'occupant';
```

</td>

<td>

```javascript
class UnknownCustomer {
  get name() {
    return 'occupant';
  }
}
```

</td>
</tr>
</tbody>
</table>

Sometimes we put too much focus on implementing our classes, encapsulating their behaviors, and making them specialists on what they should do, that we forget to think about when they just... don't exist. This "non-existence" often leads to client code performing repetitive null checks and choosing alternate behaviors and values whenever appropriate. It's better, though, to have these special cases considered as part of our main implementation as well, so our domain is even more solid and clients are way happier. This refactoring helps doing that.

## Working examples

We have three working examples, all of them revolving around the same base domain: a company that provides services at specific sites. A site can have a customer, but that's not always the case. For cases when there isn't a customer, some default values are used for name, billing plan, and other aspects. The base code for the three programs is something similar to what's shown below:

- site:

```javascript
export class Site {
  constructor({ customer }) {
    this._customer = customer;
  }

  get customer() {
    return this._customer;
  }
}
```

- customer:

```javascript
export const registry = {
  billingPlans: {
    basic: 'basic',
    premium: 'premium',
  },
};

export class Customer {
  constructor(data) {
    this._billingPlan = data.billingPlan;
    this._paymentHistory = data.paymentHistory;
    this._name = data.name;
  }

  get name() {
    return this._name;
  }

  get billingPlan() {
    return this._billingPlan;
  }

  set billingPlan(arg) {
    this._billingPlan = arg;
  }

  get paymentHistory() {
    return this._paymentHistory;
  }
}
```

- client code:

```javascript
// client 1
export function getCustomerNameOrDefault(site) {
  const aCustomer = site.customer;
  // ... lots of intervening code ...
  let customerName;
  if (aCustomer === 'unknown') customerName = 'occupant';
  else customerName = aCustomer.name;

  return customerName;
}

// client 2
export function getCustomerPlanOrDefault(aCustomer) {
  const plan = aCustomer === 'unknown' ? registry.billingPlans.basic : aCustomer.billingPlan;
  return plan;
}

// client 3
export function updateCustomerBillingPlan(aCustomer, newPlan) {
  if (aCustomer !== 'unknown') aCustomer.billingPlan = newPlan;
  return aCustomer;
}

// client 4
export function getWeeksDelinquentInLastYear(aCustomer) {
  const weeksDelinquent =
    aCustomer === 'unknown' ? 0 : aCustomer.paymentHistory.weeksDelinquentInLastYear;

  return weeksDelinquent;
}

// client 5
export function slightlyDifferentGetCustomerNameOrDefault(site) {
  const aCustomer = site.customer;
  // ... lots of intervening code ...
  let customerName;
  if (aCustomer === 'unknown') customerName = 'unknown occupant';
  else customerName = aCustomer.name;

  return customerName;
}
```

### Test suite

Since the code is similar to all three examples, the test suite is also almost the same, and looks like this:

- site tests:

```javascript
describe('Site', () => {
  it('should have a customer', () => {
    const aSite = new Site({ customer: { name: 'John Doe' } });
    expect(aSite.customer).toEqual({ name: 'John Doe' });
  });
});
```

- customer tests:

```javascript
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
```

- client code tests:

```javascript
import {
  getCustomerNameOrDefault,
  getCustomerPlanOrDefault,
  updateCustomerBillingPlan,
  getWeeksDelinquentInLastYear,
  slightlyDifferentGetCustomerNameOrDefault,
} from '.';
import { registry, Customer } from './customer';
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
      const aCustomer = 'unknown';
      const newPlan = registry.billingPlans.premium;

      const updatedCustomer = updateCustomerBillingPlan(aCustomer, newPlan);

      expect(updatedCustomer).toBe('unknown');
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
```

Variations will be highlighted and discussed accordingly as / if needed in the examples themselves.

---

### Example #1: Using a class

The first approach to this problem is to introduce a class to encapsulate the default values for an `UnknownCustomer`.

#### Steps

We start by introducing an `isUnknown` getter at `Customer`. This will be used later as we migrate from an "unknown" string to a structured boolean flag:

```diff
@@ -27,4 +27,8 @@ export class Customer {
   get paymentHistory() {
     return this._paymentHistory;
   }
+
+  get isUnknown() {
+    return false;
+  }
 }

diff --git a/src/using-a-class/customer/index.test.js b/src/using-a-class/customer/index.test.js
@@ -23,4 +23,9 @@ describe('Customer', () => {
     expect(customer.billingPlan).toEqual(newBillingPlan);
   });
+
+  it('should not be unknown', () => {
+    const customer = new Customer(data);
+    expect(customer.isUnknown).toBe(false);
+  });
 });
```

We then introduce the `UnknownCustomer` to represent the special case, its `isUnkown` getter, of course, returns `true`:

```diff
@@ -32,3 +32,9 @@ export class Customer {
     return false;
   }
 }
+
+export class UnknownCustomer {
+  get isUnknown() {
+    return true;
+  }
+}

diff --git a/src/using-a-class/customer/index.test.js b/src/using-a-class/customer/index.test.js
@@ -1,4 +1,4 @@
-import { registry, Customer } from '.';
+import { registry, Customer, UnknownCustomer } from '.';
 describe('Customer', () => {
   const data = {
@@ -29,3 +29,10 @@ describe('Customer', () => {
     expect(customer.isUnknown).toBe(false);
   });
 });
+
+describe('UnknownCustomer', () => {
+  it('should be unknown', () => {
+    const customer = new UnknownCustomer();
+    expect(customer.isUnknown).toBe(true);
+  });
+});
```

We then proceed to extract the `isUnknown` check into a function. This will come in handy when updating the calling code:

```diff
@@ -38,3 +38,10 @@ export class UnknownCustomer {
     return true;
   }
 }
+
+export function isUnknown(arg) {
+  if (!(arg instanceof Customer || arg === 'unknown'))
+    throw new Error(`investigate bad value: <${arg}>`);
+
+  return arg === 'unknown';
+}

diff --git a/src/using-a-class/customer/index.test.js b/src/using-a-class/customer/index.test.js
@@ -1,4 +1,4 @@
-import { registry, Customer, UnknownCustomer } from '.';
+import { registry, Customer, UnknownCustomer, isUnknown } from '.';
 describe('Customer', () => {
   const data = {
@@ -36,3 +36,20 @@ describe('UnknownCustomer', () => {
     expect(customer.isUnknown).toBe(true);
   });
 });
+
+describe('isUnknown', () => {
+  it('should return true if customer is unknown', () => {
+    const customer = 'unknown';
+    expect(isUnknown(customer)).toBe(true);
+  });
+
+  it('should return false if customer is known', () => {
+    const customer = new Customer({ name: 'John Doe' });
+    expect(isUnknown(customer)).toBe(false);
+  });
+
+  it('should throw an error if customer is not a Customer instance or "unknown"', () => {
+    const badCustomer = { name: 'John Doe' };
+    expect(() => isUnknown(badCustomer)).toThrow('investigate bad value: <[object Object]>');
+  });
+});
```

We can then start updating the calling code. We start with `getCustomerNameOrDefault`:

```diff
@@ -1,11 +1,11 @@
-import { registry } from './customer';
+import { registry, isUnknown } from './customer';
 // client 1
 export function getCustomerNameOrDefault(site) {
   const aCustomer = site.customer;
   // ... lots of intervening code ...
   let customerName;
-  if (aCustomer === 'unknown') customerName = 'occupant';
+  if (isUnknown(aCustomer)) customerName = 'occupant';
   else customerName = aCustomer.name;
   return customerName;
```

...then `getCustomerPlanOrDefault`:

```diff
@@ -13,7 +13,7 @@ export function getCustomerNameOrDefault(site) {
 // client 2
 export function getCustomerPlanOrDefault(aCustomer) {
-  const plan = aCustomer === 'unknown' ? registry.billingPlans.basic : aCustomer.billingPlan;
+  const plan = isUnknown(aCustomer) ? registry.billingPlans.basic : aCustomer.billingPlan;
   return plan;
 }
```

...then `updateCustomerBillingPlan`:

```diff
@@ -19,7 +19,7 @@ export function getCustomerPlanOrDefault(aCustomer) {
 // client 3
 export function updateCustomerBillingPlan(aCustomer, newPlan) {
-  if (aCustomer !== 'unknown') aCustomer.billingPlan = newPlan;
+  if (!isUnknown(aCustomer)) aCustomer.billingPlan = newPlan;
   return aCustomer;
 }
```

...then `getWeeksDelinquentInLastYear`:

```diff
@@ -25,8 +25,9 @@ export function updateCustomerBillingPlan(aCustomer, newPlan) {
 // client 4
 export function getWeeksDelinquentInLastYear(aCustomer) {
-  const weeksDelinquent =
-    aCustomer === 'unknown' ? 0 : aCustomer.paymentHistory.weeksDelinquentInLastYear;
+  const weeksDelinquent = isUnknown(aCustomer)
+    ? 0
+    : aCustomer.paymentHistory.weeksDelinquentInLastYear;
   return weeksDelinquent;
 }
```

- and, finally, `slightlyDifferentGetCustomerNameOrDefault`:

```diff
@@ -36,9 +36,6 @@ export function getWeeksDelinquentInLastYear(aCustomer) {
 export function slightlyDifferentGetCustomerNameOrDefault(site) {
   const aCustomer = site.customer;
   // ... lots of intervening code ...
-  let customerName;
-  if (aCustomer === 'unknown') customerName = 'unknown occupant';
-  else customerName = aCustomer.name;
-
+  const customerName = isUnknown(aCustomer) ? 'unknown occupant' : aCustomer.name;
   return customerName;
 }
```

We now want to start using the `isUnknown` flag instead of a bare "unknown" string. To do so, we first need to add support to `UnknownCustomer` at `isUnknown`:

```diff
@@ -40,8 +40,8 @@ export class UnknownCustomer {
 }
 export function isUnknown(arg) {
-  if (!(arg instanceof Customer || arg === 'unknown'))
+  if (!(arg instanceof Customer || arg instanceof UnknownCustomer || arg === 'unknown'))
     throw new Error(`investigate bad value: <${arg}>`);
-  return arg === 'unknown';
+  return arg.isUnknown || arg === 'unknown';
 }

diff --git a/src/using-a-class/customer/index.test.js b/src/using-a-class/customer/index.test.js
@@ -48,7 +48,10 @@ describe('isUnknown', () => {
     expect(isUnknown(customer)).toBe(false);
   });
-  it('should throw an error if customer is not a Customer instance or "unknown"', () => {
+  it('should throw an error if customer is not a Customer instance, UnknownCustomer instance, or "unknown"', () => {
+    expect(() => isUnknown(new Customer({ name: 'John Doe' }))).not.toThrow();
+    expect(() => isUnknown(new UnknownCustomer())).not.toThrow();
+
     const badCustomer = { name: 'John Doe' };
     expect(() => isUnknown(badCustomer)).toThrow('investigate bad value: <[object Object]>');
   });
```

With this change in place, we can now return an `UnknownCustomer` as special case at `Site`:

```diff
@@ -1,9 +1,11 @@
+import { UnknownCustomer } from '../customer';
+
 export class Site {
   constructor({ customer }) {
     this._customer = customer;
   }
   get customer() {
-    return this._customer;
+    return this._customer === 'unknown' ? new UnknownCustomer() : this._customer;
   }
 }

diff --git a/src/using-a-class/site/index.test.js b/src/using-a-class/site/index.test.js
@@ -1,8 +1,14 @@
 import { Site } from '.';
+import { UnknownCustomer } from '../customer';
 describe('Site', () => {
   it('should have a customer', () => {
     const aSite = new Site({ customer: { name: 'John Doe' } });
     expect(aSite.customer).toEqual({ name: 'John Doe' });
   });
+
+  it('should return an unknown customer if no customer is provided', () => {
+    const aSite = new Site({ customer: 'unknown' });
+    expect(aSite.customer).toBeInstanceOf(UnknownCustomer);
+  });
 });
```

And, as Fowler says in the book, "now the fun begins". We want all default properties inside `UnknownCustomer`. We start by returning 'occupant' as its name:

```diff
@@ -37,6 +37,10 @@
export class UnknownCustomer {
   get isUnknown() {
     return true;
   }
+
+  get name() {
+    return 'occupant';
+  }
 }
 export function isUnknown(arg) {

diff --git a/src/using-a-class/customer/index.test.js b/src/using-a-class/customer/index.test.js
@@ -35,6 +35,11 @@ describe('UnknownCustomer', () => {
     const customer = new UnknownCustomer();
     expect(customer.isUnknown).toBe(true);
   });
+
+  it('should return "occupant" as name', () => {
+    const customer = new UnknownCustomer();
+    expect(customer.name).toBe('occupant');
+  });
 });
 describe('isUnknown', () => {
```

With that change in place, we don't need to check for unknown customers anymore at `getCustomerNameOrDefault`:

```diff
@@ -4,10 +4,7 @@ import { registry, isUnknown } from './customer';
 export function getCustomerNameOrDefault(site) {
   const aCustomer = site.customer;
   // ... lots of intervening code ...
-  let customerName;
-  if (isUnknown(aCustomer)) customerName = 'occupant';
-  else customerName = aCustomer.name;
-
+  const customerName = aCustomer.name;
   return customerName;
 }
```

and we can even [inline](https://github.com/kaiosilveira/inline-variable-refactoring) the `customerName` variable:

```diff
@@ -4,8 +4,7 @@ import { registry, isUnknown } from './customer';
 export function getCustomerNameOrDefault(site) {
   const aCustomer = site.customer;
   // ... lots of intervening code ...
-  const customerName = aCustomer.name;
-  return customerName;
+  return aCustomer.name;
 }
 // client 2
```

We repeat the process for the billing plan, returning 'basic' for unknown customers:

```diff
@@ -41,6 +41,10 @@ export class UnknownCustomer {
   get name() {
     return 'occupant';
   }
+
+  get billingPlan() {
+    return registry.billingPlans.basic;
+  }
 }
 export function isUnknown(arg) {

diff --git a/src/using-a-class/customer/index.test.js b/src/using-a-class/customer/index.test.js
@@ -40,6 +40,11 @@ describe('UnknownCustomer', () => {
     const customer = new UnknownCustomer();
     expect(customer.name).toBe('occupant');
   });
+
+  it('should return "basic" as billing plan', () => {
+    const customer = new UnknownCustomer();
+    expect(customer.billingPlan).toBe(registry.billingPlans.basic);
+  });
 });
 describe('isUnknown', () => {
```

As for the setter, we simply implement a no-op version:

```diff
@@ -45,6 +45,8 @@
export class UnknownCustomer {
   get billingPlan() {
     return registry.billingPlans.basic;
   }
+
+  set billingPlan(_arg) {}
 }
 export function isUnknown(arg) {

diff --git a/src/using-a-class/customer/index.test.js b/src/using-a-class/customer/index.test.js
@@ -45,6 +45,13 @@ describe('UnknownCustomer', () => {
     const customer = new UnknownCustomer();
     expect(customer.billingPlan).toBe(registry.billingPlans.basic);
   });
+
+  it('should ignore set operations to billingPlan', () => {
+    const customer = new UnknownCustomer();
+
+    customer.billingPlan = registry.billingPlans.premium;
+    expect(customer.billingPlan).toBe(registry.billingPlans.basic);
+  });
 });
 describe('isUnknown', () => {
```

We can then remove the check for unknown customers and the conditional assignment at `updateCustomerBillingPlan`, since they're all cover by the special case class:

```diff
@@ -15,7 +15,7 @@ export function getCustomerPlanOrDefault(aCustomer) {
 // client 3
 export function updateCustomerBillingPlan(aCustomer, newPlan) {
-  if (!isUnknown(aCustomer)) aCustomer.billingPlan = newPlan;
+  aCustomer.billingPlan = newPlan;
   return aCustomer;
 }

diff --git a/src/using-a-class/index.test.js b/src/using-a-class/index.test.js
@@ -5,7 +5,7 @@ import {
   getWeeksDelinquentInLastYear,
   slightlyDifferentGetCustomerNameOrDefault,
 } from '.';
-import { registry, Customer } from './customer';
+import { registry, Customer, UnknownCustomer } from './customer';
 import { Site } from './site';
 describe('client code', () => {
@@ -49,12 +49,12 @@ describe('client code', () => {
     });
     it('should not update the customer billing plan if customer is unknown', () => {
-      const aCustomer = 'unknown';
+      const aCustomer = new UnknownCustomer();
       const newPlan = registry.billingPlans.premium;
       const updatedCustomer = updateCustomerBillingPlan(aCustomer, newPlan);
-      expect(updatedCustomer).toBe('unknown');
+      expect(updatedCustomer.billingPlan).toBe(aCustomer.billingPlan);
     });
   });
```

And we can do the same for `getCustomerPlanOrDefault`:

```diff
@@ -9,7 +9,7 @@ export function getCustomerNameOrDefault(site) {
 // client 2
 export function getCustomerPlanOrDefault(aCustomer) {
-  const plan = isUnknown(aCustomer) ? registry.billingPlans.basic : aCustomer.billingPlan;
+  const plan = aCustomer.billingPlan;
   return plan;
 }
```

Things are trickier for the payment history, though, since it's a getter that returns an object. We proceed with introducing a "special case for a special case", by adding a `NullPaymentHistory` construct:

```diff
@@ -0,0 +1,5 @@
+export class NullPaymentHistory {
+  get weeksDelinquentInLastYear() {
+    return 0;
+  }
+}

diff --git a/src/using-a-class/customer/payment-history/index.test.js b/src/using-a-class/customer/payment-history/index.test.js
@@ -0,0 +1,8 @@
+import { NullPaymentHistory } from '.';
+
+describe('NullPaymentHistory', () => {
+  it('should has zero weeks as delinquent in the last year', () => {
+    const paymentHistory = new NullPaymentHistory();
+    expect(paymentHistory.weeksDelinquentInLastYear).toBe(0);
+  });
+});
```

We can then return a `NullPaymentHistory` at `UnknownCustomer.paymentHistory`:

```diff
@@ -1,3 +1,5 @@
+import { NullPaymentHistory } from './payment-history';
+
 export const registry = {
   billingPlans: {
     basic: 'basic',
@@ -47,6 +49,10 @@ export class UnknownCustomer {
   }
   set billingPlan(_arg) {}
+
+  get paymentHistory() {
+    return new NullPaymentHistory();
+  }
 }
 export function isUnknown(arg) {

diff --git a/src/using-a-class/customer/index.test.js b/src/using-a-class/customer/index.test.js
@@ -1,4 +1,5 @@
 import { registry, Customer, UnknownCustomer, isUnknown } from '.';
+import { NullPaymentHistory } from './payment-history';
 describe('Customer', () => {
   const data = {
@@ -52,6 +53,11 @@ describe('UnknownCustomer', () => {
     customer.billingPlan = registry.billingPlans.premium;
     expect(customer.billingPlan).toBe(registry.billingPlans.basic);
   });
+
+  it('should return a null payment history', () => {
+    const customer = new UnknownCustomer();
+    expect(customer.paymentHistory).toBeInstanceOf(NullPaymentHistory);
+  });
 });
 describe('isUnknown', () => {
```

And, finally, we can remove the check for unknown customers at `getWeeksDelinquentInLastYear`:

```diff
@@ -21,10 +21,7 @@ export function updateCustomerBillingPlan(aCustomer, newPlan) {
 // client 4
 export function getWeeksDelinquentInLastYear(aCustomer) {
-  const weeksDelinquent = isUnknown(aCustomer)
-    ? 0
-    : aCustomer.paymentHistory.weeksDelinquentInLastYear;
-
+  const weeksDelinquent = aCustomer.paymentHistory.weeksDelinquentInLastYear;
   return weeksDelinquent;
 }
```

Last, but not least, we can now stop using the `isUnknown` function at `slightlyDifferentGetCustomerNameOrDefault`, favoring the `isUnknown` getter:

```diff
@@ -29,6 +29,6 @@ export function getWeeksDelinquentInLastYear(aCustomer) {
 export function slightlyDifferentGetCustomerNameOrDefault(site) {
   const aCustomer = site.customer;
   // ... lots of intervening code ...
-  const customerName = isUnknown(aCustomer) ? 'unknown occupant' : aCustomer.name;
+  const customerName = aCustomer.isUnknown ? 'unknown occupant' : aCustomer.name;
   return customerName;
 }
```

Notice that we can't remove the check for unknown altogether, since the default value being used at this function ("unknown occupant") isn't the same as the default chosen for `UnknownCustomer` ("occupant").

And the most pleasant step comes now, since we're able to [remove the now dead](https://github.com/kaiosilveira/remove-dead-code-refactoring) `isUnknown` function:

```diff
@@ -54,10 +54,3 @@ export class UnknownCustomer {
     return new NullPaymentHistory();
   }
 }
-
-export function isUnknown(arg) {
-  if (!(arg instanceof Customer || arg instanceof UnknownCustomer || arg === 'unknown'))
-    throw new Error(`investigate bad value: <${arg}>`);
-
-  return arg.isUnknown || arg === 'unknown';
-}

diff --git a/src/using-a-class/customer/index.test.js b/src/using-a-class/customer/index.test.js
@@ -1,4 +1,4 @@
-import { registry, Customer, UnknownCustomer, isUnknown } from '.';
+import { registry, Customer, UnknownCustomer } from '.';
 import { NullPaymentHistory } from './payment-history';
 describe('Customer', () => {
@@ -59,23 +59,3 @@ describe('UnknownCustomer', () => {
     expect(customer.paymentHistory).toBeInstanceOf(NullPaymentHistory);
   });
 });
-
-describe('isUnknown', () => {
-  it('should return true if customer is unknown', () => {
-    const customer = 'unknown';
-    expect(isUnknown(customer)).toBe(true);
-  });
-
-  it('should return false if customer is known', () => {
-    const customer = new Customer({ name: 'John Doe' });
-    expect(isUnknown(customer)).toBe(false);
-  });
-
-  it('should throw an error if customer is not a Customer instance, UnknownCustomer instance, or "unknown"', () => {
-    expect(() => isUnknown(new Customer({ name: 'John Doe' }))).not.toThrow();
-    expect(() => isUnknown(new UnknownCustomer())).not.toThrow();
-
-    const badCustomer = { name: 'John Doe' };
-    expect(() => isUnknown(badCustomer)).toThrow('investigate bad value: <[object Object]>');
-  });
-});
diff --git a/src/using-a-class/index.js b/src/using-a-class/index.js
@@ -1,5 +1,3 @@
-import { registry, isUnknown } from './customer';
-
 // client 1
 export function getCustomerNameOrDefault(site) {
   const aCustomer = site.customer;
```

And that's it for this one! All default behavior is now encapsulated at `UnknownCustomer` and all clients that follow the same convention for the defaults will be able to leverage this feat.

#### Commit history

Below there's the commit history for the steps detailed above.

| Commit SHA                                                                                                                    | Message                                                               |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [8a61088](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/8a610887a195cf32781f04fbf8edcf71d288477c) | introduce `isUnknown` getter                                          |
| [20235a2](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/20235a26533f88025afabe53a5f10b18b2232bc6) | introduce `UnknownCustomer` construct                                 |
| [6aedcc1](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/6aedcc18ab7b36306c185e16266ebcdadc197845) | extract `isUnknown` check into a function                             |
| [67b89eb](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/67b89eb52e929c6d6b34df963a1a7a3ef672825d) | update `getCustomerNameOrDefault` to use `isUnknown`                  |
| [8970635](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/8970635edbd27257a051b237a7b35f21a6136d98) | update `getCustomerPlanOrDefault` to use `isUnknown`                  |
| [4eb00e7](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/4eb00e7f59b7472cd9a2e4164d498169876388cf) | update `updateCustomerBillingPlan` to use `isUnknown`                 |
| [f11e57d](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/f11e57d4f13f1af3bccaa716f950284173f71a7d) | update `getWeeksDelinquentInLastYear` to use `isUnknown`              |
| [9d9d171](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/9d9d17191a134b7eb5de483a64ed8a1cb01916c3) | update `slightlyDifferentGetCustomerNameOrDefault` to use `isUnknown` |
| [2c8eee6](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/2c8eee69ba3bc95ee2f44a8772c57c8af9fb9bf7) | add support to `UnknownCustomer` at `isUnknown`                       |
| [c6cd32c](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/c6cd32c1e427c3c834fbacb550828f16be535a77) | return a `UnknownCustomer` as special case at `Site`                  |
| [97d9fca](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/97d9fca278a999a1c7de4dd4eebf95d813421b19) | return 'occupant' as name for `UnknownCustomer`                       |
| [6a91b68](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/6a91b68f365e516521e45e6986ab83a1b21f7d68) | remove conditional for customer name at `getCustomerNameOrDefault`    |
| [7f3acc3](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/7f3acc39af799870d8a75c9dd23275f41ecea056) | inline `customerName` at `getCustomerNameOrDefault`                   |
| [a6230dc](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/a6230dca4b6fc7d414ecd0cc90968c89f39b0772) | return 'basic' as value for `UnknownCustomer.billingPlan`             |
| [82c3df4](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/82c3df453eb3f47a55a1b89b41288bad84b8b507) | implement no-op setter for `UnknownCustomer.billingPlan`              |
| [00c447d](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/00c447d9c5e803d957aa3bbfd9228311b3fdc142) | remove check for unknown at `updateCustomerBillingPlan`               |
| [f0a4ff6](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/f0a4ff6329b89eae624f77c31756487fd70996fa) | remove check for unknown at `getCustomerPlanOrDefault`                |
| [85c2cd1](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/85c2cd130d1267c1d8b8b6b286ac540f557b1111) | introduce `NullPaymentHistory`                                        |
| [73790e6](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/73790e6ffb2f4bc1a84016ffc6607b0c11f6f42e) | return a `NullPaymentHistory` at `UnknownCustomer.paymentHistory`     |
| [a701106](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/a7011061501981ae50207f35a1589215fd0c4914) | remove check for unknown at `getWeeksDelinquentInLastYear`            |
| [870a07b](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/870a07be76965840ef825763f39802010a5e9a06) | stop using `isUnknown` at `slightlyDifferentGetCustomerNameOrDefault` |
| [cd55843](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/cd558435d50581742f7c118b1e131cabd04c294b) | remove now unused `isUnknown`                                         |

For the full commit history for this project, check the [Commit History tab](https://github.com/kaiosilveira/introduce-special-case-refactoring/commits/main).

---

### Example #2: Using an object literal

In this approach, instead of introducing a class, we'll be leveraging Javascript's duck typing aspect to simply use a object literal as a default-value-holder for unknown customers. This will work whenever we don't have writes being performed upon our returning object, which was the case in the previous example (hence the no-op setter implemented there).

Similarly to what we did in the previous example, we start by adding a `isUnknown` getter to `Customer`:

```diff
@@ -27,4 +27,8 @@ export class Customer {
   get paymentHistory() {
     return this._paymentHistory;
   }
+
+  get isUnknown() {
+    return false;
+  }
 }

diff --git a/src/using-object-literal/customer/index.test.js b/src/using-object-literal/customer/index.test.js
@@ -22,4 +22,11 @@ describe('Customer', () => {
     expect(customer.billingPlan).toEqual('premium');
   });
+
+  describe('isUnknown', () => {
+    it('should return false', () => {
+      const customer = new Customer(data);
+      expect(customer.isUnknown).toBe(false);
+    });
+  });
 });
```

We then introduce a `createUnknownCustomer` utility:

```diff
@@ -32,3 +32,7 @@ export class Customer {
     return false;
   }
 }
+
+export function createUnknownCustomer() {
+  return { isUnknown: true };
+}

diff --git a/src/using-object-literal/customer/index.test.js b/src/using-object-literal/customer/index.test.js
@@ -1,4 +1,4 @@
-import { Customer } from '.';
+import { createUnknownCustomer, Customer } from '.';
 describe('Customer', () => {
   const data = {
@@ -30,3 +30,10 @@ describe('Customer', () => {
     });
   });
 });
+
+describe('createUnknownCustomer', () => {
+  it('should return an object with isUnknown set to true', () => {
+    const unknownCustomer = createUnknownCustomer();
+    expect(unknownCustomer.isUnknown).toBe(true);
+  });
+});
```

And extract the `isUnknown` logic into a function:

```diff
@@ -36,3 +36,7 @@ export class Customer {
 export function createUnknownCustomer() {
   return { isUnknown: true };
 }
+
+export function isUnknown(arg) {
+  return arg === 'unknown';
+}

diff --git a/src/using-object-literal/customer/index.test.js b/src/using-object-literal/customer/index.test.js
@@ -1,4 +1,4 @@
-import { createUnknownCustomer, Customer } from '.';
+import { createUnknownCustomer, Customer, isUnknown } from '.';
 describe('Customer', () => {
   const data = {
@@ -37,3 +37,13 @@ describe('createUnknownCustomer', () => {
     expect(unknownCustomer.isUnknown).toBe(true);
   });
 });
+
+describe('isUnknown', () => {
+  it('should return true if the argument is "unknown"', () => {
+    expect(isUnknown('unknown')).toBe(true);
+  });
+
+  it('should return false if the argument is not "unknown"', () => {
+    expect(isUnknown('John Doe')).toBe(false);
+  });
+});
```

Now, we need to update the clients so they use our new `isUnknown` function. We start with `getCustomerNameOrDefault`:

```diff
@@ -1,11 +1,11 @@
-import { registry } from './customer';
+import { registry, isUnknown } from './customer';
 // client 1
 export function getCustomerNameOrDefault(site) {
   const aCustomer = site.customer;
   // ... lots of intervening code ...
   let customerName;
-  if (aCustomer === 'unknown') customerName = 'occupant';
+  if (isUnknown(aCustomer)) customerName = 'occupant';
   else customerName = aCustomer.name;
   return customerName;
```

...then `getCustomerPlanOrDefault`:

```diff
@@ -13,7 +13,7 @@ export function getCustomerNameOrDefault(site) {
 // client 2
 export function getCustomerPlanOrDefault(aCustomer) {
-  const plan = aCustomer === 'unknown' ? registry.billingPlans.basic : aCustomer.billingPlan;
+  const plan = isUnknown(aCustomer) ? registry.billingPlans.basic : aCustomer.billingPlan;
   return plan;
 }
```

...and, finally, `getWeeksDelinquentInLastYear`:

```diff
@@ -19,8 +19,9 @@ export function getCustomerPlanOrDefault(aCustomer) {
 // client 3
 export function getWeeksDelinquentInLastYear(aCustomer) {
-  const weeksDelinquent =
-    aCustomer === 'unknown' ? 0 : aCustomer.paymentHistory.weeksDelinquentInLastYear;
+  const weeksDelinquent = isUnknown(aCustomer)
+    ? 0
+    : aCustomer.paymentHistory.weeksDelinquentInLastYear;
   return weeksDelinquent;
 }
```

To migrate out of the "unknown" string, we need to add support to object checks at `isUnknown`:

```diff
@@ -38,5 +38,5 @@ export function createUnknownCustomer() {
 }
 export function isUnknown(arg) {
-  return arg === 'unknown';
+  return typeof arg === 'string' ? arg === 'unknown' : arg.isUnknown;
 }

diff --git a/src/using-object-literal/customer/index.test.js b/src/using-object-literal/customer/index.test.js
@@ -39,11 +39,23 @@ describe('createUnknownCustomer', () => {
 });
 describe('isUnknown', () => {
-  it('should return true if the argument is "unknown"', () => {
-    expect(isUnknown('unknown')).toBe(true);
+  describe('arg is string', () => {
+    it('should return true if the argument is "unknown"', () => {
+      expect(isUnknown('unknown')).toBe(true);
+    });
+
+    it('should return false if the argument is not "unknown"', () => {
+      expect(isUnknown('John Doe')).toBe(false);
+    });
   });
-  it('should return false if the argument is not "unknown"', () => {
-    expect(isUnknown('John Doe')).toBe(false);
+  describe('arg is object', () => {
+    it('should return true if the argument is "unknown"', () => {
+      expect(isUnknown({ isUnknown: true })).toBe(true);
+    });
+
+    it('should return false if the argument is not "unknown"', () => {
+      expect(isUnknown({ isUnknown: false })).toBe(false);
+    });
   });
 });
```

And now we can start returning an unknown customer from the factory method at `Site.customer`:

```diff
@@ -1,9 +1,11 @@
+import { createUnknownCustomer } from '../customer';
+
 export class Site {
   constructor({ customer }) {
     this._customer = customer;
   }
   get customer() {
-    return this._customer;
+    return this._customer === 'unknown' ? createUnknownCustomer() : this._customer;
   }
 }

diff --git a/src/using-object-literal/site/index.test.js b/src/using-object-literal/site/index.test.js
@@ -5,4 +5,9 @@ describe('Site', () => {
     const aSite = new Site({ customer: { name: 'John Doe' } });
     expect(aSite.customer).toEqual({ name: 'John Doe' });
   });
+
+  it('should return an unknown customer if the customer is unknown', () => {
+    const aSite = new Site({ customer: 'unknown' });
+    expect(aSite.customer.isUnknown).toBe(true);
+  });
 });
```

With all that in place, we're ready to start migrating the default properties into the object. We start by setting 'occupant' as its name:

```diff
@@ -34,7 +34,7 @@ export class Customer {
 }
 export function createUnknownCustomer() {
-  return { isUnknown: true };
+  return { isUnknown: true, name: 'occupant' };
 }
 export function isUnknown(arg) {

diff --git a/src/using-object-literal/customer/index.test.js b/src/using-object-literal/customer/index.test.js
@@ -36,6 +36,11 @@ describe('createUnknownCustomer', () => {
     const unknownCustomer = createUnknownCustomer();
     expect(unknownCustomer.isUnknown).toBe(true);
   });
+
+  it('should return "occupant" as name for an unknown customer', () => {
+    const unknownCustomer = createUnknownCustomer();
+    expect(unknownCustomer.name).toBe('occupant');
+  });
 });
 describe('isUnknown', () => {
```

and we're now safe to remove unknown checks from `getCustomerNameOrDefault`:

```diff
@@ -4,10 +4,7 @@ import { registry, isUnknown } from './customer';
 export function getCustomerNameOrDefault(site) {
   const aCustomer = site.customer;
   // ... lots of intervening code ...
-  let customerName;
-  if (isUnknown(aCustomer)) customerName = 'occupant';
-  else customerName = aCustomer.name;
-
+  const customerName = aCustomer.name;
   return customerName;
 }
```

We proceed with defining 'basic' as the billing plan for unknown customers:

```diff
@@ -34,7 +34,7 @@ export class Customer {
 }
 export function createUnknownCustomer() {
-  return { isUnknown: true, name: 'occupant' };
+  return { isUnknown: true, name: 'occupant', billingPlan: registry.billingPlans.basic };
 }
 export function isUnknown(arg) {

diff --git a/src/using-object-literal/customer/index.test.js b/src/using-object-literal/customer/index.test.js
@@ -1,4 +1,4 @@
-import { createUnknownCustomer, Customer, isUnknown } from '.';
+import { createUnknownCustomer, Customer, isUnknown, registry } from '.';
 describe('Customer', () => {
   const data = {
@@ -41,6 +41,11 @@ describe('createUnknownCustomer', () => {
     const unknownCustomer = createUnknownCustomer();
     expect(unknownCustomer.name).toBe('occupant');
   });
+
+  it('should return "basic" as billing plan for an unknown customer', () => {
+    const unknownCustomer = createUnknownCustomer();
+    expect(unknownCustomer.billingPlan).toBe(registry.billingPlans.basic);
+  });
 });
 describe('isUnknown', () => {
```

and therefore removing unknown checks at `getCustomerPlanOrDefault`:

```diff
@@ -10,7 +10,7 @@ export function getCustomerNameOrDefault(site) {
 // client 2
 export function getCustomerPlanOrDefault(aCustomer) {
-  const plan = isUnknown(aCustomer) ? registry.billingPlans.basic : aCustomer.billingPlan;
+  const plan = aCustomer.billingPlan;
   return plan;
 }
```

Finally, we return zero as value for `paymentHistory.weeksDelinquentInLastYear` for an unknown customers:

```diff
@@ -34,7 +34,14 @@ export class Customer {
 }
 export function createUnknownCustomer() {
-  return { isUnknown: true, name: 'occupant', billingPlan: registry.billingPlans.basic };
+  return {
+    isUnknown: true,
+    name: 'occupant',
+    billingPlan: registry.billingPlans.basic,
+    paymentHistory: {
+      weeksDelinquentInLastYear: 0,
+    },
+  };
 }
 export function isUnknown(arg) {

diff --git a/src/using-object-literal/customer/index.test.js b/src/using-object-literal/customer/index.test.js
@@ -46,6 +46,11 @@ describe('createUnknownCustomer', () => {
     const unknownCustomer = createUnknownCustomer();
     expect(unknownCustomer.billingPlan).toBe(registry.billingPlans.basic);
   });
+
+  it('should return a total of zero weeks delinquent last year', () => {
+    const unknownCustomer = createUnknownCustomer();
+    expect(unknownCustomer.paymentHistory.weeksDelinquentInLastYear).toBe(0);
+  });
 });
 describe('isUnknown', () => {
```

therefore removing unknown checks at `getWeeksDelinquentInLastYear`:

```diff
@@ -16,9 +16,6 @@ export function getCustomerPlanOrDefault(aCustomer) {
 // client 3
 export function getWeeksDelinquentInLastYear(aCustomer) {
-  const weeksDelinquent = isUnknown(aCustomer)
-    ? 0
-    : aCustomer.paymentHistory.weeksDelinquentInLastYear;
-
+  const weeksDelinquent = aCustomer.paymentHistory.weeksDelinquentInLastYear;
   return weeksDelinquent;
 }
```

And that's it! All default values are now being read from the special case object literal.

#### Commit history

Below there's the commit history for the steps detailed above.

| Commit SHA                                                                                                                    | Message                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [fafccfe](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/fafccfec1bc9f57c6e0071627154ede1d869492e) | add `isUnknown` getter to `Customer`                                                        |
| [d54edc4](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/d54edc4291bdbb8505bb660be681ffd12cfb7183) | introduce `createUnknownCustomer` utility                                                   |
| [a253aa9](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/a253aa9cbca3a8d90ce469a06ea9132851aa2164) | extract `isUnknown` logic into a function                                                   |
| [8fc902f](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/8fc902f475dd5bc5917de626b16d92beff004554) | update `getCustomerNameOrDefault` to use `isUnknown`                                        |
| [476cd0d](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/476cd0d426a89fb0cb326a3160dab6b3625f7dd8) | update `getCustomerPlanOrDefault` to use `isUnknown`                                        |
| [fc36b0e](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/fc36b0efeb5c878e90f256d2b9ba0bec5adab9ae) | update `getWeeksDelinquentInLastYear` to use `isUnknown`                                    |
| [8d33b03](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/8d33b03978cf5650aa7a0c209be147fe1c5e6751) | add support to obj check at `isUnknown`                                                     |
| [94ba00b](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/94ba00b17dca983d9dee007ea59a87369418369a) | return unknown customer from factory at `Site.customer`                                     |
| [f9ba32f](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/f9ba32f26e2cef103a95b3a514105f31d98e344e) | return 'occupant' as name for unknown customer                                              |
| [a22a90c](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/a22a90c64fca1c93a054649ff3933bbfb7d25dfc) | remove unknown check at `getCustomerNameOrDefault`                                          |
| [5150a68](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/5150a68fdb9ce92bd6eedc3db42f22571d0b2bc6) | return 'basic' as billing plan for unknown customer                                         |
| [1dd1522](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/1dd15229b6550fc9d995889943c73501893ce661) | remove unknown check at `getCustomerPlanOrDefault`                                          |
| [7122b42](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/7122b425e4cd6fd37ab933f41f0b30d5b4ac3f98) | return zero as value for `paymentHistory.weeksDelinquentInLastYear` for an unknown customer |
| [4e64e60](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/4e64e60dc35bc463c469831fdfc78d214c6d2ad9) | remove unknown check at `getWeeksDelinquentInLastYear`                                      |

For the full commit history for this project, check the [Commit History tab](https://github.com/kaiosilveira/introduce-special-case-refactoring/commits/main).

---

### Example #3: Using a transform

In this approach, instead of using auxiliary data structures, the idea is to transform and enhance the input object to contain the data we need.

#### Steps

We start by introducing a transform function named `enrichSite`. This function does nothing but a deep copy at firstƒ:

```diff
@@ -1,3 +1,5 @@
+import _ from 'lodash';
+
 export const registry = {
   billingPlans: {
     basic: 'basic',
@@ -31,3 +33,7 @@ export function getWeeksDelinquentInLastYear(inputSite) {
   return weeksDelinquent;
 }
+
+export function enrichSite(inputSite) {
+  return _.cloneDeep(inputSite);
+}

diff --git a/src/using-a-transform/index.test.js b/src/using-a-transform/index.test.js
@@ -3,6 +3,7 @@ import {
   getCustomerNameOrDefault,
   getCustomerPlanOrDefault,
   getWeeksDelinquentInLastYear,
+  enrichSite,
 } from '.';
 describe('client code', () => {
@@ -48,3 +49,12 @@ describe('client code', () => {
     });
   });
 });
+
+describe('enrichSite', () => {
+  it('should return a deep clone of the input site', () => {
+    const inputSite = { customer: { name: 'John Doe' } };
+    const outputSite = enrichSite(inputSite);
+    expect(outputSite).toEqual(inputSite);
+    expect(outputSite).not.toBe(inputSite);
+  });
+});
```

We then update the calling code to call the transform function. We start with `getCustomerNameOrDefault`:

```diff
@@ -8,8 +8,9 @@ export const registry = {
 };
 // client 1
-export function getCustomerNameOrDefault(site) {
-  const aCustomer = site.customer;
+export function getCustomerNameOrDefault(inputSite) {
+  const aSite = enrichSite(inputSite);
+  const aCustomer = aSite.customer;
   // ... lots of intervening code ...
   let customerName;
   if (aCustomer === 'unknown') customerName = 'occupant';
```

...then `getCustomerPlanOrDefault`:

```diff
@@ -21,7 +21,8 @@ export function getCustomerNameOrDefault(inputSite) {
 // client 2
 export function getCustomerPlanOrDefault(inputSite) {
-  const aCustomer = inputSite.customer;
+  const aSite = enrichSite(inputSite);
+  const aCustomer = aSite.customer;
   const plan = aCustomer === 'unknown' ? registry.billingPlans.basic : aCustomer.billingPlan;
   return plan;
 }
```

and, finally, `getWeeksDelinquentInLastYear`:

```diff
@@ -29,7 +29,8 @@ export function getCustomerPlanOrDefault(inputSite) {
 // client 3
 export function getWeeksDelinquentInLastYear(inputSite) {
-  const aCustomer = inputSite.customer;
+  const aSite = enrichSite(inputSite);
+  const aCustomer = aSite.customer;
   const weeksDelinquent =
     aCustomer === 'unknown' ? 0 : aCustomer.paymentHistory.weeksDelinquentInLastYear;
```

We proceed with encapsulating the check for unknown customers into a function:

```diff
@@ -40,3 +40,7 @@ export function getWeeksDelinquentInLastYear(inputSite) {
 export function enrichSite(inputSite) {
   return _.cloneDeep(inputSite);
 }
+
+export function isUnknown(aCustomer) {
+  return aCustomer === 'unknown';
+}

diff --git a/src/using-a-transform/index.test.js b/src/using-a-transform/index.test.js
@@ -4,6 +4,7 @@ import {
   getCustomerPlanOrDefault,
   getWeeksDelinquentInLastYear,
   enrichSite,
+  isUnknown,
 } from '.';
 describe('client code', () => {
@@ -58,3 +59,13 @@ describe('enrichSite', () => {
     expect(outputSite).not.toBe(inputSite);
   });
 });
+
+describe('isUnknown', () => {
+  it('should return true if customer is unknown', () => {
+    expect(isUnknown('unknown')).toBe(true);
+  });
+
+  it('should return false if customer is known', () => {
+    expect(isUnknown({ name: 'John Doe' })).toBe(false);
+  });
+});
```

...and updating the callers to use it. We start with `getCustomerNameOrDefault`:

```diff
@@ -13,7 +13,7 @@ export function getCustomerNameOrDefault(inputSite) {
   const aCustomer = aSite.customer;
   // ... lots of intervening code ...
   let customerName;
-  if (aCustomer === 'unknown') customerName = 'occupant';
+  if (isUnknown(aCustomer)) customerName = 'occupant';
   else customerName = aCustomer.name;
   return customerName;
```

...then `getCustomerPlanOrDefault`:

```diff
@@ -23,7 +23,7 @@ export function getCustomerNameOrDefault(inputSite) {
 export function getCustomerPlanOrDefault(inputSite) {
   const aSite = enrichSite(inputSite);
   const aCustomer = aSite.customer;
-  const plan = aCustomer === 'unknown' ? registry.billingPlans.basic : aCustomer.billingPlan;
+  const plan = isUnknown(aCustomer) ? registry.billingPlans.basic : aCustomer.billingPlan;
   return plan;
 }
```

...and, finally, `getWeeksDelinquentInLastYear`:

```diff
@@ -31,8 +31,9 @@ export function getCustomerPlanOrDefault(inputSite) {
 export function getWeeksDelinquentInLastYear(inputSite) {
   const aSite = enrichSite(inputSite);
   const aCustomer = aSite.customer;
-  const weeksDelinquent =
-    aCustomer === 'unknown' ? 0 : aCustomer.paymentHistory.weeksDelinquentInLastYear;
+  const weeksDelinquent = isUnknown(aCustomer)
+    ? 0
+    : aCustomer.paymentHistory.weeksDelinquentInLastYear;
   return weeksDelinquent;
 }
```

Now, since we want to move out of the "unknown" string favoring a flag in the object, we add support for such flag at `isUnknown`:

```diff
@@ -43,5 +43,6 @@ export function enrichSite(inputSite) {
 }
 export function isUnknown(aCustomer) {
-  return aCustomer === 'unknown';
+  if (aCustomer === 'unknown') return true;
+  else return aCustomer.isUnknown;
 }

diff --git a/src/using-a-transform/index.test.js b/src/using-a-transform/index.test.js
@@ -66,6 +66,6 @@ describe('isUnknown', () => {
   });
   it('should return false if customer is known', () => {
-    expect(isUnknown({ name: 'John Doe' })).toBe(false);
+    expect(isUnknown({ name: 'John Doe', isUnknown: false })).toBe(false);
   });
 });
```

And now we're safe to transform site customers to contain an unknown customer object with `isUnknown=true` if `customer="unknown"` is provided:

```diff
@@ -39,7 +39,14 @@ export function getWeeksDelinquentInLastYear(inputSite) {
 }
 export function enrichSite(inputSite) {
-  return _.cloneDeep(inputSite);
+  const result = _.cloneDeep(inputSite);
+  const unknownCustomer = {
+    isUnknown: true,
+  };
+
+  if (isUnknown(result.customer)) result.customer = unknownCustomer;
+  else result.customer.isUnknown = false;
+  return result;
 }
 export function isUnknown(aCustomer) {

diff --git a/src/using-a-transform/index.test.js b/src/using-a-transform/index.test.js
@@ -52,11 +52,16 @@ describe('client code', () => {
 });
 describe('enrichSite', () => {
-  it('should return a deep clone of the input site', () => {
-    const inputSite = { customer: { name: 'John Doe' } };
-    const outputSite = enrichSite(inputSite);
-    expect(outputSite).toEqual(inputSite);
-    expect(outputSite).not.toBe(inputSite);
+  it('should return a customer with the isUnknown flag set to true if customer is unknown', () => {
+    const aSite = { customer: 'unknown' };
+    const enrichedSite = enrichSite(aSite);
+    expect(enrichedSite.customer.isUnknown).toBe(true);
+  });
+
+  it('should return a customer with the isUnknown flag set to false if customer is known', () => {
+    const aSite = { customer: { name: 'John Doe' } };
+    const enrichedSite = enrichSite(aSite);
+    expect(enrichedSite.customer.isUnknown).toBe(false);
   });
 });
```

With all that in place, we're ready to start migrating the properties. We start by defining 'occupant' as the default name for unknown customers:

```diff
@@ -42,6 +42,7 @@ export function enrichSite(inputSite) {
   const result = _.cloneDeep(inputSite);
   const unknownCustomer = {
     isUnknown: true,
+    name: 'occupant',
   };
   if (isUnknown(result.customer)) result.customer = unknownCustomer;

diff --git a/src/using-a-transform/index.test.js b/src/using-a-transform/index.test.js
@@ -63,6 +63,12 @@ describe('enrichSite', () => {
     const enrichedSite = enrichSite(aSite);
     expect(enrichedSite.customer.isUnknown).toBe(false);
   });
+
+  it('should set the unknown customer name to "occupant"', () => {
+    const aSite = { customer: 'unknown' };
+    const enrichedSite = enrichSite(aSite);
+    expect(enrichedSite.customer.name).toBe('occupant');
+  });
 });
 describe('isUnknown', () => {
```

and removing the check for unknown customers at `getCustomerNameOrDefault`:

```diff
@@ -12,10 +12,7 @@ export function getCustomerNameOrDefault(inputSite) {
   const aSite = enrichSite(inputSite);
   const aCustomer = aSite.customer;
   // ... lots of intervening code ...
-  let customerName;
-  if (isUnknown(aCustomer)) customerName = 'occupant';
-  else customerName = aCustomer.name;
-
+  const customerName = aCustomer.name;
   return customerName;
 }
```

Similarly, 'basic' is the default billing plan for unknown customers:

```diff
@@ -40,6 +40,7 @@ export function enrichSite(inputSite) {
   const unknownCustomer = {
     isUnknown: true,
     name: 'occupant',
+    billingPlan: registry.billingPlans.basic,
   };
   if (isUnknown(result.customer)) result.customer = unknownCustomer;

diff --git a/src/using-a-transform/index.test.js b/src/using-a-transform/index.test.js
@@ -69,6 +69,12 @@ describe('enrichSite', () => {
     const enrichedSite = enrichSite(aSite);
     expect(enrichedSite.customer.name).toBe('occupant');
   });
+
+  it('should set the unknown customer billing plan to basic', () => {
+    const aSite = { customer: 'unknown' };
+    const enrichedSite = enrichSite(aSite);
+    expect(enrichedSite.customer.billingPlan).toBe(registry.billingPlans.basic);
+  });
 });
 describe('isUnknown', () => {
```

and, as consequence, the check for unknown customers is no longer needed at `getCustomerPlanOrDefault`:

```diff
@@ -20,7 +20,7 @@ export function getCustomerNameOrDefault(inputSite) {
 export function getCustomerPlanOrDefault(inputSite) {
   const aSite = enrichSite(inputSite);
   const aCustomer = aSite.customer;
-  const plan = isUnknown(aCustomer) ? registry.billingPlans.basic : aCustomer.billingPlan;
+  const plan = aCustomer.billingPlan;
   return plan;
 }
```

Finally, we set weeks delinquent last year to zero as default for unknown customers:

```diff
@@ -41,6 +41,7 @@ export function enrichSite(inputSite) {
     isUnknown: true,
     name: 'occupant',
     billingPlan: registry.billingPlans.basic,
+    paymentHistory: { weeksDelinquentInLastYear: 0 },
   };
   if (isUnknown(result.customer)) result.customer = unknownCustomer;

diff --git a/src/using-a-transform/index.test.js b/src/using-a-transform/index.test.js
@@ -75,6 +75,12 @@ describe('enrichSite', () => {
     const enrichedSite = enrichSite(aSite);
     expect(enrichedSite.customer.billingPlan).toBe(registry.billingPlans.basic);
   });
+
+  it('should set the weeks delinquent to 0 if customer is unknown', () => {
+    const aSite = { customer: 'unknown' };
+    const enrichedSite = enrichSite(aSite);
+    expect(enrichedSite.customer.paymentHistory.weeksDelinquentInLastYear).toBe(0);
+  });
 });
 describe('isUnknown', () => {
```

therefore removing the need for checking unknown customers at `getWeeksDelinquentInLastYear`:

```diff
@@ -28,10 +28,7 @@ export function getCustomerPlanOrDefault(inputSite) {
 export function getWeeksDelinquentInLastYear(inputSite) {
   const aSite = enrichSite(inputSite);
   const aCustomer = aSite.customer;
-  const weeksDelinquent = isUnknown(aCustomer)
-    ? 0
-    : aCustomer.paymentHistory.weeksDelinquentInLastYear;
-
+  const weeksDelinquent = aCustomer.paymentHistory.weeksDelinquentInLastYear;
   return weeksDelinquent;
 }
```

And that's it!

#### Commit history

Below there's the commit history for the steps detailed above.

| Commit SHA                                                                                                                    | Message                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [06d8997](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/06d8997f16b85982df73bd29e8e77ad0cd47d81b) | introduce transform function `enrichSite`                               |
| [47ebacd](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/47ebacd64d285a8d29c877e1581ae368008ea079) | call site transform fn at `getCustomerNameOrDefault`                    |
| [3388e1f](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/3388e1f4f59afb8c22945ded0cacdf277e094e47) | call site transform fn at `getCustomerPlanOrDefault`                    |
| [fffba10](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/fffba1086d147020b463e6902bea3aa68f35ba30) | call site transform fn at `getWeeksDelinquentInLastYear`                |
| [00a290d](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/00a290d0bbaad80efcd950ed3d04784214f399ff) | encapsulate check for unknown customers into a function                 |
| [4b5b85f](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/4b5b85f6430af1e450874ccf361ceda138128f4a) | update `getCustomerNameOrDefault` to use `isUnknown`                    |
| [f070925](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/f070925e2a9ba76df09377a547b5cdb66b68d740) | update `getCustomerPlanOrDefault` to use `isUnknown`                    |
| [65f0985](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/65f0985d9c33afb8144bf0baf8aaead3eaab1927) | update `getWeeksDelinquentInLastYear` to use `isUnknown`                |
| [7fe1bd0](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/7fe1bd094fe44817d85a48c4ef4aa7ab3fd604b8) | add support to `aCustomer.isUnknown` flag at `isUnknown` fn             |
| [d9e1a0e](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/d9e1a0ec0996e6e69f0cafa6dadf2040ebcfce23) | transform site to contain a unknown customer obj with `isUnknown=true`  |
| [0448377](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/04483772d76503b7c91a7d7aecf2b3b5888ba718) | set 'occupant' as default name for unknown customer                     |
| [e980633](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/e9806333a3f0102fcd45a69a3bfe5357d8ec9141) | remove check for unknown customers at `getCustomerNameOrDefault`        |
| [fc2a743](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/fc2a7430a0fbf4edde87c843827c492795ce69a7) | set 'basic' as default billing plan for unknown customer                |
| [ac8c5ec](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/ac8c5ecef5e6e3ed998cfe7504a5b53bd07b084c) | remove check for unknown customers at `getCustomerPlanOrDefault`        |
| [06834d9](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/06834d981ceb71455889a5cee8fdec64db6d825b) | set weeks delinquent last year to zero as default for unknown customers |
| [808cc12](https://github.com/kaiosilveira/introduce-special-case-refactoring/commit/808cc129349411e4b90e7e829b35c25b61724b64) | remove check for unknown customers at `getWeeksDelinquentInLastYear`    |

For the full commit history for this project, check the [Commit History tab](https://github.com/kaiosilveira/introduce-special-case-refactoring/commits/main).
