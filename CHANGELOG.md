# Changelog

All notable changes to the "MySQL Realtime Fetching" project will be documented in this file.

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
