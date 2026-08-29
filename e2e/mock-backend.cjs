/* eslint-disable @typescript-eslint/no-require-imports */
const http = require('node:http');

const port = Number(process.env.E2E_MOCK_BACKEND_PORT || 4010);
const accessToken = 'e2e-access-token';
const orderId = 'order-e2e-1';
const orderNumber = 'ORD-E2E-0001';
const staffUserId = '64b0000000000000000000aa';
const productionJobId = '64b0000000000000000000bb';
let productionStage = 'file_check';
let productionStageHistory = [{ stage: 'file_check', changedAt: new Date().toISOString(), changedBy: staffUserId }];

function productionJob() {
  return {
    id: productionJobId,
    jobNumber: 'PJ-20260829-E2E00001',
    orderId,
    orderNumber,
    workSummary: 'พิมพ์นามบัตร E2E 100 ใบ',
    jobType: 'นามบัตร',
    dueAt: '2026-08-30T10:00:00.000Z',
    dueAtBangkok: '2026-08-30 17:00:00',
    priority: 'normal',
    isRush: false,
    isOverdue: false,
    assignee: { id: staffUserId, username: 'cashier' },
    internalNote: 'ตรวจ bleed ก่อนผลิต',
    linkedUploadIds: ['GL-20260829-E2E00001'],
    stage: productionStage,
    customerMilestone: productionStage === 'ready' || productionStage === 'delivered' ? (productionStage === 'ready' ? 'ready' : 'completed') : productionStage === 'producing' || productionStage === 'quality_check' ? 'in_progress' : 'received',
    stageHistory: productionStageHistory,
  };
}

function json(response, status, body) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on('data', chunk => chunks.push(chunk));
    request.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

function authorized(request) {
  return request.headers.authorization === `Bearer ${accessToken}`;
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://127.0.0.1:${port}`);

  if (request.method === 'GET' && url.pathname === '/health') {
    return json(response, 200, { status: 'ok' });
  }

  if (request.method === 'POST' && url.pathname === '/auth/login') {
    try {
      const body = await readJson(request);
      if (body.username !== 'cashier' || body.password !== 'e2e-password') {
        return json(response, 401, { message: 'invalid credentials' });
      }
      return json(response, 200, {
        accessToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        user: { username: 'cashier', role: 'staff' },
      });
    } catch {
      return json(response, 400, { message: 'invalid payload' });
    }
  }

  if (request.method === 'GET' && url.pathname === '/auth/me') {
    return authorized(request)
      ? json(response, 200, { user: { id: staffUserId, username: 'cashier', role: 'staff' } })
      : json(response, 401, { message: 'unauthorized' });
  }

  if (request.method === 'POST' && url.pathname === '/auth/logout') {
    return json(response, 200, { ok: true });
  }

  if (request.method === 'POST' && url.pathname === '/uploads') {
    return json(response, 201, {
      id: 'upload-e2e-1',
      originalName: 'smoke.pdf',
      size: 31,
      mimeType: 'application/pdf',
      createdAt: new Date().toISOString(),
      signedUrl: 'https://example.test/e2e-smoke.pdf',
      expiresIn: 900,
    });
  }

  if (!authorized(request)) {
    return json(response, 401, { message: 'unauthorized' });
  }

  if (request.method === 'GET' && url.pathname === '/quick-products') {
    return json(response, 200, [
      {
        id: 'product-e2e-1',
        _id: 'product-e2e-1',
        name: 'E2E A4 Print',
        category: 'Print',
        code: 'E2E-A4',
        typeCode: 'print',
        active: true,
        quickSaleEnabled: true,
        isHotMenu: true,
        quickSaleSortOrder: 1,
        variants: [{ id: 'variant-e2e-1', name: 'Default', price: 25, active: true }],
      },
    ]);
  }

  if (request.method === 'GET' && url.pathname === '/notifications/action-center') {
    return json(response, 200, {
      summary: { total: 0, critical: 0, outstandingAmount: 0, filesWaiting: 0 },
      items: [],
    });
  }

  if (request.method === 'GET' && url.pathname === '/production/jobs/assignees') {
    return json(response, 200, [{ id: staffUserId, username: 'cashier' }]);
  }

  if (request.method === 'GET' && url.pathname === '/production/jobs') {
    const job = productionJob();
    const requestedStage = url.searchParams.get('stage');
    const visible = !requestedStage || requestedStage === job.stage;
    return json(response, 200, { items: visible ? [job] : [], page: 1, limit: 100, total: visible ? 1 : 0, totalPages: 1 });
  }

  if (request.method === 'GET' && url.pathname === `/production/jobs/${productionJobId}`) {
    return json(response, 200, productionJob());
  }

  if (request.method === 'PATCH' && url.pathname === `/production/jobs/${productionJobId}/stage`) {
    const body = await readJson(request);
    const stages = ['file_check', 'queued', 'producing', 'quality_check', 'ready', 'delivered'];
    const expected = stages[stages.indexOf(productionStage) + 1];
    if (body.stage !== productionStage && body.stage !== expected) {
      return json(response, 409, { message: `Production job cannot transition from ${productionStage} to ${body.stage}.` });
    }
    if (body.stage !== productionStage) {
      productionStage = body.stage;
      productionStageHistory = [...productionStageHistory, { stage: productionStage, changedAt: new Date().toISOString(), changedBy: staffUserId }];
    }
    return json(response, 200, productionJob());
  }

  if (request.method === 'PATCH' && url.pathname === `/production/jobs/${productionJobId}`) {
    return json(response, 200, productionJob());
  }

  if (request.method === 'POST' && url.pathname === '/orders') {
    const now = new Date().toISOString();
    return json(response, 201, {
      _id: orderId,
      orderId,
      orderNumber,
      orderType: 'QUICK_SALE',
      saleDate: now,
      entryMode: 'normal',
      customerName: 'ลูกค้าหน้าร้าน',
      phoneNumber: '',
      payment: 'cash',
      status: 'paid',
      workflowStatus: 'pending',
      createdAt: now,
      updatedAt: now,
      salesChannel: 'quick_sale',
      taxInvoice: 'no',
      cart: [
        {
          name: 'E2E A4 Print',
          category: 'Print',
          quantity: 1,
          unitPrice: 25,
          totalPrice: 25,
          fullPayment: true,
        },
      ],
      subtotal: 25,
      discount: 0,
      vatAmount: 0,
      grandTotal: 25,
      remainingTotal: 0,
      receivedAmount: 25,
      changeAmount: 0,
    });
  }

  if (request.method === 'POST' && url.pathname === `/orders/${orderId}/tracking-access`) {
    return json(response, 201, { token: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' });
  }

  return json(response, 404, { message: `Unhandled E2E mock route: ${request.method} ${url.pathname}` });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Glossy E2E mock backend listening on http://127.0.0.1:${port}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
