# Guía Técnica: Análisis de Desempeño del Sistema

## Proyecto: Backstage Online - Live Dashboard
**Fecha:** 2026-01-14
**Rama:** `feature/responsive-polish`

---

## Resumen Ejecutivo

Este documento analiza la arquitectura actual del sistema de tiempo real, identifica cuellos de botella, y proporciona recomendaciones para mejorar el desempeño y facilitar la implementación de nuevas funcionalidades.

---

## 1. ARQUITECTURA ACTUAL

### 1.1 Diagrama de Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ARQUITECTURA ACTUAL                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   FRONTEND (Browser)                                                    │
│   ┌─────────────────┐      ┌─────────────────┐                         │
│   │   monitor.js    │      │   summary.js    │                         │
│   │  Polling: 2s    │      │  Polling: 5s    │                         │
│   └────────┬────────┘      └────────┬────────┘                         │
│            │                        │                                   │
│            ▼                        ▼                                   │
│   ┌─────────────────────────────────────────────┐                      │
│   │              fetch() API calls              │                      │
│   └─────────────────────────────────────────────┘                      │
│            │                        │                                   │
├────────────┼────────────────────────┼───────────────────────────────────┤
│            ▼                        ▼                                   │
│   BACKEND (PHP)                                                         │
│   ┌─────────────────┐      ┌─────────────────┐                         │
│   │   fetch.php     │      │fetch_summary.php│                         │
│   │  SELECT * ...   │      │  SELECT ...     │                         │
│   └────────┬────────┘      └────────┬────────┘                         │
│            │                        │                                   │
│            ▼                        ▼                                   │
│   ┌─────────────────────────────────────────────┐                      │
│   │           db_connection.php                 │                      │
│   │      Nueva conexión por cada request        │                      │
│   └─────────────────────────────────────────────┘                      │
│                          │                                              │
├──────────────────────────┼──────────────────────────────────────────────┤
│                          ▼                                              │
│   DATABASE (MySQL)                                                      │
│   ┌─────────────────────────────────────────────┐                      │
│   │  VIEW: comandas_v7                          │                      │
│   │  VIEW: resumen_comandas_ultima_operacion_v7 │                      │
│   └─────────────────────────────────────────────┘                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Componentes y Responsabilidades

| Componente | Archivo | Función | Frecuencia |
|------------|---------|---------|------------|
| Monitor | `monitor.js` | Tarjetas de órdenes en vivo | Cada 2s |
| Summary | `summary.js` | Tabla analítica consolidada | Cada 5s |
| KPI | `kpi.js` | Métricas calculadas | Por evento |
| API Monitor | `fetch.php` | JSON de comandas | Por request |
| API Summary | `fetch_summary.php` | JSON agregado | Por request |

### 1.3 Métricas Actuales de Polling

```
CARGA POR USUARIO ACTIVO
────────────────────────

Monitor:  1 request / 2s  = 30 requests/min
Summary:  1 request / 5s  = 12 requests/min (solo cuando está visible)
                          ─────────────────
Total máximo:               42 requests/min por usuario

CON 10 USUARIOS SIMULTÁNEOS
────────────────────────────
Monitor:  300 requests/min = 5 req/s
Summary:  120 requests/min = 2 req/s
                          ─────────────
Total:                      420 requests/min = 7 req/s

CON 50 USUARIOS SIMULTÁNEOS
────────────────────────────
Total:                      2,100 requests/min = 35 req/s
```

---

## 2. PROBLEMAS IDENTIFICADOS

### 2.1 Cuellos de Botella - Backend

#### P1: Consulta Sin Límite (CRÍTICO)

**Ubicación:** `fetch.php:11`
```php
$result = $con->query("SELECT * FROM comandas_v7 ORDER BY id DESC");
```

**Problema:**
- `SELECT *` trae todas las columnas (incluyendo las que no se usan)
- Sin `LIMIT` puede devolver miles de registros
- Ordenamiento `ORDER BY id DESC` sin índice puede ser costoso

**Impacto:**
- Memoria del servidor crece con cada registro histórico
- Tiempo de respuesta degrada exponencialmente
- Transferencia de red innecesaria

**Recomendación:**
```php
// Usar solo columnas necesarias + limitar registros
$result = $con->query("
    SELECT id_comanda, nombre, tipo_salida, estado_comanda,
           estado_impresion, sub_total, cor_subtotal_anterior,
           cantidad, fecha_emision, usuario_reg
    FROM comandas_v7
    ORDER BY id DESC
    LIMIT 50
");
```

