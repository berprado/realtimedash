# Changelog


## v4.0 - Database Integrity & Printing Logic (2026-01-09)
-   **Database Refactor**:
    -   **New View `comandas_v7`**: Replaced `comandas_v6`. Now sources `estado_impresion` from the **actual printing log** (`bar_comanda_impresion`) instead of the administrative status.
    -   **Helper View `vw_comanda_ultima_impresion`**: Created to support v7 logic in MySQL 5.6, ensuring only the latest printing event is considered.
    -   **Migration Script**: Added `scripts/migrate_v7.php` for automated deployment of the new views.
-   **Fixed**:
    -   Resolved issue where printed tickets appeared as "Pending" (gray/yellow) because the administrative flag in `bar_comanda` was not updated reliably.
-   **Compatibility**:
    -   Dashboard frontend logic remains unchanged (Plug & Play update).

## [Unreleased / Current] - 2026-01-02

### Added
-   **Professional Dashboard UI**: Complete redesign using Dark Mode, simple Glassmorphism, and responsive Card Grid.
-   **style.css**: New stylesheet with CSS Variables for theming (prepared for future Light Mode).
-   **Smart Icons Logic**: Frontend JS automatically assigns icons based on product prefixes (`V `, `C `, `CHOPP `, etc.).
-   **Courtesy Logic Refinement**: Now displays the opportunity cost (`cor_subtotal_anterior`) instead of 0.00 for courtesies.
-   **Visual Identity**: Updated color palette: Sales (Green `#47db95`), Courtesies (Magenta `#d50075`).
-   **Advanced Status Logic**: Visual mapping for "Cortesía", "Venta", "Anulado", and "Pendiente" based on `tipo_salida`, `estado_comanda` and `estado_impresion`.
-   **Audio Alerts**: Implemented a "beep" notification when a new `id_comanda` is detected.
-   **Database View**: Integrated `comandas_v6` view in `fetch.php` for cleaner query logic.
-   **Multi-Environment Support**: Added `APP_ENV` (test/production) switching in `db_connection.php`.

### Changed
-   **fetch.php**: Replaced complex hardcoded JOIN query with `SELECT * FROM comandas_v6`. Expanded API response fields.
-   **index.html**: Replaced table layout with Grid/Card layout.
-   **Directory Structure**: Removed obsolete `yt_test.sql` and `fetch.php` legacy code.

### Fixed
-   Resolved inconsistency between `.env` configuration and actual database connection code.
-   Fixed data fetching to include `cantidad` and `usuario` which were missing in the original implementation.
-   **Character Encoding**: Fixed issue with special characters (ñ, accents) not displaying by enforcing `utf8` charset in `db_connection.php`.
-   **Visual Refinements v2.3**:
    -   Quantity display moved to the end of product name (e.g. `Product x2`).
    -   Added "Pending" status styling (Yellow `#facc15`).
    -   Updated Live Feed animation to Green.
    -   Added Date to timestamp and User Profile icon.
    -   **Reliability Logic**: Extended "Sale" status to include all `PROCESADO` orders even if `estado_impresion` is NULL (fixes "Undefined" icon issue).
    -   **Connection Health Monitor (v2.5)**: Implemented 3-state real-time connection status:
        -   🟢 LIVE FEED: Normal operation.
        -   🟡 RECONECTANDO...: Immediate feedback on signal loss.
        -   🔴 SIN CONEXIÓN: Critical alert after 5s of downtime.
    -   **Empty State UI (v2.6)**: Added a friendly placeholder ("Todo tranquilo por ahora...") when there are no active orders, preventing a "broken" blank screen experience.
    -   **Sticky Metrics Header (v2.7)**: Added a real-time analytics panel in the header (Sticky position).

### v3.0 - Modular Architecture & UI Polish (2026-01-08)
-   **Architecture Refactor**:
    -   Split monolithic `index.html` logic into ES Modules (`js/modules/monitor.js`, `js/modules/kpi.js`).
    -   Created central `js/app.js` controller.
    -   Organized assets into `css/` (main, layout) and `assets/`.
-   **Navigation Upgrade**:
    -   Implemented **Sidebar Navigation** with Glassmorphism.
    -   **Hamburger Menu**: Replaced hover expansion with a dedicated toggle button for better UX.
    -   **Responsive Layout**: Fixed overflow issues and ensured stability on collapse/expand.

### v3.1 - Product Summary & Analytics (2026-01-08)
-   **New Feature: Product Analytics**:
    -   Added "Analytics" view accessible via Sidebar.
    -   Displays aggregated sales data: Product Name, Category, Sold Qty/Amount, Courtesy Qty/Amount, and Global Total.
    -   Backend: Created `resumen_comandas_ultima_operacion` view and `fetch_summary.php`.
    -   Frontend: Implemented `summary.js` with table rendering and empty states.

### v3.2 - Performance & Stability (2026-01-09)
-   **Optimized Data Fetching**:
    -   **Replaced SSE with Polling**: Switched from Server-Sent Events to `setInterval` polling (2s Monitor, 5s Summary) to resolve local WampServer blocking issues (zombie processes).
    -   **Smart Re-rendering**: Implemented JSON comparison in both `monitor.js` and `summary.js` to **eliminate flickering**. The DOM is now only updated when the data payload actually changes.
-   **Bug Fixes**:
    -   Fixed `app.js` module initialization issues.
    -   Resolved "CONECTANDO..." freeze by clearing stuck server threads.
