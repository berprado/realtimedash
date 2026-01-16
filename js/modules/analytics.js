// js/modules/analytics.js
// Interactive Analytics module using Tabulator
// Provides sorting, column visibility, and row highlighting features

let pollInterval = null;
let table = null;
const POLL_RATE = 5000; // 5 seconds
let lastDataJSON = '';

// Format number without currency symbol
function formatNumber(amount) {
    return new Intl.NumberFormat('es-BO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Initialize Tabulator instance
function createTable(data) {
    const container = document.getElementById('analytics-table');
    if (!container) return null;

    return new Tabulator("#analytics-table", {
        data: data,
        layout: "fitColumns",
        responsiveLayout: "collapse",
        movableColumns: true,
        placeholder: "No hay datos disponibles",

        // Column configuration
        columnDefaults: {
            headerSort: true,
            headerSortTristate: true, // Click 3 times: asc -> desc -> none
        },

        columns: [
            {
                title: "ID",
                field: "id_producto_combo",
                width: 70,
                hozAlign: "center",
                headerHozAlign: "center"
            },
            {
                title: "Producto",
                field: "nombre",
                widthGrow: 3,
                formatter: function (cell) {
                    const data = cell.getRow().getData();
                    const badgeClass = data.categoria === 'Tragos' ? 'badge-drink' : 'badge-food';
                    return `<span class="product-name">${cell.getValue()}</span>
                            <span class="badge ${badgeClass}">${data.categoria || ''}</span>`;
                }
            },
            {
                title: "Cant. V",
                field: "cantidad_venta",
                hozAlign: "right",
                headerHozAlign: "center",
                width: 90,
                bottomCalc: "sum",
                formatter: function (cell) {
                    const val = parseFloat(cell.getValue()) || 0;
                    return val > 0 ? val : '-';
                },
                cssClass: "col-venta"
            },
            {
                title: "Cant. C",
                field: "cantidad_cortesia",
                hozAlign: "right",
                headerHozAlign: "center",
                width: 90,
                bottomCalc: "sum",
                formatter: function (cell) {
                    const val = parseFloat(cell.getValue()) || 0;
                    return val > 0 ? val : '-';
                },
                cssClass: "col-cortesia"
            },
            {
                title: "Monto V",
                field: "monto_venta",
                hozAlign: "right",
                headerHozAlign: "center",
                width: 110,
                bottomCalc: "sum",
                bottomCalcFormatter: function (cell) {
                    return formatNumber(cell.getValue());
                },
                formatter: function (cell) {
                    const val = parseFloat(cell.getValue()) || 0;
                    return val > 0 ? formatNumber(val) : '-';
                },
                cssClass: "col-venta"
            },
            {
                title: "Monto C",
                field: "monto_cortesia",
                hozAlign: "right",
                headerHozAlign: "center",
                width: 110,
                bottomCalc: "sum",
                bottomCalcFormatter: function (cell) {
                    return formatNumber(cell.getValue());
                },
                formatter: function (cell) {
                    const val = parseFloat(cell.getValue()) || 0;
                    return val > 0 ? formatNumber(val) : '-';
                },
                cssClass: "col-cortesia"
            }
        ],

        // Row click handler for highlighting
        rowClick: function (e, row) {
            // Toggle highlight class
            const element = row.getElement();
            element.classList.toggle('row-highlighted');
        },
    });
}

export function initAnalytics() {
    // Initial setup if needed
    console.log("[Analytics] Module initialized");
}

export function startAnalytics() {
    if (pollInterval) return; // Already running

    console.log("[Analytics] Starting polling...");
    loadAnalyticsData();
    pollInterval = setInterval(loadAnalyticsData, POLL_RATE);
}

export function stopAnalytics() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
        console.log("[Analytics] Polling stopped");
    }
}

async function loadAnalyticsData() {
    try {
        console.log("[Analytics] Fetching data...");
        const response = await fetch('fetch_summary.php');
        if (!response.ok) throw new Error('Network error: ' + response.status);
        const data = await response.json();

        // Prevent unnecessary re-renders
        const currentJSON = JSON.stringify(data);
        if (currentJSON !== lastDataJSON) {
            lastDataJSON = currentJSON;
            console.log("[Analytics] Data updated:", data.length, "items");

            if (table) {
                // Update existing table (preserves sort state)
                table.setData(data);
            } else {
                // First load - create table
                table = createTable(data);
            }
        } else {
            console.log("[Analytics] Data unchanged, skipping render");
        }

    } catch (e) {
        console.error("[Analytics] Error fetching data:", e);
    }
}

// Utility functions for external control
export function toggleColumn(field, visible) {
    if (table) {
        if (visible) {
            table.showColumn(field);
        } else {
            table.hideColumn(field);
        }
    }
}

export function clearHighlights() {
    if (table) {
        table.getRows().forEach(row => {
            row.getElement().classList.remove('row-highlighted');
        });
    }
}
