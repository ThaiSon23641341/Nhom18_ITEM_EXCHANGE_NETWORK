import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from 'express';
import { ApiError, demoStore, type DemoStore } from './demoStore.js';
import type {
  Appointment,
  AppointmentStatus,
  CreateAppointmentInput,
  CreateItemInput,
  CreateItemReportInput,
  Item,
  ItemCondition,
  ItemReport,
  ItemStatus,
  PaginatedResponse,
  ReportReason,
  ReportStatus,
  UpdateItemInput,
} from './models.js';
import { REPORT_REASONS } from './models.js';

const API_PREFIX = '/api/v1';
const PAGE_DEFAULT = 1;
const LIMIT_DEFAULT = 10;
const LIMIT_MAX = 50;
const PROHIBITED_TERMS = ['lua dao', 'vu khi', 'ma tuy', 'hang cam'];
const ITEM_STATUSES: readonly ItemStatus[] = [
  'available',
  'reserved',
  'exchanged',
];
const ITEM_CONDITIONS: readonly ItemCondition[] = ['new', 'good', 'fair'];
const APPOINTMENT_STATUSES: readonly AppointmentStatus[] = [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
];
const REPORT_STATUSES: readonly ReportStatus[] = [
  'pending',
  'actioned',
  'dismissed',
];

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const text = (value: unknown): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;

const normalizeText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('vi')
    .replace(/[đ]/g, 'd');

const isValidDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
};

const containsProhibitedTerm = (value: string): boolean => {
  const normalized = ` ${normalizeText(value).replace(/[^\p{L}\p{N}]+/gu, ' ')} `;
  return PROHIBITED_TERMS.some((term) => normalized.includes(` ${term} `));
};

const isOneOf = <T extends string>(
  value: unknown,
  values: readonly T[],
): value is T => typeof value === 'string' && values.includes(value as T);

const parsePage = (value: unknown, defaultValue: number): number => {
  if (value === undefined) return defaultValue;
  if (typeof value !== 'string') {
    throw new ApiError('Pagination values must be single values.', 400, 'BAD_REQUEST');
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ApiError('Pagination values must be positive integers.', 400, 'BAD_REQUEST');
  }
  return parsed;
};

