import { randomUUID } from "crypto";

export function success(
  data: any,
  options: {
    message?: string;
    meta?: Record<string, any>;
  } = {}
) {
  return {
    status: "success",
    message: options.message ?? "Request successful",
    data,
    meta: {
      ...(options.meta ?? {}),
      request_id: randomUUID(),
      timestamp: new Date().toISOString()
    }
  };
}

export function error(message: string, meta: Record<string, any> = {}) {
  return {
    status: "error",
    message,
    data: null,
    meta: {
      ...meta,
      request_id: randomUUID(),
      timestamp: new Date().toISOString()
    }
  };
}