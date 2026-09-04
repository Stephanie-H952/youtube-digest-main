const test = require("node:test");
const assert = require("node:assert/strict");

const settings = require("../settings.js");

test("Anthropic defaults use Claude", () => {
  const normalized = settings.normalize({
    provider: "unexpected",
    aiApiKey: "  example-key  ",
    aiBaseUrl: "https://api.example.com/v1",
    aiModel: "example-model",
    supadataApiKey: "  example-supadata  ",
  });

  assert.equal(normalized.provider, "anthropic");
  assert.equal(normalized.aiBaseUrl, "https://api.anthropic.com/v1");
  assert.equal(normalized.aiModel, "claude-sonnet-5");
  assert.equal(normalized.aiApiKey, "");
  assert.equal(normalized.supadataApiKey, "example-supadata");
  assert.equal(
    settings.aiMessagesUrl(),
    "https://api.anthropic.com/v1/messages",
  );
});

test("legacy AI provider migration clears only the AI key and is idempotent", () => {
  const legacy = {
    provider: "deepseek",
    aiApiKey: "custom-secret",
    aiBaseUrl: "https://api.deepseek.com",
    aiModel: "deepseek-v4-flash",
    supadataApiKey: " supadata-secret ",
  };
  const first = settings.migrateLegacyCustom(legacy);

  assert.equal(first.migrated, true);
  assert.equal(first.settings.provider, "anthropic");
  assert.equal(first.settings.aiBaseUrl, settings.DEFAULTS.aiBaseUrl);
  assert.equal(first.settings.aiModel, settings.DEFAULTS.aiModel);
  assert.equal(first.settings.aiApiKey, "");
  assert.equal(first.settings.supadataApiKey, "supadata-secret");

  const second = settings.migrateLegacyCustom(first.settings);
  assert.equal(second.migrated, false);
  assert.deepEqual(second.settings, first.settings);

  const configuredClaude = settings.normalize({
    ...first.settings,
    aiApiKey: "new-claude-key",
  });
  assert.equal(configuredClaude.aiApiKey, "new-claude-key");
});

test("missing settings normalize to Claude defaults without a migration warning", () => {
  const migration = settings.migrateLegacyCustom(undefined);

  assert.equal(migration.migrated, false);
  assert.equal(migration.settings.provider, "anthropic");
  assert.equal(migration.settings.aiApiKey, "");
  assert.equal(migration.settings.aiBaseUrl, "https://api.anthropic.com/v1");
  assert.equal(migration.settings.aiModel, "claude-sonnet-5");
});

test("Supadata receives a canonical YouTube URL", () => {
  assert.equal(
    settings.canonicalYouTubeUrl("ydTeb_I0b94"),
    "https://www.youtube.com/watch?v=ydTeb_I0b94",
  );
  assert.throws(
    () => settings.canonicalYouTubeUrl('"><script>'),
    /Invalid YouTube video ID/,
  );
});
