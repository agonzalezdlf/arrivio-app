import { Delivery, RouteStats } from './types';

export const ROUTE_SUMMARIES: RouteStats[] = [
  { 
    routeId: 'MAD-NORTH-A1', 
    driverName: 'Carlos M.', 
    totalStops: 124, 
    reliability: 94, 
    potentialFailures: 3, 
    aiInterventions: 12,
    role: 'delivery',
    completedStops: [
      { id: 'D-1100', address: 'Calle de Velázquez 12, Madrid', status: 'success', time: '07:45' },
      { id: 'D-1101', address: 'Calle de Goya 4, Madrid', status: 'failed', time: '07:55' }
    ]
  },
  { 
    routeId: 'MAD-NORTH-A2', 
    driverName: 'Ricardo P.', 
    totalStops: 118, 
    reliability: 91, 
    potentialFailures: 4, 
    aiInterventions: 15,
    role: 'delivery',
    completedStops: []
  },
  { 
    routeId: 'MAD-CENTRAL-B2', 
    driverName: 'Elena G.', 
    totalStops: 142, 
    reliability: 68, 
    potentialFailures: 14, 
    aiInterventions: 28,
    role: 'pickup',
    completedStops: [
      { id: 'P-1001', address: 'Mango Store, Gran Vía 32, Madrid', status: 'success', time: '08:15' }
    ]
  },
  { 
    routeId: 'MAD-CENTRAL-B3', 
    driverName: 'Miguel S.', 
    totalStops: 130, 
    reliability: 82, 
    potentialFailures: 8, 
    aiInterventions: 21,
    role: 'pickup',
    completedStops: []
  },
  { 
    routeId: 'MAD-EAST-C4', 
    driverName: 'Javier R.', 
    totalStops: 110, 
    reliability: 89, 
    potentialFailures: 5, 
    aiInterventions: 8,
    role: 'delivery',
    completedStops: []
  },
  { 
    routeId: 'MAD-SOUTH-D8', 
    driverName: 'Sofia L.', 
    totalStops: 135, 
    reliability: 74, 
    potentialFailures: 11, 
    aiInterventions: 19,
    role: 'pickup',
    completedStops: [
      { id: 'P-1005', address: 'Inditex Hub, Valdemoro', status: 'success', time: '07:30' }
    ]
  },
  { 
    routeId: 'MAD-WEST-E1', 
    driverName: 'Antonio K.', 
    totalStops: 95, 
    reliability: 96, 
    potentialFailures: 2, 
    aiInterventions: 5,
    role: 'delivery',
    completedStops: []
  },
];const MANUAL_STOPS: Delivery[] = [
  // MAD-NORTH-A1 (Delivery Route)
  {
    id: 'D-2210',
    userId: 'Lucía Fernández',
    entityId: 'NIF: 45678912K',
    address: 'Avenida de América 101, Madrid',
    merchantOrigin: 'Zara Serrano',
    predictedProbability: 0.92,
    suggestedSlot: '08:30 - 09:30',
    assignedRoute: 'MAD-NORTH-A1',
    status: 'pending',
    priority: false,
    stopType: 'delivery',
    historyCount: 24,
    notes: 'Strong morning presence confirmed by multi-provider data. Origin: Zara Serrano.',
    predictedArrival: '08:45',
    confidenceScore: 92
  },
  {
    id: 'D-9842',
    userId: 'Carlos Ruiz',
    entityId: 'NIE: X1234567L',
    address: 'Calle de Serrano 45, Madrid',
    merchantOrigin: 'Mango Gran Vía',
    predictedProbability: 0.45,
    suggestedSlot: '09:30 - 10:30',
    assignedRoute: 'MAD-NORTH-A1',
    status: 'delayed',
    priority: false,
    stopType: 'delivery',
    historyCount: 12,
    notes: 'Usually receives in morning slots. Origin: Mango Gran Vía.',
    predictedArrival: '10:05',
    confidenceScore: 45
  },
  
  // MAD-CENTRAL-B2 (SEUR Locker/Point Pickups)
  {
    id: 'P-1001',
    userId: 'Elena Ruiz',
    entityId: 'NIF: 50893421H',
    storeName: 'SEUR Locker - Plaza de Colón',
    merchantOrigin: 'Zara Serrano',
    address: 'SEUR Locker - Plaza de Colón, Madrid',
    predictedProbability: 0.88,
    suggestedSlot: '08:00 - 09:00',
    assignedRoute: 'MAD-CENTRAL-B2',
    status: 'delivered',
    priority: true,
    stopType: 'pickup',
    historyCount: 340,
    notes: 'Diverted to secure SEUR Locker point. Picked up from Zara Serrano.',
    predictedArrival: '08:15',
    confidenceScore: 88
  },
  {
    id: 'P-1002',
    userId: 'Carlos Gómez',
    entityId: 'NIE: Y9876543M',
    storeName: 'SEUR Point - Librería Goya',
    merchantOrigin: 'Mango Gran Vía',
    address: 'SEUR Point - Librería Goya, Madrid',
    predictedProbability: 0.38,
    suggestedSlot: '10:00 - 11:00',
    assignedRoute: 'MAD-CENTRAL-B2',
    status: 'not-home',
    priority: true,
    stopType: 'pickup',
    historyCount: 210,
    notes: 'Regular customer pick-up point. Picked up from Mango Gran Vía.',
    predictedArrival: '10:15',
    confidenceScore: 38
  }
];

