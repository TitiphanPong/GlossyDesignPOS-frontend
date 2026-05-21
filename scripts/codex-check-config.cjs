const { writeGithubOutput } = require('./codex-queue-utils.cjs');

function main() {
  const openAiKey = (process.env.OPENAI_API_KEY || '').trim();

  if (!openAiKey) {
    const reason = 'OPENAI_API_KEY repository secret is missing.';
    writeGithubOutput({
      config_ok: 'false',
      config_status: 'blocked',
      config_reason: reason,
    });
    process.stdout.write(`${reason}\n`);
    return;
  }

  writeGithubOutput({
    config_ok: 'true',
    config_status: 'ok',
    config_reason: 'Required automation secrets are configured.',
  });
  process.stdout.write('Automation config check passed.\n');
}

main();
