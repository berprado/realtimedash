// js/modules/monitor.js

// Import helper for currency if needed, or define locally.
// For simplicity in this phase, we'll keep helpers inside or export them from a utils.js later.
// Let's assume we want self-contained modules first.

const container = document.getElementById('orders-container');
const audio = new Audio('https://s3.amazonaws.com/freecodecamp/drums/Heater-1.mp3');
let lastComandaId = 0;
let disconnectTimer = null;
let reconnectTimeout = null;

// Helper: Format Currency
export function formatCurrency(amount) {
    return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(amount);
}

// Helper: Process Product Info (Icons)
function processProductInfo(productName) {
    let icon = 'restaurant'; // default
    let name = productName;

    // Prefixes Rule Map
    const prefixMap = [
        { prefix: 'V ', icon: 'wine_bar' },    // Vaso
        { prefix: 'C ', icon: 'liquor' },      // Botella/Combo
        { prefix: 'T ', icon: 'local_bar' },   // Trago
        { prefix: 'J ', icon: 'kebab_dining' },// Jarra/Jugo
        { prefix: 'P ', icon: 'tapas' },       // Piqueo
        { prefix: 'G ', icon: 'local_drink' }, // Gaseosa
        { prefix: 'CERVEZA ', icon: 'sports_bar' },
        { prefix: 'CHOPP ', icon: 'sports_bar' },
        { prefix: 'COCTEL ', icon: 'cocktail' }
    ];

    for (const rule of prefixMap) {
        if (productName.startsWith(rule.prefix)) {
            icon = rule.icon;
            // Optional: remove prefix for display clean-up if desired
            // name = productName.substring(rule.prefix.length); 
            break; 
        }
    }
    return { name, icon };
}

// Helper: Status Info
function getStatusInfo(type, state, printState) {
    const normalizedType = (type || '').toUpperCase();
    const normalizedState = (state || '').toUpperCase();
    const normalizedPrint = (printState || '').toUpperCase();

    // 1. CORTESIA PROCESADO
    if (normalizedType === 'CORTESIA' && normalizedState === 'PROCESADO') {
        return { class: 'type-courtesy', icon: 'money_off', label: '' };
    }
    // 2. VENTA PROCESADO
    if (normalizedType === 'VENTA' && normalizedState === 'PROCESADO') {
        return { class: 'status-sale', icon: 'price_check', label: '' };
    }
    // 3. ANULADO
    if (normalizedState === 'ANULADO') {
        return { class: 'status-cancelled', icon: 'remove_done', label: '' };
    }
    // 4. PENDIENTE
    if (normalizedState === 'PENDIENTE') {
        return { class: 'status-pending', icon: 'pending_actions', label: '' };
    }
    return { class: 'status-undefined', icon: 'question_mark', label: '' };
}

// Connection State UI
function updateConnectionState(state) {
    // Dispatch Custom Event for other modules (like KPI header) to listen
    // or update DOM if the circle is inside the monitor module.
    // In our new design, the Circle might be in the KPI module or Global.
    // Let's assume monitor handles the Logic and dispatches events.
    const event = new CustomEvent('connection-change', { detail: { state } });
    document.dispatchEvent(event);
}

// Main Process Function
export function processData(data) {
    // If container not found (e.g. we are in another view), stop.
    const ordersContainer = document.getElementById('orders-container');
    if (!ordersContainer) return;

    ordersContainer.innerHTML = ''; // Clear current

    // Empty State Check
    if (!data || data.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <span class="material-symbols-outlined">inbox</span>
                <p>Todo tranquilo por ahora...</p>
            </div>
        `;
        return;
    }

    let maxIdInBatch = 0;
    let hasNewOrders = false;

    data.forEach(item => {
        const currentComandaId = parseInt(item.id_comanda);
        if (currentComandaId > lastComandaId) hasNewOrders = true;
        if (currentComandaId > maxIdInBatch) maxIdInBatch = currentComandaId;

        const product = processProductInfo(item.nombre);
        const status = getStatusInfo(item.tipo_salida, item.estado_comanda, item.estado_impresion);

        let displayPrice = item.sub_total;
        if (status.class === 'type-courtesy') displayPrice = item.cor_subtotal_anterior;

        let cardClasses = `order-card ${status.class}`;
        // Highlight logic requires verifying persistence or simpler approach for now
        if (currentComandaId > lastComandaId && lastComandaId !== 0) cardClasses += ' highlight-new';

        const cardHTML = `
            <div class="${cardClasses}">
                <div class="card-header">
                    <span class="order-id">#${item.id_comanda || '???'}</span>
                    <span class="status-badge" title="${item.tipo_salida} - ${item.estado_comanda}">
                        <span class="material-symbols-outlined" style="font-size: 18px;">${status.icon}</span>
                        ${status.label}
                    </span>
                </div>
                <div class="product-name">
                    ${product.name} 
                    ${parseFloat(item.cantidad) > 1 ? `<span style="color:var(--accent-color); margin-left:5px;">x${Math.round(item.cantidad)}</span>` : ''}
                </div>
                <div class="product-meta">
                    <span class="timestamp">
                        <span class="material-symbols-outlined" style="font-size: 14px; vertical-align: -2px;">schedule</span>
                        ${item.fecha_emision || '--:--'}
                    </span>
                    <span class="price-tag">${formatCurrency(displayPrice)}</span>
                </div>
                <div style="font-size:0.8rem; color: #64748b; margin-top:5px; text-align:right;">
                     <span class="material-symbols-outlined" style="font-size: 14px; vertical-align: -2px;">account_circle</span>
                     ${item.usuario_reg || 'Staff'}
                </div>
            </div>
        `;
        ordersContainer.innerHTML += cardHTML;
    });

    if (maxIdInBatch > 0) {
        if (hasNewOrders && lastComandaId > 0) audio.play().catch(e => console.log('Audio autoplay blocked', e));
        lastComandaId = maxIdInBatch;
    }
}

// Initialization of SSE
export function startMonitor() {
    const source = new EventSource('fetch.php');

    source.onopen = function () {
        if (disconnectTimer) clearTimeout(disconnectTimer);
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        updateConnectionState('connected');
    };

    source.onmessage = function (event) {
        try {
            const data = JSON.parse(event.data);
            processData(data); // Render Grid
            // Dispatch Data for KPI Module
            const dataEvent = new CustomEvent('data-updated', { detail: data });
            document.dispatchEvent(dataEvent);
        } catch (e) {
            console.error("Error parsing SSE data", e);
        }
    };

    source.onerror = function () {
        if (!reconnectTimeout) {
            reconnectTimeout = setTimeout(() => {
                 updateConnectionState('reconnecting');
            }, 2000);
        }
        
        if (!disconnectTimer) {
            disconnectTimer = setTimeout(() => {
                updateConnectionState('disconnected');
            }, 7000);
        }
    };
}
