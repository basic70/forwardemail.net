/**
 * Copyright (c) Forward Email LLC
 * SPDX-License-Identifier: BUSL-1.1
 */

const os = require('node:os');

const { setTimeout } = require('node:timers/promises');
const Stripe = require('stripe');
const dayjs = require('dayjs-with-plugins');
const ms = require('ms');
const pMap = require('p-map');
const pMapSeries = require('p-map-series');

const getAllStripeCustomers = require('./get-all-stripe-customers');
const _ = require('#helpers/lodash');

const env = require('#config/env');
const config = require('#config');
const i18n = require('#helpers/i18n');
const logger = require('#helpers/logger');
const Users = require('#models/users');
const emailHelper = require('#helpers/email');

// stripe api rate limitation is 100 writes/100 reads per second in live mode
const concurrency = os.cpus().length;
const stripe = new Stripe(env.STRIPE_SECRET_KEY);

//
// this gets all customers in stripe
// and ensures that the customer exists in our db
// and it also looks up subscriptions for them
// and if there is more than one active subscription or the subscription isn't stored on our side, then store it
// and it will email admins if any errors occur
//

async function mapper(customer) {
  // wait a second to prevent rate limitation error
  await setTimeout(ms('1s'));

  // check for user on our side
  let user = await Users.findOne({
    [config.userFields.stripeCustomerID]: customer.id
  })
    .lean()
    .exec();

  if (!user) return;

  if (user.is_banned) return;

  // if emails did not match
  if (user.email !== customer.email) {
    logger.info(
      `User email ${user.email} did not match customer email ${customer.email} (${customer.id})`
    );
    customer = await stripe.customers.update(customer.id, {
      email: user.email
    });
    logger.info(`Updated user email to match ${user.email}`);
  }

  // check for active subscriptions
  // (if there is more than one than error)
  // (otherwise if there is one then ensure it is set on user object)
  const [activeSubscriptions, trialingSubscriptions] = await Promise.all([
    stripe.subscriptions.list({
      customer: customer.id,
      status: 'active'
    }),
    stripe.subscriptions.list({
      customer: customer.id,
      status: 'trialing'
    })
  ]);

  if (activeSubscriptions.has_more || trialingSubscriptions.has_more) {
    const err = new TypeError(
      `Subscriptions has_more issue - this should not have pagination ${customer.email} (${customer.id})`
    );
    err.isCodeBug = true;
    err.customer = customer;
    err.activeSubscriptions = activeSubscriptions;
    err.trialingSubscriptions = trialingSubscriptions;
    throw err;
  }

  let subscriptions = [
    ...activeSubscriptions.data,
    ...trialingSubscriptions.data
  ];

  if (subscriptions.length > 1) {
    await logger.error(
      new Error(
        `We may need to refund: User had multiple subscriptions ${user.email} (${customer.id})`
      )
    );
    await emailHelper({
      template: 'alert',
      message: {
        to: config.email.message.from,
        subject: `Customer had multiple subscriptions: ${user.email}`
      },
      locals: {
        message: `<p>Customer may have had duplicate subscription payments and may need some of them refunded.</p>
          <p>Subscriptions are already synced correctly to the latest trial or most recently active.</p>
          <p><a href="https://dashboard.stripe.com/customers/${customer.id}" class="btn btn-dark btn-lg" target="_blank" rel="noopener noreferrer">Review Stripe Customer</a></p>`
      }
    });

    // find the subscription that is trialing
    // and cancel all the other ones
    // otherwise if no trialing then cancel everything but newest
    // save to the user the trialing or newest
    const trialing = subscriptions.find((s) => s.status === 'trialing');
    if (trialing) {
      await Users.findByIdAndUpdate(user._id, {
        $set: {
          [config.userFields.stripeSubscriptionID]: trialing.id
        }
      });
      const subscriptionsToCancel = subscriptions.filter(
        (s) => s.id !== trialing.id
      );
      await pMapSeries(subscriptionsToCancel, async (subscription) => {
        await stripe.subscriptions.del(subscription.id);
      });
    } else {
      // sort subscriptions by `created` in reverse (gets newest timestamp first)
      subscriptions = _.sortBy(subscriptions, 'created').reverse();
      const [first, ...others] = subscriptions;
      await Users.findByIdAndUpdate(user._id, {
        $set: {
          [config.userFields.stripeSubscriptionID]: first.id
        }
      });
      await pMapSeries(others, async (subscription) => {
        await stripe.subscriptions.del(subscription.id);
      });
    }
  } else if (
    subscriptions.length === 1 &&
    (!user[config.userFields.stripeSubscriptionID] ||
      user[config.userFields.stripeSubscriptionID] !== subscriptions[0].id)
  ) {
    // if subscription ID was not saved to the user then error
    await Users.findByIdAndUpdate(user._id, {
      $set: {
        [config.userFields.stripeSubscriptionID]: subscriptions[0].id
      }
    });
  }

  // return early since no subscriptions
  if (subscriptions.length === 0) return;

  // lookup when the user's subscription ends
  user = await Users.findById(user._id).lean().exec();

  if (!user) return;

  // lookup when the user is supposed to get billed next time
  const subscription = await stripe.subscriptions.retrieve(
    user[config.userFields.stripeSubscriptionID]
  );

  if (!subscription.current_period_end) return;

  // if subscription has trial and trial end is equal to billing cycle anchor
  // (this means we've already maximized the duration that we can possibly trial for)
  if (
    subscription.billing_cycle_anchor &&
    subscription.trial_end &&
    subscription.start_date &&
    subscription.billing_cycle_anchor === subscription.trial_end &&
    subscription.billing_cycle_anchor !== subscription.start_date
  )
    return;

  // ensure they're not more than a day apart and if so then extend it
  const nextBillDate = dayjs.unix(subscription.current_period_end).toDate();
  const days = dayjs(new Date(user[config.userFields.planExpiresAt])).diff(
    nextBillDate,
    'days'
  );

  if (
    new Date(user[config.userFields.planExpiresAt]).getTime() > Date.now() &&
    nextBillDate.getTime() > Date.now() &&
    days > 0
  ) {
    // cannot be more than 730 days from now (2 years), otherwise set to 720 days from now
    let trialEnd = dayjs(user[config.userFields.planExpiresAt]).toDate();
    try {
      await stripe.subscriptions.update(
        user[config.userFields.stripeSubscriptionID],
        {
          trial_end: dayjs(trialEnd).unix(),
          proration_behavior: 'none'
        }
      );
    } catch (err) {
      if (
        err.stack &&
        !err.stack.includes('The maximum number of trial period days is 730')
      )
        throw err;
      if (!subscription.billing_cycle_anchor) throw err;
      // billing_cycle_anchor + 2 years
      trialEnd = dayjs
        .unix(subscription.billing_cycle_anchor)
        .add(730, 'days')
        .toDate();
      await stripe.subscriptions.update(
        user[config.userFields.stripeSubscriptionID],
        {
          trial_end: dayjs(trialEnd).unix(),
          proration_behavior: 'none'
        }
      );
    }

    // send an email here
    const locale = user[config.lastLocaleField] || i18n.config.defaultLocale;
    await emailHelper({
      template: 'alert',
      message: {
        to: user[config.userFields.receiptEmail] || user.email,
        ...(user[config.userFields.receiptEmail] ? { cc: user.email } : {}),
        subject: i18n.api.t({
          phrase: config.i18n.phrases.BILLING_CYCLE_UPDATED_SUBJECT,
          locale
        })
      },
      locals: {
        message: i18n.api.t(
          {
            phrase: config.i18n.phrases.BILLING_CYCLE_UPDATED_BODY,
            locale
          },
          dayjs(trialEnd).locale(locale).format('LL'),
          dayjs(nextBillDate).locale(locale).format('LL'),
          `${config.urls.web}/${locale}/my-account/billing`
        ),
        locale
      }
    });
  }
}

async function checkSubscriptionAccuracy() {
  logger.info('Fetching Stripe customers');
  const customers = await getAllStripeCustomers();
  logger.info(`Started checking ${customers.length} Stripe customers`);
  await pMap(customers, mapper, { concurrency });
  logger.info(`Finished checking ${customers.length} Stripe customers`);
}

module.exports = checkSubscriptionAccuracy;
