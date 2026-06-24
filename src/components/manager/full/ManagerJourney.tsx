import React, { useState } from 'react';
import { Search, MapPin, Clock, Check, HelpCircle, ExternalLink, FileText, Shield, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_DELIVERIES } from '../../../data';
import { cn } from '../../../lib/utils';

interface JourneyStep {
  title: string;
  subtitle: React.ReactNode;
  status: 'completed' | 'current' | 'pending';
  isFailed?: boolean;
  time?: string;
  location: React.ReactNode;
  details: React.ReactNode;
}

export function FullJourney() {
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);

  const candidates = MOCK_DELIVERIES.filter(d => 
    d.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.id.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const activePackage = candidates[focusedIndex] || MOCK_DELIVERIES[0];

  const getTimelineSteps = (pkg: typeof activePackage): JourneyStep[] => {
    const isPickup = pkg.stopType === 'pickup';
    const zoneCode = pkg.assignedRoute.split('-').pop() || 'A1';
    const origin = pkg.merchantOrigin || 'Zara Serrano';
    const destinationName = isPickup ? (pkg.storeName || 'SEUR Locker Point') : 'Customer Residence';
    
    const steps: JourneyStep[] = [
      {
        title: 'Collected from Merchant',
        subtitle: <span>Picked up from <strong className="font-extrabold text-slate-800">{origin}</strong></span>,
        status: 'completed',
        time: '06:15 AM',
        location: <span><strong className="font-extrabold text-slate-800">{origin}</strong>, Madrid</span>,
        details: <span>Consignment successfully collected and logged from the <strong className="font-extrabold text-slate-800">{origin}</strong> retail loading bay. Package integrity verified and scanned.</span>
      }
    ];

    // Step 2: Sorted & Registered
    if (pkg.status === 'delayed') {
      steps.push({
        title: 'Sorted & Registered',
        subtitle: <span className="text-amber-600 font-bold uppercase">Awaiting Route Calibration</span>,
        status: 'current',
        time: '07:30 AM',
        location: 'SEUR Central Depot (Serrano Logistics Bay #4)',
        details: <span>Weighed and sorted for <strong className="font-extrabold text-slate-800">{pkg.userId}</strong>. Delayed in logistics bay due to dynamic traffic optimization on sector <strong className="font-extrabold text-slate-800">{zoneCode}</strong>. Awaiting next dispatch driver slot.</span>
      });
      // Remaining steps are pending
      steps.push({
        title: 'In Transit',
        subtitle: isPickup ? <span>En route to locker</span> : <span>En route to residence</span>,
        status: 'pending',
        location: '',
        details: ''
      });
      steps.push({
        title: isPickup ? 'Available at SEUR Point' : 'Delivered to Customer',
        subtitle: 'Pending delivery',
        status: 'pending',
        location: '',
        details: ''
      });
    } else {
      steps.push({
        title: 'Sorted & Registered',
        subtitle: 'Processed at primary logistics depot',
        status: 'completed',
        time: '07:30 AM',
        location: 'SEUR Central Depot (Serrano Logistics Bay #4)',
        details: <span>Weighed, sorted, and allocated to routing sector <strong className="font-extrabold text-slate-800">{zoneCode}</strong> for <strong className="font-extrabold text-slate-800">{pkg.userId}</strong>. Predictive route SLA calibrated.</span>
      });

      // Step 3: In Transit
      const isDelivered = pkg.status === 'delivered' || (pkg.status as string) === 'success' || (pkg.status as string) === 'synced';
      const hasFailed = ['failed', 'not-home', 'person-not-home', 'access-issue', 'access-denied', 'blocked-entry', 'unresponsive-intercom', 'refused-damaged', 'wrong-address', 'address-incomplete'].includes(pkg.status);
      
      steps.push({
        title: 'In Transit',
        subtitle: isPickup ? (
          <span>En route to <strong className="font-extrabold text-slate-850">{destinationName}</strong></span>
        ) : (
          <span>En route to customer residence</span>
        ),
        status: isDelivered || hasFailed ? 'completed' : 'current',
        time: '08:45 AM',
        location: `SEUR Dispatch Vehicle (${pkg.assignedRoute})`,
        details: isPickup ? (
          <span>Package loaded onto smart delivery dispatch van. Heading towards secure local collection partner: <strong className="font-extrabold text-slate-850">{destinationName}</strong>.</span>
        ) : (
          <span>Package loaded onto dispatch van. Bound for home address: <strong className="font-extrabold text-slate-850">{pkg.address.split(',')[0]}</strong>.</span>
        )
      });

      // Step 4: Delivered or Exception
      if (isDelivered) {
        steps.push({
          title: isPickup ? 'Available at SEUR Point' : 'Delivered to Customer',
          subtitle: 'Completed successfully',
          status: 'completed',
          time: pkg.actualArrival || '10:15 AM',
          location: isPickup ? (
            <span><strong className="font-extrabold text-slate-850">{pkg.storeName || 'SEUR Locker Point'}</strong>, Madrid</span>
          ) : (
            <span>{pkg.address}</span>
          ),
          details: isPickup 
            ? <span>Delivered and locked securely in terminal <strong className="font-extrabold text-slate-850">{destinationName}</strong>. Dynamic notification sent to <strong className="font-extrabold text-slate-850">{pkg.userId}</strong> with cryptographic pickup passcode.</span>
            : <span>Delivered and verified in-person with customer <strong className="font-extrabold text-slate-850">{pkg.userId}</strong> at residence. Electronic signature captured.</span>
        });
      } else if (hasFailed) {
        let failureSub = 'Delivery Exception';
        let failureDetails = <span>Delivery attempt failed at destination. Package held at nearest depot.</span>;
        if (pkg.status === 'not-home' || pkg.status === 'person-not-home') {
          failureSub = 'Recipient Not Home';
          failureDetails = <span>Driver arrived at <strong className="font-extrabold text-slate-850">{pkg.address.split(',')[0]}</strong> but recipient was not at home. Driver left a physical notice ticket and package was redirected.</span>;
        } else if (pkg.status === 'access-issue' || pkg.status === 'access-denied' || pkg.status === 'blocked-entry' || pkg.status === 'unresponsive-intercom') {
          failureSub = 'Access Issue at Destination';
          failureDetails = <span>Driver encountered an access issue (intercom unresponsive, gate locked, or building entry blocked) at <strong className="font-extrabold text-slate-850">{pkg.address.split(',')[0]}</strong>. Multi-agent routing advisor recommended immediate redirection.</span>;
        } else if (pkg.status === 'wrong-address' || pkg.status === 'address-incomplete') {
          failureSub = 'Incorrect/Incomplete Address';
          failureDetails = <span>Dynamic address validation flagged a mismatched or incomplete street address on <strong className="font-extrabold text-slate-850">{pkg.address.split(',')[0]}</strong>. Awaiting manual input corrections from customer portal.</span>;
        } else if (pkg.status === 'failed' || pkg.status === 'refused-damaged') {
          failureSub = 'Refused / Damaged Package';
          failureDetails = <span>The recipient refused the package or the package was identified as damaged upon arrival at <strong className="font-extrabold text-slate-850">{pkg.address.split(',')[0]}</strong>. Redirection requested.</span>;
        }

        steps.push({
          title: 'Delivery Exception',
          subtitle: <span className="text-red-600 font-extrabold uppercase">{failureSub}</span>,
          status: 'current',
          isFailed: true,
          time: '10:30 AM',
          location: <span>{pkg.address}</span>,
          details: failureDetails
        });
      } else {
        // Pending delivery
        steps.push({
          title: isPickup ? 'Available at SEUR Point' : 'Delivered to Customer',
          subtitle: isPickup ? <span>Pending locker delivery</span> : 'Pending home hand-off',
          status: 'pending',
          location: isPickup ? (
            <span><strong className="font-extrabold text-slate-850">{pkg.storeName || 'SEUR Locker Point'}</strong>, Madrid</span>
          ) : (
            <span>{pkg.address}</span>
          ),
          details: isPickup
            ? <span>En route to terminal. Expected availability at <strong className="font-extrabold text-slate-850">{destinationName}</strong> slot: <strong className="font-extrabold text-slate-850">{pkg.suggestedSlot}</strong>.</span>
            : <span>En route to home address. Driver is currently navigating to destination. Scheduled SLA window: <strong className="font-extrabold text-slate-850">{pkg.suggestedSlot}</strong>.</span>
        });
      }
    }

    return steps;
  };

  const steps = getTimelineSteps(activePackage).filter(step => step.status !== 'pending');

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <header className="min-h-[72px] px-6 border-b border-[#E2E8F0] flex flex-col md:flex-row items-start md:items-center justify-between bg-white shrink-0 py-4 md:py-0 gap-4 text-left">
        <div>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
            ENTERPRISE SUITE
          </span>
          <h1 className="text-[18px] md:text-[20px] font-black text-[#1E293B] mt-1">Full Product Journey Tracker</h1>
          <p className="text-[10px] text-[#64748B] font-heavy tracking-wider uppercase leading-none mt-1">
            Tracking customer deliveries and retail pickups
          </p>
        </div>
        <div className="flex items-center gap-3 font-heavy text-[11px]">
          <div className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-full text-[10px] font-black uppercase tracking-wider">
            Sovereign Audit Live
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          
          <div className="lg:col-span-4 text-left space-y-4">
            <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-[13px] font-black text-slate-900 uppercase">Select Routing Parcel</h3>
              <p className="text-[11.5px] text-slate-400 font-medium leading-relaxed">
                Filter by recipient name or parcel ID.
              </p>
              
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Recipient or Code..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setFocusedIndex(0);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold focus:outline-none focus:border-blue-500 uppercase placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {candidates.map((pkg, idx) => {
                  const isCur = activePackage.id === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => setFocusedIndex(idx)}
                      className={cn(
                        "w-full p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group gap-2",
                        isCur 
                          ? "bg-blue-600 border-blue-500 text-white shadow-lg" 
                          : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div>
                          <div className={cn("text-[10px] font-mono font-black uppercase mb-1", isCur ? "text-blue-100" : "text-slate-400")}>
                            {pkg.id}
                          </div>
                          <div className="text-[13.5px] font-black uppercase leading-tight truncate max-w-[155px]">
                            {pkg.userId}
                          </div>
                          <div className={cn("text-[9.5px] font-semibold mt-1 flex flex-col gap-0.5", isCur ? "text-blue-200" : "text-slate-500")}>
                            <span>🏪 From: {pkg.merchantOrigin || 'Zara Serrano'}</span>
                            <span>
                              {pkg.stopType === 'pickup' ? `🔄 Seur Point: ${pkg.storeName}` : `📦 Home Delivery`}
                            </span>
                          </div>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider shrink-0",
                          isCur ? "bg-blue-800 text-white" : "bg-slate-100 text-slate-600"
                        )}>
                          {pkg.status}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-[24px] border border-slate-200 p-6 md:p-8 shadow-sm space-y-6 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-5 gap-3">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest font-mono">Real-Time Routing Traversal</span>
                <h2 className="text-[18px] font-black text-slate-905 tracking-tight mt-1">Journey: {activePackage.userId}</h2>
                <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                  <span className="bg-slate-105 text-slate-700 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border border-slate-200">
                    {activePackage.entityId || 'NIF/NIE: N/A'}
                  </span>
                  
                  {/* Clickable link to the Order ID */}
                  <button 
                    onClick={() => setSelectedOrderDetails(activePackage)}
                    className="text-blue-600 hover:text-blue-800 text-[10px] font-mono font-extrabold underline flex items-center gap-1 bg-blue-50 hover:bg-blue-100 transition-colors px-2.5 py-0.5 rounded-md border border-blue-150"
                  >
                    <ExternalLink className="w-3 h-3" /> Order Token: {activePackage.id}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-50 px-4 py-2 rounded-2xl border">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-[11px] font-black text-slate-705">Predicted Delivery: <strong className="text-blue-600">{activePackage.predictedArrival || '09:45'} AM</strong></span>
              </div>
            </div>

            <div className="relative pl-8 space-y-8 py-2">
              <div className="absolute top-0 bottom-0 left-[15px] w-0.5 bg-slate-150" />

              {steps.map((step, idx) => {
                const isComp = step.status === 'completed';
                const isCur = step.status === 'current';
                const isFailed = step.isFailed;

                return (
                  <div key={idx} className="relative">
                    <div className={cn(
                      "absolute -left-[30px] w-8 h-8 rounded-full flex items-center justify-center border transition-all shadow-sm z-10 bg-white",
                      isFailed 
                        ? "bg-red-600 border-red-500 text-white scale-105" 
                        : isComp 
                          ? "bg-blue-600 border-blue-500 text-white" 
                          : isCur 
                            ? "border-blue-500 text-blue-600 scale-105 animate-pulse" 
                            : "border-slate-200 text-slate-300"
                    )}>
                      {isFailed ? (
                        <X className="w-4 h-4 stroke-[3px]" />
                      ) : isComp ? (
                        <Check className="w-4 h-4 stroke-[3px]" />
                      ) : (
                        <div className={cn("w-2 h-2 rounded-full", isCur ? "bg-blue-600" : "bg-slate-200")} />
                      )}
                    </div>

                    <div className="pl-4 space-y-1">
                      <h4 className={cn(
                        "text-[14px] md:text-[15px] font-black tracking-tight", 
                        isFailed 
                          ? "text-red-600 animate-pulse" 
                          : isComp 
                            ? "text-slate-800" 
                            : isCur 
                              ? "text-blue-600" 
                              : "text-slate-400"
                      )}>
                        {step.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide leading-none">{step.subtitle}</p>
                      <p className="text-[11.5px] text-slate-500 leading-relaxed font-semibold pt-1">{step.details}</p>
                      <div className="text-[9.5px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
                        📍 Coordinates: {step.location} {step.time && `• ${step.time}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border flex items-start gap-3">
              <HelpCircle className="w-4 h-4 text-blue-500 mt-0.5" />
              <div>
                <h5 className="text-[11.5px] font-black text-slate-700 uppercase tracking-wider">Multi-Agent Spatial Calibration</h5>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5">
                  The system actively models urban bottlenecks dynamically. Routes change dynamically behind-the-scenes to maintain the sovereign 99% dispatch target.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Dynamic Order Details Modal */}
      <AnimatePresence>
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden text-left"
            >
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-[15px] font-black uppercase tracking-tight">Sovereign Dispatch Certificate</h3>
                    <p className="text-[9.5px] text-slate-400 font-mono">TOKEN: {selectedOrderDetails.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedOrderDetails(null)}
                  className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Final Customer Recipient</span>
                    <strong className="text-slate-900 text-sm uppercase">{selectedOrderDetails.userId}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Legal Identity Code</span>
                    <strong className="text-slate-900 font-mono">{selectedOrderDetails.entityId}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Assigned Route Cluster</span>
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 rounded font-mono font-bold">{selectedOrderDetails.assignedRoute}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">SLA Target Arrival Slot</span>
                    <strong className="text-slate-900">{selectedOrderDetails.suggestedSlot}</strong>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Physical Destination Address</span>
                  <p className="text-[12px] font-bold text-slate-800 uppercase">{selectedOrderDetails.address}</p>
                </div>

                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Merchant Origin Store</span>
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-850 px-2.5 py-1 rounded-lg border border-blue-150 text-[11px] font-bold">
                    🏢 {selectedOrderDetails.merchantOrigin || 'Zara Serrano'} Location
                  </div>
                </div>

                {selectedOrderDetails.stopType === 'pickup' && selectedOrderDetails.storeName && (
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Destination SEUR Point / Locker</span>
                    <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-850 px-2.5 py-1 rounded-lg border border-amber-150 text-[11px] font-bold">
                      📦 {selectedOrderDetails.storeName}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="text-[11px] text-slate-600 leading-normal font-medium">
                    <strong className="text-blue-900 uppercase font-black block">Active SLA Integrity Verification</strong>
                    This consignment represents a sovereign legal contract. Physical delivery is audited and dynamically calculated to maintain a <span className="text-blue-700 font-bold">{Math.round(selectedOrderDetails.predictedProbability * 100)}% reliability score</span>.
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end">
                <button 
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-[11px] font-black uppercase tracking-wider shadow-md hover:bg-blue-700 transition-colors"
                >
                  Close Document
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

