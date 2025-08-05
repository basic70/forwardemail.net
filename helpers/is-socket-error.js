/**
 * Copyright (c) Forward Email LLC
 * SPDX-License-Identifier: BUSL-1.1
 */

function isSocketError(err) {
  if (typeof err !== 'object') return false;
  // socket is not connected
  if (err?.code === 'ENOTCONN') return true;
  if (err?.code === 'ENOTSOCK') return true;
  for (const key of ['message', 'response']) {
    if (typeof err[key] !== 'string') continue;
    if (
      err[key].includes('Connection closed') ||
      err[key].includes('Connection pool was closed') ||
      err[key].includes('Connection closed unexpectedly') ||
      err[key].includes('Socket closed unexpectedly') ||
      err[key].includes('Unexpected socket close') ||
      err[key].includes('socket is already destroyed') ||
      err[key].includes('socket is already half-closed')
    )
      return true;
  }

  return false;
}

module.exports = isSocketError;
