/*
 * Copyright (c) Forward Email LLC
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const mongoose = require('mongoose');
const validationErrorTransform = require('mongoose-validation-error-transform');

// <https://github.com/Automattic/mongoose/issues/5534>
mongoose.Error.messages = require('@ladjs/mongoose-error-messages');

const {
  dummyProofModel,
  dummySchemaOptions,
  sqliteVirtualDB
} = require('#helpers/mongoose-to-sqlite');

const Contacts = new mongoose.Schema(
  {
    // Reference to address book
    address_book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AddressBooks',
      required: true,
      index: true
    },

    // Unique identifier for the contact within the address book
    contact_id: {
      type: String,
      required: true,
      index: true
    },

    // UID from vCard
    uid: {
      type: String,
      required: true,
      index: true
    },

    // Full vCard content
    content: {
      type: String,
      required: true
    },

    // ETag for HTTP caching and synchronization
    etag: {
      type: String,
      required: true
    },

    // Full name extracted from vCard for searching
    fullName: {
      type: String,
      default: '',
      trim: true,
      index: true
    },

    // Whether this is a group contact
    isGroup: {
      type: Boolean,
      default: false,
      index: true
    },

    // Extracted email addresses
    emails: [
      {
        value: {
          type: String,
          trim: true
        },
        type: {
          type: String,
          default: 'INTERNET',
          trim: true
        }
      }
    ],

    // Extracted phone numbers
    phoneNumbers: [
      {
        value: {
          type: String,
          trim: true
        },
        type: {
          type: String,
          default: 'CELL',
          trim: true
        }
      }
    ]
  },
  dummySchemaOptions
);

// Compound index for address_book + contact_id uniqueness
Contacts.index({ address_book: 1, contact_id: 1 }, { unique: true });

// Add SQLite virtual DB support
Contacts.plugin(sqliteVirtualDB);
Contacts.plugin(validationErrorTransform);

module.exports = dummyProofModel(mongoose.model('Contacts', Contacts));