const paginate = <T>(
  values: T[],
  page: number,
  limit: number,
): PaginatedResponse<T> => {
  const total = values.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return {
    data: values.slice(start, start + limit),
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
};

const getBody = (request: Request): JsonRecord => {
  if (!isRecord(request.body)) {
    throw new ApiError('Request body must be a JSON object.', 400, 'BAD_REQUEST');
  }
  return request.body;
};

const parseCreateItem = (
  body: JsonRecord,
  store: DemoStore,
): CreateItemInput => {
  const ownerId = text(body.ownerId);
  const title = text(body.title);
  const description = text(body.description);
  const category = text(body.category);
  const imageUrl = text(body.imageUrl) ?? '';

  if (!ownerId || !store.userExists(ownerId)) {
    throw new ApiError('A valid ownerId is required.', 400, 'BAD_REQUEST');
  }
  if (!title || !description || !category) {
    throw new ApiError(
      'Title, description, and category are required.',
      400,
      'BAD_REQUEST',
    );
  }
  if (title.length > 120 || description.length > 2000 || category.length > 80) {
    throw new ApiError('Item text fields exceed their maximum length.', 400, 'BAD_REQUEST');
  }
  if (imageUrl.length > 2048) {
    throw new ApiError('Image URL is too long.', 400, 'BAD_REQUEST');
  }
  if (!isOneOf(body.condition, ITEM_CONDITIONS)) {
    throw new ApiError('Condition is invalid.', 400, 'BAD_REQUEST');
  }
  if (containsProhibitedTerm(`${title} ${description}`)) {
    throw new ApiError(
      'Listing contains content that is not allowed.',
      400,
      'PROHIBITED_CONTENT',
    );
  }
  return {
    ownerId,
    title,
    description,
    category,
    condition: body.condition,
    imageUrl,
  };
};

const parseUpdateItem = (body: JsonRecord): UpdateItemInput => {
  const changes: UpdateItemInput = {};
  const allowedFields = [
    'title',
    'description',
    'category',
    'condition',
    'imageUrl',
    'status',
  ];

  if (Object.keys(body).some((key) => !allowedFields.includes(key))) {
    throw new ApiError('Request contains unsupported fields.', 400, 'BAD_REQUEST');
  }

  for (const field of ['title', 'description', 'category', 'imageUrl'] as const) {
    if (body[field] !== undefined) {
      const value = text(body[field]);
      if (value === undefined || (field !== 'imageUrl' && !value)) {
        throw new ApiError(`${field} must be a string.`, 400, 'BAD_REQUEST');
      }
      if (
        (field === 'title' && value.length > 120) ||
        (field === 'description' && value.length > 2000) ||
        (field === 'category' && value.length > 80) ||
        (field === 'imageUrl' && value.length > 2048)
      ) {
        throw new ApiError(`${field} exceeds its maximum length.`, 400, 'BAD_REQUEST');
      }
      changes[field] = value;
    }
  }

  if (body.condition !== undefined) {
    if (!isOneOf(body.condition, ITEM_CONDITIONS)) {
      throw new ApiError('Condition is invalid.', 400, 'BAD_REQUEST');
    }
    changes.condition = body.condition;
  }
  if (body.status !== undefined) {
    if (!isOneOf(body.status, ITEM_STATUSES)) {
      throw new ApiError('Status is invalid.', 400, 'BAD_REQUEST');
    }
    changes.status = body.status;
  }

  const content = `${changes.title ?? ''} ${changes.description ?? ''}`;
  if (containsProhibitedTerm(content)) {
    throw new ApiError(
      'Listing contains content that is not allowed.',
      400,
      'PROHIBITED_CONTENT',
    );
  }
  if (Object.keys(changes).length === 0) {
    throw new ApiError('At least one item field must be provided.', 400, 'BAD_REQUEST');
  }
  return changes;
};

const parseCreateAppointment = (
  body: JsonRecord,
  store: DemoStore,
): CreateAppointmentInput => {
  const itemId = text(body.itemId);
  const requesterId = text(body.requesterId);
  const date = text(body.date);
  const time = text(body.time);
  const location = text(body.location);
  const scheduledAt = text(body.scheduledAt);
  const note = text(body.note) ?? '';

  if (
    !itemId ||
    !requesterId ||
    !date ||
    !time ||
    !location ||
    location.length > 200 ||
    !isValidDate(date) ||
    !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) ||
    !store.userExists(requesterId)
    || note.length > 500
    || (scheduledAt !== undefined && Number.isNaN(Date.parse(scheduledAt)))
  ) {
    throw new ApiError('Appointment fields are invalid.', 400, 'BAD_REQUEST');
  }

  const item = store.getItem(itemId);
  if (item.ownerId === requesterId) {
    throw new ApiError('Owners cannot request their own item.', 400, 'BAD_REQUEST');
  }
  if (item.status !== 'available') {
    throw new ApiError('Item is not available for appointment.', 409, 'CONFLICT');
  }
  return { itemId, requesterId, date, time, location, scheduledAt, note };
};

const parseCreateReport = (
  body: JsonRecord,
  store: DemoStore,
): CreateItemReportInput => {
  const itemId = text(body.itemId);
  const reporterId = text(body.reporterId);
  const details = text(body.details) ?? '';

  if (!itemId || !store.itemExists(itemId)) {
    throw new ApiError('A valid itemId is required.', 400, 'BAD_REQUEST');
  }
  if (!reporterId || !store.userExists(reporterId)) {
    throw new ApiError('A valid reporterId is required.', 400, 'BAD_REQUEST');
  }
  if (!isOneOf(body.reason, REPORT_REASONS)) {
    throw new ApiError('Report reason is invalid.', 400, 'BAD_REQUEST');
  }
  if (details.length > 500) {
    throw new ApiError('Report details must be 500 characters or fewer.', 400, 'BAD_REQUEST');
  }
  return {
    itemId,
    reporterId,
    reason: body.reason as ReportReason,
    details,
  };
};

