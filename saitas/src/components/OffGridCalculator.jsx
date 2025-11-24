import React, { useState, useEffect, useCallback, useReducer } from 'react';
import ApplianceList from './ApplianceList.jsx';
import SystemParameters from './SystemParameters.jsx';
import SystemResults from './SystemResults.jsx';

// Chart.js importai ir registracija perkelti į vidų, kad būtų valdomi
// TIK kliento pusėje, kadangi tai gali būti pagrindinė SSR klaidos priežastis.
let ChartJS;
let Pie;
let Bar;

if (typeof window !== 'undefined') {
  // Šis kodas bus vykdomas TIK kliento pusėje
  const ChartModule = await import('chart.js');
  const ReactChartJS2 = await import('react-chartjs-2');

  ChartJS = ChartModule.Chart;
  Pie = ReactChartJS2.Pie;
  Bar = ReactChartJS2.Bar;

  // Registruojame komponentus TIK kliento pusėje
  ChartJS.register(
    ChartModule.ArcElement,
    ChartModule.Tooltip,
    ChartModule.Legend,
    ChartModule.CategoryScale,
    ChartModule.LinearScale,
    ChartModule.BarElement
  );
}


// Svarbu: Šie duomenys paimti iš jūsų pateikto kodo ir laikomi čia lokaliai.
// Jei juos importuojate iš JSON failo, įsitikinkite, kad importas veikia tinkamai.
// Pavadintas LOCAL_SOLAR_COMPONENTS, kad būtų aišku, jog tai vidiniai duomenys,
// o ne props perduoti iš Astro.
const LOCAL_SOLAR_COMPONENTS = {
  "solarPanels": [
    { "id": "panel-001", "model": "EcoSun 100M", "brand": "EcoSol", "power_watts": 100, "voltage_vmp": 18.9, "current_imp": 5.29, "voltage_voc": 22.8, "current_isc": 5.67, "type": "Monocrystalline", "dimensions_mm": "1000x500x35", "price_usd_approx": 90 },
    { "id": "panel-002", "model": "PowerVault 300P", "brand": "SolarGen", "power_watts": 300, "voltage_vmp": 32.5, "current_imp": 9.23, "voltage_voc": 39.5, "current_isc": 9.78, "type": "Polycrystalline", "dimensions_mm": "1640x992x40", "price_usd_approx": 250 },
    { "id": "panel-003", "model": "SunForge 400M Pro", "brand": "ResilientEnergy", "power_watts": 400, "voltage_vmp": 40.5, "current_imp": 9.88, "voltage_voc": 48.6, "current_isc": 10.35, "type": "Monocrystalline", "dimensions_mm": "1990x1000x35", "price_usd_approx": 350 },
    { "id": "panel-004", "model": "HelioMax 450H", "brand": "SunTech", "power_watts": 450, "voltage_vmp": 41.2, "current_imp": 10.92, "voltage_voc": 49.8, "current_isc": 11.45, "type": "Half-Cut Monocrystalline", "dimensions_mm": "2108x1048x35", "price_usd_approx": 400 },
    { "id": "panel-005", "model": "BrightWave 250T", "brand": "EcoVolt", "power_watts": 250, "voltage_vmp": 30.1, "current_imp": 8.31, "voltage_voc": 37.4, "current_isc": 8.85, "type": "Thin-Film", "dimensions_mm": "1750x850x35", "price_usd_approx": 200 },
    { "id": "panel-006", "model": "DualSun 520B", "brand": "NextGenSolar", "power_watts": 520, "voltage_vmp": 42.8, "current_imp": 12.15, "voltage_voc": 51.2, "current_isc": 12.75, "type": "Bifacial Monocrystalline", "dimensions_mm": "2256x1133x35", "price_usd_approx": 480 },
    { "id": "panel-007", "model": "MiniVolt 50M", "brand": "CompactEnergy", "power_watts": 50, "voltage_vmp": 17.5, "current_imp": 2.86, "voltage_voc": 21.0, "current_isc": 3.05, "type": "Monocrystalline", "dimensions_mm": "700x400x30", "price_usd_approx": 60 },
    { "id": "panel-008", "model": "EliteSun 600M Premium", "brand": "SolarLux", "power_watts": 600, "voltage_vmp": 44.0, "current_imp": 13.64, "voltage_voc": 53.0, "current_isc": 14.20, "type": "Monocrystalline", "dimensions_mm": "2384x1150x35", "price_usd_approx": 550 }
  ],
  "batteries": [
    { "id": "batt-li-001", "model": "LithiumCell 100Ah", "brand": "LifePower", "capacity_ah": 100, "voltage_v": 12, "type": "LiFePO4", "max_dod": 0.85, "efficiency_roundtrip": 0.98, "cycle_life_at_dod_approx": 3000, "dimensions_mm": "330x173x220", "weight_kg": 12.5, "price_usd_approx": 350 },
    { "id": "batt-li-002", "model": "LithiumCell 200Ah", "brand": "LifePower", "capacity_ah": 200, "voltage_v": 12, "type": "LiFePO4", "max_dod": 0.85, "efficiency_roundtrip": 0.98, "cycle_life_at_dod_approx": 3000, "dimensions_mm": "522x240x220", "weight_kg": 25, "price_usd_approx": 650 },
    { "id": "batt-la-001", "model": "DeepCycle AGM 100Ah", "brand": "PowerStore", "capacity_ah": 100, "voltage_v": 12, "type": "Lead-Acid (AGM)", "max_dod": 0.50, "efficiency_roundtrip": 0.85, "cycle_life_at_dod_approx": 500, "dimensions_mm": "330x170x220", "weight_kg": 29, "price_usd_approx": 180 },
    { "id": "batt-la-002", "model": "DeepCycle Flooded 200Ah", "brand": "Everlast", "capacity_ah": 200, "voltage_v": 6, "type": "Lead-Acid (Flooded)", "max_dod": 0.50, "efficiency_roundtrip": 0.80, "cycle_life_at_dod_approx": 800, "dimensions_mm": "260x180x270", "weight_kg": 35, "price_usd_approx": 220 },
    { "id": "batt-li-003", "model": "PowerCore 150Ah", "brand": "VoltMaster", "capacity_ah": 150, "voltage_v": 24, "type": "LiFePO4", "max_dod": 0.90, "efficiency_roundtrip": 0.97, "cycle_life_at_dod_approx": 3500, "dimensions_mm": "480x200x240", "weight_kg": 20, "price_usd_approx": 550 },
    { "id": "batt-la-003", "model": "EnduraGel 120Ah", "brand": "StableEnergy", "capacity_ah": 120, "voltage_v": 12, "type": "Lead-Acid (Gel)", "max_dod": 0.60, "efficiency_roundtrip": 0.87, "cycle_life_at_dod_approx": 700, "dimensions_mm": "350x175x230", "weight_kg": 32, "price_usd_approx": 240 },
    { "id": "batt-li-004", "model": "HighVolt 100Ah", "brand": "EnerSys", "capacity_ah": 100, "voltage_v": 48, "type": "LiFePO4", "max_dod": 0.90, "efficiency_roundtrip": 0.98, "cycle_life_at_dod_approx": 4000, "dimensions_mm": "600x250x200", "weight_kg": 30, "price_usd_approx": 900 },
    { "id": "batt-li-005", "model": "LiteCell 50Ah", "brand": "PowerLite", "capacity_ah": 50, "voltage_v": 12, "type": "LiFePO4", "max_dod": 0.85, "efficiency_roundtrip": 0.98, "cycle_life_at_dod_approx": 3000, "dimensions_mm": "250x150x180", "weight_kg": 6.5, "price_usd_approx": 200 },
    { "id": "batt-lto-001", "model": "TitanPower 80Ah", "brand": "FutureCell", "capacity_ah": 80, "voltage_v": 24, "type": "Lithium Titanate (LTO)", "max_dod": 0.95, "efficiency_roundtrip": 0.99, "cycle_life_at_dod_approx": 10000, "dimensions_mm": "400x180x200", "weight_kg": 18, "price_usd_approx": 1200 }
  ]
};

