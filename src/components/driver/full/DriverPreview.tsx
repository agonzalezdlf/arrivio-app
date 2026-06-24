import React, { useState } from 'react';
import { 
  MapPin, CheckCircle2, Clock, Navigation, 
  Menu, Bell, ChevronRight, Edit3, BrainCircuit, ArrowRight,
  ShieldAlert, Scan, X, PackageOpen, DoorOpen, MapPinned, AlertTriangle, PenTool, Plus, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_DELIVERIES } from '../../../data';
import { cn } from '../../../lib/utils';
import { DeliveryStatus } from '../../../types';

export function DriverPreview({
  stops: propStops,
  setStops: propSetStops,
  pitchStage = 'scale'
}: {
  stops?: any[];
  setStops?: React.Dispatch<React.SetStateAction<any[]>>;
  pitchStage?: 'poc' | 'mvp' | 'scale';
}) {
  const [localStops, setLocalStops] = useState(MOCK_DELIVERIES);
  const stops = propStops || localStops;
  const setStops = propSetStops || setLocalStops;

  const [dutyMode, setDutyMode] = useState<'delivery' | 'pickup'>('delivery');
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  
  const filteredStops = stops.filter(s => s.stopType === dutyMode);
  const activeStop = filteredStops[currentStopIndex];
  const completedStops = filteredStops.slice(0, currentStopIndex).reverse();
  const upcomingStops = filteredStops.slice(currentStopIndex + 1, currentStopIndex + 4);

  const [showFailureReasons, setShowFailureReasons] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [newAddress, setNewAddress] = useState(activeStop?.address || '');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const [showHandover, setShowHandover] = useState(false);
  const [selectedCapture, setSelectedCapture] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<'idle' | 'analyzing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPickupsDropdown, setShowPickupsDropdown] = useState(false);

  // POC specific handover signature states
  const [recipientName, setRecipientName] = useState('Alex Garcia');
  const [isSigned, setIsSigned] = useState(false);

  // Phone Toast Notifications
  const [driverToast, setDriverToast] = useState<{ title: string; desc: string; type: 'success' | 'warn' } | null>(null);
  const showPhoneToast = (title: string, desc: string, type: 'success' | 'warn' = 'success') => {
    setDriverToast({ title, desc, type });
    setTimeout(() => {
      setDriverToast(null);
    }, 4500);
  };

  const goToNextStop = (id: string, status: DeliveryStatus) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    
    if (currentStopIndex < filteredStops.length - 1) {
      setIsFinishing(true);
      setTimeout(() => {
        setCurrentStopIndex(prev => prev + 1);
        setIsFinishing(false);
        setSelectedCapture(null);
        setAiStatus('idle');
        setErrorMessage('');
        setIsSigned(false);
      }, 500);
    } else {
      showPhoneToast("Operational Shift Completed!", "All route stops and delivery nodes synchronized.", "success");
    }
    setShowFailureReasons(false);
    setShowHandover(false);
    setShowPickupsDropdown(false);
  };

  const handleModifyAddress = () => {
    setStops(prev => prev.map((s, idx) => idx === currentStopIndex ? { ...s, address: newAddress } : s));
    setIsEditingAddress(false);
  };

  if (!activeStop) return null;

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-0 md:p-8 flex flex-col items-center justify-center">
      <div className="mb-4 md:mb-8 text-center mt-6 md:mt-0 px-4">
        <h2 className="text-[18px] md:text-[20px] font-[900] text-[#1E293B] uppercase tracking-tighter italic">Courier App Simulator</h2>
        <p className="text-[11px] md:text-[13px] text-[#64748B] font-bold uppercase tracking-widest opacity-60">Route ID: MAD-NORTH-04 • Driver U-99</p>
      </div>

      <div className="w-full max-w-sm md:w-[350px] min-h-[580px] h-[calc(100vh-140px)] md:h-[700px] bg-white md:border-[12px] md:border-slate-900 rounded-3xl md:rounded-[48px] overflow-hidden shadow-lg md:shadow-2xl flex flex-col relative border border-slate-100">
        {/* Dynamic iOS-style Phone Notification Toast */}
        <AnimatePresence>
          {driverToast && (
            <motion.div
              initial={{ y: -65, opacity: 0 }}
              animate={{ y: 24, opacity: 1 }}
              exit={{ y: -65, opacity: 0 }}
              className="absolute top-12 left-4 right-4 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3 z-50 text-left text-white shadow-2xl flex items-start gap-3 pointer-events-auto"
            >
              <div className="p-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg shrink-0 mt-0.5">
                <BrainCircuit className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-[10px] font-black uppercase tracking-wider text-white leading-none">{driverToast.title}</h5>
                <p className="text-[9.5px] text-slate-350 font-medium leading-normal mt-1">{driverToast.desc}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Notch */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-slate-900 rounded-b-[24px] z-30" />
        
        {/* Status Bar */}
        <div className="pt-4 md:pt-10 px-6 pb-3 border-b border-slate-100 flex items-center justify-between bg-white z-20 shrink-0">
           {pitchStage !== 'poc' ? (
             <button onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')} className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 transition-all hover:scale-105 active:scale-95 shadow-sm">
                {viewMode === 'list' ? <Navigation className="w-4 h-4 text-blue-600" /> : <Menu className="w-4 h-4 text-slate-400" />}
             </button>
           ) : (
             <div className="w-9 h-9" />
           )}
           <div className="text-center">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{viewMode === 'map' ? 'Nav-Live' : 'Active-Node'}</h2>
              <p className="text-[14px] font-black text-slate-900 tracking-tighter">STOP 0{currentStopIndex + 1}/{filteredStops.length}</p>
           </div>
           <div className="w-9 h-9 rounded-xl flex items-center justify-center relative">
              <Bell className="w-4 h-4 text-slate-400" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
           </div>
        </div>

        {/* Transition Overlay */}
        <AnimatePresence>
          {isFinishing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-md z-40 flex flex-col items-center justify-center"
            >
               <BrainCircuit className="w-12 h-12 text-blue-600 animate-spin mb-4" />
               <p className="font-black text-slate-900 uppercase tracking-widest text-[11px]">Syncing Next Node...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          {pitchStage !== 'poc' && (
            <div className="px-5 pt-4">
               <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl">
                  <button 
                    onClick={() => { setDutyMode('delivery'); setCurrentStopIndex(0); setShowPickupsDropdown(false); }}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                      dutyMode === 'delivery' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"
                    )}
                  >Delivery</button>
                  <button 
                    onClick={() => { setDutyMode('pickup'); setCurrentStopIndex(0); setShowPickupsDropdown(false); }}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                      dutyMode === 'pickup' ? "bg-white text-amber-600 shadow-sm" : "text-slate-400"
                    )}
                  >Pickup</button>
               </div>
            </div>
          )}

          {viewMode === 'map' ? (
             <div className="h-full relative overflow-hidden bg-slate-100">
                <div className="absolute inset-0 opacity-20">
                   <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#94a3b8 2px, transparent 2px)', backgroundSize: '24px 24px' }} />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                   <motion.div 
                     animate={{ scale: [1, 1.2, 1] }} 
                     transition={{ repeat: Infinity, duration: 2 }}
                     className="relative"
                   >
                      <div className="w-5 h-5 bg-blue-600 rounded-full shadow-[0_0_25px_rgba(37,99,235,0.7)] border-4 border-white" />
                      <div className="absolute -top-14 -left-6 p-2 bg-slate-900 text-white rounded-lg shadow-xl border border-white/10 min-w-[90px]">
                         <div className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Driver Pos</div>
                         <div className="text-[10px] font-bold leading-tight">M-30 Sector-4</div>
                      </div>
                   </motion.div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xl flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                      <MapPinned className="w-6 h-6" />
                   </div>
                   <div>
                      <div className="text-[13px] font-black text-slate-900 leading-none mb-1">~0.8 km • 3 mins</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate w-40">{activeStop.address}</div>
                   </div>
                </div>
             </div>
          ) : (
             <div className="p-5 space-y-5">
            {/* Active Card */}
            <div className={cn(
               "bg-white border-2 rounded-[28px] p-6 shadow-sm space-y-5 relative overflow-hidden transition-all",
               activeStop.stopType === 'pickup' ? "border-amber-500" : "border-blue-600"
            )}>
              <div className="flex justify-between items-start">
                 <div className={cn(
                   "p-3 rounded-2xl",
                   activeStop.stopType === 'pickup' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                 )}>
                    {activeStop.stopType === 'pickup' ? <PackageOpen className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                 </div>
                 <div className="text-right">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Propensity</div>
                    <div className="text-[16px] font-black text-emerald-600 italic tracking-tighter">{Math.round(activeStop.predictedProbability * 100)}% Confidence
                     </div>
                     <span className="text-[9px] text-slate-500 font-extrabold tracking-tight mt-1 leading-none block">
                       based on {activeStop.historyCount || 42} orders
                     </span>
                     <div className="hidden"></div>
                 </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "text-[8px] font-black uppercase px-2.5 py-1 rounded-lg",
                    activeStop.stopType === 'pickup' ? "bg-amber-100 text-amber-700 font-black italic" : "bg-blue-100 text-blue-700 font-black italic"
                  )}>
                    {activeStop.stopType === 'pickup' ? 'Retail Pickup' : 'Delivery Node'}
                  </span>
                  <span className="text-[10px] font-black text-slate-300 italic">#{activeStop.id}</span>
                </div>
                {isEditingAddress ? (
                  <div className="space-y-3 bg-slate-50 p-3 rounded-2xl">
                    <input 
                      className="w-full text-[13px] p-3 border border-slate-200 bg-white rounded-xl outline-none focus:ring-2 ring-blue-100 font-bold"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button onClick={handleModifyAddress} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest">Update</button>
                      <button onClick={() => setIsEditingAddress(false)} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-[11px] font-black uppercase tracking-widest">Discard</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-widest mb-1 italic leading-none">Traversal Adress</h3>
                    <p className="text-[17px] font-[900] text-slate-900 leading-[1.1] mb-4 uppercase italic tracking-tighter">
                      {activeStop.stopType === 'pickup' && activeStop.storeName && activeStop.address.includes(',') && activeStop.address.toLowerCase().includes(activeStop.address.split(',')[0].toLowerCase())
                        ? activeStop.address.split(',').slice(1).join(',').trim()
                        : activeStop.address}
                    </p>
                    
                    <div className="space-y-1">
                       <h3 className="text-[15px] font-black uppercase italic tracking-tight leading-none text-slate-800">
                          Recipient: {activeStop.userId}
                       </h3>
                       <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Origin Merchant: <strong className="font-[1000] text-slate-800 underline decoration-slate-300">{activeStop.merchantOrigin || 'Zara Serrano'}</strong>
                       </p>
                       {activeStop.stopType === 'pickup' && (
                         <div className="mt-1 text-[11px] font-black text-amber-600 uppercase tracking-widest leading-none">
                            Locker Destination: <strong className="font-[1000] text-amber-800 underline decoration-amber-300">{activeStop.storeName}</strong>
                         </div>
                       )}
                       {activeStop.stopType === 'delivery' && (
                         <div className="mt-1 text-[11px] font-black text-blue-600 uppercase tracking-widest leading-none">
                            Direct Home Delivery
                         </div>
                       )}
                    </div>

                    <button 
                      onClick={() => setIsEditingAddress(true)}
                      className="mt-4 flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] hover:text-blue-600 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Point
                    </button>

                    {/* Registered Reference Photos */}
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-left">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block">Address Reference Photos</span>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Verify entrance facade and mailbox block setup:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-100 flex items-center justify-center">
                          <img 
                             src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&auto=format&fit=crop&q=80" 
                             alt="Facade Reference" 
                             className="w-full h-full object-cover"
                             referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-center">
                             <span className="text-[8px] text-white font-black uppercase tracking-tight">Facade Entrance</span>
                          </div>
                        </div>
                        <div className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-100 flex items-center justify-center">
                          <img 
                             src="https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=200&auto=format&fit=crop&q=80" 
                             alt="Locker Reference" 
                             className="w-full h-full object-cover"
                             referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-center">
                             <span className="text-[8px] text-white font-black uppercase tracking-tight">Box Locker</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                       <Clock className="w-4 h-4 text-slate-400" />
                       <span className="text-[12px] font-black text-slate-700 italic tracking-tighter">Target: {activeStop.suggestedSlot}</span>
                    </div>
                    <div className="px-2.5 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase">
                       Shift Sync-04
                    </div>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1.5 leading-none">
                       <BrainCircuit className="w-3.5 h-3.5 text-blue-500" />
                       System Predicted Context
                    </p>
                    <p className="text-[11px] italic text-slate-700 font-medium leading-relaxed">"{activeStop.notes}"</p>
                 </div>

                 {/* Pitch-Stage Dynamic Action Modules (Noticeable Progression) */}
                 {false && (
                   <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-left space-y-2 animate-in slide-in-from-top-4 duration-300">
                      <p className="text-[9px] font-mono font-black text-amber-800 uppercase flex items-center gap-1.5 leading-none">
                         <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                         MVP Route Optimization Alert
                      </p>
                      <p className="text-[10.5px] text-amber-900 font-semibold leading-normal">
                         Recipient predicted as <span className="font-extrabold text-amber-950">Likely Absent</span> (~{Math.round((1 - activeStop.predictedProbability) * 100)}% risk) under early morning hours.
                      </p>
                      <button
                        onClick={() => {
                          setStops(prev => prev.map(s => s.id === activeStop.id ? { 
                            ...s, 
                            predictedProbability: 0.94, 
                            suggestedSlot: "17:00 - 18:30 (Evening)",
                            notes: "Assisted shift: Moved to late delivery slot to prevent absence."
                          } : s));
                          showPhoneToast("SLA Recalculated!", "Moved to 5:00 PM to maximize home presence.", "success");
                        }}
                        className="w-full h-8.5 bg-white border border-amber-300 hover:bg-amber-100/30 text-amber-800 rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all select-none cursor-pointer"
                      >
                         Optimize Route Block Proximity
                      </button>
                   </div>
                 )}

                 {false && (
                   <div className="p-4 bg-slate-900 border border-indigo-900/40 text-left rounded-2xl text-white space-y-3 animate-in fade-in duration-300 relative overflow-hidden shadow-md">
                      <div className="absolute top-0 right-0 p-3 opacity-[0.035] pointer-events-none">
                         <BrainCircuit className="w-20 h-20 text-indigo-400" />
                      </div>
                      
                      <div className="flex items-center gap-2 relative z-10">
                         <BrainCircuit className="w-3.5 h-3.5 text-indigo-400 animate-pulse shrink-0" />
                         <span className="text-[9px] font-black uppercase tracking-wider text-indigo-300 font-mono">Hermética Cognitive Solver</span>
                         <span className="text-[7.5px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-1.5 py-0.5 rounded uppercase ml-auto">Active</span>
                      </div>

                      <p className="text-[10.5px] text-slate-300 leading-snug font-medium relative z-10">
                         Absence risk registered at <span className="text-rose-405 font-black font-mono">{Math.round((1 - activeStop.predictedProbability) * 100)}%</span>. Recipient is historically at office until 5 PM.
                      </p>

                      <button
                        onClick={() => {
                          const targetId = activeStop.id;
                          setIsFinishing(true);
                          setTimeout(() => {
                            setStops(prev => {
                              const targetItem = prev.find(s => s.id === targetId);
                              if (!targetItem) return prev;
                              const otherItems = prev.filter(s => s.id !== targetId);
                              
                              // Slices target stop and appends to end of matching route sequence
                              const rescheduledStop = {
                                ...targetItem,
                                suggestedSlot: '17:00 - 18:30 (Later Hours)',
                                predictedProbability: 0.98,
                                notes: 'Re-routed autonomously to Later Hours per recipient matrix lock. SLA compliance secure @98%.'
                              };
                              return [...otherItems, rescheduledStop];
                            });
                            setIsFinishing(false);
                            showPhoneToast("Hermética Active Solver!", "Rerouted Elena to Evening. Next Madrid stop pulled forward.", "success");
                          }, 1100);
                        }}
                        className="w-full h-9 bg-indigo-600 hover:bg-slate-800 text-white rounded-xl text-[9.5px] font-extrabold uppercase tracking-widest transition-all cursor-pointer relative z-10 flex items-center justify-center gap-1.5 border border-indigo-400/20 font-mono"
                      >
                         <RefreshCw className="w-3 h-3 animate-spin" />
                         Solve Absence (Move Later)
                      </button>
                   </div>
                 )}
              </div>
            </div>

            {/* Next Stops */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">Upcoming Node Cluster</h4>
              {upcomingStops.map((stop, idx) => (
                <div key={stop.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                   <div className="flex items-center gap-4">
                      <div className="text-[11px] font-black text-slate-300 italic">#{idx + currentStopIndex + 2}</div>
                      <div className={cn("p-2 rounded-xl", stop.stopType === 'pickup' ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500")}>
                        {stop.stopType === 'pickup' ? <ArrowRight className="w-3.5 h-3.5 -rotate-45" /> : <MapPin className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-black text-slate-800 truncate w-32 uppercase italic tracking-tighter">{stop.address}</div>
                        <div className="text-[9px] font-bold text-slate-400 flex gap-2 uppercase tracking-tight">
                           <span>{stop.suggestedSlot.split(' - ')[0]}</span>
                           <span className={stop.stopType === 'pickup' ? "text-amber-600" : "text-blue-600"}>{stop.stopType || 'delivery'}</span>
                        </div>
                      </div>
                   </div>
                </div>
              ))}
              {upcomingStops.length === 0 && (
                 <div className="py-6 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No Further Nodes in Sequence</p>
                 </div>
              )}
            </div>

            {/* Resolved Stops */}
            {completedStops.length > 0 && (
              <div className="space-y-3 pb-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 italic">Resolved Traversal History</h4>
                {completedStops.map((stop) => (
                  <div key={stop.id} className="bg-slate-50 border border-slate-100/50 rounded-2xl p-4 flex items-center justify-between opacity-60">
                     <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-xl",
                          stop.status === 'delivered' ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                        )}>
                          {stop.status === 'delivered' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-black text-slate-500 truncate w-40 uppercase italic tracking-tighter line-through">{stop.address}</div>
                          <div className="text-[8px] font-black text-slate-400 uppercase">
                             Resolved: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {stop.status}
                          </div>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

        {/* Action Panel */}
        <div className="p-6 bg-white border-t border-slate-100 space-y-2 relative z-30 shrink-0">
          <AnimatePresence>
            {showFailureReasons && (
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className={cn(
                  "absolute inset-x-0 bottom-0 bg-white z-50 border-t border-slate-150 rounded-t-[32px] p-6 flex flex-col shadow-[0_-8px_30px_rgb(0,0,0,0.12)] text-left",
                  pitchStage === 'poc' ? "h-[320px]" : pitchStage === 'mvp' ? "h-[380px]" : "h-[530px]"
                )}
              >
                <div className="flex items-center justify-between mb-4 shrink-0 pb-2 border-b border-slate-100">
                   <p className="text-[12px] font-black text-slate-900 uppercase tracking-widest italic leading-none">Operational Exception Report</p>
                   <button onClick={() => setShowFailureReasons(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                      <X className="w-5 h-5" />
                   </button>
                </div>
                <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1">
                  {[
                    { icon: DoorOpen, label: 'Person Not Home', key: 'person-not-home' },
                    { icon: MapPinned, label: 'Wrong Address', key: 'wrong-address' },
                    ...(pitchStage === 'mvp' || pitchStage === 'scale' ? [
                      { icon: AlertTriangle, label: 'Address Incomplete', key: 'address-incomplete' }
                    ] : []),
                    ...(pitchStage === 'scale' ? [
                      { icon: ShieldAlert, label: 'Blocked Entry to Building', key: 'blocked-entry' },
                      { icon: Clock, label: 'Unresponsive Intercom', key: 'unresponsive-intercom' },
                      { icon: X, label: 'Refused / Damaged', key: 'refused-damaged' }
                    ] : [])
                  ].map((reason) => (
                    <button 
                      key={reason.key}
                      onClick={() => goToNextStop(activeStop.id, reason.key as any)} 
                      className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[9.5px] font-black text-slate-700 hover:bg-slate-900 hover:text-white transition-all flex flex-col items-center justify-center gap-2 group uppercase italic tracking-tighter text-center"
                    >
                      <reason.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                      {reason.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            {showHandover && (
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="absolute inset-x-0 bottom-0 h-[530px] bg-white z-50 border-t border-slate-150 rounded-t-[32px] p-5 flex flex-col shadow-[0_-8px_30px_rgb(0,0,0,0.12)] text-left"
              >
                <div className="flex items-center justify-between pointer-events-auto shrink-0 mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    {pitchStage === 'poc' ? (
                      <>
                        <PenTool className="w-5 h-5 text-blue-600 animate-pulse" />
                        <p className="text-[12px] font-black text-slate-900 uppercase tracking-widest italic">Manual Recipient Handover</p>
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="w-5 h-5 text-blue-600" />
                        <p className="text-[12px] font-black text-slate-950 uppercase tracking-widest italic animate-pulse">AI Proof-of-Delivery</p>
                      </>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setShowHandover(false);
                      setSelectedCapture(null);
                      setAiStatus('idle');
                      setErrorMessage('');
                      setIsSigned(false);
                    }} 
                    className="p-1 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {pitchStage === 'poc' ? (
                    <div className="space-y-4 text-left">
                      <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-[10px] text-blue-800 leading-normal font-medium">
                        ℹ️ Please capture a signature below from the designated receiver to release this parcel.
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Recipient Surname</label>
                        <input
                          type="text"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] font-bold text-slate-850 focus:outline-none focus:border-blue-500"
                          placeholder="Surname"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Recipient Signature Pad</label>
                        <div 
                          onClick={() => setIsSigned(true)}
                          className="border border-dashed border-slate-305 rounded-[20px] bg-slate-50 h-[178px] relative flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden hover:bg-slate-100/50 transition-colors"
                        >
                          {isSigned ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                              {/* Cursive Signature Vector rendering */}
                              <svg className="w-48 h-20 text-blue-600 animate-in fade-in duration-300" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M10,25 Q25,5 40,28 T70,12 T90,20" />
                                <path d="M25,24 L75,24" strokeWidth="1" stroke="lightgray" strokeDasharray="2 2" />
                              </svg>
                              <span className="text-[10px] font-mono text-slate-400 uppercase mt-2">Signed by {recipientName}</span>
                            </div>
                          ) : (
                            <div className="text-center p-4 space-y-2 pointer-events-none">
                              <PenTool className="w-8 h-8 text-slate-400 mx-auto animate-bounce" />
                              <p className="text-[11px] font-black text-slate-550 uppercase tracking-widest leading-none">Tap / Click here to sign</p>
                              <p className="text-[8px] text-slate-400">Generates simulated receipt ink to clear SLA requirements.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {isSigned && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => setIsSigned(false)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-605 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded"
                          >
                            Clear Pad
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Camera Viewfinder */}
                      <div className="border border-dashed border-slate-300 rounded-[24px] overflow-hidden bg-slate-950 aspect-[16/10] relative flex items-center justify-center">
                        {selectedCapture ? (
                          <>
                            <img 
                              src={selectedCapture} 
                              alt="Camera Capture" 
                              className={cn(
                                "w-full h-full object-cover transition-all",
                                aiStatus === 'analyzing' ? "opacity-30 brightness-50" : ""
                              )}
                              referrerPolicy="no-referrer"
                            />
                            {aiStatus === 'analyzing' && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white p-4">
                                <motion.div 
                                  className="w-full h-0.5 bg-blue-500 absolute top-0"
                                  animate={{ top: ['0%', '100%', '0%'] }}
                                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                />
                                <BrainCircuit className="w-8 h-8 text-blue-500 animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-center">AI Spatial Frame Analysis...</span>
                              </div>
                            )}
                            {aiStatus === 'success' && (
                              <div className="absolute top-3 right-3 bg-emerald-500/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-400 flex items-center gap-1.5 text-white">
                                <span className="text-[8px] font-black uppercase tracking-widest">AI VALIDATED ✅</span>
                              </div>
                            )}
                            {aiStatus === 'failed' && (
                              <div className="absolute top-3 right-3 bg-rose-500/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-rose-400 flex items-center gap-1.5 text-white animate-bounce">
                                <span className="text-[8px] font-black uppercase tracking-widest">AI REJECTED ❌</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center p-6 space-y-2">
                            <Plus className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">Camera Feed Idle</p>
                            <p className="text-[9px] text-slate-400 leading-tight">Select a simulated capture sample below to start the spatial validation thread.</p>
                          </div>
                        )}
                      </div>

                      {errorMessage && (
                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 text-[10px] text-rose-700 font-medium leading-relaxed">
                          {errorMessage}
                        </div>
                      )}

                      {aiStatus === 'success' && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-[10px] text-emerald-800 font-extrabold uppercase leading-normal tracking-tight text-center">
                          ✓ Package verified at correct coordinate threshold. Address label matched. Handover unlocked!
                        </div>
                      )}

                      {/* Simulator Capture Options */}
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Simulated Photo Capture Inputs</p>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            {
                              label: 'Valid Facade',
                              url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&auto=format&fit=crop&q=80',
                              type: 'success',
                              detail: 'Label match score >0.92'
                            },
                            {
                              label: 'Empty Tiles',
                              url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=300&auto=format&fit=crop&q=80',
                              type: 'empty',
                              detail: 'No parcel envelope detected'
                            },
                            {
                              label: 'Blurred Feed',
                              url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=300&auto=format&fit=crop&q=80',
                              type: 'blurry',
                              detail: 'Sharpness index failure'
                            }
                          ].map((sample, sIdx) => (
                            <button 
                              key={sIdx}
                              onClick={() => {
                                setSelectedCapture(sample.url);
                                setAiStatus('analyzing');
                                setErrorMessage('');
                                setTimeout(() => {
                                  if (sample.type === 'success') {
                                    setAiStatus('success');
                                  } else if (sample.type === 'empty') {
                                    setAiStatus('failed');
                                    setErrorMessage('AI rejection: Target delivery item cannot be recognized. No parcel envelope detected on physical coordinate grid.');
                                  } else {
                                    setAiStatus('failed');
                                    setErrorMessage('AI rejection: Sharpness index failure (< 0.25). Capturing motion-blur too high to recognize barcode segment.');
                                  }
                                }, 1400);
                              }}
                              disabled={aiStatus === 'analyzing'}
                              className={cn(
                                "group rounded-xl overflow-hidden border bg-slate-50 text-center transition-all flex flex-col select-none",
                                selectedCapture === sample.url ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-100" : "border-slate-100 hover:border-slate-300"
                              )}
                            >
                              <div className="aspect-[4/3] bg-slate-200 overflow-hidden relative shrink-0">
                                <img src={sample.url} className="w-full h-full object-cover" />
                              </div>
                              <div className="p-1 px-1.5 flex-1 flex flex-col justify-between">
                                <span className="text-[8px] font-black text-slate-700 uppercase block truncate">{sample.label}</span>
                                <span className="text-[6.5px] font-bold text-slate-400 block tracking-tighter mt-0.5 leading-none">{sample.detail}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex gap-2 shrink-0">
                  <button 
                    onClick={() => {
                      setShowHandover(false);
                      setSelectedCapture(null);
                      setAiStatus('idle');
                      setErrorMessage('');
                      setIsSigned(false);
                    }}
                    className="flex-1 h-12 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 shadow-sm"
                  >
                    Go Back
                  </button>
                  <button 
                    onClick={() => {
                      goToNextStop(activeStop.id, 'delivered');
                    }}
                    disabled={pitchStage === 'poc' ? !isSigned : aiStatus !== 'success'}
                    className={cn(
                      "flex-[2] h-12 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md",
                      (pitchStage === 'poc' ? isSigned : aiStatus === 'success')
                        ? "bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-500 scale-[1.02] active:scale-95 cursor-pointer" 
                        : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Delivery
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setShowHandover(true)}
            disabled={isFinishing}
            className="w-full h-14 bg-blue-600 text-white rounded-[20px] font-black text-[13px] uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            Confirm Handover
          </button>
          <button 
            onClick={() => setShowFailureReasons(true)}
            disabled={isFinishing}
            className="w-full h-14 bg-white border-2 border-slate-100 rounded-[20px] text-[12px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
          >
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            Report Exception
          </button>
        </div>
      </div>
    </div>
  );
}
