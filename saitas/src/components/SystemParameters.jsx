// src/components/SystemParameters.jsx
import React from 'react';

const SystemParameters = ({
  autonomyDays, setAutonomyDays,
  solarHours, setSolarHours,
  systemVoltage, setSystemVoltage,
  inverterEfficiency, setInverterEfficiency,
  solarSystemLosses, setSolarSystemLosses,
  batteryType, setBatteryType,
  tempFactor, setTempFactor,
  selectedPanelId, setSelectedPanelId,
  selectedBatteryId, setSelectedBatteryId,
  solarComponents, // Perduodame komponentų katalogą
  PRESETS,
  usePreset,
  resetCalculator
}) => {
  return (
    <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4 section-title">0. Load a Preset Scenario</h3>
      <p className="text-gray-600 mb-4">Choose a predefined setup to quickly estimate your system needs or clear to start fresh.</p>
      <div className="relative inline-block w-full sm:w-1/2 md:w-1/3 mb-8"> {/* Pridėtas mb-8 */}
        <select
          onChange={(e) => usePreset(e.target.value)}
          className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-gridors-primary"
          defaultValue=""
        >
          <option value="">-- Clear Preset / Start Fresh --</option>
          {Object.keys(PRESETS).map(presetName => (
            <option key={presetName} value={presetName}>
              {presetName}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>

      <h3 className="text-2xl font-semibold text-gray-800 mb-4 section-title">2. System Parameters</h3>
      <p className="text-gray-600 mb-4">Define your system's operational characteristics for accurate sizing.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Solar Panel Model Selection */}
        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Solar Panel Model:</span>
          <select
            value={selectedPanelId}
            onChange={(e) => setSelectedPanelId(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:ring-gridors-primary focus:border-gridors-primary"
          >
            {solarComponents.solarPanels.map(panel => (
              <option key={panel.id} value={panel.id}>
                {panel.brand} {panel.model} ({panel.power_watts}W)
              </option>
            ))}
          </select>
        </label>
        {/* Battery Model Selection */}
        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Battery Model:</span>
          <select
            value={selectedBatteryId}
            onChange={(e) => setSelectedBatteryId(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:ring-gridors-primary focus:border-gridors-primary"
          >
            {solarComponents.batteries.map(battery => (
              <option key={battery.id} value={battery.id}>
                {battery.brand} {battery.model} ({battery.capacity_ah}Ah {battery.voltage_v}V {battery.type})
              </option>
            ))}
          </select>
          <span className="text-gray-500 text-xs mt-1" title="Battery type, efficiency, and DoD will update based on selected model.">
              <i className="fas fa-info-circle mr-1"></i>Info from model
            </span>
        </label>
        {/* Temperature Derating Factor (%) */}
        <label className="flex flex-col">
          <span className="text-gray-700 text-sm mb-1" title="Enter reduction in battery capacity due to cold temperatures. e.g., 80 for 20% loss at cold temps (0.80 factor).">
            Temp. Derating Factor (%) <i className="fas fa-info-circle ml-1 text-gray-400"></i>
          </span>
          <input
            type="number"
            value={tempFactor * 100}
            onChange={(e) => setTempFactor(parseFloat(e.target.value) / 100)}
            className="p-2 border border-gray-300 rounded-md focus:ring-gridors-primary focus:border-gridors-primary"
          />
        </label>
        {/* Autonomy (Days without sun) */}
        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Autonomy (Days without sun):</span>
          <input
            type="number"
            value={autonomyDays}
            onChange={(e) => setAutonomyDays(parseFloat(e.target.value))}
            className="p-2 border border-gray-300 rounded-md focus:ring-gridors-primary focus:border-gridors-primary"
          />
        </label>
        {/* Average Peak Sun Hours/day */}
        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Average Peak Sun Hours/day:</span>
          <input
            type="number"
            value={solarHours}
            onChange={(e) => setSolarHours(parseFloat(e.target.value))}
            className="p-2 border border-gray-300 rounded-md focus:ring-gridors-primary focus:border-gridors-primary"
          />
        </label>
        {/* System Voltage (V) - now read-only, controlled by battery model selection */}
        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">System Voltage (V) - from Battery:</span>
          <input
            type="number"
            value={systemVoltage}
            readOnly
            className="p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
          />
          <span className="text-gray-500 text-xs mt-1" title="System Voltage is determined by the selected battery model.">
              <i className="fas fa-info-circle mr-1"></i>Read-only
            </span>
        </label>
        {/* Inverter Efficiency (%) */}
        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Inverter Efficiency (%):</span>
          <input
            type="number"
            value={inverterEfficiency * 100}
            onChange={(e) => setInverterEfficiency(parseFloat(e.target.value) / 100)}
            className="p-2 border border-gray-300 rounded-md focus:ring-gridors-primary focus:border-gridors-primary"
          />
        </label>
        {/* Solar System Losses (%) */}
        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Solar System Losses (%):</span>
          <input
            type="number"
            value={solarSystemLosses * 100}
            onChange={(e) => setSolarSystemLosses(parseFloat(e.target.value) / 100)}
            className="p-2 border border-gray-300 rounded-md focus:ring-gridors-primary focus:border-gridors-primary"
          />
        </label>
        {/* Battery Efficiency (%) - now read-only, controlled by battery model selection */}
        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Battery Efficiency (%) - from Model:</span>
          <input
            type="number"
            value={batteryEfficiency * 100}
            readOnly
            className="p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
          />
           <span className="text-gray-500 text-xs mt-1" title="Efficiency depends on selected battery model.">
              <i className="fas fa-info-circle mr-1"></i>Read-only
            </span>
        </label>
        {/* Battery DoD (%) - now read-only, controlled by battery model selection */}
        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Battery DoD (%) - from Model:</span>
          <input
            type="number"
            value={batteryDepthOfDischarge * 100}
            readOnly
            className="p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
          />
           <span className="text-gray-500 text-xs mt-1" title="Depth of Discharge depends on selected battery model.">
              <i className="fas fa-info-circle mr-1"></i>Read-only
            </span>
        </label>
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={() => dispatch({ type: 'RESET_CALCULATOR' })}
          className="btn btn-secondary px-4 py-2 rounded-md font-bold"
        >
          Reset All Values
        </button>
      </div>
    </div>
  );
};

export default SystemParameters;