// PRESETS dabar saugiai naudoja LOCAL_SOLAR_COMPONENTS duomenis
const PRESETS = (LOCAL_SOLAR_COMPONENTS.solarPanels.length > 0 && LOCAL_SOLAR_COMPONENTS.batteries.length > 0) ? {
  "Tiny Cabin": {
    appliances: [
      { id: 1, name: 'LED Lights', watts: 15, hours: 8, dutyCycle: 1, surgeWatts: 0 },
      { id: 2, name: 'Laptop', watts: 60, hours: 4, dutyCycle: 1, surgeWatts: 0 },
      { id: 3, name: 'Phone Charging', watts: 10, hours: 6, dutyCycle: 1, surgeWatts: 0 },
      { id: 4, name: 'Water Pump (small)', watts: 100, hours: 0.5, dutyCycle: 1, surgeWatts: 300 },
      { id: 5, name: 'Comms Radio', watts: 5, hours: 24, dutyCycle: 1, surgeWatts: 0 },
    ],
    solarHours: 4,
    autonomyDays: 3,
    systemVoltage: 12,
    batteryType: 'Lead-Acid',
    tempFactor: 1.1,
    selectedPanelId: LOCAL_SOLAR_COMPONENTS.solarPanels[0].id,
    selectedBatteryId: LOCAL_SOLAR_COMPONENTS.batteries[2].id // 'batt-la-001'
  },
  "Remote Workshop": {
    appliances: [
      { id: 1, name: 'LED Lights (Shop)', watts: 50, hours: 6, dutyCycle: 1, surgeWatts: 0 },
      { id: 2, name: 'Power Drill (intermittent)', watts: 700, hours: 0.2, dutyCycle: 1, surgeWatts: 1500 },
      { id: 3, name: 'Soldering Iron', watts: 40, hours: 3, dutyCycle: 1, surgeWatts: 0 },
      { id: 4, name: 'Small Air Compressor (intermittent)', watts: 1000, hours: 0.1, dutyCycle: 1, surgeWatts: 3000 },
      { id: 5, name: 'Laptop', watts: 60, hours: 8, dutyCycle: 1, surgeWatts: 0 },
    ],
    solarHours: 6,
    autonomyDays: 2,
    systemVoltage: 24,
    batteryType: 'LiFePO4',
    tempFactor: 1,
    selectedPanelId: LOCAL_SOLAR_COMPONENTS.solarPanels[1].id, // 'panel-002'
    selectedBatteryId: LOCAL_SOLAR_COMPONENTS.batteries[0].id // 'batt-li-001'
  },
  "Family Home (Moderate)": {
    appliances: [
      { id: 1, name: 'LED Lights (Home)', watts: 100, hours: 8, dutyCycle: 1, surgeWatts: 0 },
      { id: 2, name: 'Refrigerator', watts: 100, hours: 24, dutyCycle: 0.33, surgeWatts: 500 },
      { id: 3, name: 'Freezer', watts: 150, hours: 24, dutyCycle: 0.25, surgeWatts: 700 },
      { id: 4, name: 'Microwave (intermittent)', watts: 1000, hours: 0.05, dutyCycle: 1, surgeWatts: 1800 },
      { id: 5, name: 'Washing Machine (intermittent)', watts: 500, hours: 0.5, dutyCycle: 1, surgeWatts: 1500 },
      { id: 6, name: 'Laptop/Tablet Charging', watts: 150, hours: 6, dutyCycle: 1, surgeWatts: 0 },
      { id: 7, name: 'Water Pump (house)', watts: 500, hours: 1, dutyCycle: 1, surgeWatts: 1500 },
    ],
    solarHours: 5,
    autonomyDays: 2,
    systemVoltage: 48,
    batteryType: 'LiFePO4',
    tempFactor: 1,
    selectedPanelId: LOCAL_SOLAR_COMPONENTS.solarPanels[2].id, // 'panel-003'
    selectedBatteryId: LOCAL_SOLAR_COMPONENTS.batteries[1].id // 'batt-li-002'
  },
} : {}; // Atsarginis variantas - tuščias objektas, jei LOCAL_SOLAR_COMPONENTS yra tuščias (nors neturėtų)

