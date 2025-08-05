/**
 * Copyright (c) Forward Email LLC
 * SPDX-License-Identifier: BUSL-1.1
 */

const os = require('node:os');
const { callbackify } = require('node:util');
const { isIP } = require('node:net');

const Axe = require('axe');
const ip = require('ip');
const isFQDN = require('is-fqdn');
const isSANB = require('is-string-and-not-blank');
const ms = require('ms');
const mxConnect = require('mx-connect');
const nodemailer = require('nodemailer');
const pify = require('pify');

const isRetryableError = require('./is-retryable-error');
const isSSLError = require('./is-ssl-error');
const isSocketError = require('./is-socket-error');
const isTLSError = require('./is-tls-error');
const parseRootDomain = require('./parse-root-domain');

const env = require('#config/env');
const config = require('#config');

const asyncMxConnect = pify(mxConnect);
const maxConnectTime = ms('1m');

const transporterConfig = {
  debug: config.env !== 'test',
  transactionLog: config.env !== 'test',
  // mirrors the queue configuration 60s timeout
  connectionTimeout: config.smtpQueueTimeout,
  greetingTimeout: config.smtpQueueTimeout,
  socketTimeout: config.smtpQueueTimeout,
  dnsTimeout: config.smtpQueueTimeout
};

//
// list of hosts that only allow up to 10 concurrent connections per IP
//
/*
const CONCURRENT_HOSTS = new Set([
  'aol.com',
  'cox.net',
  'comcast.net',
  'centurylink.net',
  'centurytel.net',
  'embarqmail.com',
  'frontier.com',
  'frontiernet.net',
  'gallatinriver.net',
  'infinitummail.com',
  'netscape.net',
  'optimum.net',
  'optonline.net',
  'prodigy.net.mx',
  'q.com',
  'rocketmail.com',
  'suddenlink.net',
  'verizon.net',
  'yahoo.co.in',
  'yahoo.co.uk',
  'yahoo.com',
  'yahoo.com.mx',
  'ymail.com',
  'yahoodns.net'
]);
*/

// <https://github.com/MicrosoftDocs/OfficeDocs-Support/blob/public/Exchange/ExchangeOnline/email-delivery/send-receive-emails-socketerror.md#cant-send-or-receive-email-when-using-tls-11-or-tls-10>
// <https://blogs.office.com/2013/04/17/outlook-com-gets-two-step-verification-sign-in-by-alias-and-new-international-domains/>
const OUTLOOK_HOSTS = new Set([
  'hotmail.ac',
  'hotmail.at',
  'hotmail.ba',
  'hotmail.be',
  'hotmail.bs',
  'hotmail.ca',
  'hotmail.ch',
  'hotmail.cl',
  'hotmail.co.at',
  'hotmail.co.il',
  'hotmail.co.ug',
  'hotmail.co.uk',
  'hotmail.co.ve',
  'hotmail.co.za',
  'hotmail.com',
  'hotmail.com.ar',
  'hotmail.com.au',
  'hotmail.com.br',
  'hotmail.com.do',
  'hotmail.com.ly',
  'hotmail.com.pl',
  'hotmail.com.ro',
  'hotmail.com.tr',
  'hotmail.com.ve',
  'hotmail.de',
  'hotmail.dk',
  'hotmail.ee',
  'hotmail.es',
  'hotmail.fi',
  'hotmail.fr',
  'hotmail.gr',
  'hotmail.hu',
  'hotmail.ie',
  'hotmail.it',
  'hotmail.lt',
  'hotmail.lu',
  'hotmail.lv',
  'hotmail.nl',
  'hotmail.no',
  'hotmail.pt',
  'hotmail.se',
  'hotmail.sk',
  'live.at',
  'live.be',
  'live.ca',
  'live.cl',
  'live.co.uk',
  'live.com',
  'live.com.ar',
  'live.com.co',
  'live.com.mx',
  'live.com.pe',
  'live.com.ve',
  'live.de',
  'live.dk',
  'live.fi',
  'live.fr',
  'live.it',
  'live.nl',
  'live.no',
  'live.se',
  'msn.com',
  'msn.nl',
  'outlook.at',
  'outlook.be',
  'outlook.bz',
  'outlook.cl',
  'outlook.co',
  'outlook.co.cr',
  'outlook.co.il',
  'outlook.co.th',
  'outlook.com',
  'outlook.com.ar',
  'outlook.com.au',
  'outlook.com.br',
  'outlook.com.pe',
  'outlook.com.py',
  'outlook.com.tr',
  'outlook.cz',
  'outlook.de',
  'outlook.dk',
  'outlook.ec',
  'outlook.es',
  'outlook.fr',
  'outlook.hn',
  'outlook.ht',
  'outlook.hu',
  'outlook.ie',
  'outlook.in',
  'outlook.it',
  'outlook.jp',
  'outlook.kr',
  'outlook.lv',
  'outlook.mx',
  'outlook.my',
  'outlook.pa',
  'outlook.pt',
  'outlook.sa',
  'outlook.sg',
  'outlook.sk',
  'outlook.uy',
  'passport.com',
  'webtv.net',
  'windowslive.com',
  'hotmail.co.uk',
  'hotmail.com',
  'hotmail.fr',
  'live.co.za',
  'live.com',
  'microsoft.com',
  'msn.com',
  'outlook.co.uk',
  'outlook.com'
]);

