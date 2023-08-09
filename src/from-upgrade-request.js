"use strict";

const PerMessageDeflate = require("ws/lib/permessage-deflate");
const WsExtensions = require("ws/lib/extension");

const WsTransformStream = require("./ws-transform-stream");

const DEFLATE_EXT_NAME = PerMessageDeflate.extensionName;

function getHeader(source, name) {
  if (!source || typeof source !== "object") {
    return;
  }

  if (source && typeof source.getHeader == "function") {
    return source.getHeader(name) || source.getHeader(name.toLowerCase());
  }

  if (source && typeof source.get == "function") {
    return source.get(name) || source.get(name.toLowerCase());
  }

  if (source && typeof source.headers == "object") {
    return source.headers[name] || source.headers[name.toLowerCase()];
  }

  return source[name] || source[name.toLowerCase()];
}

function fromUpgradeHeaders(upgradeReqOrHeaders, options = {}) {
  options.receiver = options.receiver || {};
  options.sender = options.sender || {};

  for (const side of ["receiver", "sender"]) {
    try {
      // if (!upgradeReqOrHeaders[side]) {
      //     continue;
      // }

      const extHeader = getHeader(upgradeReqOrHeaders, "Sec-Websocket-Extensions");
      const extensions = extHeader && WsExtensions.parse(extHeader);

      const sideOptions = options[side];

      // they want to enable PerMessageDeflate
      if (extensions[DEFLATE_EXT_NAME]) {
        sideOptions.extensions = sideOptions.extensions || {};
        sideOptions.extensions[DEFLATE_EXT_NAME] = new PerMessageDeflate(
          {},
          side === "receiver",
          sideOptions.maxPayload
        );
        sideOptions.extensions[DEFLATE_EXT_NAME].accept(extensions[DEFLATE_EXT_NAME]);
        options.compress = true;
      }
    } catch (err) {
      // silently fail, server/client will handle the errors in negotiation
      if (options[side] && options[side].extensions) delete options[side].extensions[DEFLATE_EXT_NAME];
    }
  }
  return new WsTransformStream(options);
}

module.exports = fromUpgradeHeaders;
