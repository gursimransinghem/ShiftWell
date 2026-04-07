# ShiftWell Enterprise API — OpenAPI 3.0 Specification

**Version:** 1.0.0
**Base URL:** `https://api.shiftwell.app/v1`
**Auth:** OAuth2 Client Credentials Flow
**Rate Limit:** 60 requests/minute per client

---

## OpenAPI YAML

```yaml
openapi: "3.0.3"
info:
  title: ShiftWell Enterprise API
  description: |
    Enterprise API for hospital scheduling system integration and
    anonymized outcome data export. All outcome data is aggregated,
    anonymized, and differentially private — no PII is exposed.
  version: "1.0.0"
  contact:
    name: ShiftWell Enterprise Support
    email: enterprise@shiftwell.app

servers:
  - url: https://api.shiftwell.app/v1
    description: Production

security:
  - OAuth2ClientCredentials: []

components:
  securitySchemes:
    OAuth2ClientCredentials:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://api.shiftwell.app/auth/token
          scopes:
            schedules:write: Push employee shift schedules
            outcomes:read: Read anonymized cohort outcome data

  schemas:
    Shift:
      type: object
      required: [start, end, type]
      properties:
        start:
          type: string
          format: date-time
          example: "2026-04-06T07:00:00-05:00"
          description: ISO 8601 datetime with timezone offset
        end:
          type: string
          format: date-time
          example: "2026-04-06T15:00:00-05:00"
        type:
          type: string
          enum: [day, evening, night]
        department:
          type: string
          example: "Emergency Medicine"
          description: Optional department or unit code

    SchedulePush:
      type: object
      required: [employeeId, shifts, source]
      properties:
        employeeId:
          type: string
          example: "EMP-12345"
          description: Employee identifier from the source system (no PII beyond the ID)
        shifts:
          type: array
          items:
            $ref: "#/components/schemas/Shift"
          minItems: 1
        source:
          type: string
          enum: [kronos, qgenda, api, manual]
          example: "kronos"

    OutcomeMetrics:
      type: object
      properties:
        avgAdherenceRate:
          type: number
          minimum: 0
          maximum: 100
          description: Average sleep schedule adherence rate (percentage)
          example: 78
        avgDebtHours:
          type: number
          minimum: 0
          description: Average sleep debt hours per participant
          example: 0.4
        avgRecoveryScore:
          type: number
          minimum: 0
          maximum: 100
          description: Average recovery score for the cohort
          example: 72
        transitionRecoveryDays:
          type: number
          minimum: 0
          description: Average days to recover from a shift transition
          example: 3
        participantCount:
          type: integer
          minimum: 5
          description: Number of participants in this cohort (minimum 5 for privacy)
          example: 55

    OutcomeTrends:
      type: object
      properties:
        adherenceChange:
          type: number
          description: Percentage point change in adherence vs previous period
          example: 4.2
        debtChange:
          type: number
          description: Change in average debt hours vs previous period
          example: -0.3
        recoveryChange:
          type: number
          description: Percentage point change in recovery score vs previous period
          example: 2.1

    OutcomeResponse:
      type: object
      properties:
        cohortId:
          type: string
          example: "hospital-A"
        period:
          type: object
          properties:
            start:
              type: string
              format: date
              example: "2026-03-01"
            end:
              type: string
              format: date
              example: "2026-03-31"
        metrics:
          $ref: "#/components/schemas/OutcomeMetrics"
        trends:
          $ref: "#/components/schemas/OutcomeTrends"

    HealthResponse:
      type: object
      properties:
        status:
          type: string
          enum: [ok, degraded]
          example: "ok"
        version:
          type: string
          example: "1.0.0"
        timestamp:
          type: string
          format: date-time
          example: "2026-04-06T12:00:00Z"

    ErrorResponse:
      type: object
      required: [error, message]
      properties:
        error:
          type: string
          example: "validation_error"
        message:
          type: string
          example: "employeeId is required"
        details:
          type: array
          items:
            type: string
          description: Field-level validation errors

paths:
  /schedules:
    post:
      operationId: pushSchedule
      summary: Push employee shifts
      description: |
        Ingest one or more shifts for a single employee from a scheduling system.
        Shifts are parsed and stored for circadian optimization.
        Supported source systems: Kronos, QGenda, direct API, manual entry.
      security:
        - OAuth2ClientCredentials:
            - schedules:write
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/SchedulePush"
            examples:
              kronos:
                summary: Kronos schedule push
                value:
                  employeeId: "EMP-12345"
                  source: "kronos"
                  shifts:
                    - start: "2026-04-06T07:00:00-05:00"
                      end: "2026-04-06T15:00:00-05:00"
                      type: "day"
                      department: "Emergency Medicine"
                    - start: "2026-04-07T19:00:00-05:00"
                      end: "2026-04-08T07:00:00-05:00"
                      type: "night"
      responses:
        "202":
          description: Schedule accepted for processing
          content:
            application/json:
              schema:
                type: object
                properties:
                  accepted:
                    type: integer
                    description: Number of shifts accepted
                    example: 2
                  employeeId:
                    type: string
                    example: "EMP-12345"
        "400":
          description: Validation error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "401":
          description: Missing or invalid access token
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "403":
          description: Insufficient scope (requires schedules:write)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "429":
          description: Rate limit exceeded (60 req/min per client)
          headers:
            Retry-After:
              schema:
                type: integer
              description: Seconds until the rate limit resets
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "500":
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"

  /outcomes:
    get:
      operationId: listOutcomes
      summary: List anonymized outcome data for all accessible cohorts
      description: |
        Returns anonymized, differentially private outcome metrics for all cohorts
        the authenticated client has access to. Cohorts with fewer than 5 participants
        are suppressed for privacy. Data is aggregated monthly.
      security:
        - OAuth2ClientCredentials:
            - outcomes:read
      parameters:
        - name: period
          in: query
          required: false
          schema:
            type: string
            pattern: "^\\d{4}-\\d{2}$"
            example: "2026-03"
          description: "Filter by period in yyyy-MM format (default: most recent)"
      responses:
        "200":
          description: Outcome data for accessible cohorts
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/OutcomeResponse"
        "401":
          description: Missing or invalid access token
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "403":
          description: Insufficient scope (requires outcomes:read)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "429":
          description: Rate limit exceeded
          headers:
            Retry-After:
              schema:
                type: integer
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "500":
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"

  /outcomes/{cohortId}:
    get:
      operationId: getCohortOutcomes
      summary: Get anonymized outcome data for a specific cohort
      description: |
        Returns anonymized outcome metrics for a single cohort. Requires the client
        to have access to the specified cohort. Returns 404 if the cohort does not
        exist or is suppressed for privacy (fewer than 5 participants).
      security:
        - OAuth2ClientCredentials:
            - outcomes:read
      parameters:
        - name: cohortId
          in: path
          required: true
          schema:
            type: string
          description: Cohort identifier (employer or facility)
          example: "hospital-A"
        - name: period
          in: query
          required: false
          schema:
            type: string
            pattern: "^\\d{4}-\\d{2}$"
            example: "2026-03"
      responses:
        "200":
          description: Outcome data for the specified cohort
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OutcomeResponse"
        "400":
          description: Invalid cohortId or period format
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "401":
          description: Missing or invalid access token
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "403":
          description: Insufficient scope or not authorized for this cohort
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "404":
          description: Cohort not found or suppressed for privacy
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "429":
          description: Rate limit exceeded
          headers:
            Retry-After:
              schema:
                type: integer
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "500":
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"

  /health:
    get:
      operationId: healthCheck
      summary: API health check
      description: |
        Returns the current health status of the API. Does not require authentication.
        Use this endpoint for monitoring and uptime checks.
      security: []
      responses:
        "200":
          description: API is healthy
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/HealthResponse"
              example:
                status: "ok"
                version: "1.0.0"
                timestamp: "2026-04-06T12:00:00Z"
        "503":
          description: API is degraded or unavailable
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/HealthResponse"
              example:
                status: "degraded"
                version: "1.0.0"
                timestamp: "2026-04-06T12:00:00Z"
```

