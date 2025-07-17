/**
 * Copyright (c) Forward Email LLC
 * SPDX-License-Identifier: BUSL-1.1
 */

// eslint-disable-next-line import/no-unassigned-import
require('#config/env');

const process = require('node:process');

// eslint-disable-next-line import/no-unassigned-import
require('#config/env');
// eslint-disable-next-line import/no-unassigned-import
require('#config/mongoose');

const Graceful = require('@ladjs/graceful');
const falso = require('@ngneat/falso');
const mongoose = require('mongoose');

const { Inquiries, Users } = require('#models');
const setupMongoose = require('#helpers/setup-mongoose');

const INQUIRY_COUNT = 50;

const graceful = new Graceful({
  mongooses: [mongoose]
});

graceful.listen();

const createFakeInquiry = async () => {
  const randomEmail = falso.randEmail();
  const randomPassword = falso.randPassword();
  const randomUsername = falso.randUserName();

  console.log(`Generating user with email: ${randomEmail}`);

  const user = await Users.create({
    email: randomEmail,
    password: randomPassword
  });

  await Inquiries.create({
    user: user.id,
    message: `Hey this is ${randomUsername}, \n I am looking for some help! Thanks in advance.`
  });
};

(async () => {
  await setupMongoose();

  for (let count = 0; count <= INQUIRY_COUNT; count++) {
    await createFakeInquiry();
  }

  process.exit(0);
})();
