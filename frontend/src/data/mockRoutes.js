export const mockRoutes = {
  'boston-nyc': [
    {
      id: 'route_safe',
      name: 'I-95 South (Safe Route)',
      type: 'interstate',
      distance: 215,
      duration: 255, // minutes
      safetyGrade: 'A',
      riskLevel: 'SAFE',
      strikeProbability: 0.02,
      bridges: [
        { id: 'i95_providence_overpass', clearance: 192, margin: 'comfortable', name: 'I-95 Providence Overpass (16\'0")' },
        { id: 'i95_connecticut_bridge', clearance: 180, margin: 'comfortable', name: 'I-95 Connecticut River Bridge (15\'0")' }
      ],
      description: 'All Interstate highways with 14+ foot clearances. Standard commercial truck route. No known problem areas.',
      recommended: true,
      icon: '✅'
    },
    {
      id: 'route_risky',
      name: 'I-93 to Highway 1 (Marginal)',
      type: 'mixed',
      distance: 208,
      duration: 248,
      safetyGrade: 'C',
      riskLevel: 'MEDIUM',
      strikeProbability: 0.35,
      bridges: [
        { id: 'bridge_004', clearance: 168, margin: 'tight' },
        { id: 'bridge_003', clearance: 138, margin: 'very tight' }
      ],
      description: 'Shorter but includes tight clearances. BQE section has multiple 11\'6" bridges. Not recommended for inexperienced drivers.',
      recommended: false,
      icon: '⚠️'
    },
    {
      id: 'route_dangerous',
      name: 'Storrow Drive Route (BLOCKED)',
      type: 'prohibited',
      distance: 203,
      duration: 243,
      safetyGrade: 'F',
      riskLevel: 'CRITICAL',
      strikeProbability: 0.99,
      bridges: [
        { id: 'bridge_002', clearance: 126, margin: 'will not fit' }
      ],
      description: 'DANGEROUS: Storrow Drive has 10\'6" clearances. GPS often incorrectly routes trucks here. 89 documented strikes. DO NOT USE.',
      recommended: false,
      blocked: true,
      icon: '🚫'
    }
  ],
  
  'chicago-detroit': [
    {
      id: 'chi_det_safe',
      name: 'I-94 East (Recommended)',
      type: 'interstate',
      distance: 283,
      duration: 285,
      safetyGrade: 'A',
      riskLevel: 'SAFE',
      strikeProbability: 0.01,
      bridges: [
        { id: 'i94_kalamazoo_overpass', clearance: 180, margin: 'comfortable', name: 'I-94 Kalamazoo Overpass (15\'0")' },
        { id: 'i94_battle_creek_bridge', clearance: 192, margin: 'comfortable', name: 'I-94 Battle Creek Bridge (16\'0")' }
      ],
      description: 'Major interstate corridor. All bridges 15+ feet. Excellent for oversized loads.',
      recommended: true,
      icon: '✅'
    },
    {
      id: 'chi_det_alternate',
      name: 'US-12 Route (Scenic)',
      type: 'highway',
      distance: 291,
      duration: 310,
      safetyGrade: 'B',
      riskLevel: 'LOW',
      strikeProbability: 0.08,
      bridges: [
        { id: 'chi_bridge_004', clearance: 170, margin: 'comfortable' },
        { id: 'chi_bridge_005', clearance: 164, margin: 'tight' }
      ],
      description: 'Slower scenic route. Most clearances good but one 13\'8" bridge requires caution.',
      recommended: false,
      icon: '🛣️'
    }
  ],

  'la-sf': [
    {
      id: 'la_sf_coastal',
      name: 'US-101 Coastal (Safe)',
      type: 'highway',
      distance: 382,
      duration: 390,
      safetyGrade: 'A',
      riskLevel: 'SAFE',
      strikeProbability: 0.03,
      bridges: [
        { id: 'ca_bridge_001', clearance: 186, margin: 'comfortable' },
        { id: 'ca_bridge_002', clearance: 192, margin: 'comfortable' },
        { id: 'ca_bridge_003', clearance: 174, margin: 'comfortable' }
      ],
      description: 'Scenic coastal route with excellent clearances. Preferred truck route for Pacific coast.',
      recommended: true,
      icon: '🌊'
    },
    {
      id: 'la_sf_inland',
      name: 'I-5 Inland (Fastest)',
      type: 'interstate',
      distance: 383,
      duration: 360,
      safetyGrade: 'A',
      riskLevel: 'SAFE',
      strikeProbability: 0.02,
      bridges: [
        { id: 'ca_bridge_004', clearance: 180, margin: 'comfortable' },
        { id: 'ca_bridge_005', clearance: 204, margin: 'comfortable' }
      ],
      description: 'Fastest inland route through Central Valley. All Interstate-standard clearances.',
      recommended: true,
      icon: '⚡'
    }
  ],

  'miami-orlando': [
    {
      id: 'mia_orl_turnpike',
      name: 'Florida Turnpike (Premium)',
      type: 'toll',
      distance: 235,
      duration: 210,
      safetyGrade: 'A',
      riskLevel: 'SAFE',
      strikeProbability: 0.01,
      bridges: [
        { id: 'fl_bridge_001', clearance: 192, margin: 'comfortable' },
        { id: 'fl_bridge_002', clearance: 198, margin: 'comfortable' }
      ],
      description: 'Modern toll road with excellent clearances. Well-maintained, wide lanes.',
      recommended: true,
      icon: '💰'
    },
    {
      id: 'mia_orl_i95',
      name: 'I-95 to I-4 (Free)',
      type: 'interstate',
      distance: 241,
      duration: 225,
      safetyGrade: 'B',
      riskLevel: 'LOW',
      strikeProbability: 0.05,
      bridges: [
        { id: 'fl_bridge_003', clearance: 174, margin: 'comfortable' },
        { id: 'fl_bridge_004', clearance: 168, margin: 'comfortable' },
        { id: 'fl_bridge_005', clearance: 165, margin: 'tight' }
      ],
      description: 'Free alternative. Slightly longer with one 13\'9" bridge near Orlando.',
      recommended: false,
      icon: '🆓'
    }
  ],

  'dallas-houston': [
    {
      id: 'dal_hou_safe',
      name: 'I-45 Direct (Recommended)',
      type: 'interstate',
      distance: 239,
      duration: 225,
      safetyGrade: 'A',
      riskLevel: 'SAFE',
      strikeProbability: 0.02,
      bridges: [
        { id: 'tx_bridge_001', clearance: 186, margin: 'comfortable' },
        { id: 'tx_bridge_002', clearance: 192, margin: 'comfortable' },
        { id: 'tx_bridge_003', clearance: 180, margin: 'comfortable' }
      ],
      description: 'Direct interstate route. All clearances excellent. Heavy truck traffic route.',
      recommended: true,
      icon: '🤠'
    },
    {
      id: 'dal_hou_backroads',
      name: 'US-75 Backroads (Risky)',
      type: 'highway',
      distance: 251,
      duration: 270,
      safetyGrade: 'D',
      riskLevel: 'HIGH',
      strikeProbability: 0.68,
      bridges: [
        { id: 'tx_bridge_004', clearance: 156, margin: 'very tight' },
        { id: 'tx_bridge_005', clearance: 142, margin: 'very tight' },
        { id: 'tx_bridge_006', clearance: 138, margin: 'will not fit' }
      ],
      description: 'OLD ROUTE - Multiple low bridges from 1950s. Several 11\'6" clearances. High strike history.',
      recommended: false,
      icon: '⚠️'
    }
  ],

  'seattle-portland': [
    {
      id: 'sea_por_i5',
      name: 'I-5 South (Standard)',
      type: 'interstate',
      distance: 174,
      duration: 180,
      safetyGrade: 'A',
      riskLevel: 'SAFE',
      strikeProbability: 0.02,
      bridges: [
        { id: 'wa_bridge_001', clearance: 186, margin: 'comfortable' },
        { id: 'wa_bridge_002', clearance: 192, margin: 'comfortable' }
      ],
      description: 'Main north-south route. Modern Interstate standards throughout.',
      recommended: true,
      icon: '☕'
    },
    {
      id: 'sea_por_coastal',
      name: 'US-101 Coastal (Scenic)',
      type: 'highway',
      distance: 289,
      duration: 345,
      safetyGrade: 'C',
      riskLevel: 'MEDIUM',
      strikeProbability: 0.22,
      bridges: [
        { id: 'wa_bridge_003', clearance: 162, margin: 'tight' },
        { id: 'wa_bridge_004', clearance: 156, margin: 'very tight' },
        { id: 'wa_bridge_005', clearance: 168, margin: 'comfortable' }
      ],
      description: 'Beautiful coastal route but narrow with older bridges. Two bridges under 13\'6".',
      recommended: false,
      icon: '🌲'
    }
  ],

  // Reverse direction routes
  'nyc-boston': [
    {
      id: 'route_safe_rev',
      name: 'I-95 North (Safe Route)',
      type: 'interstate',
      distance: 215,
      duration: 255,
      safetyGrade: 'A',
      riskLevel: 'SAFE',
      strikeProbability: 0.02,
      bridges: [
        { id: 'i95_connecticut_bridge', clearance: 180, margin: 'comfortable', name: 'I-95 Connecticut River Bridge (15\'0")' },
        { id: 'i95_providence_overpass', clearance: 192, margin: 'comfortable', name: 'I-95 Providence Overpass (16\'0")' }
      ],
      description: 'All Interstate highways with 14+ foot clearances. Standard commercial truck route. No known problem areas.',
      recommended: true,
      icon: '✅'
    },
    {
      id: 'route_risky_rev',
      name: 'Highway 1 to I-93 (Marginal)',
      type: 'mixed',
      distance: 208,
      duration: 248,
      safetyGrade: 'C',
      riskLevel: 'MEDIUM',
      strikeProbability: 0.35,
      bridges: [
        { id: 'bridge_003', clearance: 138, margin: 'very tight' },
        { id: 'bridge_004', clearance: 168, margin: 'tight' }
      ],
      description: 'Shorter but includes tight clearances. BQE section has multiple 11\'6" bridges. Not recommended for inexperienced drivers.',
      recommended: false,
      icon: '⚠️'
    },
    {
      id: 'route_dangerous_rev',
      name: 'Storrow Drive Route (BLOCKED)',
      type: 'prohibited',
      distance: 203,
      duration: 243,
      safetyGrade: 'F',
      riskLevel: 'CRITICAL',
      strikeProbability: 0.99,
      bridges: [
        { id: 'bridge_002', clearance: 126, margin: 'will not fit' }
      ],
      description: 'DANGEROUS: Storrow Drive has 10\'6" clearances. GPS often incorrectly routes trucks here. 89 documented strikes. DO NOT USE.',
      recommended: false,
      blocked: true,
      icon: '🚫'
    }
  ],
  
  'detroit-chicago': [
    {
      id: 'det_chi_safe',
      name: 'I-94 West (Recommended)',
      type: 'interstate',
      distance: 283,
      duration: 285,
      safetyGrade: 'A',
      riskLevel: 'SAFE',
      strikeProbability: 0.01,
      bridges: [
        { id: 'chi_bridge_003', clearance: 186, margin: 'comfortable' },
        { id: 'chi_bridge_002', clearance: 192, margin: 'comfortable' },
        { id: 'chi_bridge_001', clearance: 180, margin: 'comfortable' }
      ],
      description: 'Major interstate corridor. All bridges 15+ feet. Excellent for oversized loads.',
      recommended: true,
      icon: '✅'
    },
    {
      id: 'det_chi_alternate',
      name: 'US-12 Route (Scenic)',
      type: 'highway',
      distance: 291,
      duration: 310,
      safetyGrade: 'B',
      riskLevel: 'LOW',
      strikeProbability: 0.08,
      bridges: [
        { id: 'chi_bridge_005', clearance: 164, margin: 'tight' },
        { id: 'chi_bridge_004', clearance: 170, margin: 'comfortable' }
      ],
      description: 'Slower scenic route. Most clearances good but one 13\'8" bridge requires caution.',
      recommended: false,
      icon: '🛣️'
    }
  ],

  'sf-la': [
    {
      id: 'sf_la_coastal',
      name: 'US-101 Coastal (Safe)',
      type: 'highway',
      distance: 382,
      duration: 390,
      safetyGrade: 'A',
      riskLevel: 'SAFE',
      strikeProbability: 0.03,
      bridges: [
        { id: 'ca_bridge_003', clearance: 174, margin: 'comfortable' },
        { id: 'ca_bridge_002', clearance: 192, margin: 'comfortable' },
        { id: 'ca_bridge_001', clearance: 186, margin: 'comfortable' }
      ],
      description: 'Scenic coastal route with excellent clearances. Preferred truck route for Pacific coast.',
      recommended: true,
      icon: '🌊'
    },
    {
      id: 'sf_la_inland',
      name: 'I-5 Inland (Fastest)',
      type: 'interstate',
      distance: 383,
      duration: 360,
      safetyGrade: 'A',
      riskLevel: 'SAFE',
      strikeProbability: 0.02,
      bridges: [
        { id: 'ca_bridge_005', clearance: 204, margin: 'comfortable' },
        { id: 'ca_bridge_004', clearance: 180, margin: 'comfortable' }
      ],
      description: 'Fastest inland route through Central Valley. All Interstate-standard clearances.',
      recommended: true,
      icon: '⚡'
    }
  ],

  'orlando-miami': [
    {
      id: 'orl_mia_turnpike',
      name: 'Florida Turnpike (Premium)',
      type: 'toll',
      distance: 235,
      duration: 210,
      safetyGrade: 'A',
      riskLevel: 'SAFE',
      strikeProbability: 0.01,
      bridges: [
        { id: 'fl_bridge_002', clearance: 198, margin: 'comfortable' },
        { id: 'fl_bridge_001', clearance: 192, margin: 'comfortable' }
      ],
      description: 'Modern toll road with excellent clearances. Well-maintained, wide lanes.',
      recommended: true,
      icon: '💰'
    },
    {
      id: 'orl_mia_i95',
      name: 'I-4 to I-95 (Free)',
      type: 'interstate',
      distance: 241,
      duration: 225,
      safetyGrade: 'B',
      riskLevel: 'LOW',
      strikeProbability: 0.05,
      bridges: [
        { id: 'fl_bridge_005', clearance: 165, margin: 'tight' },
        { id: 'fl_bridge_004', clearance: 168, margin: 'comfortable' },
        { id: 'fl_bridge_003', clearance: 174, margin: 'comfortable' }
      ],
      description: 'Free alternative. Slightly longer with one 13\'9" bridge near Orlando.',
      recommended: false,
      icon: '🆓'
    }
  ],

  'houston-dallas': [
    {
      id: 'hou_dal_safe',
      name: 'I-45 North (Recommended)',
      type: 'interstate',
      distance: 239,
      duration: 225,
      safetyGrade: 'A',
      riskLevel: 'SAFE',
      strikeProbability: 0.02,
      bridges: [
        { id: 'tx_bridge_003', clearance: 180, margin: 'comfortable' },
        { id: 'tx_bridge_002', clearance: 192, margin: 'comfortable' },
        { id: 'tx_bridge_001', clearance: 186, margin: 'comfortable' }
      ],
      description: 'Direct interstate route. All clearances excellent. Heavy truck traffic route.',
      recommended: true,
      icon: '🤠'
    },
    {
      id: 'hou_dal_backroads',
      name: 'US-75 Backroads (Risky)',
      type: 'highway',
      distance: 251,
      duration: 270,
      safetyGrade: 'D',
      riskLevel: 'HIGH',
      strikeProbability: 0.68,
      bridges: [
        { id: 'tx_bridge_006', clearance: 138, margin: 'will not fit' },
        { id: 'tx_bridge_005', clearance: 142, margin: 'very tight' },
        { id: 'tx_bridge_004', clearance: 156, margin: 'very tight' }
      ],
      description: 'OLD ROUTE - Multiple low bridges from 1950s. Several 11\'6" clearances. High strike history.',
      recommended: false,
      icon: '⚠️'
    }
  ],

  'portland-seattle': [
    {
      id: 'por_sea_i5',
      name: 'I-5 North (Standard)',
      type: 'interstate',
      distance: 174,
      duration: 180,
      safetyGrade: 'A',
      riskLevel: 'SAFE',
      strikeProbability: 0.02,
      bridges: [
        { id: 'wa_bridge_002', clearance: 192, margin: 'comfortable' },
        { id: 'wa_bridge_001', clearance: 186, margin: 'comfortable' }
      ],
      description: 'Main north-south route. Modern Interstate standards throughout.',
      recommended: true,
      icon: '☕'
    },
    {
      id: 'por_sea_coastal',
      name: 'US-101 Coastal (Scenic)',
      type: 'highway',
      distance: 289,
      duration: 345,
      safetyGrade: 'C',
      riskLevel: 'MEDIUM',
      strikeProbability: 0.22,
      bridges: [
        { id: 'wa_bridge_005', clearance: 168, margin: 'comfortable' },
        { id: 'wa_bridge_004', clearance: 156, margin: 'very tight' },
        { id: 'wa_bridge_003', clearance: 162, margin: 'tight' }
      ],
      description: 'Beautiful coastal route but narrow with older bridges. Two bridges under 13\'6".',
      recommended: false,
      icon: '🌲'
    }
  ]
};

export const getRoutesForTrip = (origin, destination) => {
  const key = `${origin}-${destination}`.toLowerCase().replace(/\s+/g, '-');
  return mockRoutes[key] || [];
};