const sendError = (response: Response, error: unknown): void => {
  if (error instanceof ApiError) {
    response.status(error.statusCode).json({
      error: { code: error.code, message: error.message },
    });
    return;
  }
  throw error;
};

export const createApp = (store: DemoStore = demoStore) => {
  const app = express();
  app.use((_request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (_request.method === 'OPTIONS') {
      response.status(204).end();
      return;
    }
    next();
  });
  app.use(express.json({ limit: '100kb' }));

  app.get(`${API_PREFIX}/health`, (_request, response) => {
    response.json({ status: 'ok', mode: 'in-memory-demo' });
  });

  app.get(`${API_PREFIX}/users/:id/public`, (request, response) => {
    try {
      response.json({ data: store.getPublicUser(request.params.id) });
    } catch (error) {
      sendError(response, error);
    }
  });

  app.get(`${API_PREFIX}/items`, (request, response) => {
    try {
      const page = parsePage(request.query.page, PAGE_DEFAULT);
      const limit = parsePage(request.query.limit, LIMIT_DEFAULT);
      if (limit > LIMIT_MAX) {
        throw new ApiError(`Limit cannot exceed ${LIMIT_MAX}.`, 400, 'BAD_REQUEST');
      }
      const query = text(request.query.query);
      const category = text(request.query.category);
      const status = request.query.status;
      if (status !== undefined && !isOneOf(status, ITEM_STATUSES)) {
        throw new ApiError('Status filter is invalid.', 400, 'BAD_REQUEST');
      }

      let items = store.listItems();
      if (query) {
        items = items.filter((item) =>
          normalizeText(`${item.title} ${item.description}`).includes(
            normalizeText(query),
          ),
        );
      }
      if (category) {
        items = items.filter(
          (item) => normalizeText(item.category) === normalizeText(category),
        );
      }
      if (status) items = items.filter((item) => item.status === status);

      response.json({ data: paginate(items, page, limit) });
    } catch (error) {
      sendError(response, error);
    }
  });

  app.get(`${API_PREFIX}/items/:id`, (request, response) => {
    try {
      response.json({ data: store.getItem(request.params.id) });
    } catch (error) {
      sendError(response, error);
    }
  });

  app.post(`${API_PREFIX}/items`, (request, response) => {
    try {
      const input = parseCreateItem(getBody(request), store);
      const now = new Date().toISOString();
      const item: Item = {
        id: `item-${crypto.randomUUID()}`,
        ...input,
        status: 'available',
        createdAt: now,
        updatedAt: now,
      };
      response.status(201).json({ data: store.createItem(item) });
    } catch (error) {
      sendError(response, error);
    }
  });

  app.patch(`${API_PREFIX}/items/:id`, (request, response) => {
    try {
      const changes = parseUpdateItem(getBody(request));
      const item = store.getItem(request.params.id);
      const nextStatus = changes.status ?? item.status;
      const validTransition =
        item.status === nextStatus ||
        (item.status === 'available' &&
          (nextStatus === 'reserved' || nextStatus === 'exchanged')) ||
        (item.status === 'reserved' &&
          (nextStatus === 'available' || nextStatus === 'exchanged'));
      if (!validTransition) {
        throw new ApiError('Item status transition is not allowed.', 409, 'CONFLICT');
      }
      response.json({
        data: store.updateItem(item.id, {
          ...changes,
          updatedAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      sendError(response, error);
    }
  });

  app.delete(`${API_PREFIX}/items/:id`, (request, response) => {
    try {
      store.deleteItem(request.params.id);
      response.status(204).end();
    } catch (error) {
      sendError(response, error);
    }
  });

  app.get(`${API_PREFIX}/appointments`, (request, response) => {
    try {
      const page = parsePage(request.query.page, PAGE_DEFAULT);
      const limit = parsePage(request.query.limit, LIMIT_DEFAULT);
      if (limit > LIMIT_MAX) {
        throw new ApiError(`Limit cannot exceed ${LIMIT_MAX}.`, 400, 'BAD_REQUEST');
      }
      const requesterId = text(request.query.requesterId);
      let appointments = store.listAppointments();
      if (requesterId) {
        appointments = appointments.filter(
          (appointment) => appointment.requesterId === requesterId,
        );
      }
      response.json({ data: paginate(appointments, page, limit) });
    } catch (error) {
      sendError(response, error);
    }
  });

  app.post(`${API_PREFIX}/appointments`, (request, response) => {
    try {
      const input = parseCreateAppointment(getBody(request), store);
      const now = new Date().toISOString();
      const appointment: Appointment = {
        id: `appointment-${crypto.randomUUID()}`,
        ...input,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };
      store.updateItem(input.itemId, {
        status: 'reserved',
        updatedAt: now,
      });
      response.status(201).json({ data: store.createAppointment(appointment) });
    } catch (error) {
      sendError(response, error);
    }
  });

  app.patch(`${API_PREFIX}/appointments/:id/status`, (request, response) => {
    try {
      const body = getBody(request);
      if (!isOneOf(body.status, APPOINTMENT_STATUSES)) {
        throw new ApiError('Appointment status is invalid.', 400, 'BAD_REQUEST');
      }
      const appointment = store.getAppointment(request.params.id);
      const allowedNextStatuses: Record<
        AppointmentStatus,
        readonly AppointmentStatus[]
      > = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['cancelled', 'completed'],
        cancelled: [],
        completed: [],
      };
      if (
        !allowedNextStatuses[appointment.status].includes(body.status)
      ) {
        throw new ApiError('Appointment status transition is not allowed.', 409, 'CONFLICT');
      }
      const now = new Date().toISOString();
      const updated = store.updateAppointment(appointment.id, {
        status: body.status,
        updatedAt: now,
      });
      if (body.status === 'cancelled') {
        const item = store.getItem(appointment.itemId);
        if (item.status === 'reserved') {
          store.updateItem(item.id, { status: 'available', updatedAt: now });
        }
      } else if (body.status === 'completed') {
        store.updateItem(appointment.itemId, {
          status: 'exchanged',
          updatedAt: now,
        });
      }
      response.json({ data: updated });
    } catch (error) {
      sendError(response, error);
    }
  });

  app.get(`${API_PREFIX}/reports`, (request, response) => {
    try {
      const page = parsePage(request.query.page, PAGE_DEFAULT);
      const limit = parsePage(request.query.limit, LIMIT_DEFAULT);
      if (limit > LIMIT_MAX) {
        throw new ApiError(`Limit cannot exceed ${LIMIT_MAX}.`, 400, 'BAD_REQUEST');
      }
      response.json({ data: paginate(store.listReports(), page, limit) });
    } catch (error) {
      sendError(response, error);
    }
  });

  app.post(`${API_PREFIX}/reports`, (request, response) => {
    try {
      const input = parseCreateReport(getBody(request), store);
      const now = new Date().toISOString();
      const report: ItemReport = {
        id: `report-${crypto.randomUUID()}`,
        ...input,
        details: input.details ?? '',
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };
      response.status(201).json({ data: store.createReport(report) });
    } catch (error) {
      sendError(response, error);
    }
  });

  app.patch(`${API_PREFIX}/reports/:id/status`, (request, response) => {
    try {
      const body = getBody(request);
      if (
        !isOneOf(body.status, REPORT_STATUSES) ||
        body.status === 'pending'
      ) {
        throw new ApiError(
          'A resolved report status is required.',
          400,
          'BAD_REQUEST',
        );
      }
      const updated = store.updateReport(request.params.id, {
        status: body.status,
        updatedAt: new Date().toISOString(),
      });
      response.json({ data: updated });
    } catch (error) {
      sendError(response, error);
    }
  });

  app.use((_request, response) => {
    response.status(404).json({
      error: { code: 'NOT_FOUND', message: 'API route was not found.' },
    });
  });

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    if (error instanceof SyntaxError) {
      response.status(400).json({
        error: { code: 'BAD_JSON', message: 'Request body contains invalid JSON.' },
      });
      return;
    }
    response.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error.' },
    });
  };
  app.use(errorHandler);

  return app;
};

export const app = createApp();
