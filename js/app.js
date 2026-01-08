// js/app.js
import { startMonitor } from './modules/monitor.js';
import { initKPI } from './modules/kpi.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("App Initialized");

    // Initialize Modules
    initKPI();      // Start listening for data
    startMonitor(); // Start fetching data (will trigger events for KPI)

    // Layout Logic (Sidebar Toggles etc.)
    const sidebar = document.querySelector('.sidebar');
    // Add logic here if we implement manual toggle, currently it is hover-based CSS.
});
