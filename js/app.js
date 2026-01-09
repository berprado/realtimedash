// js/app.js
import { initMonitor, startMonitor } from './modules/monitor.js';
import { initKPI } from './modules/kpi.js';
import { initSummary, startSummary, stopSummary } from './modules/summary.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Modules
    initMonitor();  // Setup Monitor Grid
    initKPI();      // Setup Metrics Header
    initSummary();  // Setup Summary Module

    // Start Default Module (Monitor)
    startMonitor();

    // Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    const views = {
        'live-monitor': document.getElementById('orders-container'),
        'analytics-summary': document.getElementById('summary-container')
    };

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');

            if (!targetId || !views[targetId]) return;

            // 1. Update Sidebar Active State
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // 2. Switch View Visibility
            Object.values(views).forEach(el => el.style.display = 'none');
            views[targetId].style.display = 'block'; // Or flex/grid depending on CSS

            // 3. Manage Module Lifecycle (Performance)
            if (targetId === 'analytics-summary') {
                startSummary();
            } else {
                stopSummary();
            }

            // Optional: Scroll to top
            window.scrollTo(0, 0);
        });
    });

    // Layout Logic (Sidebar Toggles)
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
        });
    }
});
