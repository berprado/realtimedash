// js/modules/kpi.js
import { formatCurrency } from './monitor.js'; // Re-use formatter if we export it, or dup logic.

// We listen to the global event 'data-updated' dispatched by monitor.
// Or we can design it such that App.js passes data to both.
// Listening to event is cleaner for decoupled modules.

export function initKPI() {
    // 1. Data Listener
    document.addEventListener('data-updated', (e) => {
        calculateMetrics(e.detail);
    });

    // 2. Connection Listener
    document.addEventListener('connection-change', (e) => {
        updateKPIConnectionUI(e.detail.state);
    });
}

function calculateMetrics(data) {
    if (!data) return;

    let totalSales = 0;
    let totalCourtesy = 0;

    // Sets to track unique counts
    const uniqueSalesIds = new Set();
    const uniqueCourtesyIds = new Set();
    const uniqueVoidIds = new Set();

    data.forEach(item => {
        const type = (item.tipo_salida || '').toUpperCase();
        const state = (item.estado_comanda || '').toUpperCase();
        const comandaId = item.id_comanda;

        // 1. Sales (VENTA + PROCESADO)
        if (type === 'VENTA' && state === 'PROCESADO') {
            totalSales += parseFloat(item.sub_total || 0);
            uniqueSalesIds.add(comandaId);
        }

        // 2. Courtesy (CORTESIA + PROCESADO)
        if (type === 'CORTESIA' && state === 'PROCESADO') {
            totalCourtesy += parseFloat(item.cor_subtotal_anterior || 0);
            uniqueCourtesyIds.add(comandaId);
        }

        // 3. Void (ANULADO)
        if (state === 'ANULADO') {
            uniqueVoidIds.add(comandaId);
        }
    });

    // DOM Updates
    updateStat('#stat-sales', formatCurrency(totalSales), `${uniqueSalesIds.size} Comandas`);

    const avgTicket = uniqueSalesIds.size > 0 ? (totalSales / uniqueSalesIds.size) : 0;
    updateStat('#stat-avg', formatCurrency(avgTicket), null);

    updateStat('#stat-courtesy', formatCurrency(totalCourtesy), `${uniqueCourtesyIds.size} Comandas`);

    updateStat('#stat-void', uniqueVoidIds.size, 'Comandas');
}

function updateStat(selector, value, countText) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.querySelector('.stat-value').innerText = value;
    if (countText && el.querySelector('.stat-count')) {
        el.querySelector('.stat-count').innerText = countText;
    }
}

function updateKPIConnectionUI(state) {
    const statusCircle = document.getElementById('status-circle');
    const statusText = document.getElementById('status-text');

    if (!statusCircle || !statusText) return;

    statusCircle.classList.remove('status-connected', 'status-reconnecting', 'status-disconnected');

    if (state === 'connected') {
        statusCircle.classList.add('status-connected');
        statusText.textContent = 'LIVE FEED';
        statusText.style.color = 'var(--text-secondary)';
    } else if (state === 'reconnecting') {
        statusCircle.classList.add('status-reconnecting');
        statusText.textContent = 'RECONECTANDO...';
        statusText.style.color = 'var(--status-warning)';
    } else if (state === 'disconnected') {
        statusCircle.classList.add('status-disconnected');
        statusText.textContent = 'SIN CONEXIÓN';
        statusText.style.color = 'var(--status-cancelled)';
    }
}
