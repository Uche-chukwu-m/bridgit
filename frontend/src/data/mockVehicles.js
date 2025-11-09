export const vehicleLibrary = [
  {
    id: 'uhaul_10',
    name: "U-Haul 10' Truck",
    baseHeight: 83,
    heightDisplay: "6'11\"",
    typicalMods: [
      { name: 'None', height: 0 }
    ],
    description: 'Smallest U-Haul truck. Usually fits under most bridges.',
    imageUrl: '/assets/vehicles/uhaul10.jpg',
    commonUse: 'Studio/1BR apartment moves'
  },
  {
    id: 'uhaul_15',
    name: "U-Haul 15' Truck",
    baseHeight: 150,
    heightDisplay: "12'6\"",
    typicalMods: [
      { name: 'Roof AC Unit', height: 8 },
      { name: 'CB Antenna', height: 4 }
    ],
    description: 'Most common rental truck. With AC unit, typically 13\'6" total.',
    imageUrl: '/assets/vehicles/uhaul15.jpg',
    commonUse: '2-3 BR apartment moves',
    warning: 'Often hits Storrow Drive bridges'
  },
  {
    id: 'uhaul_20',
    name: "U-Haul 20' Truck",
    baseHeight: 162,
    heightDisplay: "13'6\"",
    typicalMods: [
      { name: 'Roof AC Unit', height: 8 },
      { name: 'CB Antenna', height: 4 }
    ],
    description: 'Large moving truck. Close to bridge limits even without mods.',
    imageUrl: '/assets/vehicles/uhaul20.jpg',
    commonUse: '3-4 BR house moves',
    warning: 'High risk for low bridges'
  },
  {
    id: 'penske_16',
    name: "Penske 16' Truck",
    baseHeight: 152,
    heightDisplay: "12'8\"",
    typicalMods: [
      { name: 'Roof AC Unit', height: 6 }
    ],
    description: 'Similar to U-Haul 15\' but slightly taller base.',
    imageUrl: '/assets/vehicles/penske16.jpg',
    commonUse: 'Business moves, deliveries'
  },
  {
    id: 'rv_class_a',
    name: 'Class A RV (Motorhome)',
    baseHeight: 156,
    heightDisplay: "13'0\"",
    typicalMods: [
      { name: 'AC Units (2-3)', height: 10 },
      { name: 'Satellite Dish', height: 8 },
      { name: 'Antenna', height: 6 }
    ],
    description: 'Large motorhome. Often exceeds 14\' with equipment.',
    imageUrl: '/assets/vehicles/rv_class_a.jpg',
    commonUse: 'Vacation travel',
    warning: 'Very high - plan routes carefully'
  },
  {
    id: 'rv_class_c',
    name: 'Class C RV',
    baseHeight: 138,
    heightDisplay: "11'6\"",
    typicalMods: [
      { name: 'AC Unit', height: 8 },
      { name: 'Antenna', height: 6 }
    ],
    description: 'Mid-size RV. More manageable height.',
    imageUrl: '/assets/vehicles/rv_class_c.jpg',
    commonUse: 'Family travel'
  }
];

export const getVehicleById = (id) => vehicleLibrary.find(v => v.id === id);

export const calculateTotalHeight = (vehicle, selectedMods) => {
  let total = vehicle.baseHeight;
  selectedMods.forEach(mod => {
    const modData = vehicle.typicalMods.find(m => m.name === mod);
    if (modData) total += modData.height;
  });
  return total;
};