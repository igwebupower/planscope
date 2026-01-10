import type { PlanningApplication, LocalAuthority, PlanningClimate } from '../types/index.js';

// Sample UK local authorities with planning stats
export const LOCAL_AUTHORITIES: Record<string, LocalAuthority> = {
  camden: {
    name: 'Camden',
    approval_rate: 0.72,
    avg_decision_days: 56,
    planning_climate: 'PRO_DEVELOPMENT',
  },
  islington: {
    name: 'Islington',
    approval_rate: 0.68,
    avg_decision_days: 63,
    planning_climate: 'MODERATE',
  },
  westminster: {
    name: 'Westminster',
    approval_rate: 0.58,
    avg_decision_days: 78,
    planning_climate: 'RESTRICTIVE',
  },
  hackney: {
    name: 'Hackney',
    approval_rate: 0.75,
    avg_decision_days: 52,
    planning_climate: 'PRO_DEVELOPMENT',
  },
  kensington: {
    name: 'Kensington and Chelsea',
    approval_rate: 0.55,
    avg_decision_days: 84,
    planning_climate: 'RESTRICTIVE',
  },
  southwark: {
    name: 'Southwark',
    approval_rate: 0.71,
    avg_decision_days: 58,
    planning_climate: 'PRO_DEVELOPMENT',
  },
  tower_hamlets: {
    name: 'Tower Hamlets',
    approval_rate: 0.69,
    avg_decision_days: 61,
    planning_climate: 'MODERATE',
  },
  lambeth: {
    name: 'Lambeth',
    approval_rate: 0.73,
    avg_decision_days: 54,
    planning_climate: 'PRO_DEVELOPMENT',
  },
};

// Application types commonly found in UK planning
export const APPLICATION_TYPES = [
  'Single storey rear extension',
  'Two storey side extension',
  'Loft conversion with dormer',
  'Change of use - residential',
  'New dwelling',
  'Basement extension',
  'Outbuilding/garden room',
  'Shop front alterations',
  'Listed building consent',
  'Tree works',
  'Solar panel installation',
  'New vehicular access',
  'Conversion of garage',
  'Roof terrace',
  'External alterations',
];

// Generate realistic mock applications around a given point
export function generateMockApplications(
  centerLat: number,
  centerLng: number,
  radiusM: number,
  count: number = 15
): PlanningApplication[] {
  const applications: PlanningApplication[] = [];
  const statuses = ['APPROVED', 'REFUSED', 'PENDING', 'WITHDRAWN'] as const;
  const statusWeights = [0.65, 0.15, 0.15, 0.05]; // Realistic distribution

  for (let i = 0; i < count; i++) {
    // Generate random point within radius
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radiusM;
    const latOffset = (distance * Math.cos(angle)) / 111000; // Rough meters to degrees
    const lngOffset = (distance * Math.sin(angle)) / (111000 * Math.cos(centerLat * Math.PI / 180));

    const lat = centerLat + latOffset;
    const lng = centerLng + lngOffset;

    // Weighted random status
    const rand = Math.random();
    let cumulative = 0;
    let status: typeof statuses[number] = statuses[0];
    for (let j = 0; j < statuses.length; j++) {
      cumulative += statusWeights[j];
      if (rand < cumulative) {
        status = statuses[j];
        break;
      }
    }

    // Generate decision date (within last 2 years for decided apps)
    let decisionDate: string | null = null;
    if (status !== 'PENDING') {
      const daysAgo = Math.floor(Math.random() * 730);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      decisionDate = date.toISOString().split('T')[0];
    }

    // Generate house number and street
    const houseNum = Math.floor(Math.random() * 200) + 1;
    const streets = [
      'High Street', 'Church Road', 'Station Road', 'Park Avenue',
      'Victoria Road', 'Green Lane', 'Mill Lane', 'The Grove',
      'Queens Road', 'Kings Road', 'Manor Road', 'Elm Grove',
    ];
    const street = streets[Math.floor(Math.random() * streets.length)];

    const applicationType = APPLICATION_TYPES[Math.floor(Math.random() * APPLICATION_TYPES.length)];

    applications.push({
      id: `APP/${2023 + Math.floor(Math.random() * 2)}/${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
      address: `${houseNum} ${street}`,
      lat,
      lng,
      distance_m: Math.round(distance),
      status,
      decision_date: decisionDate,
      type: getApplicationTypeCategory(applicationType),
      summary: applicationType,
    });
  }

  // Sort by distance
  return applications.sort((a, b) => a.distance_m - b.distance_m);
}

function getApplicationTypeCategory(summary: string): string {
  if (summary.includes('extension') || summary.includes('Loft') || summary.includes('Basement')) {
    return 'EXTENSION';
  }
  if (summary.includes('dwelling') || summary.includes('New')) {
    return 'NEW_BUILD';
  }
  if (summary.includes('Change of use') || summary.includes('Conversion')) {
    return 'CHANGE_OF_USE';
  }
  if (summary.includes('Tree') || summary.includes('Solar')) {
    return 'MINOR_WORKS';
  }
  return 'OTHER';
}

// Determine local authority based on coordinates (simplified)
export function getLocalAuthority(lat: number, lng: number): LocalAuthority {
  // Simplified zone detection based on London coordinates
  // In production, this would use proper boundary data
  const keys = Object.keys(LOCAL_AUTHORITIES);
  const index = Math.abs(Math.floor((lat * 100 + lng * 100) % keys.length));
  return LOCAL_AUTHORITIES[keys[index]];
}
