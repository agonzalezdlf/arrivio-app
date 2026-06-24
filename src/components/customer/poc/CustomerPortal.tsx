import React, { useState } from 'react';
import { 
  Smartphone, Bell, Calendar, Check, RefreshCw, Send, ShieldCheck, 
  MapPin, Clock, ChevronRight
} from 'lucide-react';
import { SIMULATION_PERSONAS } from '../CustomerSimulator';

export function POCCustomer() {
  // Static preconfigured customer profile representing the active recipient for showcase
  const customerName = 'Alex Gonzalez';
  const customerPhone = '+34 600 123 456';
  const customerAddress = 'Calle de Gran Vía 28, 3ºA';
  const customerItem = 'Chanel Luxury Cosmetics';

  const activePersona = {
    id: 'POC-YOU-MAD',
    name: customerName,
    phone: customerPhone,
    address: customerAddress,
    item: customerItem,
  };

  const [simState, setSimState] = useState<'notified' | 'portal' | 'success'>('notified');
  const [selectedDay, setSelectedDay] = useState('Tomorrow');
  const [selectedSlot, setSelectedSlot] = useState('Afternoon (15-18)');

  const confirmChoice = () => {
    setSimState('success');
  };

  return (
    <div className="flex-1 bg-slate-50 p-4 md:p-8 flex flex-col items-center justify-center text-left min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-sm flex flex-col space-y-5">
        
        {/* Showcase Header */}
        <div className="text-center space-y-1.5 select-none">
          <span className="text-[9.5px] bg-blue-50 border border-blue-100 text-blue-700 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest font-mono inline-block">
            POC Touchpoint Simulator
          </span>
          <h2 className="text-[18px] font-black text-slate-900 tracking-tight leading-none">End-Customer Sync Flow</h2>
          <p className="text-[11.5px] text-slate-500 max-w-xs mx-auto leading-normal">
            Experience when they get the notification, how they enter availability, and locking preferences into SEUR Madrid's queue.
          </p>
        </div>

        {/* Mobile simulator */}
        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full aspect-[1/2.05] bg-slate-950 md:border-[10px] border-slate-900 rounded-[38px] shadow-2xl relative overflow-hidden flex flex-col pointer-events-auto">
            
            <div className="flex-1 bg-white relative flex flex-col overflow-hidden pt-6 pb-2 text-left min-h-0">
              
              {simState === 'notified' && (
                <div className="flex-1 flex flex-col justify-between p-4 bg-slate-900 text-white animate-fade-in">
                  <div className="pt-4 text-center">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black">Outbound SMS Relay</span>
                    <h4 className="text-[20px] font-black text-yellow-500 mt-1 uppercase italic">1 New SMS</h4>
                  </div>

                  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 space-y-3 shadow-md my-auto hover:bg-slate-750 transition-all cursor-pointer active:scale-98"
                       onClick={() => setSimState('portal')}>
                    <div className="flex justify-between items-center text-[8px] font-mono uppercase text-blue-400 tracking-wider">
                      <span>SEUR MADRID</span>
                      <span>Just Now</span>
                    </div>
                    <p className="text-[11px] leading-normal text-slate-200 font-semibold">
                      Hola {activePersona.name}! Your order tracking is now available. Please enter your weekly availability matrix to ensure successful first-time deliveries!
                    </p>
                    <p className="text-[11px] leading-normal text-slate-400 italic font-semibold">
                      Tap our web link to enter your global weekly availability preferences.
                    </p>
                    <div className="p-2 bg-blue-950 border border-blue-900 rounded-xl text-[10.5px] font-mono text-blue-300 flex justify-between items-center">
                      <span>seur.madrid/sync-node</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-[10.5px] text-blue-400 font-bold tracking-widest animate-pulse uppercase">
                      👆 Tap the bubble to unlock sync portal
                    </span>
                  </div>
                </div>
              )}

              {simState === 'portal' && (
                <div className="flex-1 flex flex-col justify-between p-4 animate-in slide-in-from-bottom">
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-[10px] font-mono text-slate-500">
                      🔐 seur.madrid/sync-node (Secure)
                    </div>

                    <div className="p-3 bg-slate-900 text-white rounded-xl text-left">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 font-semibold block">COURIER PREDICTION</span>
                      <h4 className="text-[12px] font-black tracking-tight">{activePersona.item}</h4>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[13px] font-black text-slate-900 uppercase">POC Availability Switch</h4>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Select your regular weekly home presence. We save this matrix globally to optimize all future pedidos and guarantee first-time delivery success.
                      </p>
                    </div>

                    {/* Simple day dropdown */}
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Preferred Day</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Today', 'Tomorrow'].map((day) => (
                            <button
                              key={day}
                              onClick={() => setSelectedDay(day)}
                              className={`py-2 text-[11px] font-black rounded-xl border ${
                                selectedDay === day 
                                  ? "bg-slate-900 border-slate-950 text-white" 
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase text-slate-400">Preferred Window</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Morning (09-12)', 'Afternoon (15-18)'].map((slot) => (
                            <button
                              key={slot}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2 text-[11px] font-black rounded-xl border ${
                                selectedSlot === slot 
                                  ? "bg-slate-900 border-slate-950 text-white" 
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={confirmChoice}
                    className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:bg-blue-500 shadow-md cursor-pointer mt-4"
                  >
                    Lock Preference Window
                  </button>
                </div>
              )}

              {simState === 'success' && (
                <div className="flex-1 flex flex-col justify-between p-5 bg-slate-900 text-white text-center animate-in zoom-in-95">
                  <div className="my-auto space-y-4">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mx-auto shadow-md">
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-[16px] font-black tracking-tight leading-none uppercase">Successfully Synced!</h4>
                      <p className="text-[11px] text-slate-400 mt-2 leading-normal">
                        Your preferred window has been locked in database. The SEUR route re-sequencer updated Stop configurations.
                      </p>
                    </div>

                    <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1.5 text-left text-[11px]">
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-400">Carrier:</span>
                        <span className="font-bold text-indigo-300">SEUR Madrid Node</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-400">Chosen Slot:</span>
                        <span className="font-extrabold text-yellow-300 italic">{selectedDay} ({selectedSlot})</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSimState('notified');
                    }}
                    className="text-[9.5px] uppercase font-black text-slate-400 hover:text-white underline decoration-dotted tracking-wider cursor-pointer bg-transparent border-0"
                  >
                    ← Simulate Again
                  </button>
                </div>
              )}

            </div>

            <div className="h-4 bg-slate-950 flex items-center justify-center">
              <div className="w-16 h-1 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
