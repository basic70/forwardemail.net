/**
 * Copyright (c) Forward Email LLC
 * SPDX-License-Identifier: BUSL-1.1
 */

const getErrorCode = require('./get-error-code');
const isCodeBug = require('./is-code-bug');
const isRetryableError = require('./is-retryable-error');
const logger = require('./logger');

async function shouldThrow(err, session, resolver) {
  // handle programmer mistakes
  err.isCodeBug = isCodeBug(err);

  // set response code if missing
  err.responseCode = getErrorCode(err);

  // throw early if it was a code bug
  if (err.isCodeBug) {
    // log the error
    logger.fatal(err, { session, resolver });
    throw err;
  }

  // if it was a nodemailer/smtp-server specific
  // connection error then return early (so it will retry)
  if (isRetryableError(err)) {
    // log the error
    logger.error(err, { session, resolver });
    return;
  }

  // TODO: <https://csi.cloudmark.com/en/reset/>
  // TODO: <http://dnsbl.invaluement.com/lookup/>
  // TODO: <http://sendersupport.senderscore.net/>
  // TODO: <http://www.spamhaus.org/lookup.lasso>
  // TODO: <http://www.surbl.org/>
  // TODO: abuse_rbl@abuse-att.net
  // TODO: unblock.request@cox.net
  // TODO: email cloudmark
  // TODO: spamcop
  // TODO: bounce report email should auto trigger these
  // TODO: tobr@rx.t-online.de
  // TODO: bigpond
  // TODO: sender.office.com
  // TODO: https://sendersupport.olc.protection.outlook.com/pm/

  // log the error
  logger.error(err, { session, resolver });

  throw err;
}

module.exports = shouldThrow;