const HOSTNAME = os.hostname();
const IP_ADDRESS = ip.address();

async function getTransporter(options = {}, err) {
  const {
    ignoreMXHosts,
    mxLastError,
    target,
    port,
    resolver,
    logger,
    cache
    // client
  } = options;

  // safeguard to ensure port is always a number
  if (typeof port === 'string') throw new TypeError('Port must be a number');

  let mx = {
    host: target,
    port
  };

  //
  // TODO: rewrite to use SMTPConnection object instead of nodemailer
  //       <https://github.com/nodemailer/nodemailer/issues/1575>
  //

  // this is required since custom port forwarding would be recursive otherwise
  if (env.NODE_ENV === 'test' || port === 25) {
    // <https://github.com/zone-eu/mx-connect#configuration-options>
    mx = await asyncMxConnect({
      ignoreMXHosts,
      mxLastError,
      target,
      port,
      localAddress: IP_ADDRESS,
      localHostname: HOSTNAME,
      // the default in mx-connect is 300s (5 min)
      // <https://github.com/zone-eu/mx-connect/blob/f9e20ceff5a4a7cfb85fba58ca2f040aaa7c2358/lib/get-connection.js#L6>
      maxConnectTime,
      dnsOptions: {
        // NOTE: if we merge code then this will need adjusted
        blockLocalAddresses: env.NODE_ENV !== 'test',
        // <https://github.com/zone-eu/mx-connect/pull/4>
        resolve: callbackify(resolver.resolve.bind(resolver))
      },
      mtaSts: {
        enabled: config.env !== 'test',
        logger(results) {
          logger[results.success ? 'info' : 'error']('MTA-STS', {
            results
          });
        },
        cache
      }
    });
  }

  //
  // if the SMTP response was from trusted root host and it was rejected for spam
  // then denylist the sender (probably a low-reputation domain name spammer)
  //
  let truthSource = false;
  if (
    mx &&
    isSANB(mx.hostname) &&
    isFQDN(mx.hostname) &&
    config.truthSources.has(parseRootDomain(mx.hostname))
  )
    truthSource = parseRootDomain(mx.hostname);

  const requireTLS = Boolean(
    Boolean(mx.policyMatch && mx.policyMatch.mode === 'enforce') ||
      (truthSource && OUTLOOK_HOSTS.has(truthSource)) ||
      (truthSource && truthSource === 'google.com')
  );

  //
  // attempt to send the email with TLS
  //
  const tls = {
    minVersion: requireTLS ? 'TLSv1.2' : 'TLSv1',
    // ignore self-signed cert warnings if we are forwarding to a custom port
    // (since a lot of sysadmins generate self-signed certs or forget to renew)
    rejectUnauthorized: requireTLS && mx.port === 25
  };

  if (isFQDN(mx.hostname)) tls.servername = mx.hostname;

  // <https://github.com/nodemailer/nodemailer/issues/1517>
  // <https://gist.github.com/andris9/a13d9b327ea81d620ea89926d2097921>
  if (!mx.socket && !isIP(mx.host) && isFQDN(mx.host)) {
    try {
      const [host] = await resolver.resolve(mx.host);
      if (isIP(host)) mx.host = host;
    } catch (err) {
      // NOTE: these are mostly ETIMEDOUT
      if (isRetryableError(err)) logger.debug(err);
      else logger.error(err);
    }
  }

  // if there was a TLS, SSL, or ECONNRESET then attempt to ignore STARTTLS
  const ignoreTLS = Boolean(
    !requireTLS &&
      err &&
      (isSocketError(err) ||
        isSSLError(err) ||
        isTLSError(err) ||
        err.code === 'ECONNRESET')
  );

  const opportunisticTLS = Boolean(!requireTLS && !ignoreTLS);

  const transporter = nodemailer.createTransport({
    ...transporterConfig,
    secure: false,
    secured: false,
    logger: new Axe({ silent: true }),
    name: HOSTNAME,
    requireTLS,
    ignoreTLS,
    opportunisticTLS,
    tls,
    host: mx.host,
    port: mx.port,
    ...(mx.socket ? { connection: mx.socket } : {})
  });

  return {
    truthSource,
    mx,
    requireTLS,
    ignoreTLS,
    opportunisticTLS,
    tls,
    transporter
  };
}

module.exports = getTransporter;