// Inicialios būsenos nustatymas
const getInitialState = (props) => ({
  appliances: [
    { id: 1, name: 'LED Lights', watts: 10, hours: 6, dutyCycle: 1, surgeWatts: 0 },
    { id: 2, name: 'Laptop', watts: 60, hours: 4, dutyCycle: 1, surgeWatts: 0 },
    { id: 3, name: 'Mini Fridge', watts: 50, hours: 24, dutyCycle: 0.33, surgeWatts: 150 },
  ],
  newAppliance: { name: '', watts: '', hours: '', dutyCycle: 100, surgeWatts: '' },
  autonomyDays: 2,
  solarHours: 5,
  systemVoltage: 12,
  inverterEfficiency: 0.90,
  solarSystemLosses: 0.20,
  batteryType: 'LiFePO4', // Numatytasis tipas, bus atnaujintas pagal pasirinktą bateriją
  tempFactor: 1,
  // Naudojami props duomenys pirminiam pasirinkimui
  selectedPanelId: props.solarComponents?.solarPanels?.[0]?.id || null,
  selectedBatteryId: props.solarComponents?.batteries?.[0]?.id || null,
  allSolarComponents: props.solarComponents, // Išsaugome props duomenis būsenoje, kad būtų lengviau pasiekti

  // Skaičiavimo rezultatai
  totalDailyWh: 0,
  totalDailyAh: 0,
  requiredSolarWatts: 0,
  requiredBatteryAh: 0,
  requiredBatteryKWh: 0,
  numBatteries: 0,
  numSolarPanels: 0,
  requiredInverterWatts: 0,
  requiredChargeControllerAmps: 0,

  // Įspėjimai
  showWarning: false,
  warningMessage: '',
});

