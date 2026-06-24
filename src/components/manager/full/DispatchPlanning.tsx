import React, { useState } from 'react';
import { 
  Check, X, Clock, HelpCircle, ArrowRight, Filter, Search, 
  Settings2, MapPin, BrainCircuit, ShieldCheck, AlertTriangle, Users,
  ArrowDownLeft, ArrowUpRight, ChevronLeft, Zap, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_DELIVERIES } from '../../../data';
import { cn } from '../../../lib/utils';
import { Delivery } from '../../../types';

export function BulkPlanner({ 
  setActiveTab,
  deliveries,
  setDeliveries,
  routes,
  setRoutes,
  pitchStage = 'scale'
}: { 
  setActiveTab?: (tab: string) => void;
  deliveries: Delivery[];
  setDeliveries: React.Dispatch<React.SetStateAction<Delivery[]>>;
  routes: any[];
  setRoutes: React.Dispatch<React.SetStateAction<any[]>>;
  pitchStage?: 'poc' | 'mvp' | 'scale';
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setLocalActiveTab] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedZone, setSelectedZone] = useState('MAD-NORTH-A1');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [isPolishing, setIsPolishing] = useState(false);
  const [filterConflicts, setFilterConflicts] = useState(false);
  
  const [showRedirectExplain, setShowRedirectExplain] = useState(false);
  const [showPolishExplain, setShowPolishExplain] = useState(false);

  // Custom Toast Notification State
  const [toast, setToast] = useState<{ message: string; subMessage?: string; type: 'success' | 'alert' | 'info' } | null>(null);
  const showToastMsg = (message: string, subMessage?: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToast({ message, subMessage, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getCleanAddress = (addr: string, storeName?: string) => {
    let clean = addr;
    if (storeName) {
      // Remove starting store prefix (e.g. "Zara, Calle Serrano" -> "Calle Serrano")
      const firstWord = storeName.split(' ')[0];
      const regex = new RegExp(`^${firstWord}[,:\\-\\s]*`, 'i');
      clean = clean.replace(regex, '');
    }
    if (clean.trim().toLowerCase() === 'madrid') {
      if (storeName?.toLowerCase().includes('zara')) {
        return 'Calle de Serrano 23, Madrid';
      } else if (storeName?.toLowerCase().includes('mango')) {
        return 'Gran Vía 32, Madrid';
      } else {
        return 'Calle Gran Vía 12, Madrid';
      }
    }
    return clean;
  };

  const entries = deliveries.filter(d => 
    (d.stopType === activeTab) &&
    (d.assignedRoute === selectedZone || selectedZone === 'ALL') &&
    (d.address.toLowerCase().includes(searchTerm.toLowerCase()) || 
     d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (d.storeName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
     (d.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
     (d.entityId?.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (!filterConflicts || d.priority)
  );

  // Total source orders optimized under this bulk cluster tab
  const totalClusterOrders = entries.reduce((acc, curr) => acc + (curr.historyCount || 0), 0);

  const handleAction = (id: string, action: string) => {
    if (action === 'override') {
      setDeliveries(prev => prev.map(d => {
        if (d.id === id) {
          return { ...d, status: 'synced', predictedProbability: 0.99, priority: false };
        }
        return d;
      }));
      showToastMsg(`Override Active: ${id}!`, 'Direct manual override injected. Node sequencing locked to 99% predicted success.', 'success');
    } else {
      setDeliveries(prev => prev.map(d => {
        if (d.id === id) {
          if (action === 'priority') return { ...d, priority: !d.priority };
          if (action === 'move') return { ...d, suggestedSlot: 'Adjusted By Admin' };
        }
        return d;
      }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <header className="min-h-[72px] px-4 md:px-8 border-b border-[#E2E8F0] flex flex-col md:flex-row items-start md:items-center justify-between bg-white shrink-0 py-4 md:py-0 gap-4">
        <div>
          <h1 className="text-[18px] md:text-[20px] font-black text-[#1E293B]">Bulk Dispatch Planner</h1>
          <p className="text-[11px] md:text-[13px] text-[#64748B] font-medium uppercase tracking-tight opacity-70 italic">Massive Sequence Optimization Control</p>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <button 
            onClick={() => setFilterConflicts(!filterConflicts)}
            className={cn(
              "flex px-3 py-1 rounded-lg text-[10px] md:text-[11px] font-bold border items-center gap-2 transition-all",
              filterConflicts 
                ? "bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-100" 
                : "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100"
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {filterConflicts ? 'Showing Conflicts' : `${deliveries.filter(d => d.priority).length} Systematic Conflicts`}
          </button>
          <button 
            onClick={() => {
              setShowRedirectExplain(true);
            }}
            className="bg-white border border-[#E2E8F0] text-[#1E293B] px-3 md:px-4 py-2 rounded-lg text-[12px] md:text-[13px] font-[600] hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            Redirect
            <MapPin className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => {
              setShowPolishExplain(true);
            }}
            disabled={isPolishing}
            className={cn(
              "bg-[#2563EB] text-white px-4 md:px-5 py-2 rounded-lg text-[12px] md:text-[13px] font-[600] hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 whitespace-nowrap",
              isPolishing && "opacity-70 cursor-not-allowed"
            )}
          >
            {isPolishing ? 'Polishing...' : 'AI Polish'}
            <BrainCircuit className={cn("w-3.5 h-3.5", isPolishing && "animate-spin")} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-[1280px] mx-auto w-full font-sans">
        {/* Bulk Dispatch Tabs & Zone Select */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-fit overflow-x-auto">
             <button 
               onClick={() => setLocalActiveTab('delivery')}
               className={cn(
                 "px-4 md:px-6 py-2 rounded-lg text-[10px] md:text-[12px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap",
                 activeTab === 'delivery' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
               )}
             >
                <ArrowUpRight className="w-4 h-4" />
                Delivery ({deliveries.filter(d => d.stopType === 'delivery').length} stops)
             </button>
             <button 
               onClick={() => setLocalActiveTab('pickup')}
               className={cn(
                 "px-4 md:px-6 py-2 rounded-lg text-[10px] md:text-[12px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap",
                 activeTab === 'pickup' ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
               )}
             >
                <ArrowDownLeft className="w-4 h-4" />
                Pickup ({deliveries.filter(d => d.stopType === 'pickup').length} stops)
             </button>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Zone:</span>
             <select 
               value={selectedZone}
               onChange={(e) => setSelectedZone(e.target.value)}
               className="bg-white border border-slate-200 px-3 md:px-4 py-2 rounded-xl text-[11px] md:text-[12px] font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 flex-1 md:min-w-[180px]"
             >
                <option value="ALL">All Zones (Cluster)</option>
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

        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="panel-header flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 shrink-0 p-4 gap-3 sm:gap-0">
            <div className="flex items-center gap-3 md:gap-4 flex-wrap">
              <div className="text-[13px] md:text-[15px] font-[900] uppercase tracking-tighter text-slate-800">Operational Ledger</div>
              <div className="flex gap-2 items-center">
                <span className="px-2 py-0.5 bg-blue-100 text-[#2563EB] rounded text-[9px] md:text-[10px] font-black uppercase">{entries.length} Filtered Stops</span>
                <div className="group relative">
                   <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl leading-relaxed border border-white/10 font-medium">
                      <p className="font-black mb-1 uppercase tracking-widest text-blue-400 italic">What is a Node?</p>
                      A Node is a <span className="text-white font-bold italic">unique physical stop</span>. Even if a person has 10 packages, the system treats the location point as one Node for efficiency. Multiple shipments to one address are clustered automatically.
                   </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Search className="w-4 h-4 text-[#94A3B8]" />
              <input 
                type="text" 
                placeholder="Global Filter..." 
                className="bg-transparent border-none text-[12px] md:text-[13px] focus:ring-0 outline-none flex-1 sm:w-48 text-left sm:text-right font-black uppercase placeholder:text-slate-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <table className="min-w-[800px] w-full text-left border-collapse">
              <thead className="sticky top-0 z-20">
                <tr className="bg-slate-900 border-b border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Physical Node</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Legal Entity Identifier</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Traversal Address</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Prediction Reliability</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Optimized Slot</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.length > 0 ? entries.map((delivery, idx) => (
                  <React.Fragment key={`${delivery.id}-${idx}`}>
                    <tr 
                      className={cn(
                        "hover:bg-slate-50 transition-all cursor-pointer group",
                        expandedId === `${delivery.id}-${idx}` ? "bg-blue-50/50" : "bg-white"
                      )}
                      onClick={() => setExpandedId(expandedId === `${delivery.id}-${idx}` ? null : `${delivery.id}-${idx}`)}
                    >
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-[12px] font-black tracking-widest text-slate-400 uppercase leading-none mb-1",
                            expandedId === `${delivery.id}-${idx}` ? "text-blue-400" : ""
                          )}>
                            {delivery.id}
                          </span>
                          <span className={cn(
                            "text-[11px] font-bold text-slate-500 uppercase tracking-tighter"
                          )}>
                            {delivery.assignedRoute}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-[15px] font-[900] tracking-tighter uppercase italic leading-none",
                            expandedId === `${delivery.id}-${idx}` ? "text-blue-600" : "text-slate-800"
                          )}>
                            {delivery.userId || 'Customer Recipient'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                             {delivery.entityId || 'NIF-PENDING'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col truncate max-w-full">
                          <span className="text-[14px] font-black text-slate-800 uppercase italic tracking-tight">{getCleanAddress(delivery.address, delivery.storeName)}</span>
                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
                             Origin: <strong className="font-[1000] text-blue-800 underline decoration-blue-300">{delivery.merchantOrigin || 'Zara Serrano'}</strong>
                           </span>
                           {delivery.stopType === 'pickup' && (
                             <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest mt-0.5">
                               📌 SEUR Point: <strong className="font-[1000] text-amber-800 underline decoration-amber-300">{delivery.storeName}</strong>
                             </span>
                           )}
                          <div className="flex items-center gap-3 mt-1.5">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">
                                Unique Physical Stop
                             </span>

                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-5">
                          <div className="flex flex-col items-end">
                            {(() => {
                              const probPct = Math.round(delivery.predictedProbability * 100);
                              const probColor = probPct >= 90 
                                ? "text-emerald-600" 
                                : probPct >= 75 
                                  ? "text-orange-500" 
                                  : "text-red-600";
                              const probBg = probPct >= 90 
                                ? "bg-emerald-500" 
                                : probPct >= 75 
                                  ? "bg-orange-500" 
                                  : "bg-red-500";
                              return (
                                <>
                                  <span className="text-[18px] font-black text-slate-900 tracking-tighter leading-none mb-1">
                                    {probPct}%
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter leading-none">Reliability</span>
                                  <span className="text-[9px] text-blue-500 font-extrabold tracking-tight mt-1 whitespace-nowrap leading-none">
                                    based on {delivery.historyCount || 42} orders
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                            {(() => {
                              const probPct = Math.round(delivery.predictedProbability * 100);
                              const probBg = probPct >= 90 
                                ? "bg-emerald-500" 
                                : probPct >= 75 
                                  ? "bg-orange-500" 
                                  : "bg-red-500";
                              return (
                                <div className={cn("h-full transition-all duration-1000 shadow-sm", probBg)} style={{ width: `${probPct}%` }} />
                              );
                            })()}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-sm">
                           <Clock className="w-4 h-4" />
                           <span className="text-[13px] font-black italic tracking-tighter">{delivery.suggestedSlot}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <ChevronLeft className={cn("w-5 h-5 text-slate-300 transition-all", expandedId === `${delivery.id}-${idx}` ? "rotate-90 text-blue-500 scale-125" : "-rotate-90")} />
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedId === `${delivery.id}-${idx}` && (
                        <tr>
                           <td colSpan={6} className="p-0 border-none">
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-slate-50/50"
                              >
                                 <div className="p-6 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 border-y border-slate-100">
                                    <div className="space-y-4">
                                       <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-200 pb-2">Stop Intelligence</h6>
                                       <div className="space-y-3 pt-2">
                                          <div>
                                             <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                                Merchant Origin
                                             </div>
                                             <div className="text-[16px] font-black text-blue-600 tracking-tighter italic">
                                                {delivery.merchantOrigin || 'Zara Serrano'}
                                             </div>
                                          </div>
                                          <div>
                                             <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                                Final Customer Recipient
                                             </div>
                                             <div className="text-[14px] font-black text-slate-900 tracking-tighter">
                                                {delivery.userId || 'Elena Ruiz'} 
                                             </div>
                                          </div>
                                          <div>
                                             <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Success Propensity</div>
                                             <div className="text-[16px] font-black text-slate-900 tracking-tighter">
                                                {Math.round(delivery.predictedProbability * 100)}% Confidence
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="space-y-4">
                                       <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-200 pb-2">Node Scheduling</h6>
                                       <div className="space-y-3 pt-2">
                                          <div>
                                             <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Predicted Arrival</div>
                                             <div className="text-[16px] font-black text-blue-600 tracking-tighter uppercase">{delivery.predictedArrival}</div>
                                          </div>
                                          <div>
                                             <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">SLA Variance Guard (Safe Buffer Window)</div>
                                             <div className="text-[16px] font-black text-emerald-600 tracking-tighter">± {(Math.abs(delivery.id.charCodeAt(3) || 72) % 6 + 1.8).toFixed(1)} mins standard deviation</div>
                                             <div className="text-[10px] text-slate-400 font-bold leading-relaxed mt-1">
                                                SLA Buffer: Permitted arrival window deviation to protect carrier contract terms from local Madrid delay penalty fees.
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="space-y-4">
                                       <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-200 pb-2">Relational Metadata</h6>
                                       <div className="space-y-3 pt-2">
                                          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                             <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Route</div>
                                             <div className="text-[13px] font-black text-slate-900 uppercase">HUB-SYNC-{delivery.assignedRoute}</div>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="flex flex-col justify-center gap-3">
                                       <button 
                                          onClick={() => handleAction(delivery.id, 'override')}
                                          className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                                       >
                                          Direct Node Override
                                       </button>
                                       <button 
                                          onClick={() => setActiveTab?.('intelligence')}
                                          className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all font-black italic"
                                       >
                                          View Performance Ledger
                                       </button>
                                    </div>
                                    {delivery.stopType === 'pickup' && (
                                       <div className="col-span-1 sm:col-span-2 lg:col-span-4 mt-6 pt-6 border-t border-slate-200 text-left">
                                          <div className="flex items-center gap-2 mb-4">
                                             <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" />
                                             <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">📦 Consolidated Cargo Manifest (Bulk Retail Load)</h6>
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                             {[
                                               { id: `PKG-${delivery.id.slice(-4)}-9A`, item: 'Linen Collection Suit Jackets', qty: '14 cartons', weight: '28.5 kg', dest: 'MAD-NORTH-A1 Hub', spec: 'Hanger boxes mandatory' },
                                               { id: `PKG-${delivery.id.slice(-4)}-1F`, item: 'Women Blazer Collection Autumn', qty: '22 polybags', weight: '34.0 kg', dest: 'MAD-CENTRAL-B2 Hub', spec: 'Sealed secure tags active' },
                                               { id: `PKG-${delivery.id.slice(-4)}-5E`, item: 'Premium Footwear Collection', qty: '8 boxes', weight: '12.4 kg', dest: 'MAD-WEST-E1 Hub', spec: 'Fragile handling protocol' }
                                             ].map((pkg, idx) => (
                                                <div key={idx} className="p-4 bg-white border border-slate-200 rounded-[24px] shadow-sm flex flex-col justify-between text-left">
                                                   <div>
                                                      <div className="flex justify-between items-center mb-1.5">
                                                         <span className="text-[10px] font-black text-blue-600 font-mono">{pkg.id}</span>
                                                         <span className="text-[8px] font-black bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded uppercase tracking-wider">{pkg.qty}</span>
                                                      </div>
                                                      <div className="text-[13px] font-black text-slate-800 tracking-tight leading-tight mb-1">{pkg.item}</div>
                                                      <div className="text-[10px] text-slate-400 font-bold">Specs: {pkg.spec}</div>
                                                   </div>
                                                   <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center text-[9px] font-black text-slate-500 uppercase">
                                                      <span>Dest: {pkg.dest}</span>
                                                      <span className="text-emerald-600">{pkg.weight}</span>
                                                   </div>
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              </motion.div>
                           </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                       <div className="text-slate-400 font-black uppercase tracking-[0.2em] italic">No Traversal Nodes Detected in Zone</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
             <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Operational Ledger</div>
             <div className="text-[11px] font-black text-blue-600 uppercase tracking-widest">{entries.length} Total Nodes Projected</div>
          </div>
        </div>
      </div>

      {/* Toast Overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 p-6 bg-slate-900 border border-slate-800 text-white rounded-[32px] shadow-2xl flex items-center gap-6 max-w-md text-left"
          >
             <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 animate-pulse" />
             </div>
             <div className="flex-1">
                <div className="text-[14px] font-black tracking-tight leading-none text-blue-400 capitalize mb-1">{toast.message}</div>
                <div className="text-[11px] text-slate-300 font-bold leading-normal">{toast.subMessage}</div>
             </div>
             <button onClick={() => setToast(null)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                <X className="w-4 h-4" />
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Redirect Explanation Dialog */}
      <AnimatePresence>
        {showRedirectExplain && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
            >
               <div className="p-8 bg-slate-900 text-white text-left">
                  <div className="flex items-center gap-2 mb-1">
                     <MapPin className="w-5 h-5 text-blue-400" />
                     <span className="text-[10px] uppercase tracking-widest font-black text-blue-400">Bulk Planner Utility</span>
                  </div>
                  <h2 className="text-[18px] font-black uppercase tracking-tight">Systematic Redirection Sync</h2>
               </div>

               <div className="p-8 space-y-6 text-left">
                  <div className="space-y-3">
                     <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight">What does Redirection do?</h3>
                     <p className="text-[12px] text-slate-600 leading-relaxed font-semibold">
                        This operation re-routes active systematic conflicts to adjacent regional hubs to balance local fleet density. Redirection helps bypass active central gridlocks by distributing nodes across available backup fleets.
                     </p>
                  </div>

                  <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 text-[11px] text-slate-600 font-semibold space-y-2">
                     <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Realistic Optimization Boundaries</span>
                     <p>
                        ⚠️ ID-PENDING nodes are split to adjacent clusters. While density improves, prediction reliability stays grounded in real-world traffic historical registers and does not magically skyrocket to a perfect score.
                     </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                     <button 
                        onClick={() => setShowRedirectExplain(false)}
                        className="flex-1 py-3 border border-slate-200 text-slate-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                     >
                        Cancel
                     </button>
                     <button 
                        onClick={() => {
                           setShowRedirectExplain(false);
                           setDeliveries(prev => prev.map(d => d.priority ? { ...d, assignedRoute: 'ADJACENT-NODE', redirectionAdvised: true } : d));
                           showToastMsg('Redirection Sync Active!', 'Re-routing critical nodes to adjacent hubs to balance network density.', 'info');
                           setTimeout(() => {
                             if (setActiveTab) setActiveTab('dashboard');
                           }, 1500);
                        }}
                        className="flex-1 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                     >
                        Confirm Redirection
                     </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Polish Explanation Dialog */}
      <AnimatePresence>
        {showPolishExplain && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
            >
               <div className="p-8 bg-blue-600 text-white text-left">
                  <div className="flex items-center gap-2 mb-1">
                     <BrainCircuit className="w-5 h-5 text-blue-100" />
                     <span className="text-[10px] uppercase tracking-widest font-black text-blue-100">Live Optimization Algorithm</span>
                  </div>
                  <h2 className="text-[18px] font-black uppercase tracking-tight">AI Route Schedule Polish</h2>
               </div>

               <div className="p-8 space-y-6 text-left">
                  <div className="space-y-3">
                     <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight">What does AI Polish do?</h3>
                     <p className="text-[12px] text-slate-600 leading-relaxed font-semibold">
                        AI Polish performs a fine-grained sequence optimization. It recalibrates predicted arrival slots based on real-time traffic flow matrices, local warehouse clearance speeds, and driver behavior records.
                     </p>
                  </div>

                  <div className="p-5 bg-amber-50/70 rounded-2xl border border-amber-200 text-[11px] text-slate-600 font-semibold space-y-2">
                     <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1">⚠️ Capped Reliability Notice</span>
                     <p>
                        Prediction reliability increases incrementally and reasonably by <strong>+3% to +8%</strong>. It is strictly capped at a maximum of <strong>94%</strong> capacity based on historical records. Real-world delivery variables like traffic congestion and unloading delays prevent unrealistic 99% magic scores.
                     </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                     <button 
                        onClick={() => setShowPolishExplain(false)}
                        className="flex-1 py-3 border border-[#E2E8F0] text-slate-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                     >
                        Cancel
                     </button>
                     <button 
                        onClick={() => {
                           setShowPolishExplain(false);
                           setIsPolishing(true);
                           setTimeout(() => {
                             setIsPolishing(false);
                             setDeliveries(prev => prev.map(d => {
                               const increase = 0.03 + Math.random() * 0.05;
                               const newProbability = Math.min(0.94, d.predictedProbability + increase);
                               return {
                                 ...d,
                                 predictedArrival: `${Math.floor(Math.random() * 4) + 8}:${['05', '12', '24', '36', '48'][Math.floor(Math.random() * 5)]}`,
                                 predictedProbability: newProbability,
                                 status: Math.random() > 0.4 ? 'synced' : d.status
                               };
                             }));
                             showToastMsg('AI Polish Complete!', 'Dynamic algorithm completed. Route schedules elements realistically stabilized.', 'success');
                           }, 2000);
                        }}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                     >
                        Confirm AI Polish
                     </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InsightCard({ title, description, action, variant, icon: Icon }: any) {
  const styles = {
    warning: "bg-amber-50 border-amber-100 text-amber-900",
    info: "bg-blue-50 border-blue-100 text-blue-900",
    neutral: "bg-slate-50 border-slate-200 text-slate-900"
  };

  return (
    <div className={cn("p-4 rounded-2xl border flex items-start gap-4 shadow-sm", styles[variant as keyof typeof styles])}>
      <div className={cn(
        "p-2 rounded-xl bg-white/80 shrink-0",
        variant === 'warning' ? "text-amber-600" : variant === 'info' ? "text-blue-600" : "text-slate-600"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold mb-1">{title}</h4>
        <p className="text-[11px] opacity-80 leading-relaxed mb-3">{description}</p>
        <button className="text-[11px] font-bold border-b border-current hover:opacity-100 opacity-70 transition-opacity">
          {action}
        </button>
      </div>
    </div>
  );
}
