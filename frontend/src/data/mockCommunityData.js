export const mockIncidents = [
  // Durham, NC - The infamous 11 Foot 8 Bridge (now 12'4")
  {
    id: 'incident_001',
    bridge_id: 'bridge_001',
    bridge_name: '11 Foot 8 Bridge (Can Opener)',
    latitude: 35.9940,
    longitude: -78.9103,
    date: '2024-11-05T14:30:00',
    vehicle_height: 156,
    damage_severity: 'severe',
    reported_by: 'user_1234',
    verified: true,
    photos: ['/incidents/11foot8_nov2024.jpg']
  },
  {
    id: 'incident_002',
    bridge_id: 'bridge_001',
    bridge_name: '11 Foot 8 Bridge (Can Opener)',
    latitude: 35.9940,
    longitude: -78.9103,
    date: '2024-10-15T12:00:00',
    vehicle_height: 155,
    damage_severity: 'catastrophic',
    reported_by: 'user_7890',
    verified: true,
    photos: []
  },
  
  // Boston Storrow Drive - Multiple low bridges
  {
    id: 'incident_003',
    bridge_id: 'bridge_002',
    bridge_name: 'Storrow Drive - Dartmouth St Bridge',
    latitude: 42.3601,
    longitude: -71.0942,
    date: '2024-11-01T10:15:00',
    vehicle_height: 162,
    damage_severity: 'severe',
    reported_by: 'user_5678',
    verified: true,
    photos: []
  },
  {
    id: 'incident_004',
    bridge_id: 'bridge_002',
    bridge_name: 'Storrow Drive - Dartmouth St Bridge',
    latitude: 42.3601,
    longitude: -71.0942,
    date: '2024-10-28T16:45:00',
    vehicle_height: 160,
    damage_severity: 'moderate',
    reported_by: 'user_9012',
    verified: true,
    photos: []
  },
  {
    id: 'incident_005',
    bridge_id: 'bridge_003',
    bridge_name: 'Storrow Drive - Fairfield St Bridge',
    latitude: 42.3615,
    longitude: -71.0875,
    date: '2024-10-20T09:30:00',
    vehicle_height: 158,
    damage_severity: 'severe',
    reported_by: 'user_3456',
    verified: true,
    photos: []
  },
  {
    id: 'incident_006',
    bridge_id: 'bridge_004',
    bridge_name: 'Storrow Drive - Mass Ave Bridge',
    latitude: 42.3629,
    longitude: -71.0811,
    date: '2024-09-12T08:20:00',
    vehicle_height: 161,
    damage_severity: 'severe',
    reported_by: 'user_2468',
    verified: true,
    photos: []
  },
  
  // NYC - Multiple notorious bridges
  {
    id: 'incident_007',
    bridge_id: 'bridge_005',
    bridge_name: 'BQE - Atlantic Avenue Overpass',
    latitude: 40.6782,
    longitude: -73.9442,
    date: '2024-10-30T15:40:00',
    vehicle_height: 159,
    damage_severity: 'severe',
    reported_by: 'user_1357',
    verified: true,
    photos: []
  },
  {
    id: 'incident_008',
    bridge_id: 'bridge_006',
    bridge_name: 'Jackie Robinson Parkway Bridge',
    latitude: 40.6891,
    longitude: -73.8742,
    date: '2024-10-18T11:25:00',
    vehicle_height: 157,
    damage_severity: 'catastrophic',
    reported_by: 'user_8642',
    verified: true,
    photos: []
  },
  {
    id: 'incident_009',
    bridge_id: 'bridge_007',
    bridge_name: 'Montague Street Bridge (Brooklyn)',
    latitude: 40.6947,
    longitude: -73.9951,
    date: '2024-09-25T13:15:00',
    vehicle_height: 162,
    damage_severity: 'severe',
    reported_by: 'user_9753',
    verified: true,
    photos: []
  },
  
  // Chicago notorious bridges
  {
    id: 'incident_010',
    bridge_id: 'bridge_008',
    bridge_name: 'South Shore Line Bridge - Chicago',
    latitude: 41.7956,
    longitude: -87.5863,
    date: '2024-10-05T14:50:00',
    vehicle_height: 158,
    damage_severity: 'severe',
    reported_by: 'user_1593',
    verified: true,
    photos: []
  },
  {
    id: 'incident_011',
    bridge_id: 'bridge_009',
    bridge_name: 'Pershing Road Viaduct',
    latitude: 41.8234,
    longitude: -87.6278,
    date: '2024-09-15T10:30:00',
    vehicle_height: 160,
    damage_severity: 'moderate',
    reported_by: 'user_7531',
    verified: true,
    photos: []
  },
  
  // Philadelphia
  {
    id: 'incident_012',
    bridge_id: 'bridge_010',
    bridge_name: 'Roosevelt Boulevard Bridge',
    latitude: 40.0379,
    longitude: -75.0803,
    date: '2024-10-22T09:15:00',
    vehicle_height: 156,
    damage_severity: 'severe',
    reported_by: 'user_3698',
    verified: true,
    photos: []
  },
  
  // Washington DC
  {
    id: 'incident_013',
    bridge_id: 'bridge_011',
    bridge_name: 'Rock Creek Parkway Bridge',
    latitude: 38.9199,
    longitude: -77.0519,
    date: '2024-10-08T16:20:00',
    vehicle_height: 159,
    damage_severity: 'moderate',
    reported_by: 'user_1472',
    verified: true,
    photos: []
  },
  
  // Atlanta
  {
    id: 'incident_014',
    bridge_id: 'bridge_012',
    bridge_name: 'Freedom Parkway Bridge',
    latitude: 33.7701,
    longitude: -84.3634,
    date: '2024-09-28T12:45:00',
    vehicle_height: 161,
    damage_severity: 'severe',
    reported_by: 'user_9514',
    verified: true,
    photos: []
  },
  
  // Seattle
  {
    id: 'incident_015',
    bridge_id: 'bridge_013',
    bridge_name: 'Aurora Bridge Low Clearance',
    latitude: 47.6475,
    longitude: -122.3476,
    date: '2024-10-12T08:55:00',
    vehicle_height: 158,
    damage_severity: 'moderate',
    reported_by: 'user_7539',
    verified: true,
    photos: []
  },
  
  // Los Angeles
  {
    id: 'incident_016',
    bridge_id: 'bridge_014',
    bridge_name: 'Venice Boulevard Bridge',
    latitude: 34.0195,
    longitude: -118.3890,
    date: '2024-09-20T14:10:00',
    vehicle_height: 160,
    damage_severity: 'severe',
    reported_by: 'user_8642',
    verified: true,
    photos: []
  },
  
  // Houston
  {
    id: 'incident_017',
    bridge_id: 'bridge_015',
    bridge_name: 'Memorial Drive Underpass',
    latitude: 29.7633,
    longitude: -95.4282,
    date: '2024-10-25T11:40:00',
    vehicle_height: 157,
    damage_severity: 'catastrophic',
    reported_by: 'user_3571',
    verified: true,
    photos: []
  },
  
  // Miami
  {
    id: 'incident_018',
    bridge_id: 'bridge_016',
    bridge_name: 'I-95 NW 79th Street Bridge',
    latitude: 25.8476,
    longitude: -80.2017,
    date: '2024-09-30T15:25:00',
    vehicle_height: 159,
    damage_severity: 'severe',
    reported_by: 'user_1593',
    verified: true,
    photos: []
  },
  
  // Detroit
  {
    id: 'incident_019',
    bridge_id: 'bridge_017',
    bridge_name: 'Lodge Freeway Railroad Bridge',
    latitude: 42.3666,
    longitude: -83.0757,
    date: '2024-10-03T13:30:00',
    vehicle_height: 156,
    damage_severity: 'moderate',
    reported_by: 'user_7418',
    verified: true,
    photos: []
  },
  
  // Denver
  {
    id: 'incident_020',
    bridge_id: 'bridge_018',
    bridge_name: 'Colfax Avenue Viaduct',
    latitude: 39.7403,
    longitude: -104.9851,
    date: '2024-09-18T10:20:00',
    vehicle_height: 161,
    damage_severity: 'severe',
    reported_by: 'user_9632',
    verified: true,
    photos: []
  },
  
  // Portland
  {
    id: 'incident_021',
    bridge_id: 'bridge_019',
    bridge_name: 'Burnside Bridge Approach',
    latitude: 45.5231,
    longitude: -122.6689,
    date: '2024-10-14T09:45:00',
    vehicle_height: 158,
    damage_severity: 'moderate',
    reported_by: 'user_3698',
    verified: true,
    photos: []
  },
  
  // San Francisco
  {
    id: 'incident_022',
    bridge_id: 'bridge_020',
    bridge_name: 'Cesar Chavez Overpass',
    latitude: 37.7489,
    longitude: -122.4089,
    date: '2024-09-22T16:00:00',
    vehicle_height: 160,
    damage_severity: 'severe',
    reported_by: 'user_1597',
    verified: true,
    photos: []
  },
  
  // Dallas
  {
    id: 'incident_023',
    bridge_id: 'bridge_021',
    bridge_name: 'Woodall Rodgers Freeway Bridge',
    latitude: 32.7873,
    longitude: -96.8021,
    date: '2024-10-27T12:15:00',
    vehicle_height: 162,
    damage_severity: 'catastrophic',
    reported_by: 'user_8524',
    verified: true,
    photos: []
  },
  
  // Phoenix
  {
    id: 'incident_024',
    bridge_id: 'bridge_022',
    bridge_name: 'Grand Avenue Railroad Bridge',
    latitude: 33.4619,
    longitude: -112.0815,
    date: '2024-09-11T14:35:00',
    vehicle_height: 157,
    damage_severity: 'severe',
    reported_by: 'user_7539',
    verified: true,
    photos: []
  },
  
  // Cleveland
  {
    id: 'incident_025',
    bridge_id: 'bridge_023',
    bridge_name: 'Detroit-Superior Bridge Lower Level',
    latitude: 41.4850,
    longitude: -81.7041,
    date: '2024-10-19T11:50:00',
    vehicle_height: 159,
    damage_severity: 'moderate',
    reported_by: 'user_9517',
    verified: true,
    photos: []
  },
  
  // Indianapolis
  {
    id: 'incident_026',
    bridge_id: 'bridge_024',
    bridge_name: 'I-70 West Street Underpass',
    latitude: 39.7699,
    longitude: -86.1742,
    date: '2024-09-26T13:25:00',
    vehicle_height: 156,
    damage_severity: 'severe',
    reported_by: 'user_3571',
    verified: true,
    photos: []
  },
  
  // Nashville
  {
    id: 'incident_027',
    bridge_id: 'bridge_025',
    bridge_name: 'Broadway Viaduct',
    latitude: 36.1540,
    longitude: -86.7719,
    date: '2024-10-10T15:10:00',
    vehicle_height: 160,
    damage_severity: 'moderate',
    reported_by: 'user_1593',
    verified: true,
    photos: []
  },
  
  // Baltimore
  {
    id: 'incident_028',
    bridge_id: 'bridge_026',
    bridge_name: 'Howard Street Tunnel',
    latitude: 39.2904,
    longitude: -76.6122,
    date: '2024-09-17T10:40:00',
    vehicle_height: 161,
    damage_severity: 'severe',
    reported_by: 'user_7418',
    verified: true,
    photos: []
  },
  
  // Pittsburgh
  {
    id: 'incident_029',
    bridge_id: 'bridge_027',
    bridge_name: 'Fort Pitt Tunnel South',
    latitude: 40.4313,
    longitude: -80.0147,
    date: '2024-10-06T09:20:00',
    vehicle_height: 158,
    damage_severity: 'catastrophic',
    reported_by: 'user_9632',
    verified: true,
    photos: []
  },
  
  // Minneapolis
  {
    id: 'incident_030',
    bridge_id: 'bridge_028',
    bridge_name: 'Lowry Avenue Bridge',
    latitude: 45.0326,
    longitude: -93.2701,
    date: '2024-09-29T12:05:00',
    vehicle_height: 162,
    damage_severity: 'severe',
    reported_by: 'user_3698',
    verified: true,
    photos: []
  }
];

