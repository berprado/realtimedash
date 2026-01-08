// js/app.js
import { startMonitor } from './modules/monitor.js';
import { initKPI } from './modules/kpi.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("App Initialized");

    // Initialize Modules
    initKPI();      // Start listening for data
    startMonitor(); // Start fetching data (will trigger events for KPI)

    // Layout Logic (Sidebar Toggles)
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
        });
    }
});