// Reducer funkcija būsenos valdymui
function calculatorReducer(state, action) {
  switch (action.type) {
    case 'ADD_APPLIANCE':
      const newApp = action.payload;
      // Validacija prieš pridedant
      if (!newApp.name || isNaN(parseFloat(newApp.watts)) || isNaN(parseFloat(newApp.hours))) return state;
      return {
        ...state,
        appliances: [
          ...state.appliances,
          {
            id: state.appliances.length > 0 ? Math.max(...state.appliances.map(a => a.id)) + 1 : 1,
            name: newApp.name,
            watts: parseFloat(newApp.watts),
            hours: parseFloat(newApp.hours),
            dutyCycle: parseFloat(newApp.dutyCycle) / 100, // Konvertuojama į decimal
            surgeWatts: parseFloat(newApp.surgeWatts) || 0,
          },
        ],
        newAppliance: { name: '', watts: '', hours: '', dutyCycle: 100, surgeWatts: '' },
      };
    case 'UPDATE_APPLIANCE':
      return {
        ...state,
        appliances: state.appliances.map((app) =>
          app.id === action.payload.id ? {
            ...app,
            [action.payload.field]: action.payload.field === 'name' ? action.payload.value :
              (action.payload.field === 'dutyCycle' ? parseFloat(action.payload.value) / 100 : parseFloat(action.payload.value))
          } : app
        ),
      };
    case 'REMOVE_APPLIANCE':
      return { ...state, appliances: state.appliances.filter((app) => app.id !== action.payload.id) };
    case 'SET_NEW_APPLIANCE_FIELD':
      return { ...state, newAppliance: { ...state.newAppliance, [action.payload.field]: action.payload.value } };
    case 'SET_PARAMETER':
      if (action.payload.field === 'selectedBatteryId') {
        // Saugus priėjimas prie baterijų duomenų
        const selectedBattery = state.allSolarComponents?.batteries?.find(b => b.id === action.payload.value);
        return {
          ...state,
          [action.payload.field]: action.payload.value,
          systemVoltage: selectedBattery ? selectedBattery.voltage_v : state.systemVoltage,
          batteryType: selectedBattery ? selectedBattery.type : state.batteryType,
        };
      }
      return { ...state, [action.payload.field]: action.payload.isNumber ? parseFloat(action.payload.value) : action.payload.value };
    case 'SET_RESULTS':
      return { ...state, ...action.payload };
    case 'SET_WARNING':
      return { ...state, showWarning: action.payload.show, warningMessage: action.payload.message };
    case 'LOAD_PRESET':
      const presetName = action.payload;
      const preset = PRESETS[presetName];
      if (!preset) {
        // Jei presetas neegzistuoja, grąžiname į pradinę būseną
        return { ...getInitialState({ solarComponents: state.allSolarComponents }) };
      }
      return {
        ...state,
        appliances: preset.appliances.map((app, index) => ({ ...app, id: index + 1 })),
        solarHours: preset.solarHours,
        autonomyDays: preset.autonomyDays,
        systemVoltage: preset.systemVoltage,
        batteryType: preset.batteryType,
        tempFactor: preset.tempFactor,
        selectedPanelId: preset.selectedPanelId,
        selectedBatteryId: preset.selectedBatteryId,
        newAppliance: { name: '', watts: '', hours: '', dutyCycle: 100, surgeWatts: '' },
        showWarning: false,
        warningMessage: '',
      };
    case 'RESET_CALCULATOR':
      return { ...getInitialState({ solarComponents: state.allSolarComponents }) };
    default: return state;
  }
}

