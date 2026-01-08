<?php
/**
 * 🔧 Archivo de Configuración Principal
 * ====================================
 * Centraliza toda la configuración del proyecto para fácil mantenimiento
 */

// 🌍 CONFIGURACIÓN DE ENTORNO
define('ENVIRONMENT', 'development'); // development | production | testing

// 🚇 CONFIGURACIÓN DE TÚNEL TCP
define('TUNNEL_HOST', 'backapp.localto.net');
define('TUNNEL_PORT', 1790);
define('TUNNEL_ENABLED', true); // Cambiar a false para desactivar túnel

// 🏠 CONFIGURACIÓN LOCAL
define('LOCAL_HOST', 'localhost');
define('LOCAL_PORT', 3306);

// 🗄️ CONFIGURACIÓN DE BASE DE DATOS
define('DB_USER', 'root');
define('DB_PASS', 'admin123.'); // Cambiado a 'admin123.' para mayor seguridad
define('DB_NAME', 'adminerp');
define('DB_CHARSET', 'utf8');

// ⚡ CONFIGURACIÓN SSE
define('SSE_CHECK_INTERVAL', 2); // segundos entre verificaciones
define('SSE_MAX_EXECUTION_TIME', 300); // 5 minutos máximo por conexión
define('SSE_HEARTBEAT_INTERVAL', 30); // heartbeat cada 30 segundos

// 🔍 CONFIGURACIÓN DE DEBUGGING
define('DEBUG_MODE', ENVIRONMENT === 'development');
define('LOG_CONNECTIONS', true);
define('SHOW_ERRORS', ENVIRONMENT === 'development');

// 📊 CONFIGURACIÓN DE PERFORMANCE
define('MAX_RECORDS_LIMIT', 50); // límite de registros por consulta
define('MEMORY_LIMIT', '128M');
define('MAX_CONNECTIONS', 100);

/**
 * 🎯 Función helper para obtener configuración de BD según entorno
 */
function getDatabaseConfig() {
    if (TUNNEL_ENABLED && ENVIRONMENT === 'development') {
        return [
            'host' => TUNNEL_HOST,
            'port' => TUNNEL_PORT,
            'user' => DB_USER,
            'pass' => DB_PASS,
            'database' => DB_NAME,
            'charset' => DB_CHARSET,
            'type' => 'tunnel'
        ];
    } else {
        return [
            'host' => LOCAL_HOST,
            'port' => LOCAL_PORT,
            'user' => DB_USER,
            'pass' => DB_PASS,
            'database' => DB_NAME,
            'charset' => DB_CHARSET,
            'type' => 'local'
        ];
    }
}

/**
 * 🛠️ Función helper para logging
 */
function logMessage($message, $type = 'INFO') {
    if (LOG_CONNECTIONS) {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[{$timestamp}] [{$type}] {$message}" . PHP_EOL;
        
        if (DEBUG_MODE) {
            error_log($logMessage);
        }
        
        // Guardar en archivo de log (opcional)
        // file_put_contents('logs/app.log', $logMessage, FILE_APPEND | LOCK_EX);
    }
}

/**
 * 📋 Configuración de headers para SSE
 */
function setupSSEHeaders() {
    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');
    header('Connection: keep-alive');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Cache-Control');
    
    // Desactivar buffering
    if (ob_get_level()) {
        ob_end_clean();
    }
    
    // Configurar límites
    set_time_limit(SSE_MAX_EXECUTION_TIME);
    ini_set('memory_limit', MEMORY_LIMIT);
}

logMessage("Configuración cargada - Entorno: " . ENVIRONMENT . " | Túnel: " . (TUNNEL_ENABLED ? 'ACTIVO' : 'INACTIVO'));
?>
