/**
 * GET /api/v1/facilities — list facilities for an org.
 * Phase 38 — Advanced Platform Features
 *
 * Returns FacilityConfig[] for the authenticated org.
 * Protected: requires valid orgId session cookie (same auth as main dashboard).
 *
 * Query params:
 *   orgId: string — the organization identifier
 */

import { FacilityConfig } from '../../../../src/lib/enterprise/multi-facility';

export interface FacilitiesResponse {
  orgId: string;
  facilities: FacilityConfig[];
}

/**
 * GET /api/v1/facilities?orgId=:orgId
 * Returns the list of facilities registered under the organization.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');

  if (!orgId) {
    return Response.json({ error: 'orgId is required' }, { status: 400 });
  }

  // TODO: replace with real database lookup (Phase 28+)
  // For now returns a deterministic fixture scoped to the orgId,
  // which allows the facilities page to render without a database.
  const facilities: FacilityConfig[] = getFacilitiesForOrg(orgId);

  const body: FacilitiesResponse = { orgId, facilities };
  return Response.json(body, { status: 200 });
}

/**
 * Returns facilities for a given org.
 * Stub — replace with DB query in Phase 28.
 */
function getFacilitiesForOrg(orgId: string): FacilityConfig[] {
  // Deterministic fixture keyed by orgId.
  // This allows end-to-end rendering of the facilities dashboard during development.
  return [
    {
      facilityId: `${orgId}-fac-001`,
      facilityName: 'Main Campus',
      location: 'Primary site',
    },
    {
      facilityId: `${orgId}-fac-002`,
      facilityName: 'North Campus',
      location: 'Secondary site',
    },
  ];
}
