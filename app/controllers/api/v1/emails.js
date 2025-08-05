/**
 * Copyright (c) Forward Email LLC
 * SPDX-License-Identifier: BUSL-1.1
 */

const Boom = require('@hapi/boom');
const pickOriginal = require('@ladjs/pick-original');

const Emails = require('#models/emails');
const _ = require('#helpers/lodash');
const config = require('#config');
const createSession = require('#helpers/create-session');
const getNodemailerMessageFromRequest = require('#helpers/get-nodemailer-message-from-request');
const toObject = require('#helpers/to-object');

const REJECTED_ERROR_KEYS = [
  'recipient',
  'responseCode',
  'response',
  'message'
];

function json(email, isList = false) {
  const object = toObject(Emails, email);

  //
  // NOTE: we always rewrite rejectedErrors
  //       since we don't want to show code bugs
  //       to user via API response
  //
  delete object.rejectedErrors;

  // only admins need this info
  delete object.blocked_hashes;
  delete object.has_blocked_hashes;

  if (isList) {
    delete object.message;
    delete object.headers;
  } else {
    //
    // instead we render it similarly as we do in My Account > Emails
    // (and we only render these fields to the user)
    //
    // - recipient
    // - responseCode
    // - response
    // - message
    //
    // (not the full error object which contains stack trace etc.)
    //
    object.rejectedErrors = email.rejectedErrors.map((err) => {
      const error = {};
      for (const key of REJECTED_ERROR_KEYS) {
        if (typeof err[key] !== 'undefined') error[key] = err[key];
      }

      return error;
    });
  }

  //
  // safeguard to always add `rejectedErrors` since
  // we have it listed in omitExtraFields in emails model
  // (we never want to accidentally render it to a user)
  //
  const keys = _.isFunction(email.toObject) ? email.toObject() : email;
  if (!isList) keys.rejectedErrors = object.rejectedErrors;

  return {
    ...pickOriginal(object, keys),
    // add a helper url
    link: `${config.urls.web}/my-account/emails/${email.id}`
  };
}

async function list(ctx) {
  ctx.body = ctx.state.emails.map((email) => json(email, true));
}

async function retrieve(ctx) {
  const body = json(ctx.state.email);
  // we want to return the `message` property
  body.message = await Emails.getMessage(ctx.state.email.message, true);
  ctx.body = body;
}

async function limit(ctx) {
  const count = await ctx.client.zcard(
    `${config.smtpLimitNamespace}:${ctx.state.user.id}`
  );
  ctx.body = {
    count,
    limit:
      ctx.state.user[config.userFields.smtpLimit] || config.smtpLimitMessages
  };
}

async function create(ctx) {
  try {
    if (!_.isPlainObject(ctx.request.body))
      throw Boom.badRequest(ctx.translateError('INVALID_REQUEST_BODY'));

    // TODO: rewrite this similar to /v1/messages where we use MailComposer
    // this will throw any errors if necessary
    const message = getNodemailerMessageFromRequest(ctx);

    // queue the email
    const email = await Emails.queue(
      { message, user: ctx.state.user, dsn: message?.dsn },
      ctx.locale
    );

    ctx.logger.debug('email created', {
      session: createSession(email),
      user: email.user,
      email: email._id,
      domains: [email.domain],
      ignore_hook: false
    });

    // we want to return the `message` property
    const body = json(email);
    body.message = await Emails.getMessage(email.message, true);
    ctx.body = body;
  } catch (err) {
    ctx.logger.error(err);
    throw err;
  }
}

module.exports = { list, retrieve, create, limit };