export const mockActivityFeed = [
  {
    id: 'activity_001',
    type: 'verification',
    user: 'SafeDriver42',
    action: 'verified bridge clearance',
    bridge: 'Tobin Bridge',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
    icon: '✅'
  },
  {
    id: 'activity_002',
    type: 'incident',
    user: 'TruckDriver88',
    action: 'reported strike',
    bridge: 'Storrow Drive Bridge 1',
    timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 min ago
    icon: '🚨'
  },
  {
    id: 'activity_003',
    type: 'contribution',
    user: 'CommunityHelper',
    action: 'uploaded bridge photo',
    bridge: 'BQE Overpass',
    timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 min ago
    icon: '📸'
  },
  {
    id: 'activity_004',
    type: 'verification',
    user: 'LocalDriver99',
    action: 'confirmed clearance change',
    bridge: 'I-95 Bridge Mile 45',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
    icon: '✅'
  },
  {
    id: 'activity_005',
    type: 'alert',
    user: 'System',
    action: 'prevented potential strike',
    bridge: '11 Foot 8 Bridge',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hr ago
    icon: '🛡️'
  },
  {
    id: 'activity_006',
    type: 'contribution',
    user: 'BridgeWatcher',
    action: 'added new bridge',
    bridge: 'Highway 50 Overpass',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hrs ago
    icon: '➕'
  }
];

