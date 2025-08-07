/**
 * Copyright (c) Forward Email LLC
 * SPDX-License-Identifier: BUSL-1.1
 */

const dayjs = require('dayjs-with-plugins');
const humanize = require('humanize-string');
const titleize = require('titleize');
const _ = require('#helpers/lodash');

const Logs = require('#models/logs');

function makeDelimitedString(arr) {
  // <https://stackoverflow.com/a/17808731>
  return `"${arr
    .map((a) => (a || '').toString().trim().replaceAll('"', '""'))
    .join('","')}"`;
}

async function getLogsCsv(now = new Date(), query = {}, isAdmin = false) {
  if (!_.isObject(query) || _.isEmpty(query)) throw new Error('Invalid query');

  //
  // spreadsheet looks like this:
  //
  const csv = [];

  csv.push(
    makeDelimitedString([
      'Log ID',
      'Session ID',
      'Date',
      'Level',
      'Bounce Category',
      'Bounce Action',
      'Truth Source',
      'SMTP Response',
      'SMTP Code',
      'From',
      'From Allowlisted',
      'To',
      'Subject',
      'Message-ID',
      'MAIL FROM',
      'RCPT TO',
      'Client IP',
      'Client Hostname',
      'Client Allowlisted',
      'Target Host',
      'Target MX Hostname',
      'Target MX IP',
      'Target Type',
      'Opportunistic TLS',
      'Require TLS',
      'MX Hostname',
      'MX IP',
      'SPF',
      'DKIM'
    ])
  );

  const categories = [];

  const set = new Set();

  //
  // bounces for both MX servers and SMTP servers are stored in logs
  // (e.g. since we use `createSession` approach to mirror MX behavior)
  //
  // eslint-disable-next-line unicorn/no-array-callback-reference
  for await (const log of Logs.find(query)
    .sort({ created_at: 1 })
    .cursor()
    .addCursorFlag('noCursorTimeout', true)) {
    if (!log?.meta?.session?.id) continue;
    let response =
      log?.err?.response ||
      log?.err?.message ||
      log?.meta?.info?.response ||
      log.message;
    if (!isAdmin && log?.err?.isCodeBug === true)
      response = 'An unexpected internal server error has occurred';
    // add new row to spreadsheet
    csv.push(
      makeDelimitedString([
        // ID
        log.id,
        // Session ID
        log.meta.session.id,
        // Date
        dayjs(log.created_at).toISOString(),
        // Level
        log?.meta?.level,
        // Bounce Category
        log.bounce_category || 'none',
        // Bounce Action
        log?.err?.bounceInfo?.action || 'none',
        // Truth Source
        log?.err?.truthSource && log?.err?.truthSource
          ? log.err.truthSource
          : '',
        // SMTP Response
        response,
        // SMTP Code
        log?.err?.responseCode,
        // From
        log?.meta?.session?.originalFromAddress || '',
        // From Allowlisted
        log?.meta?.session?.isOriginalFromAddressAllowlisted ? 'true' : 'false',
        // To
        log?.err?.envelope?.to || log?.meta?.session?.headers?.To || '',
        // Subject
        log?.meta?.session?.headers && log.meta.session.headers.Subject
          ? log.meta.session.headers.Subject
          : '',
        // Message-ID
        log?.meta?.session?.headers && log.meta.session.headers['Message-ID']
          ? log.meta.session.headers['Message-ID']
          : '',
        // MAIL FROM
        log?.meta?.session?.envelope?.mailFrom?.address || '',
        // RCPT TO
        log?.meta?.session?.envelope?.rcptTo
          ? log.meta.session.envelope.rcptTo.map((to) => to.address).join(' ')
          : '',
        // Client IP
        log?.meta?.session?.remoteAddress,
        // Client Hostname
        log?.meta?.session?.resolvedClientHostname || '',
        // Client Allowlisted
        log?.meta?.session?.isAllowlisted ? 'true' : 'false',
        // Target Host
        log?.err?.target || '',
        // Target MX Hostname
        log?.err?.mx?.hostname || '',
        // Target MX IP
        log?.err?.mx?.host || '',
        // Target Type
        typeof log?.err?.mx?.ipv4 === 'boolean'
          ? log.err.mx.ipv4
            ? 'IPv4'
            : 'IPv6'
          : '',
        // Opportunistic TLS
        typeof log?.err?.opportunisticTLS === 'boolean'
          ? log.err.opportunisticTLS
            ? 'true'
            : 'false'
          : '',
        // Require TLS
        typeof log?.err?.requireTLS === 'boolean'
          ? log.err.requireTLS
            ? 'true'
            : 'false'
          : '',
        // MX Hostname
        log?.meta?.app?.hostname || '',
        // MX IP
        log?.meta?.app?.ip || '',
        // SPF
        log?.meta?.session?.spf?.status?.result || '',
        // DKIM
        log?.meta?.session?.hadAlignedAndPassingDKIM ? 'true' : 'false'
      ])
    );

    if (!Number.isFinite(categories[log.bounce_category]))
      categories[log.bounce_category] = 0;

    // generic category counter
    categories[log.bounce_category]++;

    // truth source blocklist category counter
    if (log.bounce_category === 'blocklist' && log?.err?.truthSource)
      set.add(log.err.truthSource);
  }

  // super rudimentary and simple string concatenation
  const list = [];
  for (const key of Object.keys(categories).sort()) {
    list.push(
      `<li><strong>${titleize(humanize(key))}:</strong> ${categories[key]}</li>`
    );
  }

  const message = [];
  const count = csv.length - 1;

  if (count === 0)
    message.push(
      `<p>No logs were available to download from ${dayjs(now).format(
        'M/D/YY h:mm A z'
      )}.</p>`
    );
  else
    message.push(
      `<p>Log download from ${dayjs(now).format('M/D/YY h:mm A z')}:</p>`
    );

  if (list.length > 0) {
    message.push(`<ul>`, ...list, `</ul>`);
  }

  if (set.size > 0) {
    message.push(
      `<p>Trusted hosts that were blocked:</p>`,
      `<ul><li>${[...set]
        .sort()
        .map((h) => `<code>${h}</code>`)
        .join('</li><li>')}</li></ul>`
    );
  }

  const subject = `(${count}) Email Deliverability Logs for ${dayjs(now).format(
    'M/D/YY h:mm A z'
  )} (${set.size} trusted hosts blocked)`;

  const filename = `email-deliverability-logs-${dayjs(now).format(
    'YYYY-MM-DD-h-mm-A-z'
  )}.csv`.toLowerCase();

  return {
    subject,
    filename,
    count,
    csv: csv.join('\n'),
    set,
    message: message.join('\n')
  };
}

module.exports = getLogsCsv;