---

## Authentication

### OAuth2 Client Credentials Flow

```
POST https://api.shiftwell.app/auth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&scope=schedules:write outcomes:read
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "schedules:write outcomes:read"
}
```

Include the token in all API requests:
```
Authorization: Bearer <access_token>
```

---

## Rate Limiting

- **Limit:** 60 requests per minute per `client_id`
- **Headers returned on every response:**
  - `X-RateLimit-Limit: 60`
  - `X-RateLimit-Remaining: 45`
  - `X-RateLimit-Reset: 1712401260` (Unix timestamp)
- **On limit exceeded:** HTTP 429 with `Retry-After` header

---

## Privacy & Compliance

- All outcome data is anonymized before storage — no PII in any response
- Cohorts with fewer than **5 participants** are suppressed entirely
- Cohorts below **50 participants** receive Laplacian differential privacy noise
- Data aggregation granularity: **monthly** (never daily)
- HIPAA Business Associate Agreement required for all enterprise clients
- See `docs/research/HIPAA-COMPLIANCE-ASSESSMENT.md` for full compliance documentation

---

## Error Codes

| Code | Meaning |
|------|---------|
| `validation_error` | Request body failed schema validation |
| `unauthorized` | Missing or expired access token |
| `forbidden` | Valid token but insufficient scope or cohort access |
| `not_found` | Cohort not found or suppressed for privacy |
| `rate_limited` | 60 req/min limit exceeded |
| `internal_error` | Unexpected server error |

---

*Document version: 1.0.0 — Phase 29 (API Layer)*
*Last updated: 2026-04-06*
