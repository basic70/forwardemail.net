/**
 * Copyright (c) Forward Email LLC
 * SPDX-License-Identifier: BUSL-1.1
 */

const Email = require('email-templates');
const nodemailer = require('nodemailer');
const striptags = require('striptags');
const { boolean } = require('boolean');
const { decode } = require('html-entities');

const getEmailLocals = require('./get-email-locals');
const logger = require('./logger');
const _ = require('#helpers/lodash');

const config = require('#config');
const env = require('#config/env');

/*
const conn = mongoose.connections.find(
  (conn) => conn[Symbol.for('connection.name')] === 'MONGO_URI'
);
if (!conn) {
  throw new Error('Mongoose connection does not exist');
}

const emailConn = mongoose.connections.find(
  (conn) => conn[Symbol.for('connection.name')] === 'EMAILS_MONGO_URI'
);
if (!emailConn) throw new Error('Mongoose connection does not exist');
const emailTemplates = new EmailTemplates(config.email);
const emailTemplatesFallback = new EmailTemplates({
  ...config.email,
  transport: nodemailer.createTransport({
    host: env.SMTP_TRANSPORT_HOST,
    port: env.SMTP_TRANSPORT_PORT,
    secure: env.SMTP_TRANSPORT_SECURE,
    auth: {
      user: env.SMTP_TRANSPORT_USER,
      pass: env.SMTP_TRANSPORT_PASS
    },
    logger,
    debug: boolean(env.TRANSPORT_DEBUG)
  })
});
*/

const email = new Email({
  ...config.email,
  transport: nodemailer.createTransport({
    host: env.SMTP_TRANSPORT_HOST,
    port: env.SMTP_TRANSPORT_PORT,
    secure: env.SMTP_TRANSPORT_SECURE,
    auth: {
      user: env.SMTP_TRANSPORT_USER,
      pass: env.SMTP_TRANSPORT_PASS
    },
    logger,
    debug: boolean(env.TRANSPORT_DEBUG)
  })
});

module.exports = async (data) => {
  try {
    logger.info('sending email', { data });
    if (!_.isObject(data.locals)) data.locals = {};
    const emailLocals = await getEmailLocals();
    Object.assign(data.locals, emailLocals);
    if (data?.message?.subject)
      data.message.subject = decode(striptags(data.message.subject));
    // TODO: use MailComposer so we can then add to envelope
    // TODO: add `envelope.dsn = { notify: 'never' }`
    const info = await email.send(data);
    return { info };
  } catch (err) {
    logger.error(err, { data });
    throw err;
  }
};

// TODO: temp reverted until we figure out issue
/*
// TODO: email-templates should strip tags from HTML in subject
module.exports = async (data) => {
  try {
    if (
      !conn?.models?.Users ||
      !conn?.models?.Domains ||
      !emailConn?.models?.Emails
    )
      throw new TypeError('Models were not available');

    logger.info('sending email', { data });
    if (!_.isObject(data.locals)) data.locals = {};
    const emailLocals = await getEmailLocals();
    Object.assign(data.locals, emailLocals);
    if (data?.message?.subject)
      data.message.subject = decode(striptags(data.message.subject));

    const adminIds = await conn.models.Users.distinct('_id', {
      group: 'admin'
    });

    const domain = await conn.models.Domains.findOne({
      name: env.WEB_HOST,
      'members.user': { $in: adminIds },
      has_txt_record: true
    }).populate(
      'members.user',
      `id plan ${config.userFields.isBanned} ${config.userFields.hasVerifiedEmail} ${config.userFields.planExpiresAt} ${config.userFields.stripeSubscriptionID} ${config.userFields.paypalSubscriptionID}`
    );

    // alert admins they can configure and verify domain for faster email queueing
    if (!domain) {
      const err = new TypeError(
        `Configure and verify a new admin-owned domain for ${env.WEB_HOST} for faster email queuing`
      );
      err.isCodeBug = true;
      logger.fatal(err);
    }

    // info.message is a stream
    let info = domain
      ? await emailTemplates.send(data)
      : await emailTemplatesFallback.send(data);
    let email = null;

    if (domain) {
      try {
        email = await emailConn.models.Emails.queue({
          user: adminIds[0],
          info,
          domain,
          catchall: true
        });
      } catch (err) {
        err.isCodeBug = true;
        logger.fatal(err);
        // fallback
        info = await emailTemplatesFallback.send(data);
      }
    }

    return { info, email };
  } catch (err) {
    logger.error(err, { data });
    throw err;
  }
};
*/