export const mockLeaderboard = [
  {
    rank: 1,
    username: 'BridgeGuardian_Pro',
    contributions: 247,
    verifications: 156,
    photos_uploaded: 91,
    trust_score: 98,
    member_since: '2024-01-15'
  },
  {
    rank: 2,
    username: 'SafetyFirst_2024',
    contributions: 198,
    verifications: 132,
    photos_uploaded: 66,
    trust_score: 96,
    member_since: '2024-02-20'
  },
  {
    rank: 3,
    username: 'TruckDriverDave',
    contributions: 156,
    verifications: 98,
    photos_uploaded: 58,
    trust_score: 94,
    member_since: '2024-03-10'
  },
  {
    rank: 4,
    username: 'CommunityHelper',
    contributions: 134,
    verifications: 89,
    photos_uploaded: 45,
    trust_score: 92,
    member_since: '2024-04-05'
  },
  {
    rank: 5,
    username: 'RoadWarrior',
    contributions: 112,
    verifications: 76,
    photos_uploaded: 36,
    trust_score: 90,
    member_since: '2024-05-12'
  }
];

export const mockStrikesByMonth = [
  { month: 'May', strikes: 78, prevented: 12 },
  { month: 'Jun', strikes: 92, prevented: 18 },
  { month: 'Jul', strikes: 105, prevented: 24 },
  { month: 'Aug', strikes: 118, prevented: 31 },
  { month: 'Sep', strikes: 87, prevented: 45 },
  { month: 'Oct', strikes: 64, prevented: 58 },
  { month: 'Nov', strikes: 23, prevented: 67 }
];