const generateEntityId = (isPickup: boolean) => {
  const type = Math.random();
  if (type < 0.7) {
    // NIF
    const num = Math.floor(Math.random() * 90000000) + 10000000;
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    return `NIF: ${num}${letters[num % 23]}`;
  } else if (type < 0.9) {
    // NIE
    const prefix = ['X', 'Y', 'Z'][Math.floor(Math.random() * 3)];
    const num = Math.floor(Math.random() * 900000) + 1000000;
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    return `NIE: ${prefix}${num}${letters[num % 23]}`;
  } else {
    // Passport
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const num = Math.floor(Math.random() * 900000) + 100000;
    return `PASS: ${chars[Math.floor(Math.random() * 26)]}${chars[Math.floor(Math.random() * 26)]}${num}`;
  }
};

const GENERATED_STOPS: Delivery[] = Array.from({ length: 200 }).map((_, i) => {
  const routeId = ROUTE_SUMMARIES[i % ROUTE_SUMMARIES.length].routeId;
  const isPickup = i % 2 === 0;
  
  const retailers = ['Zara Serrano', 'Mango Gran Vía', 'Massimo Dutti Serrano', 'Pull&Bear Princesa', 'Stradivarius Castellana', 'Bershka Gran Vía', 'Oysho Goya', 'Cortefiel Serrano', 'Sfera Sol', 'El Corte Inglés Castellana', 'H&M Gran Vía', 'Primark Gran Vía', 'Decathlon Atocha', 'IKEA Goya', 'MediaMarkt Alcalá'];
  const seurPoints = ['SEUR Locker - Plaza Mayor', 'SEUR Point - Librería Goya', 'SEUR Box - Estación Atocha', 'SEUR Point - Kiosko Castellana', 'SEUR Locker - Centro Princesa', 'SEUR Point - Papelería Serrano'];
  
  const customers = [
    'Andrés García', 'María Rodríguez', 'Juan Pérez', 'Ana Martínez', 'Sonia López', 
    'Toni Ruiz', 'Marta Sánchez', 'Laura Blanco', 'Javier Cano', 'Beatriz Ortiz', 
    'Roberto Gil', 'Cristina Sanz', 'Sonia Gómez', 'Manuel Torres', 'Patricia Ramos', 
    'Fernando Díaz', 'Raquel Castro', 'Álvaro Núñez', 'Sofía Vázquez', 'Ignacio Gil'
  ];
  
  const hour = Math.floor(Math.random() * 4) + 8; // 8 to 11
  const minute = ['00', '15', '30', '45'][Math.floor(Math.random() * 4)];
  const userId = customers[i % customers.length];
  const merchantOrigin = retailers[i % retailers.length];
  const storeName = isPickup ? seurPoints[i % seurPoints.length] : undefined;
  
  // High dispersion representing real-world variance: low (35-55%), medium (55-80%), high (80-95%)
  const randType = Math.random();
  let predictedProbability = 0.72;
  if (randType < 0.3) {
    // 30% are high risk (35% to 55%)
    predictedProbability = 0.35 + Math.random() * 0.20;
  } else if (randType < 0.7) {
    // 40% are moderate confidence (55% to 80%)
    predictedProbability = 0.55 + Math.random() * 0.25;
  } else {
    // 30% are highly reliable (80% to 95%)
    predictedProbability = 0.80 + Math.random() * 0.15;
  }

  const address = isPickup 
    ? `${storeName}, Madrid`
    : `Calle de ${['Alcalá', 'Goya', 'Serrano', 'Velázquez', 'Princesa', 'Castellana', 'Recoletos', 'Mayor', 'Bailén', 'Atocha'][i % 10]} ${10 + i}, Madrid`;

  return {
    id: `${isPickup ? 'RTL' : 'CST'}-${routeId.split('-').pop()}-${3000 + i}`,
    userId: userId,
    entityId: generateEntityId(isPickup),
    storeName: storeName,
    merchantOrigin: merchantOrigin,
    address: address,
    predictedProbability: predictedProbability,
    suggestedSlot: isPickup ? `${hour}:00 - ${hour + 1}:15` : `${hour + 2}:00 - ${hour + 3}:15`,
    assignedRoute: routeId,
    status: 'pending' as const,
    priority: Math.random() > 0.8, 
    stopType: (isPickup ? 'pickup' : 'delivery') as any,
    historyCount: Math.floor(Math.random() * 100) + 15,
    predictedArrival: `${hour}:${minute}`,
    confidenceScore: Math.floor(predictedProbability * 100)
  };
});

export const MOCK_DELIVERIES: Delivery[] = [...MANUAL_STOPS, ...GENERATED_STOPS];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    to: 'End Customer',
    message: 'Your package is expected between 13:00–15:00. This slot was chosen based on your previous successful deliveries.',
    type: 'success'
  },
  {
    id: 'n2',
    to: 'Retailer (Zara)',
    message: 'Delivery success probability improved by 22% after shifting slot from AM to PM.',
    type: 'insight'
  }
];

export const NETWORK_STATS = {
  totalDeliveriesLearned: '14,200,340',
  participatingProviders: 12,
  confidenceImprovement: '+18.4%',
  providerList: ['SEUR', 'Correos', 'Celeritas', 'MRW', 'TNT', 'DHL España', 'Zeleris', 'Glovo Business', 'TIPSA', 'CTT Express', 'GLS Spain', 'Ontime']
};
