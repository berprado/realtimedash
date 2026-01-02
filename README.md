# MySQL Realtime Fetching with SSE

This project demonstrates a real-time data dashboard using PHP, MySQL, and Server-Sent Events (SSE). It fetches data from a database and updates the frontend automatically without page reloads.

## 🚀 Features

- **Real-time Updates**: Uses Server-Sent Events (SSE) to push updates from the server to the client.
- **Efficient Polling**: The PHP script checks for changes in the database and only sends data when a change is detected.
- **Dynamic Frontend**: Updates the HTML table dynamically using JavaScript.

## 🛠️ Technologies

- **Frontend**: HTML5, CSS3, JavaScript (EventSource API).
- **Backend**: PHP.
- **Database**: MySQL.

## 📂 File Structure

- `index.html`: The main interface functioning as the dashboard. It connects to the SSE stream and updates the table.
- `fetch.php`: The server-side script that acts as the SSE endpoint. It continuously checks the database for new or modified records.
- `db_connection.php`: Handles the MySQL database connection credentials.
- `yt_test.sql`: (Reference) SQL dump file. *Note: Current code is configured to use the `adminerp` database.*

## ⚙️ Setup & Configuration

1.  **Database Configuration**:
    - Open `db_connection.php`.
    - Update the `$server`, `$user`, `$pass`, and `$database` variables with your MySQL credentials.
    - Ensure the target database (default: `adminerp`) exists and has the required tables (`bar_detalle_comanda_salida`, `bar_comanda`, etc.) as queried in `fetch.php`.

2.  **Running the Project**:
    - Deploy the files to a PHP-compatible web server (e.g., Apache, Nginx, or local XAMPP/WAMP).
    - Access `index.html` in your browser.

## 📝 Usage

The dashboard displays:
- **Comanda**: Order ID.
- **Producto**: Product name.
- **Total**: Subtotal amount.
- **Usuario**: User who registered the order.

Records are fetched for the latest operation ID found in `bar_comanda`.
