/**
 * Copyright (c) Forward Email LLC
 * SPDX-License-Identifier: BUSL-1.1
 */

// eslint-disable-next-line import/no-unassigned-import
require('#config/env');

const process = require('node:process');
const { parentPort } = require('node:worker_threads');

// eslint-disable-next-line import/no-unassigned-import
require('#config/mongoose');

const Graceful = require('@ladjs/graceful');
const Redis = require('@ladjs/redis');
const mongoose = require('mongoose');
const parseErr = require('parse-err');
const safeStringify = require('fast-safe-stringify');
const sharedConfig = require('@ladjs/shared-config');

const Logs = require('#models/logs');
const config = require('#config');
const createTangerine = require('#helpers/create-tangerine');
const emailHelper = require('#helpers/email');
const logger = require('#helpers/logger');
const monitorServer = require('#helpers/monitor-server');
const setupMongoose = require('#helpers/setup-mongoose');

monitorServer();

const breeSharedConfig = sharedConfig('BREE');
const client = new Redis(breeSharedConfig.redis, logger);
const resolver = createTangerine(client, logger);

const graceful = new Graceful({
  mongooses: [mongoose],
  redisClients: [client],
  logger
});

graceful.listen();

(async () => {
  await setupMongoose(logger);

  try {
    //
    // NOTE: we use async iterator (cursor) for performance
    // <https://mongoosejs.com/docs/api/querycursor.html#querycursor_QueryCursor-Symbol.asyncIterator>
    // <https://thecodebarbarian.com/whats-new-in-mongoose-53-async-iterators.html
    //
    const query = {
      $or: [
        {
          is_restricted: {
            $exists: true,
            $eq: true
          },
          domains: {
            $exists: false
          },
          domains_checked_at: {
            $exists: false
          }
        },
        {
          is_restricted: {
            $exists: true,
            $eq: true
          },
          domains: {
            $exists: true,
            $eq: []
          },
          domains_checked_at: {
            $exists: false
          }
        },
        {
          hash: {
            $exists: false
          }
        },
        {
          is_empty_domains: {
            $exists: false
          }
        },
        {
          is_restricted: {
            $exists: false
          }
        },
        {
          keywords: {
            $exists: false
          }
        },
        {
          domains: {
            $exists: false
          }
        },
        {
          date: {
            $exists: false
          }
        },
        {
          subject: {
            $exists: false
          }
        }
      ]
    };

    // eslint-disable-next-line unicorn/no-array-callback-reference
    for await (const log of Logs.find(query)
      // .sort({ created_at: -1 })
      .cursor()
      .addCursorFlag('noCursorTimeout', true)) {
      // this calls the internal static method `parseLog`
      try {
        // helper property to skip duplicate check
        log.skip_duplicate_check = true;
        // resolver helper
        log.resolver = resolver;
        await log.save();
      } catch (err) {
        if (err.is_denylist_without_domains)
          Logs.deleteOne(
            { _id: log._id },
            {
              writeConcern: { w: 0, j: false }
            }
          )
            .then()
            .catch((err) => logger.error(err));
      }
    }
  } catch (err) {
    await logger.error(err);
    // send an email to admins of the error
    await emailHelper({
      template: 'alert',
      message: {
        to: config.email.message.from,
        subject: 'Parse Logs Issue'
      },
      locals: {
        message: `<pre><code>${safeStringify(
          parseErr(err),
          null,
          2
        )}</code></pre>`
      }
    });
  }

  if (parentPort) parentPort.postMessage('done');
  else process.exit(0);
})();
