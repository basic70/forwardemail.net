/**
 * Copyright (c) Forward Email LLC
 * SPDX-License-Identifier: BUSL-1.1
 */

const web = require('./web');
const api = require('./api');
const caldav = require('./caldav');
const carddav = require('./carddav');

module.exports = {
  web,
  api,
  caldav,
  carddav
};
