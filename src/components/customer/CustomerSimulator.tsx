import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Bell, Calendar, Clock, Check, RefreshCw, 
  BrainCircuit, ArrowRight, ShieldCheck, Sparkles, CheckCircle, 
  MapPin, Send, User, ChevronRight, Info, Award, Home, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface Persona {
  id: string;
  name: string;
  roleDescription: string;
  phone: string;
  address: string;
  postal: string;
  item: string;
  store: string;
  price: string;
  initialStopOrder: number;
  newStopOrder: number;
}

export const SIMULATION_PERSONAS: Record<string, Persona> = {
  elena: {
    id: 'PRM-84952-MAD',
    name: 'Elena Marín (Residential)',
    roleDescription: 'Working professional. Needs home delivery in Chamartín after office hours.',
    phone: '+34 699 412 855',
    address: 'Calle Hiedra 14, 4ºB',
    postal: '28016 (Chamartín)',
    item: 'Chanel No.5 & Dior Sauvage Luxury Bundle',
    store: 'Primor Madrid Flagship',
    price: '€184.50',
    initialStopOrder: 6,
    newStopOrder: 2
  },
  carlos: {
    id: 'PRM-38914-MAD',
    name: 'Carlos Ruiz (Salamanca Business)',
    roleDescription: 'Corporate Manager. Needs office tower package reception in Salamanca district.',
    phone: '+34 622 108 591',
    address: 'Paseo de la Castellana 112',
    postal: '28046 (Salamanca)',
    item: 'Giorgio Armani Code & Cleansing Kit',
    store: 'Primor Goya Store',
    price: '€129.00',
    initialStopOrder: 8,
    newStopOrder: 3
  },
  sofia: {
    id: 'PRM-19522-MAD',
    name: 'Sofía Alarcón (Centro Pedestrian)',
    roleDescription: 'Boutique Owner. Lives in pedestrian Sol zone with tight commercial access laws.',
    phone: '+34 605 982 173',
    address: 'Calle de Atocha 73',
    postal: '28012 (Centro)',
    item: 'Hermès Terre d\'Hermès Perfume',
    store: 'Primor Sol Outlet',
    price: '€95.00',
    initialStopOrder: 4,
    newStopOrder: 1
  }
};

export const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export const HOUR_SLOTS = [
  '8 AM - 9 AM',
  '9 AM - 10 AM',
  '10 AM - 11 AM',
  '11 AM - 12 PM',
  '12 PM - 1 PM',
  '1 PM - 2 PM',
  '2 PM - 3 PM',
  '3 PM - 4 PM',
  '4 PM - 5 PM',
  '5 PM - 6 PM'
];

export function getCellDetails(personaKey: string, day: string, hourSlot: string) {
  const d = day.toUpperCase();
  const isWeekend = d === 'SUN' || d === 'SAT';

  if (isWeekend) {
    return {
      level: 'low' as const,
      prob: 15,
      reason: 'Reduced weekend fleet operations in the neighborhood.'
    };
  } else {
    if (hourSlot.includes('12 PM') || hourSlot.includes('1 PM') || hourSlot.includes('4 PM') || hourSlot.includes('5 PM')) {
      return {
        level: 'optimal' as const,
        prob: 96,
        reason: 'Peak dispatch density. Carrier fleet proximity is at its maximum.'
      };
    } else if (hourSlot.includes('9 AM') || hourSlot.includes('10 AM') || hourSlot.includes('2 PM') || hourSlot.includes('3 PM')) {
      return {
        level: 'moderate' as const,
        prob: 75,
        reason: 'Standard corridor service window. Balanced fleet capacity.'
      };
    } else {
      return {
        level: 'low' as const,
        prob: 30,
        reason: 'Off-peak slot. Requires manual route divergence for dispatcher.'
      };
    }
  }
}

