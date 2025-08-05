/**
 * Copyright (c) Forward Email LLC
 * SPDX-License-Identifier: BUSL-1.1
 */

const fs = require('node:fs');

const bytes = require('@forwardemail/bytes');
const ms = require('ms');
const pify = require('pify');
const { SMTPServer } = require('@forwardemail/smtp-server');

const config = require('#config');
const createMtaStsCache = require('#helpers/create-mta-sts-cache');
const createTangerine = require('#helpers/create-tangerine');
const env = require('#config/env');
const logger = require('#helpers/logger');
const onClose = require('#helpers/on-close');
const onConnect = require('#helpers/on-connect');
const onData = require('#helpers/on-data');
const onMailFrom = require('#helpers/on-mail-from');
const onRcptTo = require('#helpers/on-rcpt-to');
const isRetryableError = require('#helpers/is-retryable-error');
const isRedisError = require('#helpers/is-redis-error');
const isMongoError = require('#helpers/is-mongo-error');
const isLockingError = require('#helpers/is-locking-error');

const MAX_BYTES = bytes(env.SMTP_MESSAGE_MAX_SIZE);

// TODO: remove try/catch for isDenylisted/isSilent/isBackscatter
//       and replace with catch (err) for onData to detect and store counter
//       based off err.name detected or if it was combined then err.errors

class MX {
  constructor(options = {}) {
    this.client = options.client;
    this.wsp = options.wsp;
    this.resolver = createTangerine(this.client, logger);
    this.cache = createMtaStsCache(this.client);

    // TODO: rate limiting (?)

    this.logger = logger;

    // setup our smtp server which listens for incoming email
    // TODO: <https://github.com/nodemailer/smtp-server/issues/177>
    this.server = new SMTPServer({
      //
      // most of these options mirror the FE forwarding server options
      //
      hideENHANCEDSTATUSCODES: false,
      hideDSN: true, // explicitly disable DSN support on MX server (SMTP only)
      size: MAX_BYTES,
      onData: onData.bind(this),
      onConnect: onConnect.bind(this),
      onClose: onClose.bind(this),
      onMailFrom: onMailFrom.bind(this),
      onRcptTo: onRcptTo.bind(this),
      // NOTE: we don't need to set a value for maxClients
      //       since we have rate limiting enabled by IP
      // maxClients: Infinity, // default is Infinity
      // allow 3m to process bulk RCPT TO
      socketTimeout: config.socketTimeout,
      // default closeTimeout is 30s
      closeTimeout: ms('30s'),
      // <https://github.com/nodemailer/smtp-server/issues/177>
      disableReverseLookup: true,
      logger: this.logger,

      disabledCommands: ['AUTH'],
      secure: false,
      needsUpgrade: false,

      // <https://github.com/nodemailer/wildduck/issues/563>
      // hide8BITMIME: true,

      // keys
      ...(config.env === 'production'
        ? {
            key: fs.readFileSync(env.WEB_SSL_KEY_PATH),
            cert: fs.readFileSync(env.WEB_SSL_CERT_PATH),
            ca: fs.readFileSync(env.WEB_SSL_CA_PATH)
          }
        : {})
    });

    // override logger
    this.server.logger = this.logger;

    // kind of hacky but I filed a GH issue
    // <https://github.com/nodemailer/smtp-server/issues/135>
    this.server.address = this.server.server.address.bind(this.server.server);

    this.server.on('error', (err) => {
      err.is_server_error = true;
      if (
        !isRetryableError(err) ||
        isRedisError(err) ||
        isMongoError(err) ||
        isLockingError(err)
      )
        logger.error(err);
      else logger.debug(err);
    });

    this.listen = this.listen.bind(this);
    this.close = this.close.bind(this);
  }

  async listen(port = env.MX_PORT, host = '::', ...args) {
    await pify(this.server.listen).bind(this.server)(port, host, ...args);
  }

  async close() {
    await pify(this.server.close).bind(this.server);
  }
}

module.exports = MX;
