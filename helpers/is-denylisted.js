/**
 * Copyright (c) Forward Email LLC
 * SPDX-License-Identifier: BUSL-1.1
 */

const punycode = require('node:punycode');
const { isIP } = require('node:net');

const isFQDN = require('is-fqdn');
const { boolean } = require('boolean');
const isEmail = require('#helpers/is-email');

const DenylistError = require('#helpers/denylist-error');
const config = require('#config');
const isAllowlisted = require('#helpers/is-allowlisted');
const parseRootDomain = require('#helpers/parse-root-domain');
const parseHostFromDomainOrAddress = require('#helpers/parse-host-from-domain-or-address');

function createDenylistError(val, code = 421) {
  let str = 'value';
  if (isEmail(val)) str = 'address';
  else if (isIP(val)) str = 'IP';
  else if (isFQDN(val)) str = 'domain';
  return new DenylistError(
    `The ${str} ${val} is denylisted by ${
      config.urls.web
    } ; To request removal, you must visit ${
      config.urls.web
    }/denylist?q=${encodeURIComponent(val)} ;`,
    code,
    val
  );
}

async function isDenylisted(value, client, resolver) {
  if (!Array.isArray(value)) value = [value];

  // lowercase and trim all the values
  value = value.map((v) => punycode.toASCII(v).toLowerCase().trim());

  for (const v of value) {
    // if the value was in hard-coded denylist then exit early
    if (config.denylist.has(v)) throw createDenylistError(v, 550);

    // if it was an email address then check domain and root domain (if differs) against hard-coded denylist
    if (isEmail(v)) {
      const domain = parseHostFromDomainOrAddress(v);
      if (config.denylist.has(domain)) throw createDenylistError(domain, 550);
      const root = parseRootDomain(domain);
      if (domain !== root && config.denylist.has(root))
        throw createDenylistError(root, 550);
    }

    // if it was a domain name then check root domain against hard-coded denylist if differs
    if (isFQDN(v)) {
      if (config.denylist.has(v)) throw createDenylistError(v, 550);
      const root = parseRootDomain(v);
      if (v !== root && config.denylist.has(root))
        throw createDenylistError(root, 550);
      //
      // TODO: we need to ensure we're not adding this in `jobs/update-umbrella.js`
      //
      // if it ends with any of the test/restricted extensions return false
      if (config.testDomains.some((s) => v.endsWith(`.${s}`)))
        throw createDenylistError(v);
    }

    // if allowlisted return early
    // (note this does a reverse lookup on IP address to check hostname of IP against allowlist too)

    if (await isAllowlisted(v, client, resolver)) continue;

    // TODO: if it was a FQDN then lookup A records for domain and root domain (?)

    //
    // check if the root domain is allowlisted but IFF the value was different
    // (only applies to email and FQDN values)
    //
    if (isEmail(v) || isFQDN(v)) {
      const root = parseRootDomain(
        isFQDN(v) ? v : parseHostFromDomainOrAddress(v)
      );

      if (root !== v) {
        if (config.denylist.has(root)) throw createDenylistError(root, 550);

        const isRootDomainAllowlisted = client
          ? await isAllowlisted(root, client, resolver)
          : false;
        //
        // if the root domain was allowlisted and it was an email
        // then we need to check the combination of:
        // `denylist:email` against the denylist
        //
        // (this is a safeguard in case the email is not denylisted but domain:email is)
        //
        if (isRootDomainAllowlisted) {
          if (isEmail(v)) {
            const result = await client.get(`denylist:${v}`);

            if (boolean(result)) throw createDenylistError(v);
          }

          continue;
        }

        // check redis denylist on root domain

        const isRootDomainDenylisted = await client.get(`denylist:${root}`);

        if (boolean(isRootDomainDenylisted)) throw createDenylistError(root);
      }
    }

    const denylisted = await client.get(`denylist:${v}`);

    if (boolean(denylisted)) throw createDenylistError(v);
  }
}

module.exports = isDenylisted;
