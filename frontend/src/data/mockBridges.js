export const mockBridges = [
  {
    id: 'bridge_001',
    name: '11 Foot 8 Bridge (The Can Opener)',
    location: 'Durham, NC',
    latitude: 35.9940,
    longitude: -78.9103,
    clearance: 148, // 12'4" (was 11'8", raised in 2019)
    clearanceFeet: "12'4\"",
    incidentCount: 150,
    lastIncident: '2024-09-15',
    warnings: [
      'NOTORIOUS: 150+ documented strikes',
      'Has its own YouTube channel',
      'Most famous problem bridge in America'
    ],
    status: 'high-risk',
    imageUrl: '/assets/bridges/11foot8.jpg'
  },
  {
    id: 'bridge_002',
    name: 'Storrow Drive Bridges',
    location: 'Boston, MA',
    latitude: 42.3601,
    longitude: -71.0942,
    clearance: 126, // 10'6"
    clearanceFeet: "10'6\"",
    incidentCount: 89,
    lastIncident: '2024-10-01',
    warnings: [
      'Commercial vehicles PROHIBITED',
      'GPS often routes trucks here incorrectly',
      'Multiple bridges all under 11 feet',
      'Happens every Allston Christmas (student move-in)'
    ],
    status: 'critical',
    imageUrl: '/assets/bridges/storrow.jpg'
  },
  {
    id: 'bridge_002b',
    name: 'Memorial Drive Underpass',
    location: 'Cambridge, MA',
    latitude: 42.3636,
    longitude: -71.1003,
    clearance: 132, // 11'0"
    clearanceFeet: "11'0\"",
    incidentCount: 45,
    lastIncident: '2024-09-28',
    warnings: [
      'DANGEROUS for tall vehicles',
      'Just 3 miles from start',
      'Low clearance - rental trucks get stuck weekly',
      'Emergency services called frequently'
    ],
    status: 'critical',
    imageUrl: '/assets/bridges/memorial.jpg'
  },
  {
    id: 'bridge_003',
    name: 'Brooklyn-Queens Expressway',
    location: 'Brooklyn, NY',
    latitude: 40.6782,
    longitude: -73.9442,
    clearance: 138, // 11'6"
    clearanceFeet: "11'6\"",
    incidentCount: 23,
    lastIncident: '2024-08-20',
    warnings: [
      'Older infrastructure',
      'Frequent commercial traffic',
      'Tight clearances throughout'
    ],
    status: 'caution',
    imageUrl: '/assets/bridges/bqe.jpg'
  },
  {
    id: 'bridge_004',
    name: 'Tobin Bridge',
    location: 'Boston, MA',
    latitude: 42.3875,
    longitude: -71.0558,
    clearance: 168, // 14'0"
    clearanceFeet: "14'0\"",
    incidentCount: 0,
    lastIncident: null,
    warnings: [],
    status: 'safe',
    imageUrl: '/assets/bridges/tobin.jpg'
  },
  {
    id: 'bridge_005',
    name: 'I-95 Standard Overpass',
    location: 'Multiple locations',
    latitude: 42.1234,
    longitude: -71.2345,
    clearance: 174, // 14'6"
    clearanceFeet: "14'6\"",
    incidentCount: 0,
    lastIncident: null,
    warnings: [],
    status: 'safe',
    imageUrl: '/assets/bridges/i95.jpg'
  },
  {
    id: 'bridge_006',
    name: 'Montague Street Bridge',
    location: 'Chicago, IL',
    latitude: 41.8920,
    longitude: -87.6325,
    clearance: 135, // 11'3"
    clearanceFeet: "11'3\"",
    incidentCount: 167,
    lastIncident: '2024-10-22',
    warnings: [
      'EXTREME DANGER: 167 crashes since 2009',
      'Most hit bridge in America',
      'City renamed it "CAN OPENER BRIDGE"',
      'Average 1 crash per month',
      'Featured in countless viral videos'
    ],
    status: 'critical',
    imageUrl: '/assets/bridges/montague.jpg'
  },
  {
    id: 'bridge_007',
    name: 'Gregson Street Railroad Bridge',
    location: 'Durham, NC',
    latitude: 35.9995,
    longitude: -78.9086,
    clearance: 142, // 11'10"
    clearanceFeet: "11'10\"",
    incidentCount: 145,
    lastIncident: '2024-09-30',
    warnings: [
      'LEGENDARY: The ORIGINAL 11 Foot 8',
      'Has dedicated YouTube channel with 3M+ views',
      'Raised to 12\'4" in 2019, still gets hit',
      'Became 11foot8+8 after modification',
      'Warning system ignored constantly'
    ],
    status: 'critical',
    imageUrl: '/assets/bridges/11foot8.jpg'
  },
  {
    id: 'bridge_008',
    name: 'Westwood Boulevard Bridge',
    location: 'Los Angeles, CA',
    latitude: 34.0522,
    longitude: -118.4413,
    clearance: 138, // 11'6"
    clearanceFeet: "11'6\"",
    incidentCount: 34,
    lastIncident: '2024-08-15',
    warnings: [
      'Moving trucks stuck weekly',
      'U-Haul and Penske frequent victims',
      'Rental company blacklisted location',
      'LAPD Traffic Division knows it well'
    ],
    status: 'high-risk',
    imageUrl: '/assets/bridges/westwood.jpg'
  },
  {
    id: 'bridge_009',
    name: 'FDR Drive Overpasses',
    location: 'Manhattan, NY',
    latitude: 40.7489,
    longitude: -73.9680,
    clearance: 144, // 12'0"
    clearanceFeet: "12'0\"",
    incidentCount: 78,
    lastIncident: '2024-10-05',
    warnings: [
      'Multiple low bridges in sequence',
      'Moving truck graveyard',
      'All clearances 12\' or less',
      'Tourist rental trucks common victims',
      'Emergency lane closures weekly'
    ],
    status: 'high-risk',
    imageUrl: '/assets/bridges/fdr.jpg'
  },
  {
    id: 'bridge_010',
    name: 'Belt Parkway Overpasses',
    location: 'Brooklyn, NY',
    latitude: 40.5889,
    longitude: -73.9400,
    clearance: 132, // 11'0"
    clearanceFeet: "11'0\"",
    incidentCount: 92,
    lastIncident: '2024-09-18',
    warnings: [
      'COMMERCIAL VEHICLES BANNED',
      'Signs posted but GPS routes trucks anyway',
      'Parkway = Low clearances',
      'Designed for passenger cars only',
      'Tow trucks stationed nearby'
    ],
    status: 'critical',
    imageUrl: '/assets/bridges/belt.jpg'
  },
  {
    id: 'bridge_011',
    name: 'Memorial Drive Railway Bridge',
    location: 'Cambridge, MA',
    latitude: 42.3680,
    longitude: -71.1150,
    clearance: 126, // 10'6"
    clearanceFeet: "10'6\"",
    incidentCount: 56,
    lastIncident: '2024-09-25',
    warnings: [
      'EXTREMELY LOW - 10\'6" only',
      'MIT students witness crashes regularly',
      'Moving trucks during college move-in',
      'Railroad owned - expensive repairs billed to drivers',
      'Police checkpoint during September'
    ],
    status: 'critical',
    imageUrl: '/assets/bridges/memorial_rail.jpg'
  },
  {
    id: 'bridge_012',
    name: 'Soldiers Field Road Bridge',
    location: 'Boston, MA',
    latitude: 42.3647,
    longitude: -71.1256,
    clearance: 132, // 11'0"
    clearanceFeet: "11'0\"",
    incidentCount: 41,
    lastIncident: '2024-08-30',
    warnings: [
      'Parallel to Storrow - same problems',
      'GPS confusion with nearby routes',
      'Part of Boston\'s low bridge network',
      'Stadium traffic makes it worse'
    ],
    status: 'high-risk',
    imageUrl: '/assets/bridges/soldiers.jpg'
  },
  {
    id: 'bridge_013',
    name: 'Onondaga Lake Parkway Bridge',
    location: 'Syracuse, NY',
    latitude: 43.0962,
    longitude: -76.2161,
    clearance: 138, // 11'6"
    clearanceFeet: "11'6\"",
    incidentCount: 67,
    lastIncident: '2024-10-12',
    warnings: [
      'Parkway designation means low clearance',
      'Commercial restriction often ignored',
      'Multiple strikes per year',
      'Warning signs frequently damaged by impacts'
    ],
    status: 'high-risk',
    imageUrl: '/assets/bridges/onondaga.jpg'
  },
  {
    id: 'bridge_014',
    name: 'Lake Shore Drive Underpass',
    location: 'Chicago, IL',
    latitude: 41.9102,
    longitude: -87.6270,
    clearance: 135, // 11'3"
    clearanceFeet: "11'3\"",
    incidentCount: 53,
    lastIncident: '2024-09-08',
    warnings: [
      'Scenic route = Low bridges',
      'Tourist rental trucks',
      'Beach traffic in summer',
      'No turnaround after warning signs'
    ],
    status: 'high-risk',
    imageUrl: '/assets/bridges/lakeshore.jpg'
  },
  {
    id: 'bridge_015',
    name: 'The Canopener (Reservoir Street)',
    location: 'Needham, MA',
    latitude: 42.2835,
    longitude: -71.2356,
    clearance: 120, // 10'0"
    clearanceFeet: "10'0\"",
    incidentCount: 38,
    lastIncident: '2024-10-01',
    warnings: [
      'EXTREMELY DANGEROUS: Only 10\' clearance',
      'Nicknamed "The Canopener" by locals',
      'Box trucks destroyed regularly',
      'Private railroad - driver pays all damages',
      'Local tow company makes fortune here'
    ],
    status: 'critical',
    imageUrl: '/assets/bridges/canopener.jpg'
  },
  // SAFE BRIDGES - Route A
  {
    id: 'i95_providence_overpass',
    name: 'I-95 Providence Overpass',
    location: 'Providence, RI',
    latitude: 41.8240,
    longitude: -71.4128,
    clearance: 192, // 16'0"
    clearanceInches: 192,
    clearanceFeet: "16'0\"",
    incidentCount: 0,
    lastIncident: null,
    warnings: [],
    status: 'safe',
    imageUrl: null
  },
  {
    id: 'i95_connecticut_bridge',
    name: 'I-95 Connecticut River Bridge',
    location: 'Old Lyme, CT',
    latitude: 41.3153,
    longitude: -72.3395,
    clearance: 180, // 15'0"
    clearanceInches: 180,
    clearanceFeet: "15'0\"",
    incidentCount: 0,
    lastIncident: null,
    warnings: [],
    status: 'safe',
    imageUrl: null
  },
  {
    id: 'i94_kalamazoo_overpass',
    name: 'I-94 Kalamazoo Overpass',
    location: 'Kalamazoo, MI',
    latitude: 42.2917,
    longitude: -85.5872,
    clearance: 180, // 15'0"
    clearanceInches: 180,
    clearanceFeet: "15'0\"",
    incidentCount: 0,
    lastIncident: null,
    warnings: [],
    status: 'safe',
    imageUrl: null
  },
  {
    id: 'i94_battle_creek_bridge',
    name: 'I-94 Battle Creek Bridge',
    location: 'Battle Creek, MI',
    latitude: 42.3211,
    longitude: -85.1797,
    clearance: 192, // 16'0"
    clearanceInches: 192,
    clearanceFeet: "16'0\"",
    incidentCount: 0,
    lastIncident: null,
    warnings: [],
    status: 'safe',
    imageUrl: null
  }
];

export const getBridgeById = (id) => mockBridges.find(b => b.id === id);

export const getBridgesByStatus = (status) => 
  mockBridges.filter(b => b.status === status);

export const getProblematicBridges = () => 
  mockBridges.filter(b => b.incidentCount > 10);