/**
 * Copyright (c) Forward Email LLC
 * SPDX-License-Identifier: BUSL-1.1
 */

const Stripe = require('stripe');
const _ = require('#helpers/lodash');

const env = require('#config/env');

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

async function getAllStripeCustomers() {
  let customers = [];
  let has_more = true;
  let starting_after;
  do {
    const res = await stripe.customers.list({
      limit: 100,
      starting_after
    });

    customers = [...customers, ...res.data];
    has_more = res.has_more;
    if (has_more && _.last(res.data)) {
      starting_after = _.last(res.data).id;
    }
  } while (has_more);

  return customers;
}

module.exports = getAllStripeCustomers;
