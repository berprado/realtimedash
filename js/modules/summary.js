// js/modules/summary.js
import { formatCurrency } from './monitor.js';

let pollInterval = null;
const POLL_RATE = 5000; // 5 seconds

// Format number without currency symbol
function formatNumber(amount) {
    return new Intl.NumberFormat('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

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

    // New grouped header structure
    let html = `
        <div class="summary-table-wrapper">
            <table class="summary-table">
                <thead>
                    <tr class="header-group">
                        <th rowspan="2">ID</th>
                        <th rowspan="2">Producto</th>
                        <th colspan="2" class="col-group">Comandas</th>
                        <th colspan="2" class="col-group">Montos (BOB)</th>
                    </tr>
                    <tr class="header-sub">
                        <th class="col-venta">V</th>
                        <th class="col-cortesia">C</th>
                        <th class="col-venta">V</th>
                        <th class="col-cortesia">C</th>
                    </tr>
                </thead>
                <tbody>
    `;

    let totalVentasCant = 0;
    let totalCortesiasCant = 0;
    let totalVentasMonto = 0;
    let totalCortesiasMonto = 0;

    data.forEach(item => {
        const id = item.id_producto_combo || '-';
        const ventaCant = parseFloat(item.cantidad_venta) || 0;
        const ventaMonto = parseFloat(item.monto_venta) || 0;
        const cortesiaCant = parseFloat(item.cantidad_cortesia) || 0;
        const cortesiaMonto = parseFloat(item.monto_cortesia) || 0;

        totalVentasCant += ventaCant;
        totalCortesiasCant += cortesiaCant;
        totalVentasMonto += ventaMonto;
        totalCortesiasMonto += cortesiaMonto;

        // Category badge class
        const badgeClass = item.categoria === 'Tragos' ? 'badge-drink' : 'badge-food';

        html += `
            <tr>
                <td class="col-id">${id}</td>
                <td class="col-name">
                    <span class="product-name">${item.nombre}</span>
                    <span class="badge ${badgeClass}">${item.categoria || ''}</span>
                </td>
                <td class="col-venta">${ventaCant > 0 ? ventaCant : '-'}</td>
                <td class="col-cortesia">${cortesiaCant > 0 ? cortesiaCant : '-'}</td>
                <td class="col-venta">${ventaMonto > 0 ? formatNumber(ventaMonto) : '-'}</td>
                <td class="col-cortesia">${cortesiaMonto > 0 ? formatNumber(cortesiaMonto) : '-'}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" class="totals-label">TOTALES</td>
                        <td class="col-venta total">${totalVentasCant}</td>
                        <td class="col-cortesia total">${totalCortesiasCant}</td>
                        <td class="col-venta total">${formatNumber(totalVentasMonto)}</td>
                        <td class="col-cortesia total">${formatNumber(totalCortesiasMonto)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;

    container.innerHTML = html;
}
