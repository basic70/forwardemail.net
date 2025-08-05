/**
 * Copyright (c) Forward Email LLC
 * SPDX-License-Identifier: BUSL-1.1
 */

// eslint-disable-next-line import/no-unassigned-import
require('#config/env');

const process = require('node:process');
const fs = require('node:fs');

// eslint-disable-next-line import/no-unassigned-import
require('#config/env');
// eslint-disable-next-line import/no-unassigned-import
require('#config/mongoose');

const Graceful = require('@ladjs/graceful');
const isSANB = require('is-string-and-not-blank');
const validator = require('@forwardemail/validator');

const mongoose = require('mongoose');
const logger = require('#helpers/logger');
const setupMongoose = require('#helpers/setup-mongoose');

const Users = require('#models/users');
const Domains = require('#models/domains');
const Aliases = require('#models/aliases');

// environment variables passed to script:
// USER_EMAIL=the email of the user that the aliases created will belong to
// DOMAIN_NAME=the domain name that the aliases will belong to
// FILE_PATH=the file path to the CSV file to import
if (!isSANB(process.env.USER_EMAIL)) throw new Error('USER_EMAIL missing');
if (!isSANB(process.env.DOMAIN_NAME)) throw new Error('DOMAIN_NAME missing');
if (!isSANB(process.env.FILE_PATH)) throw new Error('FILE_PATH missing');

const graceful = new Graceful({
  mongooses: [mongoose],
  logger
});

graceful.listen();

(async () => {
  await setupMongoose(logger);

  const user = await Users.findOne({ email: process.env.USER_EMAIL })
    .lean()
    .exec();
  if (!user) throw new Error('User does not exist');

  const domain = await Domains.findOne({
    'members.user': user._id,
    name: process.env.DOMAIN_NAME
  })
    .lean()
    .exec();

  if (!domain) throw new Error('Domain does not exist');

  const stat = await fs.promises.stat(process.env.FILE_PATH);
  if (!stat.isFile()) throw new Error(`${process.env.FILE_PATH} is not a file`);

  const file = await fs.promises.readFile(process.env.FILE_PATH, 'utf8');

  const lines = file.split('\n');

  for (const line of lines) {
    const index = line.indexOf(',');
    const alias = line.slice(0, Math.max(0, index));
    const name = alias.split('@')[0];
    if (!name) continue;
    const recipients = line
      .slice(Math.max(0, index + 1))
      .replace(/"/g, '')
      .trim()
      .split(',')
      .map((str) => str.trim())
      .filter((str) => {
        const valid = validator.isEmail(str);
        if (!valid)
          console.log(
            `${name} had an invalid recipient of ${str} and it was removed`
          );
        return valid;
      });
    if (recipients.length === 0) {
      console.log(`${name} had no recipients`);
      continue;
    }

    const count = await Aliases.countDocuments({
      user: user._id,
      domain: domain._id,
      name
    });

    if (count > 0) {
      continue;
    }

    await Aliases.create({
      user: user._id,
      domain: domain._id,
      name,
      recipients
    });
  }

  process.exit(0);
})();
