// js/modules/summary.js
import { formatCurrency } from './monitor.js';

let pollInterval = null;
const POLL_RATE = 5000; // 5 seconds

export function initSummary() {
    // Setup initial state if needed
}

export function startSummary() {
    if (pollInterval) return; // Already running

    console.log("Starting Summary Polling...");
    loadSummaryData(); // Constant fetch
    pollInterval = setInterval(loadSummaryData, POLL_RATE);
}

export function stopSummary() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
        console.log("Summary Polling Stopped");
    }
}

let lastSummaryJSON = '';

async function loadSummaryData() {
    try {
        console.log("Fetching summary...");
        const response = await fetch('fetch_summary.php');
        if (!response.ok) throw new Error('Network error: ' + response.status);
        const data = await response.json();

        // Prevent flickering
        const currentSummaryJSON = JSON.stringify(data);
        if (currentSummaryJSON !== lastSummaryJSON) {
            lastSummaryJSON = currentSummaryJSON;
            console.log("Data received (Updated):", data);
            renderSummaryTable(data);
        } else {
            console.log("Data unchanged, skipping render");
        }

    } catch (e) {
        console.error("Error fetching Summary data", e);
        // Visual Debug - Only show if it's a new error state or clear appropriately
        // For now, simpler to log. If we append innerHTML, we might duplicate errors.
        // Let's just log to console to avoid UI mess during polling errors.
    }
}

function renderSummaryTable(data) {
    const container = document.getElementById('summary-container');
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="material-symbols-outlined">analytics</span>
                <p>No hay datos consolidados aún.</p>
            </div>`;
        return;
    }

    // Header
    let html = `
        <div class="summary-table-wrapper">
            <table class="summary-table">
                <thead>
                    <tr>
                        <th style="text-align:left;">Producto</th>
                        <th style="text-align:center;">Ventas (Cant)</th>
                        <th style="text-align:right;">Monto Venta</th>
                        <th style="text-align:center;">Cortesía (Cant)</th>
                        <th style="text-align:right;">Monto Cortesía</th>
                        <th style="text-align:right;">Total Global</th>
                    </tr>
                </thead>
                <tbody>
    `;

    let totalVentasGlobal = 0;
    let totalCortesiasGlobal = 0;

    data.forEach(item => {
        const ventaCant = parseFloat(item.cantidad_venta) || 0;
        const ventaMonto = parseFloat(item.monto_venta) || 0;
        const cortesiaCant = parseFloat(item.cantidad_cortesia) || 0;
        const cortesiaMonto = parseFloat(item.monto_cortesia) || 0;
        const totalRow = ventaMonto + cortesiaMonto; // Or just Venta? Usually total = revenue.

        totalVentasGlobal += ventaMonto;
        totalCortesiasGlobal += cortesiaMonto;

        // Skip rows with 0 activity if desired, or show all.
        // if (ventaCant === 0 && cortesiaCant === 0) return;

        html += `
            <tr>
                <td class="col-name">
                    <span class="product-name">${item.nombre}</span>
                    <span class="badgex ${item.categoria === 'Tragos' ? 'badge-drink' : 'badge-food'}">${item.categoria || ''}</span>
                </td>
                <td style="text-align:center; color: var(--status-sale); font-weight:bold;">${ventaCant > 0 ? ventaCant : '-'}</td>
                <td style="text-align:right;">${ventaMonto > 0 ? formatCurrency(ventaMonto) : '-'}</td>
                <td style="text-align:center; color: var(--status-courtesy);">${cortesiaCant > 0 ? cortesiaCant : '-'}</td>
                <td style="text-align:right; opacity:0.7;">${cortesiaMonto > 0 ? formatCurrency(cortesiaMonto) : '-'}</td>
                <td style="text-align:right; font-weight:bold;">${formatCurrency(ventaMonto)}</td> 
            </tr>
        `;
        // Note: Total Global usually implies "Revenues", so VentaMonto. 
        // Cortesias are opportunity cost, arguably shouldn't sum to cash total.
        // Last column I put ventaMonto as "Real Total".
    });

    html += `
                </tbody>
                <tfoot>
                    <tr>
                        <td style="text-align:right; font-weight:bold;">TOTALES</td>
                        <td></td>
                        <td style="text-align:right; font-weight:bold; color:var(--status-sale);">${formatCurrency(totalVentasGlobal)}</td>
                        <td></td>
                        <td style="text-align:right; font-weight:bold; color:var(--status-courtesy);">${formatCurrency(totalCortesiasGlobal)}</td>
                        <td style="text-align:right; font-weight:bold; font-size:1.1em; color:var(--text-primary); border-top:1px solid rgba(255,255,255,0.2);">${formatCurrency(totalVentasGlobal)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;

    container.innerHTML = html;
}
