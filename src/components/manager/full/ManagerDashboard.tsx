import React from 'react';
import { Dashboard } from './Dashboard';

interface FullDashboardProps {
  deliveries: any[];
  setDeliveries: React.Dispatch<React.SetStateAction<any[]>>;
  routes: any[];
  setRoutes: React.Dispatch<React.SetStateAction<any[]>>;
}

export function FullDashboard({ deliveries, setDeliveries, routes, setRoutes }: FullDashboardProps) {
  return (
    <div className="flex-1 bg-slate-50 flex flex-col text-left">
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <Dashboard 
          setActiveTab={() => {}} 
          deliveries={deliveries} 
          setDeliveries={setDeliveries} 
          routes={routes} 
          setRoutes={setRoutes} 
          pitchStage="scale" 
        />
      </div>
    </div>
  );
}
