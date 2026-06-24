export type DeliveryStatus = 'pending' | 'delivered' | 'failed' | 'not-home' | 'delayed' | 'access-issue' | 'redirected' | 'wrong-address' | 'access-denied' | 'person-not-home' | 'address-incomplete' | 'blocked-entry' | 'unresponsive-intercom' | 'refused-damaged';
export type StopType = 'delivery' | 'pickup' | 'completed' | 'failed';
export type TruckRole = 'delivery' | 'pickup';

export interface Delivery {
  id: string;
  userId: string; // Anonymized
  address: string;
  predictedProbability: number;
  suggestedSlot: string;
  assignedRoute: string;
  status: DeliveryStatus;
  priority: boolean;
  notes?: string;
  actualArrival?: string;
  predictedArrival: string;
  confidenceScore: number;
  redirectionAdvised?: boolean;
  stopType?: StopType;
  historyCount?: number; // Number of historical orders this prediction is based on
  storeName?: string;
  merchantOrigin?: string;
  entityId?: string; // DNI for customers, CIF or StoreID for retailers
}

export interface RouteStats {
  routeId: string;
  driverName: string;
  totalStops: number;
  reliability: number; // 0-100
  potentialFailures: number;
  aiInterventions: number;
  role: TruckRole;
  completedStops?: { id: string; address: string; status: 'success' | 'failed'; time: string }[];
}