export const mockBridgesByRisk = [
  { name: 'Critical', value: 8, color: '#dc2626' },
  { name: 'High Risk', value: 15, color: '#ea580c' },
  { name: 'Medium Risk', value: 28, color: '#eab308' },
  { name: 'Low Risk', value: 45, color: '#3b82f6' },
  { name: 'Safe', value: 104, color: '#22c55e' }
];

export const mockTopProblemBridges = [
  { name: '11 Foot 8 (Durham)', strikes: 150, risk: 95 },
  { name: 'Storrow Dr B1 (Boston)', strikes: 89, risk: 98 },
  { name: 'Storrow Dr B2 (Boston)', strikes: 67, risk: 98 },
  { name: 'Storrow Dr B3 (Boston)', strikes: 54, risk: 98 },
  { name: 'BQE Brooklyn', strikes: 23, risk: 75 },
  { name: 'Memorial Dr (Boston)', strikes: 12, risk: 65 }
];

export const mockCommunityGrowth = [
  { month: 'May', users: 1200, bridges: 145 },
  { month: 'Jun', users: 2100, bridges: 167 },
  { month: 'Jul', users: 3800, bridges: 182 },
  { month: 'Aug', users: 6200, bridges: 195 },
  { month: 'Sep', users: 9500, bridges: 203 },
  { month: 'Oct', users: 14200, bridges: 218 },
  { month: 'Nov', users: 18900, bridges: 234 }
];

export const mockUserStats = {
  warnings_received: 23,
  strikes_prevented: 3,
  bridges_verified: 7,
  photos_uploaded: 4,
  days_active: 45,
  trust_score: 87
};