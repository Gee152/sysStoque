export const TAG_PRE_CONDITION_ERROR = '[PreconditionError]'
export const TAG_INTERNAL_SERVER_ERROR = '[InternalServerError]'

export type ResultSuccess<T> = { ok: true; value: T }
export type ResultFailure = { ok: false; error: AppError }
export type Result<T> = ResultSuccess<T> | ResultFailure

export function ok<T>(value: T): ResultSuccess<T> {
  return { ok: true, value }
}

export function fail(error: AppError): ResultFailure {
  return { ok: false, error }
}

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message)
    this.name = 'AppError'
  }

  static badRequest(message: string, code = 'BAD_REQUEST') {
    return new AppError(code, message, 400)
  }

  static unauthorized(message = 'Not authenticated') {
    return new AppError('UNAUTHORIZED', message, 401)
  }

  static forbidden(message = 'Access denied') {
    return new AppError('FORBIDDEN', message, 403)
  }

  static notFound(message = 'Resource not found') {
    return new AppError('NOT_FOUND', message, 404)
  }

  static conflict(message: string) {
    return new AppError('CONFLICT', message, 409)
  }

  static internal(message = 'Internal server error') {
    return new AppError('INTERNAL_ERROR', message, 500)
  }

  static precondition(message: string): AppError {
    console.error(TAG_PRE_CONDITION_ERROR, message)
    return new AppError('PRECONDITION_ERROR', message, 400)
  }

  static serverError(message: string): AppError {
    console.error(TAG_INTERNAL_SERVER_ERROR, message)
    return new AppError('INTERNAL_SERVER_ERROR', message, 500)
  }
}
