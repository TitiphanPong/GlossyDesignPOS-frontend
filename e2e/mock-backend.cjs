/* eslint-disable @typescript-eslint/no-require-imports */
const http = require('node:http');

const port = Number(process.env.E2E_MOCK_BACKEND_PORT || 4010);
const accessToken = 'e2e-access-token';
const managerAccessToken = 'e2e-manager-access-token';
const orderId = 'order-e2e-1';
const orderNumber = 'ORD-E2E-0001';
const staffUserId = '64b0000000000000000000aa';
const productionJobId = '64b0000000000000000000bb';
const createdProductionJobId = '64b0000000000000000000be';
const existingCustomerId = '64b0000000000000000000cc';
const createdCustomerId = '64b0000000000000000000dd';
const customers = [
  {
    _id: existingCustomerId,
    customerCode: 'CUS-E2E-EXISTING',
    displayName: 'บริษัท E2E จำกัด',
    phoneNumber: '0812345678',
    email: 'customer@example.com',
    taxId: '0105555555555',
    address: '99 ถนนสุขุมวิท กรุงเทพฯ',
    active: true,
  },
];
let lastOrderCreatePayload = null;
let quotation = null;
const quotationId = '64b0000000000000000000ee';
const quotationOrderId = '64b0000000000000000000ef';
const quotationOrderNumber = 'GD-2026-009999';
let createdProductionJob = null;
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
    orderLineIndexes: [],
    stage: productionStage,
    customerMilestone: productionStage === 'ready' || productionStage === 'delivered' ? (productionStage === 'ready' ? 'ready' : 'completed') : productionStage === 'producing' || productionStage === 'quality_check' ? 'in_progress' : 'received',
    stageHistory: productionStageHistory,
  };
}