const OffGridCalculator = (props) => {
  // useReducer su tinginiu inicializatoriumi, kad props būtų prieinami iš karto
  const [state, dispatch] = useReducer(calculatorReducer, undefined, () => getInitialState(props));

  // Efektas pradiniam saulės panelių/baterijų pasirinkimui
  useEffect(() => {
    if (props.solarComponents?.solarPanels?.length > 0 && state.selectedPanelId === null) {
      dispatch({ type: 'SET_PARAMETER', payload: { field: 'selectedPanelId', value: props.solarComponents.solarPanels[0].id } });
    }
    if (props.solarComponents?.batteries?.length > 0 && state.selectedBatteryId === null) {
      dispatch({ type: 'SET_PARAMETER', payload: { field: 'selectedBatteryId', value: props.solarComponents.batteries[0].id } });
    }
  }, [props.solarComponents, state.selectedPanelId, state.selectedBatteryId]);

  // Efektas sistemos įtampos atnaujinimui, kai pasirenkama baterija
  useEffect(() => {
    // Saugus priėjimas prie props.solarComponents
    const selectedBattery = props.solarComponents?.batteries?.find(b => b.id === state.selectedBatteryId);
    if (selectedBattery && state.systemVoltage !== selectedBattery.voltage_v) {
      dispatch({ type: 'SET_PARAMETER', payload: { field: 'systemVoltage', value: selectedBattery.voltage_v, isNumber: true } });
    }
  }, [state.selectedBatteryId, state.systemVoltage, props.solarComponents]);

  // Skaičiavimo logika
  const calculateSystem = useCallback(() => {
    // Saugus priėjimas prie props.solarComponents ir jo masyvų
    const solarPanels = props.solarComponents?.solarPanels;
    const batteries = props.solarComponents?.batteries;

    const selectedPanel = solarPanels?.find(p => p.id === state.selectedPanelId);
    const selectedBattery = batteries?.find(b => b.id === state.selectedBatteryId);

    // Įspėjimai, jei pasirinkti komponentai nerasti
    if (!selectedPanel) {
      dispatch({
        type: 'SET_WARNING',
        payload: { show: true, message: 'Nepavyko rasti pasirinktos saulės panelės. Patikrinkite pasirinkimą arba pasirinkite numatytąją.' }
      });
      // Nustatome rezultatus į 0, kad išvengtume tolesnių skaičiavimo klaidų
      dispatch({ type: 'SET_RESULTS', payload: { totalDailyWh: 0, requiredSolarWatts: 0, requiredBatteryKWh: 0, numBatteries: 0, numSolarPanels: 0, requiredInverterWatts: 0, requiredChargeControllerAmps: 0 } });
      return;
    }

    if (!selectedBattery) {
      dispatch({
        type: 'SET_WARNING',
        payload: { show: true, message: 'Nepavyko rasti pasirinktos baterijos. Patikrinkite pasirinkimą arba pasirinkite numatytąją.' }
      });
      // Nustatome rezultatus į 0, kad išvengtume tolesnių skaičiavimo klaidų
      dispatch({ type: 'SET_RESULTS', payload: { totalDailyWh: 0, requiredSolarWatts: 0, requiredBatteryKWh: 0, numBatteries: 0, numSolarPanels: 0, requiredInverterWatts: 0, requiredChargeControllerAmps: 0 } });
      return;
    }

    // Paslepiame įspėjimą, jei viskas gerai
    if (state.showWarning) {
      dispatch({ type: 'SET_WARNING', payload: { show: false, message: '' } });
    }

    // Skaičiavimai
    let dailyWh = state.appliances.reduce((sum, app) => sum + (app.watts * app.hours * app.dutyCycle), 0);
    const dailyAh = dailyWh / selectedBattery.voltage_v;

    const requiredSolar = (dailyWh * (1 + state.solarSystemLosses)) / state.solarHours;

    const batteryCapacityAh = (dailyAh * state.autonomyDays * state.tempFactor) / (selectedBattery.max_dod * selectedBattery.efficiency_roundtrip);

    const requiredBatteryKWh = (batteryCapacityAh * selectedBattery.voltage_v) / 1000;

    const numParallelBatteries = Math.ceil(batteryCapacityAh / selectedBattery.capacity_ah);
    const numSeriesBatteries = Math.ceil(state.systemVoltage / selectedBattery.voltage_v);
    const numBatteries = numParallelBatteries * numSeriesBatteries;

    const numSolarPanels = Math.ceil(requiredSolar / selectedPanel.power_watts);

    const continuousLoadWatts = state.appliances.reduce((sum, app) => sum + (app.watts * app.dutyCycle), 0);
    const maxSurgeWatts = Math.max(0, ...state.appliances.map(app => (app.surgeWatts || 0)));
    const requiredInverterWatts = Math.max(continuousLoadWatts, maxSurgeWatts) / state.inverterEfficiency;

    const chargeControllerAmps = (numSolarPanels * selectedPanel.power_watts / state.systemVoltage) * 1.25;

    // Atnaujiname būseną su rezultatais
    dispatch({
      type: 'SET_RESULTS',
      payload: { totalDailyWh: dailyWh, requiredSolarWatts: requiredSolar, requiredBatteryKWh: requiredBatteryKWh, numBatteries, numSolarPanels, requiredInverterWatts, requiredChargeControllerAmps },
    });
  }, [state.appliances, state.autonomyDays, state.solarHours, state.systemVoltage, state.solarSystemLosses, state.tempFactor, state.inverterEfficiency, state.selectedPanelId, state.selectedBatteryId, props.solarComponents, state.showWarning]);

  // Efektas, kuris paleidžia skaičiavimus, kai pasikeičia susijusios reikšmės
  useEffect(() => { calculateSystem(); }, [calculateSystem]);

  // Diagramų duomenų generavimas. Saugūs patikrinimai dėl NaN ar undefined.
  const energyUseData = {
    labels: state.appliances.map(app => app.name),
    datasets: [{
      data: state.appliances.map(app => {
        const val = app.watts * app.hours * app.dutyCycle;
        return isNaN(val) ? 0 : val; // Užtikriname, kad reikšmės būtų skaičiai
      }),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FFCD56'],
    }],
  };
  const energyUseOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } };

  // Saugiai gauname pasirinktą panelę
  const currentSelectedPanel = props.solarComponents?.solarPanels?.find(p => p.id === state.selectedPanelId);
  const dailyProductionWh = currentSelectedPanel
    ? state.numSolarPanels * currentSelectedPanel.power_watts * state.solarHours * (1 - state.solarSystemLosses)
    : 0; // 0, jei panelė nerasta arba jos galia 0

  const energyProductionData = {
    labels: ['Dienos Suvartojimas', 'Panelių Gamyba'],
    datasets: [
      {
        label: 'Dienos suvartojimas (Wh)',
        data: [isNaN(state.totalDailyWh) ? 0 : state.totalDailyWh],
        backgroundColor: '#FF6384'
      },
      {
        label: 'Panelių gamyba (Wh)',
        data: [isNaN(dailyProductionWh) ? 0 : dailyProductionWh],
        backgroundColor: '#36A2EB'
      },
    ],
  };
  const energyProductionOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } };

  return (
    <div className="off-grid-calculator p-4 sm:p-6 bg-white rounded-lg shadow-xl max-w-5xl mx-auto my-10 font-sans">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Saulės energijos sistemos skaičiuoklė</h2>
      <p className="text-gray-700 mb-8 text-center">Suplanuokite savo saulės, akumuliatorių ir rezervinės energijos poreikius.</p>

      <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">0. Įkelkite išankstinį scenarijų</h3>
        <div className="relative inline-block w-full sm:w-1/2 md:w-1/3">
          <select onChange={e => dispatch({ type: 'LOAD_PRESET', payload: e.target.value })} className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-md" defaultValue="">
            <option value="">-- Išvalyti / Pradėti iš naujo --</option>
            {Object.keys(PRESETS).map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
      </div>

      {state.showWarning && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Dėmesio!</strong>
          <span className="block sm:inline"> {state.warningMessage}</span>
        </div>
      )}

      <ApplianceList
        appliances={state.appliances}
        updateAppliance={(id, field, value) => dispatch({ type: 'UPDATE_APPLIANCE', payload: { id, field, value } })}
        removeAppliance={(id) => dispatch({ type: 'REMOVE_APPLIANCE', payload: { id } })}
        newAppliance={state.newAppliance}
        setNewApplianceField={(field, value) => dispatch({ type: 'SET_NEW_APPLIANCE_FIELD', payload: { field, value } })}
        addAppliance={() => dispatch({ type: 'ADD_APPLIANCE', payload: state.newAppliance })}
      />

      <SystemParameters {...state}
        setAutonomyDays={(val) => dispatch({ type: 'SET_PARAMETER', payload: { field: 'autonomyDays', value: val, isNumber: true } })}
        setSolarHours={(val) => dispatch({ type: 'SET_PARAMETER', payload: { field: 'solarHours', value: val, isNumber: true } })}
        setSystemVoltage={(val) => dispatch({ type: 'SET_PARAMETER', payload: { field: 'systemVoltage', value: val, isNumber: true } })}
        setInverterEfficiency={(val) => dispatch({ type: 'SET_PARAMETER', payload: { field: 'inverterEfficiency', value: val, isNumber: true } })}
        setSolarSystemLosses={(val) => dispatch({ type: 'SET_PARAMETER', payload: { field: 'solarSystemLosses', value: val, isNumber: true } })}
        setTempFactor={(val) => dispatch({ type: 'SET_PARAMETER', payload: { field: 'tempFactor', value: val, isNumber: true } })}
        setSelectedPanelId={(id) => dispatch({ type: 'SET_PARAMETER', payload: { field: 'selectedPanelId', value: id } })}
        setSelectedBatteryId={(id) => dispatch({ type: 'SET_PARAMETER', payload: { field: 'selectedBatteryId', value: id } })}
        solarComponents={props.solarComponents} // Perduodame originalius props toliau į subkomponentus
      />
      
      <SystemResults {...state} />

      {/* Diagramų atvaizdavimas tik tada, kai kodas vykdomas naršyklėje */}
      {typeof window !== 'undefined' && (
        <div className="mt-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">4. Vizualizacijos</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-4 rounded-md shadow-sm border">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Energijos suvartojimas pagal įrenginius (Wh/dieną)</h4>
              {/* Pie diagramos atvaizdavimas tik jei yra teigiamų reikšmių */}
              {energyUseData.datasets[0].data.some(val => val > 0) ? (
                 <div style={{ height: '300px' }}><Pie data={energyUseData} options={energyUseOptions} /></div>
              ) : (
                <p className="text-center text-gray-500">Nėra energijos suvartojimo duomenų vizualizavimui.</p>
              )}
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Suvartojimas vs. Gamyba (Wh/dieną)</h4>
              {/* Bar diagramos atvaizdavimas tik jei yra teigiamų reikšmių */}
              {(energyProductionData.datasets[0].data[0] > 0 || energyProductionData.datasets[1].data[0] > 0) ? (
                <div style={{ height: '300px' }}><Bar data={energyProductionData} options={energyProductionOptions} /></div>
              ) : (
                <p className="text-center text-gray-500">Nėra energijos gamybos/suvartojimo duomenų vizualizavimui.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffGridCalculator;