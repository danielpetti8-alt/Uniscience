// =============================================================================
// Auth moduli xatoliklari — HTTP status bilan birga.
// Route handlerlar shu kodni JSON javobga aylantiradi (lib/api.ts).
// =============================================================================

export type AuthErrorCode =
  | 'VALIDATION_ERROR'
  | 'EMAIL_TAKEN'
  | 'USERNAME_TAKEN'
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_PENDING_EMAIL'
  | 'ACCOUNT_PENDING_APPROVAL'
  | 'ACCOUNT_BLOCKED'
  | 'LOGIN_BLOCKED'
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_USED'
  | 'NOT_AUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'

const STATUS_MAP: Record<AuthErrorCode, number> = {
  VALIDATION_ERROR: 400,
  EMAIL_TAKEN: 409,
  USERNAME_TAKEN: 409,
  INVALID_CREDENTIALS: 401,
  ACCOUNT_PENDING_EMAIL: 403,
  ACCOUNT_PENDING_APPROVAL: 403,
  ACCOUNT_BLOCKED: 403,
  LOGIN_BLOCKED: 429,
  TOKEN_INVALID: 400,
  TOKEN_EXPIRED: 400,
  TOKEN_USED: 400,
  NOT_AUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
}

export class AuthError extends Error {
  code: AuthErrorCode
  status: number
  fields?: Record<string, string>
  details?: Record<string, unknown>

  constructor(
    code: AuthErrorCode,
    message?: string,
    extra?: { fields?: Record<string, string>; details?: Record<string, unknown> },
  ) {
    super(message ?? code)
    this.name = 'AuthError'
    this.code = code
    this.status = STATUS_MAP[code]
    this.fields = extra?.fields
    this.details = extra?.details
  }
}

export function isAuthError(e: unknown): e is AuthError {
  return e instanceof AuthError
}
