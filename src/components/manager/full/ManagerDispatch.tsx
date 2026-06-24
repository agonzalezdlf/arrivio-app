import React, { useState } from 'react';
import { 
  Check, X, Clock, HelpCircle, ArrowRight, Search, 
  MapPin, BrainCircuit, AlertTriangle, ArrowDownLeft, ArrowUpRight, ChevronLeft, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_DELIVERIES, ROUTE_SUMMARIES } from '../../../data';
import { cn } from '../../../lib/utils';
import { Delivery } from '../../../types';

export function FullDispatch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setLocalActiveTab] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedZone, setSelectedZone] = useState('MAD-NORTH-A1');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>(MOCK_DELIVERIES);
  const [isPolishing, setIsPolishing] = useState(false);
  const [filterConflicts, setFilterConflicts] = useState(false);
  
  const [showRedirectExplain, setShowRedirectExplain] = useState(false);
  const [showPolishExplain, setShowPolishExplain] = useState(false);
  const [toast, setToast] = useState<{ message: string; subMessage?: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const showToastMsg = (message: string, subMessage?: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToast({ message, subMessage, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getCleanAddress = (addr: string, storeName?: string) => {
    let clean = addr;
    if (storeName) {
      const firstWord = storeName.split(' ')[0];
      const regex = new RegExp(`^${firstWord}[,:\\-\\s]*`, 'i');
      clean = clean.replace(regex, '');
    }
    return clean;
  };

  const isRouteLive = (routeId: string) => {
    // Carlos (MAD-NORTH-A1), Ricardo (MAD-NORTH-A2), Elena (MAD-CENTRAL-B2), Miguel (MAD-CENTRAL-B3), Javier (MAD-EAST-C4) are active/live routes.
    const liveRoutes = ['MAD-NORTH-A1', 'MAD-NORTH-A2', 'MAD-CENTRAL-B2', 'MAD-CENTRAL-B3', 'MAD-EAST-C4'];
    return liveRoutes.includes(routeId);
  };

  const entries = deliveries.filter(d => 
    (d.stopType === activeTab) &&
    (selectedZone === 'ALL' || d.assignedRoute === selectedZone) &&
    (d.address.toLowerCase().includes(searchTerm.toLowerCase()) || 
     d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (d.storeName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
     (d.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
     (d.entityId?.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (!filterConflicts || d.priority)
  );

  const handleAction = (id: string, action: string) => {
    if (action === 'override') {
      setDeliveries(prev => prev.map(d => {
        if (d.id === id) {
          return { ...d, status: 'synced', predictedProbability: 0.99, priority: false };
        }
        return d;
      }));
      showToastMsg(`Override Active: ${id}!`, 'Direct manual override injected. Node sequencing locked to 99% predicted success.', 'success');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <header className="min-h-[72px] px-6 border-b border-[#E2E8F0] flex flex-col md:flex-row items-start md:items-center justify-between bg-white shrink-0 py-4 md:py-0 gap-4 text-left">
        <div>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
            ENTERPRISE SUITE
          </span>
          <h1 className="text-[18px] md:text-[20px] font-black text-[#1E293B] mt-1">Full Dispatch AI Planner</h1>
          <p className="text-[11px] text-[#64748B] font-medium uppercase tracking-tight opacity-70 italic">
            Massive SLA Routing & Optimization
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => setFilterConflicts(!filterConflicts)}
            className={cn(
              "flex px-3 py-1.5 rounded-lg text-[10px] md:text-[11px] font-bold border items-center gap-2 transition-all",
              filterConflicts 
                ? "bg-rose-600 text-white border-rose-500 shadow-lg" 
                : "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100"
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {filterConflicts ? 'Conflicts Filter' : `${deliveries.filter(d => d.priority).length} High-Risk Conflicts`}
          </button>
          <button 
            onClick={() => setShowRedirectExplain(true)}
            className="bg-white border border-slate-200 text-[#1E293B] px-3.5 py-2 rounded-xl text-[11.5px] font-black hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
          >
            Redirect <MapPin className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setShowPolishExplain(true)}
            disabled={isPolishing}
            className="bg-[#2563EB] text-white px-4 py-2 rounded-xl text-[11.5px] font-black hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-md uppercase tracking-wider disabled:opacity-70"
          >
            {isPolishing ? 'Optimizing...' : 'AI Optimization Polish'}
            <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-[1280px] mx-auto w-full">
        {/* Select tab or zone */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-fit overflow-x-auto">
             <button 
               onClick={() => setLocalActiveTab('delivery')}
               className={cn(
                 "px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                 activeTab === 'delivery' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
               )}
             >
                <ArrowUpRight className={cn("w-4 h-4", activeTab === 'delivery' ? "text-blue-600" : "text-slate-450")} /> Deliveries
             </button>
             <button 
               onClick={() => setLocalActiveTab('pickup')}
               className={cn(
                 "px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                 activeTab === 'pickup' ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
               )}
             >
                <ArrowDownLeft className={cn("w-4 h-4", activeTab === 'pickup' ? "text-amber-600" : "text-slate-455")} /> Pickups
             </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto text-left">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none font-mono">SEUR Node Zone:</span>
             <select 
               value={selectedZone}
               onChange={(e) => setSelectedZone(e.target.value)}
               className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[11.5px] font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
             >
                <option value="ALL">All Zones (Hub Consolidator)</option>
                <option value="MAD-NORTH-A1">SEUR-28050 (Las Tablas)</option>
                <option value="MAD-NORTH-A2">SEUR-28020 (Plaza de Castilla)</option>
                <option value="MAD-CENTRAL-B2">SEUR-28004 (Gran Vía)</option>
                <option value="MAD-CENTRAL-B3">SEUR-28015 (Chamberí)</option>
                <option value="MAD-EAST-C4">SEUR-28001 (Serrano)</option>
                <option value="MAD-SOUTH-D8">SEUR-28500 (Vallecas)</option>
                <option value="MAD-WEST-E1">SEUR-28008 (Moncloa)</option>
             </select>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[550px]">
          <div className="p-4 bg-slate-50 flex items-center justify-between border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Active Node Sequencer</span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9.5px] font-black uppercase font-mono">
                {entries.length} Nodes Loaded
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none text-[12px] focus:ring-0 outline-none text-right font-black uppercase placeholder:text-slate-350"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800">
                  <th className="px-6 py-3.5 text-[9.5px] font-black uppercase tracking-wider text-slate-400 font-mono">Parcel ID</th>
                  <th className="px-6 py-3.5 text-[9.5px] font-black uppercase tracking-wider text-slate-400 font-mono">Legal Client Entity</th>
                  <th className="px-6 py-3.5 text-[9.5px] font-black uppercase tracking-wider text-slate-400 font-mono">Location Node</th>
                  <th className="px-6 py-3.5 text-[9.5px] font-black uppercase tracking-wider text-slate-400 font-mono text-center">Route & Status</th>
                  <th className="px-6 py-3.5 text-[9.5px] font-black uppercase tracking-wider text-slate-400 font-mono text-right">SLA Probability</th>
                  <th className="px-6 py-3.5 text-[9.5px] font-black uppercase tracking-wider text-slate-400 font-mono text-right">SLA Slot</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-705">
                {entries.length > 0 ? entries.map((delivery, idx) => {
                  const isExp = expandedId === `${delivery.id}-${idx}`;
                  return (
                    <React.Fragment key={`${delivery.id}-${idx}`}>
                      <tr
                        className={cn(
                          "hover:bg-slate-50 transition-all cursor-pointer", 
                          isExp && (delivery.stopType === 'pickup' ? "bg-amber-50/40" : "bg-blue-50/40")
                        )}
                        onClick={() => setExpandedId(isExp ? null : `${delivery.id}-${idx}`)}
                      >
                        <td className="px-6 py-4 font-mono font-black text-[11.5px] text-slate-400">{delivery.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-black text-[13.5px] text-slate-800 uppercase italic">
                            {delivery.userId}
                          </div>
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            <span className="text-[9px] text-slate-400 font-extrabold font-mono uppercase tracking-wider">ID: {delivery.entityId}</span>
                            <span className="text-[9px] text-blue-600 font-black uppercase tracking-wider">Origin: <strong className="font-[1000] text-blue-800 underline decoration-blue-200">{delivery.merchantOrigin || 'Zara Serrano'}</strong></span>
                            {delivery.stopType === 'pickup' && (
                              <span className="text-[9px] text-amber-600 font-black uppercase tracking-wider">📌 SEUR Point: <strong className="font-[1000] text-amber-800 underline decoration-amber-200">{delivery.storeName}</strong></span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[13px] font-black uppercase text-slate-600 truncate max-w-[180px]">
                          {getCleanAddress(delivery.address, delivery.storeName)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="font-extrabold text-[12px] text-slate-700 font-mono tracking-tight">
                            {delivery.assignedRoute}
                          </div>
                          <span className={cn(
                            "text-[8.5px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border inline-block mt-1",
                            isRouteLive(delivery.assignedRoute)
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          )}>
                            {isRouteLive(delivery.assignedRoute) ? "Active" : "Programmed"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {(() => {
                              const pct = Math.round(delivery.predictedProbability * 100);
                              const textColor = pct >= 90 
                                ? "text-emerald-600" 
                                : pct >= 75 
                                  ? "text-orange-500" 
                                  : "text-red-600";
                              const barBg = pct >= 90 
                                ? "bg-emerald-500" 
                                : pct >= 75 
                                  ? "bg-orange-500" 
                                  : "bg-red-500";
                              return (
                                <>
                                  <span className="font-extrabold text-[14px] text-slate-900">{pct}%</span>
                                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border">
                                    <div 
                                      className={cn("h-full transition-all duration-500", barBg)} 
                                      style={{ width: `${pct}%` }} 
                                    />
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={cn(
                            "px-2.5 py-1 rounded-xl text-[11.5px] font-black italic border",
                            delivery.stopType === 'pickup' 
                              ? "bg-amber-50 border-amber-100 text-amber-700" 
                              : "bg-blue-50 border-blue-100 text-blue-700"
                          )}>
                            {delivery.suggestedSlot}
                          </span>
                        </td>
                        <td className="px-4 text-center">
                          <ChevronLeft className={cn(
                            "w-4 h-4 text-slate-400 transition-all", 
                            isExp ? (delivery.stopType === 'pickup' ? "rotate-90 text-amber-600" : "rotate-90 text-blue-600") : "-rotate-90"
                          )} />
                        </td>
                      </tr>
                      {isExp && (
                        <tr>
                          <td colSpan={7} className="bg-slate-50 p-6 border-y text-left">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <span className="text-[8.5px] font-mono tracking-widest text-slate-400 uppercase font-black block">Geofence Registry</span>
                                <p className="text-[13px] text-slate-800 font-black mt-1 uppercase">{delivery.address}</p>
                                <span className="text-[10px] text-slate-400 font-semibold block mt-1.5 leading-relaxed">
                                  Routing coordinate mapped from central Spain database cluster.
                                </span>
                              </div>
                              <div>
                                <span className="text-[8.5px] font-mono tracking-widest text-slate-400 uppercase font-black block">Historical Operations</span>
                                <p className="text-[13px] text-slate-800 font-black mt-1">
                                  {delivery.historyCount} successful drops on zone
                                </p>
                                <span className="text-[10px] text-slate-400 font-semibold block mt-1.5 leading-relaxed">
                                  Reliability matrix calculations rely on these historic runs.
                                </span>
                              </div>
                              <div className="flex flex-col justify-center">
                                <button 
                                  onClick={() => handleAction(delivery.id, 'override')}
                                  className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-md"
                                >
                                  Trigger Direct Override
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-black uppercase tracking-wider italic">
                      No Segment Nodes Match Selected Region
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showRedirectExplain && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col p-6 text-left space-y-4">
            <h3 className="text-[16px] font-black text-slate-900 uppercase">Mass Router Redirection</h3>
            <p className="text-[11.5px] text-slate-500 font-semibold leading-relaxed">
              Redirects active systematic conflicts to alternative Madrid sectors to relieve peak logistics congestion.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowRedirectExplain(false)} className="flex-1 py-3 border border-slate-200 text-slate-505 rounded-xl text-[11px] font-black uppercase tracking-wider">Cancel</button>
              <button 
                onClick={() => {
                  setShowRedirectExplain(false);
                  setDeliveries(prev => prev.map(d => d.priority ? { ...d, assignedRoute: 'ADJACENT', redirectionAdvised: true } : d));
                  showToastMsg('Redirect Complete!', 'Enterprise re-routes triggered.', 'info');
                }} 
                className="flex-1 py-3 bg-[#2563EB] text-white rounded-xl text-[11px] font-black uppercase tracking-wider"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showPolishExplain && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col p-6 text-left space-y-4">
            <h3 className="text-[16px] font-black text-slate-905 uppercase">Enterprise AI Optimization Polish</h3>
            <p className="text-[11.5px] text-slate-500 font-semibold leading-relaxed">
              Fine-tunes dispatch sequencing using predictive AI models. Realizes massive SLA reliability improvements of <strong>+15% to +22%</strong>, elevating initial outcomes up to a near-perfect <strong>99% probability</strong>.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowPolishExplain(false)} className="flex-1 py-3 border border-slate-200 text-slate-505 rounded-xl text-[11px] font-black uppercase tracking-wider">Cancel</button>
              <button 
                onClick={() => {
                  setShowPolishExplain(false);
                  setIsPolishing(true);
                  setTimeout(() => {
                    setIsPolishing(false);
                    setDeliveries(prev => prev.map(d => ({
                      ...d,
                      predictedProbability: Math.min(0.99, d.predictedProbability + 0.15 + Math.random() * 0.07)
                    })));
                    showToastMsg('Polish Completed!', 'AI sequencing perfected! SLA reliability increased substantially.', 'success');
                  }, 1500);
                }} 
                className="flex-1 py-3 bg-[#2563EB] text-white rounded-xl text-[11px] font-black uppercase tracking-wider animate-pulse"
              >
                Confirm AI Polish
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex flex-col text-left border">
            <div className="text-[12px] font-black text-blue-400 uppercase">{toast.message}</div>
            <div className="text-[10px] text-slate-300 font-semibold">{toast.subMessage}</div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
