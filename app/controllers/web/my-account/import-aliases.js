/**
 * Copyright (c) Forward Email LLC
 * SPDX-License-Identifier: BUSL-1.1
 */

const punycode = require('node:punycode');

const Boom = require('@hapi/boom');
const isFQDN = require('is-fqdn');
const { boolean } = require('boolean');
const { isURL, isIP } = require('@forwardemail/validator');
const _ = require('#helpers/lodash');

const isEmail = require('#helpers/is-email');
const { Domains, Aliases } = require('#models');
const config = require('#config');

async function importAliases(ctx) {
  if (ctx.state.domain.is_global)
    throw Boom.badRequest(ctx.translateError('IS_NOT_ADMIN'));

  let forwardingAddresses;
  let globalForwardingAddresses;
  let ignoredAddresses;
  let errors;
  try {
    ({
      forwardingAddresses,
      globalForwardingAddresses,
      ignoredAddresses,
      errors
    } = await Domains.getTxtAddresses(
      ctx.state.domain.name,
      ctx.locale,
      false,
      ctx.resolver
    ));
  } catch (err) {
    ctx.logger.warn(err);
    if (err.code === 'ENOTFOUND')
      throw Boom.badRequest(ctx.translateError('ENOTFOUND'));
    if (err.code === 'ENODATA')
      throw Boom.badRequest(ctx.translateError('MISSING_DNS_TXT'));
    throw err;
  }

  const existingAliases = await Aliases.find({
    domain: ctx.state.domain._id
  })
    .lean()
    .exec();

  const aliases = [];

  //
  // NOTE: eventually rewrite this, it was a quick hack
  //       (this also conditionally gets invoked every time retrieveDomain controller runs)
  //
  const catchAll = [];

  for (const element of ignoredAddresses) {
    const match = aliases.find((alias) => alias.name === element.name);
    const existing = existingAliases.find(
      (alias) => alias.name === element.name
    );
    if (existing)
      errors.push(
        ctx.translateError(
          'IMPORT_ALIAS_ALREADY_EXISTS',
          element.name,
          element.recipient
        )
      );
    else if (match) {
      if (element.recipient) match.recipients.push(element.recipient);
      else
        errors.push(
          ctx.translateError('IMPORT_ALIAS_DISABLED_NOBODY', element.name)
        );
    } else {
      aliases.push({
        is_enabled: false,
        user: ctx.state.user._id,
        domain: ctx.state.domain._id,
        name: element.name,
        recipients: [element.recipient || ctx.state.user.email],
        error_code_if_disabled: element.error_code_if_disabled || 250
      });
    }
  }

  for (const element of forwardingAddresses) {
    const match = aliases.find((alias) => alias.name === element.name);
    const existing = existingAliases.find(
      (alias) => alias.name === element.name
    );
    if (existing)
      errors.push(
        ctx.translateError(
          'IMPORT_ALIAS_ALREADY_EXISTS',
          element.name,
          element.recipient
        )
      );
    else if (match) match.recipients.push(element.recipient);
    else
      aliases.push({
        user: ctx.state.user._id,
        domain: ctx.state.domain._id,
        name: element.name,
        recipients: [element.recipient]
      });
  }

  for (const element of globalForwardingAddresses) {
    // if it was a fqdn, ip, or email address then add global alias
    // otherwise throw an error that it was an invalid global
    if (
      isFQDN(element) ||
      isIP(element) ||
      isEmail(element) ||
      isURL(element, config.isURLOptions)
    ) {
      const match = aliases.find((alias) => alias.name === '*');
      const existing = existingAliases.find((alias) => alias.name === '*');
      // try to add to existing catch-all record if it wasn't already there
      if (existing) {
        if (existing.recipients.includes(element))
          errors.push(
            ctx.translateError('IMPORT_CATCHALL_ALREADY_INCLUDES', element)
          );
        else catchAll.push(element);
      } else if (match) match.recipients.push(element);
      else
        aliases.push({
          user: ctx.state.user._id,
          domain: ctx.state.domain._id,
          name: '*',
          recipients: [element]
        });
    }
  }

  const messages = [];

  if (aliases.length > 0)
    try {
      const array = await Aliases.create(
        aliases.map((alias) => ({
          ...alias,
          is_api: boolean(ctx.api),
          locale: ctx.locale
        }))
      );
      messages.push(ctx.translate('IMPORT_SUCCESSFUL', array.length));
    } catch (err) {
      messages.push(ctx.translate('IMPORT_ERROR'));
      ctx.logger.error(err);
      errors.push(err);
    }
  else messages.push(ctx.translate('IMPORT_NO_ALIASES_AVAILABLE'));

  if (catchAll.length > 0)
    try {
      const alias = await Aliases.findOne({
        user: ctx.state.user._id,
        domain: ctx.state.domain._id,
        name: '*'
      });
      for (const recipient of catchAll) {
        alias.recipients.push(recipient);
      }

      alias.locale = ctx.locale;
      await alias.save();
      messages.push(
        ctx.translate('IMPORT_CATCHALL_SUCCESSFUL', catchAll.length)
      );
    } catch (err) {
      messages.push(ctx.translate('IMPORT_CATCHALL_ERROR'));
      ctx.logger.error(err);
      errors.push(err);
    }
  else messages.push(ctx.translate('IMPORT_CATCHALL_NONE'));

  errors = _.uniqBy(errors, 'message');

  const message =
    errors.length > 0
      ? `<p>${messages.join(
          ' '
        )}</p><p class="font-weight-bold text-danger">${ctx.translate(
          'ERRORS_OCCURRED'
        )}</p><ul class="mb-0 text-left"><li>${errors
          .map((err) => err.message)
          .join('</li><li>')}</li></ul>`
      : messages.join(' ');

  const redirectTo = ctx.state.l(
    `/my-account/domains/${punycode.toASCII(ctx.state.domain.name)}/aliases`
  );

  if (!ctx.state.hasExistingTXT) {
    if (ctx.accepts('html')) {
      if (!ctx.api) ctx.flash('info', message);
      ctx.redirect(redirectTo);
    } else {
      ctx.body = {
        message,
        redirectTo
      };
    }
  }
}

module.exports = importAliases;
