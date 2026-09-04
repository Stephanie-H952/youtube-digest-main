/**
 * Shared, non-secret configuration helpers.
 *
 * API keys are stored in chrome.storage.local by options.js. This file contains
 * defaults and validation only, so it is safe to publish.
 */
var YTD_SETTINGS = (() => {
  const STORAGE_KEY = "ytd_settings";
  const DEFAULTS = Object.freeze({
    provider: "anthropic",
    aiApiKey: "",
    aiBaseUrl: "https://api.anthropic.com/v1",
    aiModel: "claude-sonnet-5",
    supadataApiKey: "",
  });

  function isLegacyAiProvider(input) {
    if (!input) return false;
    const hasOwn = (key) => Object.prototype.hasOwnProperty.call(input, key);
    if (!hasOwn("provider") && !hasOwn("aiBaseUrl") && !hasOwn("aiModel")) {
      return typeof input.aiApiKey === "string" && !!input.aiApiKey.trim();
    }
    return (
      (hasOwn("provider") && input.provider !== DEFAULTS.provider) ||
      (hasOwn("aiBaseUrl") &&
        typeof input.aiBaseUrl === "string" &&
        input.aiBaseUrl !== DEFAULTS.aiBaseUrl) ||
      (hasOwn("aiModel") &&
        typeof input.aiModel === "string" &&
        input.aiModel !== DEFAULTS.aiModel)
    );
  }

  function normalize(input = {}) {
    return {
      provider: DEFAULTS.provider,
      aiApiKey: isLegacyAiProvider(input)
        ? ""
        : typeof input.aiApiKey === "string"
          ? input.aiApiKey.trim()
          : "",
      aiBaseUrl: DEFAULTS.aiBaseUrl,
      aiModel: DEFAULTS.aiModel,
      supadataApiKey:
        typeof input.supadataApiKey === "string"
          ? input.supadataApiKey.trim()
          : "",
    };
  }

  function migrateLegacyCustom(input = {}) {
    return {
      settings: normalize(input),
      migrated: isLegacyAiProvider(input),
    };
  }

  function aiMessagesUrl() {
    return `${DEFAULTS.aiBaseUrl}/messages`;
  }

  function canonicalYouTubeUrl(videoId) {
    const normalized = String(videoId || "").trim();
    if (!/^[A-Za-z0-9_-]{6,20}$/.test(normalized)) {
      throw new Error("Invalid YouTube video ID.");
    }
    return `https://www.youtube.com/watch?v=${normalized}`;
  }

  return {
    STORAGE_KEY,
    DEFAULTS,
    isLegacyAiProvider,
    normalize,
    migrateLegacyCustom,
    aiMessagesUrl,
    canonicalYouTubeUrl,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = YTD_SETTINGS;
}
