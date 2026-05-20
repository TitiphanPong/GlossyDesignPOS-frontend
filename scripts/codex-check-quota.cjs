const { writeGithubOutput } = require('./codex-queue-utils.cjs');

function parseNumber(value) {
  const normalized = String(value ?? '').trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function sumCosts(payload) {
  return (payload.data || []).reduce((total, bucket) => {
    const bucketTotal = (bucket.results || []).reduce((subtotal, result) => {
      const amount = Number(result?.amount?.value || 0);
      return subtotal + (Number.isFinite(amount) ? amount : 0);
    }, 0);
    return total + bucketTotal;
  }, 0);
}

function monthStartUnixSeconds() {
  const now = new Date();
  return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) / 1000);
}

async function fetchCosts({ adminKey, startTime, endTime, projectId }) {
  const url = new URL('https://api.openai.com/v1/organization/costs');
  url.searchParams.set('start_time', String(startTime));
  url.searchParams.set('end_time', String(endTime));
  url.searchParams.set('bucket_width', '1d');
  if (projectId) {
    url.searchParams.append('project_ids[]', projectId);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${adminKey}`,
      'Content-Type': 'application/json',
    },
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(`OpenAI costs request failed (${response.status}): ${JSON.stringify(body)}`);
  }

  return sumCosts(body);
}

async function main() {
  const adminKey = process.env.OPENAI_ADMIN_API_KEY || '';
  const dailyLimit = parseNumber(process.env.OPENAI_DAILY_USD_LIMIT);
  const monthlyLimit = parseNumber(process.env.OPENAI_MONTHLY_USD_LIMIT);
  const projectId = (process.env.OPENAI_PROJECT_ID || '').trim();

  const limitsEnabled = dailyLimit != null || monthlyLimit != null;
  if (!limitsEnabled) {
    writeGithubOutput({
      quota_ok: 'true',
      quota_status: 'disabled',
      quota_reason: 'No quota limits configured.',
      daily_spend_usd: '',
      monthly_spend_usd: '',
    });
    process.stdout.write('Quota guard disabled because no thresholds are configured.\n');
    return;
  }

  if (!adminKey) {
    writeGithubOutput({
      quota_ok: 'false',
      quota_status: 'blocked',
      quota_reason: 'OPENAI_ADMIN_API_KEY is required when quota thresholds are configured.',
      daily_spend_usd: '',
      monthly_spend_usd: '',
    });
    process.stdout.write('Quota guard blocked the run because OPENAI_ADMIN_API_KEY is missing.\n');
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  const dayStart = now - 24 * 60 * 60;
  const monthStart = monthStartUnixSeconds();

  const [dailySpend, monthlySpend] = await Promise.all([
    dailyLimit != null ? fetchCosts({ adminKey, startTime: dayStart, endTime: now, projectId }) : Promise.resolve(null),
    monthlyLimit != null ? fetchCosts({ adminKey, startTime: monthStart, endTime: now, projectId }) : Promise.resolve(null),
  ]);

  const exceededDaily = dailyLimit != null && dailySpend > dailyLimit;
  const exceededMonthly = monthlyLimit != null && monthlySpend > monthlyLimit;
  const quotaOk = !exceededDaily && !exceededMonthly;

  const reasons = [];
  if (exceededDaily) {
    reasons.push(`24h spend $${dailySpend.toFixed(2)} exceeded limit $${dailyLimit.toFixed(2)}`);
  }
  if (exceededMonthly) {
    reasons.push(`month-to-date spend $${monthlySpend.toFixed(2)} exceeded limit $${monthlyLimit.toFixed(2)}`);
  }

  writeGithubOutput({
    quota_ok: quotaOk ? 'true' : 'false',
    quota_status: quotaOk ? 'ok' : 'blocked',
    quota_reason: quotaOk ? 'Quota check passed.' : reasons.join('; '),
    daily_spend_usd: dailySpend == null ? '' : dailySpend.toFixed(2),
    monthly_spend_usd: monthlySpend == null ? '' : monthlySpend.toFixed(2),
  });

  process.stdout.write(
    JSON.stringify(
      {
        quotaOk,
        dailySpend,
        dailyLimit,
        monthlySpend,
        monthlyLimit,
        projectId: projectId || null,
      },
      null,
      2,
    ) + '\n',
  );
}

main().catch(error => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