---

#### P2: Nueva Conexión por Cada Request (ALTO)

**Ubicación:** `db_connection.php:53`
```php
$con = mysqli_connect($server, $user, $pass, $database, $port);
```

**Problema:**
- Cada request crea una nueva conexión TCP
- Overhead de autenticación en cada llamada
- Sin connection pooling

**Impacto con 50 usuarios:**
```
35 req/s × handshake ~50ms = 1.75s de overhead acumulado/segundo
```

**Recomendación:** Implementar conexiones persistentes:
```php
// Opción 1: Conexión persistente (prefijo p:)
$con = mysqli_connect('p:' . $server, $user, $pass, $database, $port);

// Opción 2: Usar PDO con pool
$pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_PERSISTENT => true
]);
```

---

#### P3: Sin Caché de Respuestas (MEDIO)

**Problema:** Cada request ejecuta la consulta SQL completa, incluso si los datos no cambiaron.

**Recomendación:** Implementar caché con timestamp:
```php
// En fetch.php
$cacheFile = sys_get_temp_dir() . '/dashboard_cache.json';
$cacheTime = 1; // segundos

if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
    readfile($cacheFile);
    exit;
}

// ... consulta normal ...
$json = json_encode($data);
file_put_contents($cacheFile, $json);
echo $json;
```

---

#### P4: Sin Compresión GZIP (BAJO)

**Problema:** JSON sin comprimir aumenta transferencia de red.

**Recomendación:** Agregar en `fetch.php`:
```php
if (strpos($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip') !== false) {
    ob_start('ob_gzhandler');
}
```

---

### 2.2 Cuellos de Botella - Frontend

#### P5: Comparación JSON Completa (MEDIO)

**Ubicación:** `monitor.js:186-188`
```javascript
const currentDataJSON = JSON.stringify(data);
if (currentDataJSON !== lastDataJSON) {
```

**Problema:**
- `JSON.stringify()` de arrays grandes es costoso
- Comparación de strings de miles de caracteres

**Recomendación:** Usar hash o comparación selectiva:
```javascript
// Opción 1: Comparar solo el ID más reciente
const latestId = data[0]?.id_comanda;
if (latestId !== lastId || data.length !== lastLength) {
    // Actualizar
}

// Opción 2: Hash simple
function simpleHash(data) {
    return data.length + '_' + (data[0]?.id_comanda || 0);
}
```

---

#### P6: innerHTML Completo en Cada Update (ALTO)

**Ubicación:** `monitor.js:93` y `summary.js:143`
```javascript
ordersContainer.innerHTML = ''; // Clear current
// ...
ordersContainer.innerHTML += cardHTML;
```

**Problema:**
- Destruye y recrea todo el DOM en cada ciclo
- Pierde estado de scroll
- Causa "flickering" visual
- Alto consumo de CPU en el browser

**Recomendación:** Actualización diferencial del DOM:
```javascript
// Usar DocumentFragment + comparación
function updateOrders(newData, container) {
    const existingIds = new Set(
        [...container.children].map(el => el.dataset.id)
    );

    newData.forEach(item => {
        if (!existingIds.has(item.id_comanda)) {
            // Solo agregar nuevos elementos
            const card = createOrderCard(item);
            container.prepend(card);
        }
    });

    // Remover elementos que ya no existen
    // ...
}
```

---

#### P7: setInterval Sin Cleanup (BAJO)

**Ubicación:** `monitor.js:168`
```javascript
setInterval(fetchMonitorData, 2000);
```

**Problema:** El intervalo nunca se detiene, incluso si el usuario navega a otra vista.

**Recomendación:**
```javascript
let monitorInterval = null;

export function startMonitor() {
    if (monitorInterval) return;
    fetchMonitorData();
    monitorInterval = setInterval(fetchMonitorData, 2000);
}

export function stopMonitor() {
    if (monitorInterval) {
        clearInterval(monitorInterval);
        monitorInterval = null;
    }
}
```

---

### 2.3 Problemas de Escalabilidad

