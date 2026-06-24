import React, { useState } from 'react';
import { 
  Check, Calendar, Clock, Bell, RefreshCw, Send, MapPin, 
  ArrowRight, Sparkles, Smartphone, ChevronRight, ShieldCheck
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { SIMULATION_PERSONAS } from '../CustomerSimulator';

export function MVPCustomer() {
  // Static preconfigured customer profile representing the active recipient for showcase
  const customerName = 'Alex Gonzalez';
  const customerPhone = '+34 600 123 456';
  const customerAddress = 'Calle de Gran Vía 28, 3ºA';
  const customerItem = 'Dior Sauvage Bundle';

  const activePersona = {
    id: 'MVP-YOU-MAD',
    name: customerName,
    phone: customerPhone,
    address: customerAddress,
    item: customerItem,
  };

  const [simState, setSimState] = useState<'sms' | 'matrix' | 'done'>('sms');
  const [selectedSlots, setSelectedSlots] = useState<string[]>(['MON:11 AM - 12 PM']);

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

  const confirmPreferences = () => {
    setSimState('done');
  };

  return (
    <div className="flex-1 bg-slate-50 p-4 md:p-8 flex flex-col items-center justify-center text-left min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-sm flex flex-col space-y-5">
        
        {/* Showcase Header */}
        <div className="text-center space-y-1.5 select-none">
          <span className="text-[9.5px] bg-blue-50 border border-blue-100 text-blue-700 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest font-mono inline-block">
            MVP Touchpoint Simulator
          </span>
          <h2 className="text-[18px] font-black text-slate-900 tracking-tight leading-none">Weekly Matrix Sync Flow</h2>
          <p className="text-[11.5px] text-slate-500 max-w-xs mx-auto leading-normal">
            Experience when they get the notification, how they enter multiple availabilities, and locking preferences into SEUR Madrid&apos;s queue.
          </p>
        </div>

        {/* Handheld simulator with matrix */}
        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full aspect-[1/2.05] bg-slate-950 md:border-[10px] border-slate-900 rounded-[38px] shadow-2xl relative overflow-hidden flex flex-col">
            
            <div className="flex-1 bg-white relative flex flex-col overflow-hidden pt-6 pb-2 text-left min-h-0">
              
              {simState === 'sms' && (
                <div className="flex-1 flex flex-col justify-between p-4 bg-slate-900 text-white animate-fade-in">
                  <div className="pt-4 text-center">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black">Outbound SMS Sync Notify</span>
                    <h4 className="text-[20px] font-black text-[#38BDF8] mt-1 uppercase italic">Sync Invitation</h4>
                  </div>

                  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 space-y-3 shadow-md my-auto hover:bg-slate-750 transition-all cursor-pointer active:scale-98"
                       onClick={() => setSimState('matrix')}>
                    <div className="flex justify-between items-center text-[8px] font-mono uppercase text-[#38BDF8] tracking-wider">
                      <span>ARRIVIO NODE SECURE</span>
                      <span>Just Now</span>
                    </div>
                    <p className="text-[11px] leading-normal text-slate-200 font-semibold">
                      Hola {activePersona.name}! Your order tracking is now available. Please enter your weekly availability matrix to ensure successful first-time deliveries!
                    </p>
                    <div className="p-2 bg-blue-950 border border-blue-900 rounded-xl text-[10.5px] font-mono text-blue-300 flex justify-between items-center">
                      <span>node.arrivio.es/secure-sync</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-[10.5px] text-[#38BDF8] font-bold tracking-widest animate-pulse uppercase">
                      👆 TAP SCREEN TO LAUNCH MATRIX Portal
                    </span>
                  </div>
                </div>
              )}

              {simState === 'matrix' && (
                <div className="flex-1 overflow-y-auto p-4 animate-in slide-in-from-bottom max-h-full space-y-3.5">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[8.5px] font-mono bg-blue-100 text-[#2563EB] px-2 py-0.5 rounded-full font-black uppercase">
                        SEUR MADRID
                      </span>
                    </div>
                    <h4 className="text-[13.5px] font-black tracking-tight text-slate-900">
                      Global Weekly Availability Matrix
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Select your regular weekly home slots. We store this preference globally to optimize all future pedidos and guarantee first-time delivery success.
                    </p>
                  </div>

                  {/* Matrix Mon-Tue-Wed */}
                  <div className="border border-slate-250 rounded-xl overflow-hidden bg-white shadow-xs text-left shrink-0 mt-2">
                    <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200 text-center text-[9px] font-mono font-black py-2">
                      <div className="text-slate-400 border-r border-[#E2E8F0]">CEST</div>
                      {['MON', 'TUE', 'WED'].map(d => (
                        <div key={d} className="text-slate-600">{d}</div>
                      ))}
                    </div>

                    <div className="divide-y divide-slate-100">
                        {[
                          '9 AM - 10 AM',
                          '10 AM - 11 AM',
                          '11 AM - 12 PM',
                          '12 PM - 1 PM',
                          '3 PM - 4 PM'
                        ].map((hour) => {
                          const label = hour.split(' - ')[0];
                          return (
                            <div key={hour} className="grid grid-cols-4 h-9">
                              <div className="text-[8.5px] font-mono text-slate-400 font-bold bg-slate-50/50 flex items-center justify-center border-r border-[#E2E8F0]">
                                {label}
                              </div>
                              {['MON', 'TUE', 'WED'].map(d => {
                                const isSelected = selectedSlots.includes(`${d}:${hour}`);
                                return (
                                  <button
                                    key={d}
                                    type="button"
                                    onClick={() => toggleSlot(d, hour)}
                                    className={cn(
                                      "relative flex items-center justify-center transition-all cursor-pointer h-full border-r border-slate-100 last:border-0",
                                      isSelected ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50"
                                    )}
                                  >
                                    {isSelected ? (
                                      <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                                      </div>
                                    ) : (
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/30" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Preview lock highlight */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] space-y-1.5">
                      <div className="font-extrabold flex items-center gap-1.5 text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        Selected Slots ({selectedSlots.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedSlots.map(slot => (
                          <span key={slot} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-700">
                            {slot.replace(':', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* ALTERNATIVE FAIL-SAFE PREFERENCES CARD */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3 shadow-xs">
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
                      <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setFailSafeOption('retry')}
                          className={cn(
                            "py-1 px-1.5 rounded-lg text-[9px] font-bold transition-all text-center cursor-pointer",
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
                            "py-1 px-1.5 rounded-lg text-[9px] font-bold transition-all text-center cursor-pointer",
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
                            "py-1 px-1.5 rounded-lg text-[9px] font-bold transition-all text-center cursor-pointer",
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
                            "py-1 px-1.5 rounded-lg text-[9px] font-bold transition-all text-center cursor-pointer",
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
                        <div className="space-y-2 bg-white p-2.5 rounded-xl border border-slate-200/60">
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold uppercase text-slate-400">Neighbor Name</label>
                            <input
                              type="text"
                              value={neighborName}
                              onChange={(e) => setNeighborName(e.target.value)}
                              className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="e.g. Maria or Sr. Lopez"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold uppercase text-slate-400">Flat / Apartment</label>
                            <input
                              type="text"
                              value={neighborFlat}
                              onChange={(e) => setNeighborFlat(e.target.value)}
                              className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="e.g. 3ºA"
                            />
                          </div>
                        </div>
                      )}

                      {failSafeOption === 'locker' && (
                        <div className="space-y-2 bg-white p-2.5 rounded-xl border border-slate-200/60">
                          <label className="text-[8px] font-bold uppercase text-slate-400">Select Seur Pickup Point</label>
                          <select
                            value={selectedPickupPoint}
                            onChange={(e) => setSelectedPickupPoint(e.target.value)}
                            className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="SEUR Locker - Plaza de Colón">SEUR Locker - Plaza de Colón, Madrid</option>
                            <option value="SEUR Point - Librería Goya">SEUR Point - Librería Goya, Madrid</option>
                            <option value="SEUR Locker - Plaza Mayor">SEUR Locker - Plaza Mayor, Madrid</option>
                            <option value="SEUR Box - Estación Atocha">SEUR Box - Estación Atocha, Madrid</option>
                          </select>
                        </div>
                      )}

                      {failSafeOption === 'safe_place' && (
                        <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200/60">
                          <label className="text-[8px] font-bold uppercase text-slate-400">Safe Place Instructions</label>
                          <textarea
                            value={safePlaceInstructions}
                            onChange={(e) => setSafePlaceInstructions(e.target.value)}
                            rows={2}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                            placeholder="e.g. Leave inside the porch"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      onClick={confirmPreferences}
                      disabled={selectedSlots.length === 0}
                      className="w-full py-3.5 bg-blue-600 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:bg-blue-500 shadow-md cursor-pointer mt-3 shrink-0"
                    >
                      Commit & Save Selection ({selectedSlots.length})
                    </button>
                  </div>
                )}

              {simState === 'done' && (
                <div className="flex-1 flex flex-col justify-between p-5 bg-slate-900 text-white text-center animate-in zoom-in-95">
                  <div className="my-auto space-y-4">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mx-auto shadow-md">
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-black tracking-tight leading-none uppercase">Preferences Locked!</h4>
                      <p className="text-[11px] text-slate-400 mt-2 leading-normal">
                        Your preferred window has been registered. SEUR logistics node updated carrier scheduling for this delivery run safely.
                      </p>
                    </div>

                    <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-2.5 text-left text-[11px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Carrier ID:</span>
                        <span className="font-bold text-indigo-300">SEUR MADRID</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 uppercase font-black text-[8px]">Locked Slots:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedSlots.map(slot => (
                            <span key={slot} className="bg-white/10 text-yellow-300 text-[8.5px] font-bold px-2 py-0.5 rounded border border-white/5">
                              {slot.replace(':', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5 border-t border-white/10 pt-2">
                        <span className="text-slate-400 uppercase font-black text-[8px]">Fallback Action:</span>
                        <span className="font-bold text-emerald-400 text-[10.5px]">
                          {failSafeOption === 'retry' && '🔄 Standard Retry Tomorrow'}
                          {failSafeOption === 'neighbor' && `👥 Neighbor: ${neighborName || 'Unspecified'} (Flat ${neighborFlat || 'Unspecified'})`}
                          {failSafeOption === 'locker' && `📦 Locker: ${selectedPickupPoint}`}
                          {failSafeOption === 'safe_place' && `🏡 Safe Place: "${safePlaceInstructions || 'Unspecified'}"`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSimState('sms');
                    }}
                    className="text-[9.5px] uppercase font-black text-slate-400 hover:text-white underline decoration-dotted tracking-wider cursor-pointer"
                  >
                    ← Simulate Another Slot
                  </button>
                </div>
              )}

            </div>

            {/* Bottom Home lines bar */}
            <div className="h-4 bg-slate-950 flex items-center justify-center">
              <div className="w-16 h-1 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
