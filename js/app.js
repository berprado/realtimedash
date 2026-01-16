// js/app.js
import { initMonitor, startMonitor } from './modules/monitor.js';
import { initKPI } from './modules/kpi.js';
import { initSummary, startSummary, stopSummary } from './modules/summary.js';

// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/mysql-realtime-fetching/service-worker.js')
            .then(registration => {
                console.log('[PWA] Service Worker registrado exitosamente:', registration.scope);

                // Verificar actualizaciones cada 60 minutos
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);
            })
            .catch(error => {
                console.error('[PWA] Error al registrar Service Worker:', error);
            });

        // Listener para actualizaciones del Service Worker
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[PWA] Nueva versión del Service Worker activada');
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Modules
    initMonitor();  // Setup Monitor Grid
    initKPI();      // Setup Metrics Header
    initSummary();  // Setup Summary Module

    // Start Default Module (Monitor)
    startMonitor();

    // --- MENU NAVIGATION LOGIC ---
    const menuTrigger = document.getElementById('menu-trigger');
    const menuClose = document.getElementById('menu-close');
    const overlayMenu = document.getElementById('overlay-menu');
    const menuLinks = document.querySelectorAll('.menu-link');
    const views = {
        'live-monitor': document.getElementById('view-live-monitor'),
        'analytics-summary': document.getElementById('summary-container'),
        'kpi-view': document.getElementById('view-kpi')
    };

    function toggleMenu(show) {
        if (show) {
            overlayMenu.classList.add('active');
        } else {
            overlayMenu.classList.remove('active');
        }
    }

    // Open/Close Events
    if (menuTrigger) menuTrigger.addEventListener('click', () => toggleMenu(true));
    if (menuClose) menuClose.addEventListener('click', () => toggleMenu(false));

    // Close on Outside Click
    document.addEventListener('click', (e) => {
        if (overlayMenu.classList.contains('active') &&
            !overlayMenu.contains(e.target) &&
            !menuTrigger.contains(e.target)) {
            toggleMenu(false);
        }
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') toggleMenu(false);
    });

    // Navigation Events
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');

            // 1. Navigation Logic
            if (targetId && views[targetId]) {
                // Update specific styles/visibility
                Object.values(views).forEach(el => {
                    if (el) el.style.display = 'none';
                });
                views[targetId].style.display = 'block';

                // Update Active Link
                menuLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Lifecycle Management
                if (targetId === 'analytics-summary') {
                    startSummary();
                } else {
                    stopSummary();
                }

                // Scroll reset
                window.scrollTo(0, 0);
            }

            // 2. Always close menu after selection
            toggleMenu(false);
        });
    });
});
