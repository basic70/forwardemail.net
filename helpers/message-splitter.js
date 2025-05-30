/**
 * Copyright (c) Forward Email LLC
 * SPDX-License-Identifier: BUSL-1.1
 */

const { Buffer } = require('node:buffer');
const { Transform } = require('node:stream');

//
// Many thanks to Andris Reissman
// <https://gist.github.com/andris9/94e73deef71640322c422b27cded5add>
//
const bytes = require('@forwardemail/bytes');
const { Headers } = require('mailsplit');
const { Iconv } = require('iconv');

/**
 * MessageSplitter instance is a transform stream that separates message headers
 * from the rest of the body. Headers are emitted with the 'headers' event. Message
 * body is passed on as the resulting stream.
 */
class MessageSplitter extends Transform {
  constructor(options = {}) {
    super(options);
    this.lastBytes = Buffer.alloc(4);
    this.headersParsed = false;
    this.headerBytes = 0;
    this.headerChunks = [];
    this.rawHeaders = false;
    // this.bodySize = 0;
    this.dataBytes = 0;
    this._maxBytes =
      (options.maxBytes && Number(options.maxBytes)) ||
      Number.POSITIVE_INFINITY;
    this.sizeExceeded = false;
  }

  /**
   * Keeps count of the last 4 bytes in order to detect line breaks on chunk boundaries
   *
   * @param {Buffer} data Next data chunk from the stream
   */
  _updateLastBytes(data) {
    const lblen = this.lastBytes.length;
    const nblen = Math.min(data.length, lblen);

    // shift existing bytes
    for (let i = 0, length = lblen - nblen; i < length; i++) {
      this.lastBytes[i] = this.lastBytes[i + nblen];
    }

    // add new bytes
    for (let i = 1; i <= nblen; i++) {
      this.lastBytes[lblen - i] = data[data.length - i];
    }
  }

  /**
   * Finds and removes message headers from the remaining body. We want to keep
   * headers separated until final delivery to be able to modify these
   *
   * @param {Buffer} data Next chunk of data
   * @return {Boolean} Returns true if headers are already found or false otherwise
   */
  _checkHeaders(data) {
    if (this.headersParsed) {
      return true;
    }

    const lblen = this.lastBytes.length;
    let headerPos = 0;
    this.curLinePos = 0;
    for (
      let i = 0, length = this.lastBytes.length + data.length;
      i < length;
      i++
    ) {
      const chr = i < lblen ? this.lastBytes[i] : data[i - lblen];

      if (chr === 0x0a && i) {
        const pr1 = i - 1 < lblen ? this.lastBytes[i - 1] : data[i - 1 - lblen];
        const pr2 =
          i > 1
            ? i - 2 < lblen
              ? this.lastBytes[i - 2]
              : data[i - 2 - lblen]
            : false;
        if (pr1 === 0x0a) {
          this.headersParsed = true;
          headerPos = i - lblen + 1;
          this.headerBytes += headerPos;
          break;
        } else if (pr1 === 0x0d && pr2 === 0x0a) {
          this.headersParsed = true;
          headerPos = i - lblen + 1;
          this.headerBytes += headerPos;
          break;
        }
      }
    }

    if (this.headersParsed) {
      this.headerChunks.push(data.slice(0, headerPos));
      this.rawHeaders = Buffer.concat(this.headerChunks, this.headerBytes);
      this.headerChunks = null;
      this.headers = new Headers(this.rawHeaders, { Iconv });
      // this.emit('headers', this.headers);

      // <https://github.com/nodemailer/wildduck/issues/781>
      if (data.length - 1 >= headerPos) {
        const chunk = data.slice(headerPos);
        // this.bodySize += chunk.length;

        // this would be the first chunk of data sent downstream
        // from now on we keep header and body separated until final delivery
        setImmediate(() => this.push(chunk));
      }

      return false;
    }

    this.headerBytes += data.length;
    this.headerChunks.push(data);

    // store last 4 bytes to catch header break
    this._updateLastBytes(data);

    return false;
  }

  _transform(chunk, encoding, callback) {
    if (!chunk || chunk.length === 0) return callback();

    // stop reading if max size reached
    this.dataBytes += chunk.length;
    this.sizeExceeded = this.dataBytes > this._maxBytes;
    if (this.sizeExceeded) {
      const err = new Error(`Email size of ${bytes(this._maxBytes)} exceeded.`);
      err.responseCode = 552;
      return callback(err);
    }

    if (typeof chunk === 'string') chunk = Buffer.from(chunk, encoding);

    let headersFound;

    try {
      headersFound = this._checkHeaders(chunk);
    } catch (err) {
      return callback(err);
    }

    if (headersFound) {
      // this.bodySize += chunk.length;
      this.push(chunk);
    }

    setImmediate(callback);
  }

  _flush(callback) {
    if (this.headerChunks) {
      // all chunks are checked but we did not find where the body starts
      // so emit all we got as headers and push empty line as body
      this.headersParsed = true;
      // add header terminator
      this.headerChunks.push(Buffer.from('\r\n\r\n'));
      this.headerBytes += 4;
      // join all chunks into a header block
      this.rawHeaders = Buffer.concat(this.headerChunks, this.headerBytes);

      this.headers = new Headers(this.rawHeaders, { Iconv });

      // this.emit('headers', this.headers);
      this.headerChunks = null;

      // this is our body
      this.push(Buffer.from('\r\n'));
    }

    callback();
  }
}

module.exports = MessageSplitter;
