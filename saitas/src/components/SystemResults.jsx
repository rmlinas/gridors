// src/components/SystemResults.jsx
import React from 'react';

const SystemResults = ({
  totalDailyWh,
  requiredSolarWatts,
  requiredBatteryAh,
  requiredBatteryKWh,
  numBatteries,
  numSolarPanels,
  requiredInverterWatts,
  requiredChargeControllerAmps
}) => {
  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-gridors-light">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4 section-title">3. System Sizing Results</h3>
      <p className="text-gray-600 mb-6">Based on your input, here are the estimated sizes for your off-grid system components.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex justify-between items-center">
          <span className="text-gray-700 font-medium">Total Daily Energy Consumption (Wh):</span>
          <span className="text-gridors-primary text-xl font-bold">{totalDailyWh.toFixed(2)} Wh</span>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex justify-between items-center">
          <span className="text-gray-700 font-medium">Required Solar Panel Array Size (Watts):</span>
          <span className="text-gridors-primary text-xl font-bold">{requiredSolarWatts.toFixed(2)} W</span>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex justify-between items-center">
          <span className="text-gray-700 font-medium">Required Battery Bank Capacity (Ah):</span>
          <span className="text-gridors-primary text-xl font-bold">{requiredBatteryAh.toFixed(2)} Ah</span>
        </div>
         <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex justify-between items-center">
          <span className="text-gray-700 font-medium">Battery Bank Capacity (kWh):</span>
          <span className="text-gridors-primary text-xl font-bold">{requiredBatteryKWh.toFixed(2)} kWh</span>
        </div>
         <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex justify-between items-center">
          <span className="text-gray-700 font-medium">Approx. # of 100Ah 12V Batteries:</span>
          <span className="text-gridors-primary text-xl font-bold">{numBatteries}</span>
        </div>
         <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex justify-between items-center">
          <span className="text-gray-700 font-medium">Approx. # of 300W Solar Panels:</span>
          <span className="text-gridors-primary text-xl font-bold">{numSolarPanels}</span>
        </div>
         <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex justify-between items-center">
          <span className="text-gray-700 font-medium">Recommended Inverter Size (Watts):</span>
          <span className="text-gridors-primary text-xl font-bold">{requiredInverterWatts.toFixed(2)} W</span>
        </div>
         <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex justify-between items-center">
          <span className="text-gray-700 font-medium">Recommended Charge Controller (Amps):</span>
          <span className="text-gridors-primary text-xl font-bold">{requiredChargeControllerAmps.toFixed(2)} A</span>
        </div>
      </div>
    </div>
  );
};

export default SystemResults;