function pagingProductionJob(index) {
  return {
    ...productionJob(),
    id: `paging-production-${index}`,
    jobNumber: `PJ-PAGING-${String(index).padStart(3, '0')}`,
    workSummary: `PAGING-E2E job ${index}`,
    stage: 'file_check',
    customerMilestone: 'received',
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
  return [accessToken, managerAccessToken].some(token => request.headers.authorization === `Bearer ${token}`);
}

function authIdentity(request) {
  return request.headers.authorization === `Bearer ${managerAccessToken}`
    ? { id: staffUserId, username: 'manager', role: 'manager' }
    : { id: staffUserId, username: 'cashier', role: 'staff' };
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://127.0.0.1:${port}`);

  if (request.method === 'GET' && url.pathname === '/health') {
    return json(response, 200, { status: 'ok' });
  }

  if (request.method === 'POST' && url.pathname === '/auth/login') {
    try {
      const body = await readJson(request);
      const role = body.username === 'manager' ? 'manager' : body.username === 'cashier' ? 'staff' : null;
      if (!role || body.password !== 'e2e-password') {
        return json(response, 401, { message: 'invalid credentials' });
      }
      return json(response, 200, {
        accessToken: role === 'manager' ? managerAccessToken : accessToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        user: { username: body.username, role },
      });
    } catch {
      return json(response, 400, { message: 'invalid payload' });
    }
  }

  if (request.method === 'GET' && url.pathname === '/auth/me') {
    return authorized(request)
      ? json(response, 200, { user: authIdentity(request) })
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

  if (request.method === 'GET' && url.pathname === '/customers') {
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const visibleCustomers = search
      ? customers.filter(customer => `${customer.customerCode} ${customer.displayName} ${customer.phoneNumber || ''} ${customer.email || ''} ${customer.taxId || ''}`.toLowerCase().includes(search))
      : customers;
    return json(response, 200, { data: visibleCustomers.slice(0, Number(url.searchParams.get('limit') || 20)), page: 1, limit: Number(url.searchParams.get('limit') || 20), total: visibleCustomers.length });
  }

  if (request.method === 'POST' && url.pathname === '/customers') {
    const body = await readJson(request);
    const created = {
      _id: createdCustomerId,
      customerCode: 'CUS-E2E-CREATED',
      displayName: body.displayName,
      phoneNumber: body.phoneNumber,
      email: body.email,
      taxId: body.taxId,
      address: body.address,
      active: true,
    };
    const existingIndex = customers.findIndex(customer => customer._id === createdCustomerId);
    if (existingIndex >= 0) customers[existingIndex] = created;
    else customers.unshift(created);
    return json(response, 201, created);
  }

  if (request.method === 'GET' && url.pathname === '/e2e/last-order') {
    return json(response, 200, lastOrderCreatePayload || {});
  }

  if (request.method === 'GET' && url.pathname === '/products') {
    return json(response, 200, [
      {
        id: 'catalog-product-e2e-1',
        _id: 'catalog-product-e2e-1',
        name: 'E2E Quotation Print',
        category: 'Print',
        code: 'E2E-QT-A4',
        typeCode: 'print',
        active: true,
        unitLabel: 'แผ่น',
        variants: [{ id: 'catalog-variant-e2e-1', _id: 'catalog-variant-e2e-1', name: 'A4 สี', price: 100, active: true }],
      },
    ]);
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
      {
        id: 'product-e2e-2',
        _id: 'product-e2e-2',
        name: 'E2E A4 Copy',
        category: 'Copy',
        code: 'E2E-A4-COPY',
        typeCode: 'copy',
        active: true,
        quickSaleEnabled: true,
        isHotMenu: false,
        quickSaleSortOrder: 2,
        variants: [{ id: 'variant-e2e-2', name: 'Default', price: 15, active: true }],
      },
      {
        id: 'product-e2e-a4-color',
        _id: 'product-e2e-a4-color',
        name: 'E2E A4 Color',
        category: 'Print',
        code: 'E2E-A4-COLOR',
        typeCode: 'print',
        active: true,
        quickSaleEnabled: true,
        isHotMenu: false,
        quickSaleSortOrder: 3,
        variants: [{ id: 'variant-e2e-a4-color', name: 'Default', price: 12, active: true }],
      },
      {
        id: 'product-e2e-a3-color',
        _id: 'product-e2e-a3-color',
        name: 'E2E A3 Color',
        category: 'Print',
        code: 'E2E-A3-COLOR',
        typeCode: 'print',
        active: true,
        quickSaleEnabled: true,
        isHotMenu: false,
        quickSaleSortOrder: 4,
        variants: [{ id: 'variant-e2e-a3-color', name: 'Default', price: 25, active: true }],
      },
      {
        id: 'product-e2e-a4-scan',
        _id: 'product-e2e-a4-scan',
        name: 'E2E A4 Scan',
        category: 'Scan',
        code: 'E2E-A4-SCAN',
        typeCode: 'scan',
        active: true,
        quickSaleEnabled: true,
        isHotMenu: false,
        quickSaleSortOrder: 5,
        variants: [{ id: 'variant-e2e-a4-scan', name: 'Default', price: 8, active: true }],
      },
      {
        id: 'product-e2e-a3-scan-disabled',
        _id: 'product-e2e-a3-scan-disabled',
        name: 'E2E A3 Scan Disabled',
        category: 'Scan',
        code: 'E2E-A3-SCAN-DISABLED',
        typeCode: 'scan',
        active: false,
        quickSaleEnabled: true,
        isHotMenu: false,
        quickSaleSortOrder: 6,
        variants: [{ id: 'variant-e2e-a3-scan-disabled', name: 'Default', price: 12, active: true }],
      },
    ]);
  }

  if (request.method === 'GET' && url.pathname === '/quick-sale-v2/config') {
    return json(response, 200, {
      mappings: [
        { workType: 'print', size: 'A4', colorMode: 'bw', quickProductId: 'product-e2e-1' },
        { workType: 'copy', size: 'A4', colorMode: 'bw', quickProductId: 'product-e2e-2' },
        { workType: 'print', size: 'A4', colorMode: 'color', quickProductId: 'product-e2e-a4-color' },
        { workType: 'print', size: 'A3', colorMode: 'color', quickProductId: 'product-e2e-a3-color' },
        { workType: 'scan', size: 'A4', colorMode: 'bw', quickProductId: 'product-e2e-a4-scan' },
        { workType: 'scan', size: 'A3', colorMode: 'bw', quickProductId: 'product-e2e-a3-scan-disabled' },
      ],
      version: 1,
      updatedAt: new Date().toISOString(),
    });
  }

  if (request.method === 'POST' && url.pathname === '/quotations') {
    const body = await readJson(request);
    const now = new Date().toISOString();
    const quantity = Number(body.items?.[0]?.quantity || 1);
    const subtotal = quantity * 100;
    quotation = {
      _id: quotationId,
      revision: 0,
      status: 'DRAFT',
      storedStatus: 'DRAFT',
      version: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: staffUserId,
      updatedBy: staffUserId,
      customerSnapshot: body.customerSnapshot || {},
      items: [{
        productId: 'catalog-product-e2e-1',
        variantId: 'catalog-variant-e2e-1',
        productCode: 'E2E-QT-A4',
        typeCode: 'print',
        name: 'E2E Quotation Print',
        description: body.items?.[0]?.description,
        quantity,
        unit: body.items?.[0]?.unit || 'แผ่น',
        authoritativeUnitPrice: 100,
        lineTotal: subtotal,
        variantName: 'A4 สี',
      }],
      subtotal,
      discount: 0,
      taxableAmount: subtotal,
      vatRate: 7,
      vatAmount: 0,
      grandTotal: subtotal,
      taxInvoiceRequested: false,
      currency: 'THB',
      validUntil: body.validUntil ? `${body.validUntil}T16:59:59.999Z` : undefined,
      subject: body.subject,
      notes: body.notes,
      termsAndConditions: body.termsAndConditions,
      paymentTerms: body.paymentTerms,
      deliveryTerms: body.deliveryTerms,
      internalNote: body.internalNote,
      statusHistory: [{ status: 'DRAFT', action: 'CREATE', actor: staffUserId, timestamp: now }],
      revisionHistory: [],
    };
    return json(response, 201, quotation);
  }

  if (request.method === 'GET' && url.pathname === '/quotations') {
    const data = quotation ? [quotation] : [];
    return json(response, 200, {
      data,
      page: 1,
      limit: Number(url.searchParams.get('limit') || 20),
      total: data.length,
      summary: {
        draft: quotation?.status === 'DRAFT' ? 1 : 0,
        sent: quotation?.status === 'SENT' ? 1 : 0,
        approved: quotation?.status === 'APPROVED' ? 1 : 0,
        expired: 0,
        expiring: 0,
        expiringOrExpired: 0,
      },
    });
  }

  if (request.method === 'GET' && url.pathname === `/quotations/${quotationId}`) {
    return quotation ? json(response, 200, quotation) : json(response, 404, { message: 'Quotation not found.' });
  }

  if (request.method === 'PATCH' && url.pathname === `/quotations/${quotationId}`) {
    if (!quotation || quotation.status !== 'DRAFT') return json(response, 409, { message: 'Only a Draft quotation can be edited.' });
    const body = await readJson(request);
    if (body.version !== quotation.version) return json(response, 409, { message: 'Quotation version conflict.' });
    quotation = {
      ...quotation,
      ...body,
      status: 'DRAFT',
      storedStatus: 'DRAFT',
      version: quotation.version + 1,
      updatedAt: new Date().toISOString(),
    };
    delete quotation.quotationNumber;
    return json(response, 200, quotation);
  }

  if (request.method === 'POST' && url.pathname === `/quotations/${quotationId}/send`) {
    const body = await readJson(request);
    if (!quotation || quotation.status !== 'DRAFT' || body.version !== quotation.version) return json(response, 409, { message: 'Quotation changed before send.' });
    const now = new Date().toISOString();
    quotation = {
      ...quotation,
      quotationNumber: 'QT-202609-0001',
      status: 'SENT',
      storedStatus: 'SENT',
      issuedAt: now,
      updatedAt: now,
      version: quotation.version + 1,
      statusHistory: [...quotation.statusHistory, { status: 'SENT', action: 'SEND', actor: staffUserId, timestamp: now }],
    };
    return json(response, 200, quotation);
  }

  if (request.method === 'POST' && url.pathname === `/quotations/${quotationId}/approve`) {
    const body = await readJson(request);
    if (!quotation || quotation.status !== 'SENT' || body.version !== quotation.version) return json(response, 409, { message: 'Quotation changed before approval.' });
    if (!String(body.reason || '').trim()) return json(response, 400, { message: 'reason is required' });
    const now = new Date().toISOString();
    quotation = {
      ...quotation,
      status: 'APPROVED',
      storedStatus: 'APPROVED',
      updatedAt: now,
      version: quotation.version + 1,
      statusHistory: [...quotation.statusHistory, { status: 'APPROVED', action: 'APPROVE', actor: staffUserId, timestamp: now, reason: body.reason.trim() }],
    };
    return json(response, 200, quotation);
  }

  if (request.method === 'POST' && url.pathname === `/quotations/${quotationId}/revise`) {
    if (!quotation || quotation.status === 'CONVERTED' || quotation.status === 'CANCELLED') {
      return json(response, 400, { message: `Quotation in ${quotation?.status || 'UNKNOWN'} cannot be revised.` });
    }
    return json(response, 400, { message: 'Revision fixture only covers terminal-state rejection.' });
  }

  if (request.method === 'POST' && url.pathname === `/quotations/${quotationId}/convert-to-order`) {
    const body = await readJson(request);
    if (!quotation) return json(response, 404, { message: 'Quotation not found.' });
    if (quotation.convertedOrderId) {
      return json(response, 200, {
        quotation,
        order: {
          _id: quotationOrderId,
          orderId: quotationOrderId,
          orderNumber: quotationOrderNumber,
          status: 'awaiting_payment',
          workflowStatus: 'pending',
          grandTotal: quotation.grandTotal,
          remainingTotal: quotation.grandTotal,
          quotationId,
          quotationNumber: quotation.quotationNumber,
          quotationRevision: quotation.revision,
        },
        replayed: true,
      });
    }
    if (quotation.status !== 'APPROVED' || body.version !== quotation.version) return json(response, 409, { message: 'Only an Approved quotation can be converted.' });
    const now = new Date().toISOString();
    quotation = {
      ...quotation,
      status: 'CONVERTED',
      storedStatus: 'CONVERTED',
      convertedOrderId: quotationOrderId,
      convertedAt: now,
      convertedBy: staffUserId,
      updatedAt: now,
      version: quotation.version + 1,
      statusHistory: [...quotation.statusHistory, { status: 'CONVERTED', action: 'CONVERT_TO_ORDER', actor: staffUserId, timestamp: now }],
    };
    return json(response, 200, {
      quotation,
      order: {
        _id: quotationOrderId,
        orderId: quotationOrderId,
        orderNumber: quotationOrderNumber,
        status: 'awaiting_payment',
        workflowStatus: 'pending',
        grandTotal: quotation.grandTotal,
        remainingTotal: quotation.grandTotal,
        quotationId,
        quotationNumber: quotation.quotationNumber,
        quotationRevision: quotation.revision,
      },
      replayed: false,
    });
  }

  if (request.method === 'GET' && url.pathname === '/notifications/action-center') {
    return json(response, 200, {
      summary: { total: 0, critical: 0, outstandingAmount: 0, filesWaiting: 0 },
      items: [],
    });
  }

  if (request.method === 'GET' && url.pathname === '/orders') {
    const now = new Date().toISOString();
    return json(response, 200, {
      data: [{
        _id: orderId,
        orderId,
        orderNumber,
        customerName: 'ลูกค้า Production E2E',
        phoneNumber: '0812345678',
        payment: 'cash',
        status: 'paid',
        workflowStatus: 'pending',
        createdAt: now,
        updatedAt: now,
        cart: [{ name: 'งาน Production E2E', quickProductId: 'product-e2e-historical-1', quantity: 1, unitPrice: 100, totalPrice: 100 }],
        subtotal: 100,
        discount: 0,
        vatAmount: 0,
        grandTotal: 100,
        remainingTotal: 0,
      }],
      page: 1,
      limit: 10,
      total: 1,
      summary: { sales: 100, collections: 100, outstanding: 0, orders: 1, paidOrders: 1, cancelledOrders: 0 },
    });
  }

  if (request.method === 'GET' && url.pathname === `/orders/${orderId}`) {
    const now = new Date().toISOString();
    return json(response, 200, {
      _id: orderId,
      orderId,
      orderNumber,
      invoiceNumber: 'INV-202608-001-001',
      bookNo: '001',
      invoiceSequence: '001',
      invoicePeriod: '202608',
      customerName: 'ลูกค้า Invoice E2E',
      phoneNumber: '0812345678',
      taxId: '0105555555555',
      address: '99 ถนนทดสอบ กรุงเทพมหานคร 10250',
      payment: 'cash',
      paymentMethod: 'cash',
      status: 'paid',
      workflowStatus: 'pending',
      saleDate: now,
      createdAt: now,
      updatedAt: now,
      taxInvoice: 'yes',
      cart: [{ name: 'งานพิมพ์ Invoice E2E', quantity: 2, unitPrice: 100, totalPrice: 200 }],
      subtotal: 200,
      discount: 0,
      vatAmount: 14,
      grandTotal: 214,
      depositTotal: 214,
      paidAmount: 214,
      remainingTotal: 0,
      receivedAmount: 214,
      changeAmount: 0,
    });
  }

  if (request.method === 'GET' && url.pathname === '/production/jobs/assignees') {
    return json(response, 200, [{ id: staffUserId, username: 'cashier' }]);
  }

  if (request.method === 'POST' && url.pathname === '/production/jobs') {
    const body = await readJson(request);
    createdProductionJob = {
      id: createdProductionJobId,
      jobNumber: 'PJ-20260830-E2ECREATE',
      orderId: body.orderId,
      orderNumber,
      workSummary: body.workSummary,
      jobType: body.jobType,
      dueAt: body.dueAt,
      dueAtBangkok: '2026-08-31 17:00:00',
      priority: body.priority || 'normal',
      isRush: body.priority === 'rush',
      isOverdue: false,
      assignee: body.assigneeUserId ? { id: body.assigneeUserId, username: 'cashier' } : null,
      internalNote: body.internalNote,
      linkedUploadIds: body.linkedUploadIds || [],
      orderLineIndexes: body.orderLineIndexes || [],
      stage: 'file_check',
      customerMilestone: 'received',
      stageHistory: [{ stage: 'file_check', changedAt: new Date().toISOString(), changedBy: staffUserId }],
    };
    return json(response, 201, createdProductionJob);
  }

  if (request.method === 'GET' && url.pathname === '/production/jobs') {
    const requestedStage = url.searchParams.get('stage');
    const requestedPage = Number(url.searchParams.get('page') || 1);
    const requestedLimit = Number(url.searchParams.get('limit') || 25);
    const search = url.searchParams.get('q') || '';
    const allItems = search === 'PAGING-E2E'
      ? Array.from({ length: 51 }, (_, index) => pagingProductionJob(index + 1))
      : [productionJob(), ...(createdProductionJob ? [createdProductionJob] : [])];
    const filteredItems = allItems.filter(job => !requestedStage || requestedStage === job.stage);
    const start = (requestedPage - 1) * requestedLimit;
    const items = filteredItems.slice(start, start + requestedLimit);
    const stageCounts = {
      file_check: allItems.filter(job => job.stage === 'file_check').length,
      queued: allItems.filter(job => job.stage === 'queued').length,
      producing: allItems.filter(job => job.stage === 'producing').length,
      quality_check: allItems.filter(job => job.stage === 'quality_check').length,
      ready: allItems.filter(job => job.stage === 'ready').length,
      delivered: allItems.filter(job => job.stage === 'delivered').length,
    };
    return json(response, 200, {
      items,
      page: requestedPage,
      limit: requestedLimit,
      total: filteredItems.length,
      totalPages: Math.max(1, Math.ceil(filteredItems.length / requestedLimit)),
      stageCounts,
    });
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
    const body = await readJson(request);
    lastOrderCreatePayload = body;
    const now = new Date().toISOString();
    return json(response, 201, {
      _id: orderId,
      orderId,
      orderNumber,
      orderType: 'QUICK_SALE',
      saleDate: now,
      entryMode: 'normal',
      customerName: body.customerName || 'ลูกค้าหน้าร้าน',
      phoneNumber: body.phoneNumber || '',
      ...(body.customerId ? { customerId: body.customerId } : {}),
      ...(body.taxId ? { taxId: body.taxId } : {}),
      ...(body.address ? { address: body.address } : {}),
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
