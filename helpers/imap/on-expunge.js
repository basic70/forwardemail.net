/*
 * Copyright (c) Forward Email LLC
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * This file incorporates work covered by the following copyright and
 * permission notice:
 *
 *   WildDuck Mail Agent is licensed under the European Union Public License 1.2 or later.
 *   https://github.com/nodemailer/wildduck
 */

const pMapSeries = require('p-map-series');
const tools = require('wildduck/lib/tools');
const { Builder } = require('json-sql-enhanced');
const { IMAPConnection } = require('wildduck/imap-core/lib/imap-connection');

const IMAPError = require('#helpers/imap-error');
const Mailboxes = require('#models/mailboxes');
const getAttachments = require('#helpers/get-attachments');
const i18n = require('#helpers/i18n');
const refineAndLogError = require('#helpers/refine-and-log-error');
const updateStorageUsed = require('#helpers/update-storage-used');

const { formatResponse } = IMAPConnection.prototype;

const builder = new Builder();

async function onExpunge(mailboxId, update, session, fn) {
  this.logger.debug('EXPUNGE', { mailboxId, update, session });

  if (this.wsp) {
    try {
      const [bool, mailbox, messages] = await this.wsp.request({
        action: 'expunge',
        session: {
          id: session.id,
          user: session.user,
          remoteAddress: session.remoteAddress,
          selected: session.selected
        },
        mailboxId,
        update
      });

      const payloads = [];

      if (
        messages.length > 0 &&
        // write to socket we've expunged message
        // <https://github.com/zone-eu/wildduck/issues/811>
        (!update.silent ||
          (session &&
            session.selected &&
            session.selected.mailbox &&
            session.selected.mailbox.toString() === mailbox._id.toString()))
      ) {
        payloads.push(
          ...messages.map((message) =>
            formatResponse.call(session, 'EXPUNGE', message.uid)
          )
        );
      }

      if (!update.silent && session?.selected?.uidList) {
        payloads.push({
          tag: '*',
          command: String(session.selected.uidList.length),
          attributes: [
            {
              type: 'atom',
              value: 'EXISTS'
            }
          ]
        });
      }

      if (Array.isArray(payloads) && payloads.length > 0) {
        for (const payload of payloads) {
          session.writeStream.write(payload);
        }
      }

      fn(null, bool);

      const entries =
        messages.length > 0
          ? messages.map((message) => ({
              ignore: session.id,
              command: 'EXPUNGE',
              uid: message.uid,
              mailbox: mailbox._id,
              message: message._id,
              // modseq: message.modseq
              thread: message.thread,
              unseen: message.unseen
              // idate: message.idate
            }))
          : [];

      // <https://github.com/zone-eu/wildduck/blob/76f79fd274e62da3dffe8a2aac170ba41aecaa2b/lib/message-handler.js#L883C31-L893>
      if (Array.isArray(entries) && entries.length > 0)
        this.server.notifier
          .addEntries(this, session, mailboxId, entries)
          .then(() => this.server.notifier.fire(session.user.alias_id))
          .catch((err) =>
            this.logger.fatal(err, { mailboxId, update, session })
          );
    } catch (err) {
      if (err.imapResponse) return fn(null, err.imapResponse);
      fn(err);
    }

    return;
  }

  try {
    await this.refreshSession(session, 'EXPUNGE');

    const mailbox = await Mailboxes.findOne(this, session, {
      _id: mailboxId
    });

    if (!mailbox)
      throw new IMAPError(
        i18n.translate('IMAP_MAILBOX_DOES_NOT_EXIST', session.user.locale),
        {
          imapResponse: 'NONEXISTENT'
        }
      );

    // let storageUsed = 0;

    //
    // NOTE: we return early as a safeguard if the mailbox is not Trash/Junk/Spam
    //       <https://github.com/nodemailer/wildduck/issues/702>
    //       (mirrors trashCheck in `helpers/get-database.js`)
    //
    // if (
    //   config.env === 'production' &&
    //   !['Trash', 'Spam', 'Junk'].includes(mailbox.path)
    // )
    //   throw new IMAPError('EXPUNGE_RESERVED', { imapResponse: 'CANNOT' });

    const condition = {
      mailbox: mailbox._id.toString(),
      undeleted: 0
    };

    // NOTE: this occurs for UID EXPUNGE command
    if (update.isUid) {
      // return early if no messages
      // (we could also do `_id: -1` as a query)
      if (update.messages.length === 0) return fn(null, true, mailbox, []);
      condition.uid = tools.checkRangeQuery(update.messages);
    }

    //
    // NOTE: this is for the API usage which calls this function
    //       (we could have re-used `condition.uid` above however this is more accurate)
    //
    if (update._id) condition._id = update._id;

    this.logger.debug('expunge query', { condition });

    const sql = builder.build({
      type: 'remove',
      table: 'Messages',
      condition,
      returning: [
        '_id',
        'uid',
        'modseq',
        'magic',
        'mimeTree',
        'thread',
        'unseen'
      ],
      // sort required for IMAP UIDPLUS
      sort: 'uid'
    });

    // delete messages
    const messages = session.db.prepare(sql.query).all(sql.values);

    // delete attachments
    try {
      await pMapSeries(messages, async (m) => {
        const attachmentIds = getAttachments(m.mimeTree);
        if (attachmentIds.length > 0)
          await this.attachmentStorage.deleteMany(
            this,
            session,
            attachmentIds,
            m.magic
          );
      });
    } catch (err) {
      err.message = `Error while deleting attachments: ${err.message}`;
      err.isCodeBug = true;
      this.logger.fatal(err, { mailboxId, update, session });
    }

    fn(null, true, mailbox, messages);

    // update storage in background
    updateStorageUsed(session.user.alias_id, this.client)
      .then()
      .catch((err) => this.logger.fatal(err, { mailboxId, update, session }));
  } catch (err) {
    fn(refineAndLogError(err, session, true, this));
  }
}

module.exports = onExpunge;
