import React from 'react';

const ApplianceList = ({ appliances, updateAppliance, removeAppliance, newAppliance, setNewAppliance, addAppliance }) => {
  return (
    <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4 section-title">1. Your Appliance Load</h3>
      <p className="text-gray-600 mb-4">List all appliances you plan to power and their estimated daily usage.</p>

      <div className="space-y-4 mb-6">
        {appliances.map((app) => (
          <div key={app.id} className="p-3 bg-white rounded-md shadow-sm border border-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-x-4 gap-y-2 items-end">
              {/* Appliance Fields */}
              <label className="flex flex-col col-span-full sm:col-span-2">
                <span className="text-gray-700 text-sm mb-1">Appliance Name</span>
                <input
                  type="text"
                  value={app.name}
                  onChange={(e) => updateAppliance(app.id, 'name', e.target.value)}
                  placeholder="Name"
                  className="p-2 border border-gray-300 rounded-md focus:ring-gridors-primary focus:border-gridors-primary"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-gray-700 text-sm mb-1">Rated Watts</span>
                <div className="relative">
                  <input
                    type="number"
                    value={app.watts}
                    onChange={(e) => updateAppliance(app.id, 'watts', e.target.value)}
                    placeholder="W"
                    className="p-2 border border-gray-300 rounded-md focus:ring-gridors-primary focus:border-gridors-primary pr-8 w-full"
                  />
                  <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-600 pointer-events-none">W</span>
                </div>
              </label>

              <label className="flex flex-col">
                <span className="text-gray-700 text-sm mb-1">Surge Watts</span>
                <div className="relative">
                  <input
                    type="number"
                    value={app.surgeWatts !== undefined ? app.surgeWatts : ''}
                    onChange={(e) => updateAppliance(app.id, 'surgeWatts', e.target.value)}
                    placeholder="W"
                    className="p-2 border border-gray-300 rounded-md focus:ring-gridors-primary focus:border-gridors-primary pr-8 w-full"
                    title="Peak power drawn momentarily on startup"
                  />
                  <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-600 pointer-events-none">W</span>
                </div>
              </label>

              <label className="flex flex-col">
                <span className="text-gray-700 text-sm mb-1">Hours/day</span>
                <div className="relative">
                  <input
                    type="number"
                    value={app.hours}
                    onChange={(e) => updateAppliance(app.id, 'hours', e.target.value)}
                    placeholder="Hrs"
                    className="p-2 border border-gray-300 rounded-md focus:ring-gridors-primary focus:border-gridors-primary pr-8 w-full"
                  />
                  <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-600 pointer-events-none">Hrs</span>
                </div>
              </label>

              <label className="flex flex-col">
                <span className="text-gray-700 text-sm mb-1">Duty Cycle (0-1)</span>
                <input
                  type="number"
                  value={app.dutyCycle !== undefined ? app.dutyCycle : ''}
                  onChange={(e) => updateAppliance(app.id, 'dutyCycle', e.target.value)}
                  placeholder="e.g., 0.33"
                  step="0.01"
                  className="p-2 border border-gray-300 rounded-md text-sm focus:ring-gridors-primary focus:border-gridors-primary w-full"
                  title="For compressor-based appliances like fridges"
                />
              </label>

              <div className="flex justify-end items-end col-span-full sm:col-span-1">
                <button
                  onClick={() => removeAppliance(app.id)}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Appliance Input */}
      <div className="p-3 bg-white rounded-md shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 sm:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-x-4 gap-y-2 items-end">
          <label className="flex flex-col col-span-full sm:col-span-2">
            <span className="text-gray-700 text-sm mb-1">New Appliance Name</span>
            <input
              type="text"
              value={newAppliance.name}
              onChange={(e) => setNewAppliance({ ...newAppliance, name: e.target.value })}
              placeholder="Name"
              className="p-2 border border-gray-300 rounded-md focus:ring-gridors-primary focus:border-gridors-primary"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-gray-700 text-sm mb-1">Rated Watts (W)</span>
            <div className="relative">
              <input
                type="number"
                value={newAppliance.watts}
                onChange={(e) => setNewAppliance({ ...newAppliance, watts: e.target.value })}
                placeholder="W"
                className="p-2 border border-gray-300 rounded-md focus:ring-gridors-primary focus:border-gridors-primary pr-8 w-full"
              />
              <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-600 pointer-events-none">W</span>
            </div>
          </label>

          <label className="flex flex-col">
            <span className="text-gray-700 text-sm mb-1">Surge Watts (W)</span>
            <div className="relative">
              <input
                type="number"
                value={newAppliance.surgeWatts}
                onChange={(e) => setNewAppliance({ ...newAppliance, surgeWatts: e.target.value })}
                placeholder="W"
                className="p-2 border border-gray-300 rounded-md focus:ring-gridors-primary focus:border-gridors-primary pr-8 w-full"
                title="Peak power drawn momentarily on startup"
              />
              <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-600 pointer-events-none">W</span>
            </div>
          </label>

          <label className="flex flex-col">
            <span className="text-gray-700 text-sm mb-1">Hours/day</span>
            <div className="relative">
              <input
                type="number"
                value={newAppliance.hours}
                onChange={(e) => setNewAppliance({ ...newAppliance, hours: e.target.value })}
                placeholder="Hrs"
                className="p-2 border border-gray-300 rounded-md focus:ring-gridors-primary focus:border-gridors-primary pr-8 w-full"
              />
              <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-600 pointer-events-none">Hrs</span>
            </div>
          </label>

          <label className="flex flex-col">
            <span className="text-gray-700 text-sm mb-1">Duty Cycle (0-1)</span>
            <input
              type="number"
              value={newAppliance.dutyCycle}
              onChange={(e) => setNewAppliance({ ...newAppliance, dutyCycle: e.target.value })}
              placeholder="e.g., 0.33"
              step="0.01"
              className="p-2 border border-gray-300 rounded-md text-sm focus:ring-gridors-primary focus:border-gridors-primary w-full"
              title="e.g., 0.33 for 33% active time"
            />
          </label>

          <div className="flex justify-end items-end col-span-full sm:col-span-1">
            <button
              onClick={addAppliance}
              className="p-2 bg-gridors-primary text-white rounded-md hover:bg-gridors-primary-light transition-colors"
            >
              <i className="fas fa-plus"></i> Add Appliance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplianceList;
