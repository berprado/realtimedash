# MySQL Realtime Fetching with SSE

This project demonstrates a real-time data dashboard using PHP, MySQL, and Server-Sent Events (SSE). It fetches data from a database and updates the frontend automatically without page reloads.

## 🚀 Features

- **Real-time Updates**: Uses Server-Sent Events (SSE) to push updates from the server to the client.
- **Efficient Polling**: The PHP script checks for changes in the database and only sends data when a change is detected.
- **Dynamic Frontend**: Updates the HTML table dynamically using JavaScript.
- **Multi-Environment Support**: Easily switch between Local (Test) and Remote (Production) database configurations.

## 🛠️ Technologies

- **Frontend**: HTML5, CSS3, JavaScript (EventSource API).
- **Backend**: PHP.
- **Database**: MySQL.

## 📂 File Structure

- `index.html`: The main interface functioning as the dashboard. It connects to the SSE stream and updates the table.
- `fetch.php`: The server-side script that acts as the SSE endpoint. It continuously checks the database for new or modified records.
- `db_connection.php`: Handles the MySQL database connection. It intelligently selects credentials based on the active environment (`APP_ENV`).
- `.env`: Configuration file for database credentials and environment definition.

## ⚙️ Setup & Configuration

### 1. Environment Setup
The project supports two environments: **Test** (Local) and **Production** (Remote).

1.  Copy the example configuration:
    ```bash
    cp .env.example .env
    ```
2.  Edit `.env` to configure your environments.

### 2. Configuration Options (.env)

You can switch between environments by changing the `APP_ENV` variable.

**Option A: Test Environment (Local)**
Set `APP_ENV=test`. This uses the `TEST_` variables (Standard port 3306).

```ini
APP_ENV=test

TEST_DB_HOST=localhost
TEST_DB_USER=root
...
```

**Option B: Production Environment (Remote)**
Set `APP_ENV=production`. This uses the `PROD_` variables and supports custom ports (e.g., for TCP tunnels).

```ini
APP_ENV=production

PROD_DB_HOST=backapp.localto.net
PROD_DB_PORT=1790
PROD_DB_USER=root
...
```

### 3. Running the Project
- Deploy the files to a PHP-compatible web server (e.g., Apache, Nginx, or local XAMPP/WAMP).
- Access `index.html` in your browser.
- The dashboard will automatically connect to the database defined by `APP_ENV` and start streaming data.

## 📝 Usage

The dashboard displays:
- **Comanda**: Order ID.
- **Producto**: Product name.
- **Total**: Subtotal amount.
- **Usuario**: User who registered the order.

Records are fetched for the latest operation ID found in `bar_comanda`.