```
┌────────────────────────────────────────────────────────────────┐
│              CURVA DE DEGRADACIÓN PROYECTADA                   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Tiempo       │                                         ╱      │
│  Respuesta    │                                    ╱           │
│  (ms)         │                               ╱                │
│               │                          ╱                     │
│  2000 ─ ─ ─ ─ │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─╱─ ─ ─ ─ ─ ─CRÍTICO      │
│               │                  ╱                             │
│  1000 ─ ─ ─ ─ │─ ─ ─ ─ ─ ─ ─╱─ ─ ─ ─ ─ ─ ─ ─ ─DEGRADADO      │
│               │          ╱                                     │
│   500 ─ ─ ─ ─ │─ ─ ─ ╱─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ACEPTABLE     │
│               │  ╱                                             │
│   100 ────────│╱─────────────────────────────────ÓPTIMO       │
│               └────────────────────────────────────────        │
│                  10    25    50    75   100   usuarios         │
│                                                                │
│  ⚠️  Sin optimizaciones, el sistema degrada ~50 usuarios      │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. RECOMENDACIONES DE MEJORA

### 3.1 Mejoras Inmediatas (Sin Cambio de Arquitectura)

| Prioridad | Cambio | Archivo | Impacto |
|-----------|--------|---------|---------|
| 🔴 Alta | Agregar LIMIT a consulta | `fetch.php` | -70% memoria |
| 🔴 Alta | Seleccionar columnas específicas | `fetch.php` | -40% transferencia |
| 🟡 Media | Conexión persistente | `db_connection.php` | -50ms/request |
| 🟡 Media | Cache temporal (1s) | `fetch.php` | -80% queries |
| 🟢 Baja | Compresión GZIP | `fetch.php` | -60% transferencia |

**Impacto combinado estimado:** Capacidad aumenta de ~50 a ~200 usuarios.

---

### 3.2 Mejoras de Mediano Plazo

#### Opción A: Server-Sent Events (SSE)

La configuración para SSE ya existe en `config.php` pero no se utiliza.

```
ARQUITECTURA CON SSE
────────────────────

Browser                    Server                    Database
   │                          │                          │
   │──── Conexión única ─────►│                          │
   │                          │◄──── Polling interno ────│
   │◄──── evento: data ───────│                          │
   │◄──── evento: data ───────│         (solo si hay     │
   │◄──── evento: data ───────│          cambios)        │
   │                          │                          │

Ventajas:
✅ Una conexión por usuario (vs 30/min con polling)
✅ Menor latencia (push inmediato)
✅ Reduce carga del servidor 90%

Desventajas:
⚠️ Requiere servidor que soporte conexiones largas
⚠️ WAMP/XAMPP pueden tener limitaciones
```

**Implementación básica:**
```php
// sse_monitor.php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

while (true) {
    $data = fetchNewData($lastId);
    if ($data) {
        echo "data: " . json_encode($data) . "\n\n";
        ob_flush();
        flush();
    }
    sleep(SSE_CHECK_INTERVAL);
}
```

```javascript
// monitor.js con SSE
const eventSource = new EventSource('sse_monitor.php');
eventSource.onmessage = (e) => {
    const data = JSON.parse(e.data);
    processData(data);
};
```

---

#### Opción B: WebSockets

```
ARQUITECTURA CON WEBSOCKETS
───────────────────────────

Browser                    WebSocket Server           Database
   │                          │                          │
   │◄═══ Conexión bidireccional ═══►│                    │
   │                          │◄──── Trigger/Poll ───────│
   │◄──── push: new_order ────│                          │
   │───── emit: subscribe ───►│                          │
   │                          │                          │

Ventajas:
✅ Comunicación bidireccional
✅ Máxima eficiencia en tiempo real
✅ Ideal para >100 usuarios

Desventajas:
⚠️ Requiere servidor WebSocket (Ratchet, Swoole)
⚠️ Mayor complejidad de implementación
⚠️ No funciona con hosting compartido tradicional
```

---

### 3.3 Mejoras para Nuevas Funcionalidades

#### Consideraciones para Escalar

```
┌────────────────────────────────────────────────────────────────┐
│           CHECKLIST PARA NUEVAS FUNCIONALIDADES                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ANTES DE IMPLEMENTAR:                                         │
│  □ ¿Necesita datos en tiempo real o puede usar caché?          │
│  □ ¿Cuántos usuarios concurrentes se esperan?                  │
│  □ ¿La consulta SQL está optimizada (índices, límites)?        │
│  □ ¿Se puede reutilizar data existente (eventos JS)?           │
│                                                                │
│  PATRONES RECOMENDADOS:                                        │
│  ✓ Usar Custom Events para compartir datos entre módulos       │
│  ✓ Implementar start/stop para cada módulo de polling          │
│  ✓ Crear endpoints específicos (no reutilizar SELECT *)        │
│  ✓ Paginar resultados cuando sea posible                       │
│                                                                │
│  ANTIPATRONES A EVITAR:                                        │
│  ✗ Polling agresivo (<2s) sin necesidad real                   │
│  ✗ Traer todos los datos para filtrar en frontend              │
│  ✗ Múltiples endpoints que consultan la misma tabla            │
│  ✗ innerHTML para actualizar listas grandes                    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. PLAN DE IMPLEMENTACIÓN SUGERIDO

