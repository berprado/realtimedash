# MySQL Realtime Fetching with SSE (Professional Dashboard)

This project is a high-end, real-time sales dashboard designed for hospitality environments. It uses PHP, MySQL, and Server-Sent Events (SSE) to fetch data instantly, presenting it in a visually striking "Dark/Glassmorphism" interface with intelligent status logic and audio alerts.

## 🚀 Features

-   **Real-time Updates**: Uses SSE to push updates automatically (no refresh needed).
-   **Professional UI**: Dark theme, responsive grid, glassmorphism effects, and animations.
-   **Smart Logic**:
    -   **Intelligent Icons**: Automatically maps product names to icons (e.g., "V " -> 🍷, "CHOPP " -> 🍺).
    -   **Visual Statuses**: Multi-column validation to show icons for "Courtesies", "Sales", or "Annullments" without cluttering text.
-   **Audio Alerts**: Plays a subtle sound when a new order arrives.
-   **Connection Health Monitor**: Visual feedback for connection state (🟢 Connected, 🟡 Reconnecting, 🔴 Disconnected) to handle network instability gracefully.
-   **Empty State UI**: Friendly placeholder when no orders are active.
-   **Sticky Metrics Header**: Real-time analytics (Sales, Average, Courtesies, Voided) pinned to the top for easy monitoring.
-   **Multi-Environment**: Easy switch between Local (Test) and Remote (Production) databases via `.env`.

## 🛠️ Technologies

-   **Frontend**: HTML5, Modern CSS3 (Variables, Grid, keyframes), JavaScript (ES6+).
-   **Assets**: Google Fonts (Oswald, Inter), Google Material Symbols.
-   **Backend**: PHP 7.x/8.x.
-   **Database**: MySQL 5.6.12+ (Requires `comandas_v6` view).

## 📂 Project Structure

```text
mysql-realtime-fetching/
├── assets/             # Sounds and static media
├── css/
│   ├── main.css        # Global variables and core styles
│   └── layout.css      # Sidebar and Container layout
├── docs/               # SQL and documentation
├── js/
│   ├── modules/
│   │   ├── kpi.js      # Metrics header logic
│   │   └── monitor.js  # Live grid and SSE logic
│   └── app.js          # Main application controller
├── db_connection.php   # Database connection wrapper
├── fetch.php           # SSE Endpoint (ETag/Sleep logic)
├── index.html          # Main Application Shell
└── .env                # Environment configuration
```
### 1. Database Check
Ensure the view `comandas_v6` is created in your database using the provided SQL file in `docs/sql/`.

### 2. Environment (.env)
Configure your `.env` file for **test** or **production**:

```ini
APP_ENV=production
# ... credentials ...
```

### 3. Logic Customization (index.html)
The dashboard includes specific business logic in the JavaScript section of `index.html`:
-   **Prefix Mapping**: Modify `processProductInfo()` to add new rules (e.g., "TRAGO " -> icon).
-   **Status Rules**: Modify `getStatusInfo()` to change how conditions (e.g., CORTESIA + IMPRESO) are visualized.
-   **Reliability**: The system treats `PROCESADO` orders as confirmed sales even if the printer status is NULL, to handle POS inconsistencies.

### 4. Data Logic & Behavior
The dashboard relies on the `comandas_v6` view which filters data by the **latest operation** (`MAX(id_operacion)`).
-   **Continuous Flow**: When a new operation starts (e.g., next day), the dashboard continues showing the *previous* operation's data until the **first new order** is registered. At that moment, it instantly switches to the new operation.
-   **Empty State**: The "Empty State" UI is only visible on a fresh installation (Day Zero) or if the `bar_comanda` table is truncated, as there is no "previous operation" to display.

## 📝 Usage

Open `index.html` in a browser (or `http://localhost/path/to/project`).
-   **New Orders**: Will appear with a slide-in animation and a sound alert.
-   **Status**: Look for the icons (🎁 Gift, ✔️ Check, 🚫 Block) to identify order status quickly.