export function CustomerSimulator({ pitchStage = 'scale' }: { pitchStage?: 'poc' | 'mvp' | 'scale' }) {
  // Preconfigured customer profile representing the active recipient for showcase
  const customerName = 'Alex Gonzalez';
  const customerPhone = '+34 600 123 456';
  const customerAddress = 'Calle de Gran Vía 28, 3ºA';
  const customerPostal = '28013 (Centro)';
  const customerItem = 'Chanel No.5 & Dior Sauvage Luxury Bundle';
  const customerPrice = '€184.50';

  const activePersona = {
    id: 'PRM-YOU-MAD',
    name: customerName,
    roleDescription: 'Simulated personalized customer profile. Select multiple slots on your matrix.',
    phone: customerPhone,
    address: `${customerAddress}, ${customerPostal}`,
    postal: customerPostal,
    item: customerItem,
    store: 'Primor Gran Vía Store',
    price: customerPrice,
    initialStopOrder: 7,
    newStopOrder: 2
  };

  // Simulation steps State flow
  // 'idle' -> 'notified_sms' -> 'customer_portal' -> 'fully_synced'
  const [simState, setSimState] = useState<'idle' | 'notified_sms' | 'customer_portal' | 'fully_synced'>('idle');
  const [isSending, setIsSending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Selected Slots coordinates (supports ticking multiple slots)
  const [selectedSlots, setSelectedSlots] = useState<string[]>(['MON:5 PM - 6 PM']);

  // Alternative fail-safe options states
  const [failSafeOption, setFailSafeOption] = useState<'retry' | 'neighbor' | 'locker' | 'safe_place'>('retry');
  const [neighborName, setNeighborName] = useState('');
  const [neighborFlat, setNeighborFlat] = useState('');
  const [safePlaceInstructions, setSafePlaceInstructions] = useState('');
  const [selectedPickupPoint, setSelectedPickupPoint] = useState('SEUR Locker - Plaza de Colón');

  const toggleSlot = (day: string, hour: string) => {
    const key = `${day}:${hour}`;
    setSelectedSlots(prev => {
      if (prev.includes(key)) {
        return prev.filter(s => s !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  // Aggregated details based on selected slots
  const selectedDetails = selectedSlots.map(slot => {
    const [d, h] = slot.split(':');
    return getCellDetails('you', d, h);
  });

  const avgProb = selectedSlots.length > 0
    ? Math.round(selectedDetails.reduce((acc, curr) => acc + curr.prob, 0) / selectedSlots.length)
    : 0;

  const overallLevel = avgProb >= 85 ? 'optimal' : avgProb >= 60 ? 'moderate' : 'low';
  const overallReason = selectedSlots.length > 0
    ? `Combined compatibility score is ${avgProb}% across your ${selectedSlots.length} selected availability slots.`
    : 'No availability slots ticked. Please select one or more hours on the matrix.';

  const activeCellObj = {
    level: overallLevel,
    prob: avgProb,
    reason: overallReason
  };

  const [simLogs, setSimLogs] = useState<{ time: string; text: string; type: 'info' | 'success' | 'warning' }[]>([
    { time: '20:41:32', text: 'Personal customer simulation sandbox initiated.', type: 'info' }
  ]);

  const addLog = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const stamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setSimLogs(prev => [{ time: stamp, text, type }, ...prev]);
  };

  // Reset simulator state on initial mount
  useEffect(() => {
    setSimState('idle');
    setSimLogs([
      { time: new Date().toLocaleTimeString('en-GB', { hour12: false }), text: `Showcase profile ready for ${activePersona.name}. Ready for simulation.`, type: 'info' }
    ]);
  }, []);

  // Handle Dispatch Simulation Trigger
  const triggerSimulation = () => {
    setIsSending(true);
    addLog(`Filing merchant order request for ${activePersona.name} (${activePersona.id})`, 'info');
    
    setTimeout(() => {
      setIsSending(false);
      setSimState('notified_sms');
      addLog(`Package pre-calculated as STOP #${activePersona.initialStopOrder} on SEUR Central hub line.`, 'info');
      addLog(`Secure SMS token dispatched to mobile line ${activePersona.phone}`, 'success');
    }, 1000);
  };

  const handleOpenSms = () => {
    setSimState('customer_portal');
    addLog(`Customer tapped SMS webhook link. Initiating secure client portal session...`, 'info');
  };

  const commitSynchronize = () => {
    if (selectedSlots.length === 0) {
      addLog('Cannot synchronize with zero slots selected!', 'warning');
      return;
    }
    setIsSyncing(true);
    let failSafeText = '';
    if (failSafeOption === 'retry') {
      failSafeText = 'Standard Retry Tomorrow';
    } else if (failSafeOption === 'neighbor') {
      failSafeText = `Deliver to Neighbor: ${neighborName || 'Unspecified Name'} at flat ${neighborFlat || 'Unspecified Flat'}`;
    } else if (failSafeOption === 'locker') {
      failSafeText = `Drop at Pickup Point: ${selectedPickupPoint}`;
    } else if (failSafeOption === 'safe_place') {
      failSafeText = `Leave in Safe Place: ${safePlaceInstructions || 'Unspecified Location'}`;
    }

    addLog(`Submitting ${selectedSlots.length} client availability slots: ${selectedSlots.map(s => s.replace(':', ' ')).join(', ')}`, 'info');
    addLog(`Registering fallback delivery instruction: "${failSafeText}"`, 'info');
    
    setTimeout(() => {
      setIsSyncing(false);
      setSimState('fully_synced');
      addLog(`Hermética Neural Solver recalculated courier stops! Staging optimized Stop sequence from Stop #${activePersona.initialStopOrder} down to Stop #${activePersona.newStopOrder}.`, 'success');
      addLog(`Fallback instruction successfully logged in dispatch router database: "${failSafeText}"`, 'success');
      addLog(`Courier route updated. Carrier ETA reliability logged at ${avgProb}% confidence across ${selectedSlots.length} synchronized slots.`, 'success');
    }, 1200);
  };

  const resetAll = () => {
    setSimState('idle');
    setSelectedSlots(['MON:5 PM - 6 PM']);
    setFailSafeOption('retry');
    setNeighborName('');
    setNeighborFlat('');
    setSafePlaceInstructions('');
    setSelectedPickupPoint('SEUR Locker - Plaza de Colón');
    setSimLogs([
      { time: new Date().toLocaleTimeString('en-GB', { hour12: false }), text: 'Simulation reset complete. Configure your profile on the left.', type: 'info' }
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Upper Title Section */}
      <header className="px-4 md:px-8 py-5 border-b border-[#E2E8F0] bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 select-none shrink-0">
        <div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
            Interactive Customer Touchpoints
          </span>
          <h1 className="text-[20px] font-black text-[#1E293B] mt-1">End-Customer Portal & SMS Sync</h1>
          <p className="text-[12px] text-slate-500 font-medium whitespace-normal">
            Interact with the simulated SMS notification to experience how customers select their availability matrix, automatically updating the delivery route.
          </p>
        </div>

        <button 
          onClick={resetAll}
          className="px-4 py-2 text-[11px] font-black uppercase text-slate-700 hover:text-slate-900 border border-slate-250 bg-white rounded-xl flex items-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Simulation
        </button>
      </header>

      {/* Primary Simulator Workspace Layout */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
          
          {/* CONTROL SECTION (LOGISTICS CONSOLE) */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            
            {/* Interactive Demo Flow Steps */}
            <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm text-left space-y-6">
              <div>
                <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-widest font-mono block">Showcase Walkthrough</span>
                <h3 className="text-[18px] font-black text-slate-900 tracking-tight mt-1">Availability Sync Experience</h3>
                <p className="text-[12px] text-slate-500 font-medium leading-relaxed mt-1">
                  Experience how the end-customer interacts with Arrivio from the moment they receive their dispatch notification to locking their matrix availability.
                </p>
              </div>

              {/* Progress Steppers */}
              <div className="space-y-4">
                
                {/* STEP 1 */}
                <div className={cn(
                  "p-4 rounded-2xl border transition-all duration-300",
                  simState === 'idle' || simState === 'notified_sms'
                    ? "bg-blue-50/50 border-blue-200 shadow-xs"
                    : "bg-slate-50 border-slate-100 opacity-75"
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10.5px] font-bold font-mono shrink-0",
                      simState !== 'idle'
                        ? "bg-emerald-500 text-white"
                        : "bg-blue-600 text-white"
                    )}>
                      {simState !== 'idle' ? "✓" : "1"}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11.5px] font-extrabold text-slate-800 uppercase tracking-tight">Step 1: SMS Tracking Alert</span>
                        {simState !== 'idle' && (
                          <span className="text-[9px] font-bold text-emerald-600 font-mono bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Sent</span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-medium leading-normal">
                        SEUR logistics system registers the delivery. The customer receives an SMS tracking alert with a link to sync their weekly availability profile, maximizing first-time delivery success.
                      </p>

                      {simState === 'idle' && (
                        <div className="pt-2">
                          <button
                            onClick={triggerSimulation}
                            disabled={isSending}
                            className="h-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all active:scale-97 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                          >
                            {isSending ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Triggering SMS...
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                Simulate Outbound SMS Notification
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {simState === 'notified_sms' && (
                        <div className="pt-1.5 flex items-center gap-1.5 text-blue-600 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                          <Smartphone className="w-3.5 h-3.5" />
                          Tap the SMS card inside the phone to launch the portal
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* STEP 2 */}
                <div className={cn(
                  "p-4 rounded-2xl border transition-all duration-300",
                  simState === 'customer_portal'
                    ? "bg-blue-50/50 border-blue-200 shadow-xs"
                    : simState === 'fully_synced'
                    ? "bg-slate-50 border-slate-100 opacity-75"
                    : "bg-slate-50/40 border-slate-100 opacity-50"
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10.5px] font-bold font-mono shrink-0",
                      simState === 'fully_synced'
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-500"
                    )}>
                      {simState === 'fully_synced' ? "✓" : "2"}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11.5px] font-extrabold text-slate-800 uppercase tracking-tight">Step 2: Interactive Scheduling Matrix</span>
                        {simState === 'fully_synced' && (
                          <span className="text-[9px] font-bold text-emerald-600 font-mono bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Submitted</span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-medium leading-normal">
                        Customer opens their link to highlight multiple convenient hour ranges when they are home. High courier density zones are illuminated in green.
                      </p>
                      {simState === 'customer_portal' && (
                        <div className="pt-1.5 text-amber-600 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Select free slots on the grid and click &quot;Confirm Matrix Hour Slots&quot;
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* STEP 3 */}
                <div className={cn(
                  "p-4 rounded-2xl border transition-all duration-300",
                  simState === 'fully_synced'
                    ? "bg-blue-50/50 border-blue-200 shadow-xs"
                    : "bg-slate-50/40 border-slate-100 opacity-50"
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10.5px] font-bold font-mono shrink-0",
                      simState === 'fully_synced' ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                    )}>
                      3
                    </div>
                    <div className="space-y-1 flex-1">
                      <span className="text-[11.5px] font-extrabold text-slate-800 uppercase tracking-tight">Step 3: Route Re-sequencing & Saving</span>
                      <p className="text-[10.5px] text-slate-500 font-medium leading-normal">
                        Backend recalculates live routing. Your package delivery is safely prioritized and locks into optimized slots, maximizing dispatch efficiency.
                      </p>
                      {simState === 'fully_synced' && (
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          <div className="px-2 py-1 bg-emerald-50 border border-emerald-100 rounded text-[9px] font-bold text-emerald-800 font-mono uppercase">
                            ✓ STOP UPDATED: #7 → #2
                          </div>
                          <div className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded text-[9px] font-bold text-indigo-800 font-mono uppercase">
                            🌳 CO₂ AVOIDED: ~{(selectedSlots.length * 0.8).toFixed(1)} KG
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Simulated Live Server Sync Timeline */}
            <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm flex-1 flex flex-col justify-between text-left">
              <div>
                <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight">System Simulation Event Logs</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Automated logging of routing and priority adjustments in Madrid.</p>
              </div>

              <div className="border border-slate-150 rounded-2xl p-4 h-44 overflow-y-auto mt-4 font-mono text-[11px] text-slate-600 bg-slate-50 space-y-2.5 select-none">
                {simLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 border-b border-slate-200/50 pb-2 last:border-0 last:pb-0 leading-normal">
                    <span className="text-blue-600 text-[10px] font-bold shrink-0">[{log.time}]</span>
                    <span className={cn(
                      "flex-1 text-[11px] text-slate-700",
                      log.type === 'success' ? "text-emerald-700 font-bold" : "",
                      log.type === 'warning' ? "text-amber-700" : ""
                    )}>
                      {log.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* SIMULATED SMARTPHONE (USER EXPERIENCE WORKPLACE) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            
            <div className="w-full max-w-[340px] aspect-[1/2.05] bg-slate-950 md:border-[13px] border-slate-900 rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col pointer-events-auto">
              {/* Phone Speaker Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-slate-950 rounded-full z-40 hidden md:block" />

              {/* Inside Screen Container */}
              <div className="flex-1 bg-white relative flex flex-col overflow-hidden pt-6 pb-2 text-left min-h-0">
                
                {/* STATE 1: PHONE LOCK SCREEN WAITING */}
                {simState === 'idle' && (
                  <div className="flex-1 flex flex-col justify-between p-6 bg-slate-50 text-slate-800 text-center animate-fade-in">
                    <div className="my-auto space-y-4">
                      <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto animate-pulse">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 font-mono text-[9px] uppercase tracking-widest block">MADRID GATEWAY</span>
                        <h4 className="text-[18px] font-black tracking-tight text-slate-900">Waiting for Order</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed max-w-sm mx-auto font-medium">
                          Click &quot;Simulate Outbound SMS Notification&quot; on the left to dispatch the delivery token.
                        </p>
                      </div>
                    </div>

                    <div className="text-[9px] text-slate-400 font-mono pb-1 text-center font-semibold uppercase tracking-wider">
                      Carrier Status: Idle
                    </div>
                  </div>
                )}

                {/* STATE 2: NEW SMS RECEIVED */}
                {simState === 'notified_sms' && (
                  <div className="flex-1 flex flex-col justify-between p-4 bg-slate-50 text-slate-800 animate-fade-in">
                    <div className="pt-4 text-center space-y-0.5">
                      <span className="text-slate-400 font-mono text-[9px] uppercase font-black tracking-wider">SMS Inbox</span>
                      <h4 className="text-[16px] font-black tracking-tight text-slate-900">1 New Message</h4>
                    </div>

                    {/* Notification bubble */}
                    <div className="space-y-4 my-auto">
                      <div 
                        onClick={handleOpenSms}
                        className="bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-md transition-all cursor-pointer active:scale-98 text-left"
                      >
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider flex items-center gap-1">
                            <Smartphone className="w-3 h-3" /> SEUR MADRID
                          </span>
                          <span className="text-[8px] font-mono text-slate-400">Just Now</span>
                        </div>

                        <p className="text-[11.5px] text-slate-700 leading-relaxed font-semibold">
                          Hola {activePersona.name}! Your order tracking <strong>#{activePersona.id}</strong> is now active.
                        </p>
                        <p className="text-[11px] text-slate-500 leading-normal font-medium">
                          Please enter your weekly availability matrix to enhance the chances of successful first-time deliveries to you!
                        </p>

                        <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between text-[10px] text-blue-600 font-mono">
                          <span>node.seur.com/sync-mad</span>
                          <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                      </div>

                      <div className="text-center">
                        <span className="text-[10px] font-black text-blue-600 tracking-wider uppercase animate-pulse">
                          Tap the SMS card to open
                        </span>
                      </div>
                    </div>

                    <div className="text-center text-[9px] text-slate-400 font-mono font-medium">
                      Carrier Notification Simulator
                    </div>
                  </div>
                )}

                {/* STATE 3: INTERACTIVE MATRIX PORTAL */}
                {simState === 'customer_portal' && (
                  <div className="flex-1 flex flex-col justify-between animate-in slide-in-from-bottom duration-300 bg-white min-h-0">
                    
                    {/* Simulated Web Header tab */}
                    <div className="bg-slate-50 border-b border-slate-150 py-2 px-3 flex items-center gap-1.5 mx-3 rounded-lg text-[9.5px] font-mono text-slate-500 select-none mt-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate flex-1 font-semibold selection:bg-transparent">node.seur.com/sync-mad</span>
                    </div>

                    {/* Virtual app scrolling frame */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                      
                      {/* Package identity tag */}
                      <div className="bg-slate-50 text-slate-800 rounded-2xl p-3 border border-slate-200/80 flex items-center gap-2.5 shadow-xs text-left">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-center flex items-center justify-center shrink-0">P</div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[7.5px] font-sans font-black tracking-wider uppercase text-slate-400 leading-none">ORDER FROM PRIMOR</span>
                          <h4 className="text-[11px] font-black truncate leading-tight mt-0.5 text-slate-800">{activePersona.item}</h4>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-blue-600" /> Global Weekly Availability Matrix
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium leading-normal">
                          Select your regular weekly home presence. We store this preference globally to optimize all future orders and guarantee successful first-time deliveries!
                        </p>
                      </div>

                      {/* TRUE GRANULAR MATRIX GRID REFERENCE IMAGE LOOK */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white select-none shadow-xs text-left">
                        
                        {/* Column Headers */}
                        <div className="grid grid-cols-[52px_1fr] border-b border-slate-150 bg-slate-50/70">
                          <div className="py-2.5 text-[8px] font-mono uppercase font-black text-slate-400 text-center border-r border-[#E2E8F0]">
                            CEST
                          </div>
                          <div className="grid grid-cols-7 text-center divide-x divide-slate-100">
                            {WEEKDAYS.map((day) => (
                              <div key={day} className="py-2.5 text-[8.5px] font-mono font-black text-slate-600">
                                {day}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive hour columns */}
                        <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto">
                          {HOUR_SLOTS.map((hour) => {
                            const startHourLabel = hour.split(' - ')[0]; // E.g., '9 AM'
                            return (
                              <div key={hour} className="grid grid-cols-[52px_1fr] hover:bg-slate-50/20">
                                <div className="py-2.5 text-[8.5px] font-mono text-slate-400 text-center flex items-center justify-center bg-slate-50/30 border-r border-[#E2E8F0] shrink-0 font-bold">
                                  {startHourLabel}
                                </div>
                                <div className="grid grid-cols-7 h-9 divide-x divide-slate-100">
                                  {WEEKDAYS.map((day) => {
                                    const details = getCellDetails('you', day, hour);
                                    const isSelected = selectedSlots.includes(`${day}:${hour}`);

                                    return (
                                      <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleSlot(day, hour)}
                                        className={cn(
                                          "relative flex items-center justify-center transition-all cursor-pointer h-full group focus:outline-none",
                                          isSelected 
                                            ? "bg-slate-900 z-10 shadow-inner" 
                                            : "bg-white hover:bg-slate-50"
                                        )}
                                      >
                                        {/* Status indicator inside cell */}
                                        {isSelected ? (
                                          <div className={cn(
                                            "w-3.5 h-3.5 rounded-full flex items-center justify-center text-white",
                                            details.level === 'optimal' ? 'bg-emerald-500' :
                                            details.level === 'moderate' ? 'bg-amber-400' : 'bg-red-500'
                                          )}>
                                            <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                                          </div>
                                        ) : (
                                          <div className={cn(
                                            "w-2 h-2 rounded-full transition-all group-hover:scale-130 opacity-60",
                                            details.level === 'optimal' ? 'bg-emerald-500/40 group-hover:bg-emerald-500/90' :
                                            details.level === 'moderate' ? 'bg-amber-400/40 group-hover:bg-amber-400/90' : 'bg-red-400/20 group-hover:bg-red-400/70'
                                          )} />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selected Matrix Highlight Box */}
                      {pitchStage === 'poc' ? (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-[10px] text-slate-600 font-medium space-y-2">
                          <div className="font-bold flex items-center gap-1.5 text-slate-800">
                             <Clock className="w-3.5 h-3.5 text-slate-500" />
                             Selected Slots ({selectedSlots.length})
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {selectedSlots.map(slot => (
                              <span key={slot} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[8.5px] font-bold">
                                {slot.replace(':', ' ')}
                              </span>
                            ))}
                          </div>
                          <p className="text-[9.5px] text-slate-500 leading-normal pl-1 pt-1">
                             Selecting these slots reserves basic delivery attempts with local dispatch.
                          </p>
                        </div>
                      ) : pitchStage === 'mvp' ? (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/85 text-[10px] text-slate-600 font-medium space-y-2 text-left">
                        <div className="font-bold flex items-center gap-1.5 text-slate-800">
                           <Clock className="w-3.5 h-3.5 text-indigo-600" />
                           Selected Slots ({selectedSlots.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedSlots.map(slot => (
                            <span key={slot} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[8.5px] font-bold text-slate-700">
                              {slot.replace(':', ' ')}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                           <span className={cn(
                             "text-[7px] font-mono leading-none uppercase font-black px-1.5 py-0.5 rounded",
                             overallLevel === 'optimal' ? "bg-emerald-100 text-emerald-800" :
                             overallLevel === 'moderate' ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-850"
                           )}>
                             {overallLevel} • {avgProb}% CONFIDENCE
                           </span>
                        </div>
                        <p className="text-[9.5px] italic text-slate-500 leading-normal pl-0.5">
                           &quot;{overallReason}&quot;
                        </p>
                        <div className="pt-1.5 border-t border-slate-200/50">
                           <div className="w-full bg-slate-200 rounded-full h-1">
                              <div 
                                className={cn("h-1 rounded-full", overallLevel === 'optimal' ? 'bg-emerald-500' : 'bg-amber-500')} 
                                style={{ width: `${avgProb}%` }} 
                              />
                           </div>
                        </div>
                      </div>
                      ) : (
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-sm text-[10px] text-slate-600 font-medium space-y-3 text-left">
                          <div className="font-extrabold flex items-center gap-1.5 text-slate-900 text-[11px]">
                             <Clock className="w-3.5 h-3.5 text-blue-600" />
                             Selected Slots ({selectedSlots.length})
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {selectedSlots.length === 0 ? (
                              <span className="text-slate-400 italic text-[9.5px]">No slots selected. Click cells on the grid above to select.</span>
                            ) : (
                              selectedSlots.map(slot => {
                                const [d, h] = slot.split(':');
                                const detail = getCellDetails('you', d, h);
                                return (
                                  <span 
                                    key={slot}
                                    onClick={() => toggleSlot(d, h)}
                                    className={cn(
                                      "text-[9px] font-mono leading-none uppercase font-black px-2 py-1 rounded-lg border flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-all shadow-xs",
                                      detail.level === 'optimal' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                      detail.level === 'moderate' ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50/70 text-red-700 border-red-200"
                                    )}
                                  >
                                    {d} • {h.split(' - ')[0]}
                                    <span className="opacity-50 font-sans">×</span>
                                  </span>
                                );
                              })
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                             <span className={cn(
                               "text-[8px] font-mono leading-none uppercase font-black px-2 py-0.5 rounded tracking-wider",
                               overallLevel === 'optimal' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                               overallLevel === 'moderate' ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-red-55 text-red-700 border border-red-200"
                             )}>
                               ✦ {overallLevel} MATCH • {avgProb}% SYNC RELIABILITY
                             </span>
                          </div>
                          
                          <p className="text-[10px] italic text-slate-500 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                             &quot;{overallReason}&quot;
                          </p>
                          
                          <div className="pt-2 border-t border-slate-150 space-y-1 text-[9px] text-slate-400 font-mono">
                             <div className="flex justify-between">
                                <span className="font-medium">CO₂ SAVINGS:</span>
                                <span className="font-bold text-emerald-600">~{(selectedSlots.length * 0.8).toFixed(1)} kg avoided 🌳</span>
                             </div>
                             <div className="flex justify-between">
                                <span className="font-medium">COURIER SPLIT:</span>
                                <span className="text-blue-600 font-extrabold">TRUE (Multi-Slot Node Sync) ⚡</span>
                             </div>
                          </div>
                        </div>
                      )}

                      {/* ALTERNATIVE FAIL-SAFE PREFERENCES CARD */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3.5 shadow-xs">
                        <div className="space-y-1">
                          <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-indigo-600" />
                            Alternative Delivery Prefs
                          </h4>
                          <p className="text-[10px] text-slate-500 font-medium leading-normal">
                            In case you are not home or delivery fails:
                          </p>
                        </div>

                        {/* Segmented Radio Options */}
                        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setFailSafeOption('retry')}
                            className={cn(
                              "py-1.5 px-2 rounded-lg text-[9.5px] font-bold transition-all text-center cursor-pointer",
                              failSafeOption === 'retry'
                                ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                                : "text-slate-500 hover:text-slate-800"
                            )}
                          >
                            🔄 Standard Retry
                          </button>
                          <button
                            type="button"
                            onClick={() => setFailSafeOption('neighbor')}
                            className={cn(
                              "py-1.5 px-2 rounded-lg text-[9.5px] font-bold transition-all text-center cursor-pointer",
                              failSafeOption === 'neighbor'
                                ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                                : "text-slate-500 hover:text-slate-800"
                            )}
                          >
                            👥 Deliver to Neighbor
                          </button>
                          <button
                            type="button"
                            onClick={() => setFailSafeOption('locker')}
                            className={cn(
                              "py-1.5 px-2 rounded-lg text-[9.5px] font-bold transition-all text-center cursor-pointer",
                              failSafeOption === 'locker'
                                ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                                : "text-slate-500 hover:text-slate-800"
                            )}
                          >
                            📦 Drop at Locker
                          </button>
                          <button
                            type="button"
                            onClick={() => setFailSafeOption('safe_place')}
                            className={cn(
                              "py-1.5 px-2 rounded-lg text-[9.5px] font-bold transition-all text-center cursor-pointer",
                              failSafeOption === 'safe_place'
                                ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                                : "text-slate-500 hover:text-slate-800"
                            )}
                          >
                            🏡 Safe Place
                          </button>
                        </div>

                        {/* Conditional Inputs */}
                        {failSafeOption === 'neighbor' && (
                          <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200/60 animate-in fade-in slide-in-from-top-1 duration-150">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-slate-400">Neighbor Name</label>
                              <input
                                type="text"
                                value={neighborName}
                                onChange={(e) => setNeighborName(e.target.value)}
                                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="e.g. Maria (Conserje) or Sr. Lopez"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-slate-400">Flat / Apartment</label>
                              <input
                                type="text"
                                value={neighborFlat}
                                onChange={(e) => setNeighborFlat(e.target.value)}
                                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="e.g. 3ºB or Bajo Derecha"
                              />
                            </div>
                          </div>
                        )}

                        {failSafeOption === 'locker' && (
                          <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200/60 animate-in fade-in slide-in-from-top-1 duration-150">
                            <label className="text-[9px] font-bold uppercase text-slate-400">Select Seur Pickup Point</label>
                            <select
                              value={selectedPickupPoint}
                              onChange={(e) => setSelectedPickupPoint(e.target.value)}
                              className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="SEUR Locker - Plaza de Colón">SEUR Locker - Plaza de Colón, Madrid</option>
                              <option value="SEUR Point - Librería Goya">SEUR Point - Librería Goya, Madrid</option>
                              <option value="SEUR Locker - Plaza Mayor">SEUR Locker - Plaza Mayor, Madrid</option>
                              <option value="SEUR Box - Estación Atocha">SEUR Box - Estación Atocha, Madrid</option>
                            </select>
                            <div className="text-[8.5px] text-slate-500 leading-tight">
                              We will redirect the courier to offload your order here in real-time if they miss you.
                            </div>
                          </div>
                        )}

                        {failSafeOption === 'safe_place' && (
                          <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200/60 animate-in fade-in slide-in-from-top-1 duration-150">
                            <label className="text-[9px] font-bold uppercase text-slate-400">Safe Place Instructions</label>
                            <textarea
                              value={safePlaceInstructions}
                              onChange={(e) => setSafePlaceInstructions(e.target.value)}
                              rows={2}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                              placeholder="e.g. Leave inside the porch behind the blue flower pot"
                            />
                          </div>
                        )}
                      </div>

                      {/* Submit Synchronize Action */}
                      <button
                        onClick={commitSynchronize}
                        disabled={isSyncing || selectedSlots.length === 0}
                        className="w-full h-11 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-97 flex items-center justify-center gap-2 cursor-pointer shadow-md select-none mt-2"
                      >
                        {isSyncing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Locking Route...
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Confirm & Save Selection ({selectedSlots.length})
                          </>
                        )}
                      </button>

                    </div>

                    <div className="bg-slate-50 border-t border-slate-100 p-2 text-center text-[7.5px] text-slate-400 font-mono tracking-widest uppercase shrink-0">
                      🔐 Secure SSL Router • Network Sync
                    </div>
                  </div>
                )}

                {/* STATE 4: SUCCESS SYNC OK */}
                {simState === 'fully_synced' && (
                  <div className="flex-1 flex flex-col justify-between p-5 bg-white text-slate-800 animate-in zoom-in-95 duration-200 relative text-center">
                    
                    <div className="my-auto space-y-5">
                      <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
                        <Check className="w-6 h-6 stroke-[3px]" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-[16px] font-black tracking-tight text-slate-900 leading-tight">Preferences Synced</h4>
                        <span className="text-[8.5px] font-mono text-slate-400 uppercase tracking-widest block font-bold">ROUTE UPDATE RECORDED</span>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-left text-[11px] space-y-2.5">
                        <div className="flex justify-between font-mono">
                          <span className="text-slate-400 uppercase font-black text-[8px]">Carrier:</span>
                          <span className="text-slate-800 font-bold">SEUR MADRID</span>
                        </div>
                        <div className="flex flex-col gap-1 font-mono">
                          <span className="text-slate-400 uppercase font-black text-[8px]">Locked Slots:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedSlots.map(slot => {
                              const [d, h] = slot.split(':');
                              return (
                                <span key={slot} className="bg-amber-50 border border-amber-200 text-amber-750 text-[8.5px] font-bold px-2 py-0.5 rounded">
                                  {d} • {h.split(' - ')[0]}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span className="text-slate-400 uppercase font-black text-[8px]">Delivery Stop:</span>
                          <span className="text-emerald-600 font-extrabold">STOP #{activePersona.newStopOrder}</span>
                        </div>
                        
                        {/* Fallback Preference Display */}
                        <div className="flex flex-col gap-0.5 font-mono pt-1.5 border-t border-slate-150">
                          <span className="text-slate-400 uppercase font-black text-[8px]">Fallback Action:</span>
                          <span className="text-slate-850 font-bold text-[10px]">
                            {failSafeOption === 'retry' && '🔄 Standard Retry Tomorrow'}
                            {failSafeOption === 'neighbor' && `👥 Neighbor: ${neighborName || 'Unspecified'} (Flat ${neighborFlat || 'Unspecified'})`}
                            {failSafeOption === 'locker' && `📦 Locker: ${selectedPickupPoint}`}
                            {failSafeOption === 'safe_place' && `🏡 Safe Place: "${safePlaceInstructions || 'Unspecified'}"`}
                          </span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 italic font-medium leading-relaxed px-1">
                        The delivery scheduler successfully restructured stop priorities to respect your preferences. On-time delivery guaranteed.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={resetAll}
                        className="text-[9.5px] uppercase font-black text-slate-400 hover:text-slate-600 underline decoration-dotted tracking-wider"
                      >
                        ← Test other Scenarios
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Home bar anchor line */}
              <div className="h-6 bg-slate-900 border-t border-slate-900/60 flex items-center justify-center shrink-0">
                <div className="w-20 h-1 bg-white/20 rounded-full" />
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