### Fase 1: Optimización Inmediata (1-2 días)

```
□ Modificar fetch.php:
  - Agregar LIMIT 50
  - Especificar columnas
  - Agregar cache de 1 segundo

□ Modificar db_connection.php:
  - Usar conexión persistente

□ Modificar monitor.js:
  - Comparación por ID en vez de JSON completo
```

### Fase 2: Refactoring Frontend (3-5 días)

```
□ Implementar actualización diferencial del DOM
□ Agregar start/stop a monitor.js
□ Crear sistema de lifecycle para módulos
□ Optimizar renderizado de tabla summary
```

### Fase 3: Migración a SSE (5-7 días)

```
□ Crear endpoint SSE usando config.php existente
□ Modificar monitor.js para usar EventSource
□ Implementar fallback a polling para compatibilidad
□ Testing de carga y ajuste de parámetros
```

### Fase 4: Preparación para Escala (Opcional)

```
□ Evaluar migración a WebSockets si >200 usuarios
□ Considerar Redis para caché distribuido
□ Implementar CDN para assets estáticos
□ Configurar load balancer si múltiples servidores
```

---

## 5. MÉTRICAS DE ÉXITO

### Antes vs Después (Proyección)

| Métrica | Actual | Fase 1 | Fase 3 |
|---------|--------|--------|--------|
| Requests/min/usuario | 42 | 42 | ~2 |
| Latencia promedio | ~200ms | ~80ms | ~50ms |
| Usuarios soportados | ~50 | ~200 | ~500+ |
| Transferencia/min | ~2MB | ~500KB | ~100KB |
| Conexiones DB/min | 42 | 10 | 1 |

---

## 6. CONFIGURACIÓN EXISTENTE NO UTILIZADA

En `config.php` hay configuración SSE lista que no está siendo usada:

```php
// ⚡ CONFIGURACIÓN SSE (líneas 26-29)
define('SSE_CHECK_INTERVAL', 2);         // ✓ Definido
define('SSE_MAX_EXECUTION_TIME', 300);   // ✓ Definido
define('SSE_HEARTBEAT_INTERVAL', 30);    // ✓ Definido

// 📊 CONFIGURACIÓN DE PERFORMANCE (líneas 36-39)
define('MAX_RECORDS_LIMIT', 50);         // ⚠️ No se usa en fetch.php
define('MEMORY_LIMIT', '128M');          // ✓ Se aplica en setupSSEHeaders()
define('MAX_CONNECTIONS', 100);          // ⚠️ No se usa
```

**Recomendación:** Utilizar estas constantes en los endpoints:
```php
// En fetch.php
require_once 'config.php';
$limit = MAX_RECORDS_LIMIT;
$result = $con->query("SELECT ... LIMIT $limit");
```

---

## 7. CONCLUSIÓN

El sistema actual funciona correctamente para un número limitado de usuarios (~50), pero tiene varios puntos de mejora que permitirían:

1. **Inmediato:** Soportar ~4x más usuarios con cambios mínimos
2. **Mediano plazo:** Reducir carga del servidor 90% con SSE
3. **Largo plazo:** Escalar a cientos de usuarios con WebSockets

La arquitectura modular del frontend (ES6 modules, Custom Events) está bien diseñada para agregar nuevas funcionalidades. Las recomendaciones principales son:

- **Backend:** Limitar consultas, usar caché, conexiones persistentes
- **Frontend:** Actualización diferencial del DOM, lifecycle de módulos
- **Comunicación:** Migrar de Polling a SSE cuando sea necesario

---

## 8. REFERENCIAS

| Tecnología | Documentación |
|------------|---------------|
| SSE | [MDN - Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) |
| PHP SSE | [PHP Event Stream](https://www.php.net/manual/en/function.flush.php) |
| WebSockets | [Ratchet PHP](http://socketo.me/) |
| MySQL Optimization | [MySQL Query Optimization](https://dev.mysql.com/doc/refman/8.0/en/optimization.html) |

---

*Documento generado como parte del análisis técnico de desempeño del sistema.*
