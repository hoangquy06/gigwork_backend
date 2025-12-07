## Goal
- Inherit `ProblemDetails` and create per-API error schemas with clear English texts (title/detail/hint/errorCode), without changing backend behavior.
- Keep `Content-Type: application/problem+json` for error responses.

## Schema Design
- Keep `components.schemas.ProblemDetails`.
- Add new schemas using `allOf` to extend:
  - Auth: `AuthUnauthorized`, `AuthBadRequest`.
  - Users: `UsersUnauthorized`.
  - Jobs: `JobsUnauthorized`, `JobsForbidden`, `JobsNotFound`.
  - Applications: `ApplicationsUnauthorized`, `ApplicationsForbidden`, `ApplicationsNotFound`.
  - Reviews: `ReviewsBadRequest`.
  - Notifications: `NotificationsUnauthorized`.
- Each extended schema:
  - `allOf: [ { $ref: '#/components/schemas/ProblemDetails' }, { type: 'object', properties: { errorCode: { type: 'string' }, hint: { type: 'string' } } } ]`.
  - Optional `errorCode` and `hint` so it doesn't break current backend payloads.

## English Text Suggestions (examples)
- `AuthUnauthorized`:
  - `title`: "Unauthorized"
  - `detail`: "Missing or invalid token. Please sign in again"
  - `hint`: "Send Authorization: Bearer <token>"
- `AuthBadRequest`:
  - `title`: "Invalid credentials"
  - `detail`: "Email or password is incorrect"
  - `hint`: "Verify your email and password format"
- `UsersUnauthorized`:
  - `title`: "Unauthorized"
  - `detail`: "Authentication required to access user information"
  - `hint`: "Login and include JWT in Authorization header"
- `JobsForbidden`:
  - `title`: "Forbidden"
  - `detail`: "Email not verified or not the employer of this job"
  - `hint`: "Verify email or use an employer account"
- `JobsNotFound`:
  - `title`: "Job not found"
  - `detail`: "Requested job ID does not exist or was deleted"
  - `hint`: "Check the 'id' path parameter"
- `ApplicationsForbidden`:
  - `title`: "Forbidden"
  - `detail`: "You do not have permission to change this application"
  - `hint`: "Use the correct account associated with the application"
- `ReviewsBadRequest`:
  - `title`: "Invalid review request"
  - `detail`: "ApplicationId or revieweeId is invalid"
  - `hint`: "Provide valid 'applicationId' and 'revieweeId'"
- `NotificationsUnauthorized`:
  - `title`: "Unauthorized"
  - `detail`: "Authentication required to list notifications"
  - `hint`: "Include a valid JWT"

## Wiring into Responses
- Replace generic `$ref: ProblemDetails` in error responses with the new specific schemas per endpoint:
  - Auth 401 → `AuthUnauthorized`, 400 → `AuthBadRequest`.
  - Users 401 → `UsersUnauthorized`.
  - Jobs 401/403/404 → `JobsUnauthorized`/`JobsForbidden`/`JobsNotFound`.
  - Applications 401/403/404 → corresponding Applications schemas.
  - Reviews 400 → `ReviewsBadRequest`.
  - Notifications 401 → `NotificationsUnauthorized`.
- Keep status codes and success responses unchanged.
- Add `examples` under each error response using the English texts above.

## Validation & Display
- Ensure `openapi.json` remains valid JSON and `paths` stays at top-level.
- Reload `/api/docs/` with Disable cache to confirm UI renders operations and error examples.

If approved, I will update `openapi.json` by adding the extended schemas and referencing them in each error response, preserving backend behavior and existing response structures.