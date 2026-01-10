# Guía técnica – Vista `comandas_v7` (evolución desde `comandas_v6`)

> **Contexto**  
> El POS (sistema principal) registra comandas y su detalle en MySQL.  
> El **dashboard** es un sistema externo que **solo lee** la base de datos y requiere una vista estable y “amigable” para mostrar el detalle de las comandas en tiempo (casi) real.

---

## 1) ¿Qué es `comandas_v7`?

`adminerp_copy.comandas_v7` es una **vista de lectura** diseñada para que el dashboard consuma, en un solo `SELECT`, la información **detallada** de las comandas (líneas de productos/combos) junto con:

- Datos de cabecera de comanda (fecha, usuario, barra, mesa, operativa, etc.).
- Datos de producto o combo (nombre, descripción, categoría).
- Traducciones “humanas” de estados (`tipo_salida`, `estado_comanda`, `estado_impresion`).
- Un criterio operativo clave: **muestra únicamente la última operativa** (la más reciente).

---

## 2) Evolución: de `comandas_v6` a `comandas_v7`

### `comandas_v6` (versión anterior)
La vista `comandas_v6` ya unificaba correctamente:

- Detalle de comanda (`bar_detalle_comanda_salida`)
- Cabecera (`bar_comanda`)
- Producto o combo (`alm_producto` / `bar_combo_coctel`)
- Categorías (`alm_categoria`)
- Catálogo de estados (`parameter_table`)

**Problema observado:**  
`estado_impresion` a veces aparecía como `NULL` aunque la comanda **sí estaba impresa físicamente**.

### Hallazgo que desbloquea la solución
Se identificó la tabla:

- **`bar_comanda_impresion`** → *bitácora de impresión*, con el campo **`ind_estado_impresion`**.

En esa tabla, para las comandas “con `NULL`”, se encontró un registro con:

- `ind_estado_impresion = 31` → corresponde a **IMPRESO**
- validado por catálogos:
  - `master_table.id = 10` (estado_impresion_com)
  - `parameter_table.id = 31` (IMPRESO) / `32` (PENDIENTE)

**Conclusión:**  
`bar_comanda.estado_impresion` es un **estado administrativo** que puede actualizarse tarde o de forma indirecta.  
La evidencia fuerte de impresión real está en **`bar_comanda_impresion`**.

### `comandas_v7` (versión actual)
`comandas_v7` mantiene el mismo modelo de lectura de `v6`, pero **corrige** el origen del dato `estado_impresion`:

- **Antes (v6):** desde `bar_comanda.estado_impresion` → `parameter_table ei`  
- **Ahora (v7):** desde `bar_comanda_impresion.ind_estado_impresion` (último evento) → `parameter_table ei_real`

---

## 3) ¿Las columnas de `v7` son las mismas que en `v6`?

✅ **Sí.** La intención fue **mantener el contrato** (las mismas columnas y nombres), cambiando **solo la lógica de `estado_impresion`** para que sea confiable y verificable.

En otras palabras:  
- **Mismo “shape” de datos para el dashboard**  
- **Mejor semántica** para la columna `estado_impresion`

---

## 4) Componentes y tablas involucradas

`comandas_v7` une información de:

### A) Tablas operativas
- **`bar_comanda` (c)**  
  Cabecera de comanda: fecha, usuario, operativa, estados, etc.

- **`bar_detalle_comanda_salida` (dcs)**  
  Líneas detalladas de la comanda: producto/ combo, cantidad, subtotal, etc.

### B) Tablas maestras de productos/combos
- **`alm_producto` (p)**  
  Datos de producto del almacén (nombre, descripción, categoría, código).

- **`bar_combo_coctel` (cc)**  
  Datos de combo/cóctel (nombre, descripción, categoría, código).

### C) Categorías
- **`alm_categoria` (catp, catc)**  
  Categoría del producto (`catp`) o del combo (`catc`).

### D) Catálogo de estados (traducción a “texto”)
- **`parameter_table`**  
  Traduce IDs a nombres: `VENTA`, `PROCESADO`, `IMPRESO`, etc.

### E) Registro real de impresión
- **`bar_comanda_impresion`**  
  Bitácora de impresión (evento real).

### F) Vista auxiliar (pieza clave en MySQL 5.6)
- **`vw_comanda_ultima_impresion` (imp)**  
  Devuelve **la última impresión registrada** por comanda.

---

## 5) Rol de la vista auxiliar `vw_comanda_ultima_impresion`

### ¿Por qué existe?
MySQL 5.6 tiene una limitación:  
no permite crear vistas que contengan subconsultas en la cláusula `FROM` (derived tables) como parte de un `JOIN` complejo.

La solución robusta fue separar la lógica de “última impresión” en una vista auxiliar, donde el subquery está en `WHERE` (permitido en MySQL 5.6).

### ¿Qué hace exactamente?
Para cada `id_comanda`, busca el registro de impresión más reciente en `bar_comanda_impresion` (el mayor `id`).

**Salida mínima:**
- `id_comanda`
- `ind_estado_impresion` (31 IMPRESO / 32 PENDIENTE, etc.)

### Beneficio
- Permite que `comandas_v7` use un `LEFT JOIN` simple y limpio:
  - si hay impresión → toma el estado real
  - si no hay impresión registrada → queda `NULL` y se aplica fallback a `PENDIENTE`

---

## 6) Lógica funcional de `comandas_v7`

### 6.1 Unifica producto vs combo
En el detalle (`bar_detalle_comanda_salida`) una fila puede corresponder a:
- un **producto** (`dcs.id_producto`)
- un **combo/cóctel** (`dcs.id_bar_combo_coctel`)

La vista normaliza ambos con `COALESCE`:

- `nombre` = `COALESCE(p.nombre, cc.nombre)`
- `descripcion` = `COALESCE(p.descripcion, cc.descripcion)`
- `id_producto_combo` = `COALESCE(p.codigo, cc.codigo)`

**Resultado:** el dashboard muestra una sola columna “nombre/descripcion” sin preocuparse por el origen.

### 6.2 Traduce estados numéricos a texto
`bar_comanda` guarda IDs enteros como:
- `tipo_salida`
- `estado_comanda`
- (y en v6: `estado_impresion`)

La vista traduce con `parameter_table` para que el dashboard reciba:
- `VENTA`, `CORTESIA`, etc.
- `PROCESADO`, `PENDIENTE`, etc.
- `IMPRESO`, `PENDIENTE`, etc.

### 6.3 Estado de impresión: fuente de verdad (v7)
`estado_impresion` en `comandas_v7` se construye así:

1. Buscar el último estado de impresión real por comanda en `vw_comanda_ultima_impresion`.
2. Traducirlo a texto con `parameter_table`.
3. Si no hay registro de impresión, mostrar `PENDIENTE`.

Se implementa con:

- `LEFT JOIN vw_comanda_ultima_impresion imp ON imp.id_comanda = c.id`
- `LEFT JOIN parameter_table ei_real ON ei_real.id = imp.ind_estado_impresion`
- `COALESCE(ei_real.nombre, 'PENDIENTE') AS estado_impresion`

**Resultado:** el dashboard ve un estado de impresión coherente con el evento real registrado.

---

## 7) Filtro: solo la última operativa

La vista está intencionalmente “operativa” (tiempo real) y limita el dataset a la operativa más reciente:

```sql
WHERE c.id_operacion = (
  SELECT MAX(id_operacion) FROM bar_comanda
)
```

**Implicación:**  
- Ideal para dashboards en vivo.
- Si se requiere histórico, se recomienda una vista hermana (por ejemplo `comandas_historico_v1`) sin este filtro o parametrizando por operativa.

---

## 8) Implicaciones de performance y validación

### EXPLAIN
En tu `EXPLAIN`, el optimizador está usando índices adecuados:
- `bar_comanda` filtra por `id_operacion` usando índice.
- `bar_detalle_comanda_salida` se une por `id_comanda` usando índice.
- joins a PK (`eq_ref`) en tablas maestras y catálogos.

### Índice recomendado (si no existe)
Para que la resolución “última impresión” sea eficiente en grandes volúmenes:

```sql
CREATE INDEX idx_bci_comanda_id
ON adminerp_copy.bar_comanda_impresion (id_comanda, id);
```

---

## 9) Resumen ejecutivo (para el README del dashboard)

- `comandas_v7` mantiene el mismo formato de salida que `comandas_v6`.
- La única diferencia significativa es la columna **`estado_impresion`**:
  - en `v6` venía de `bar_comanda.estado_impresion`
  - en `v7` viene del **evento real** en `bar_comanda_impresion`
- La vista auxiliar `vw_comanda_ultima_impresion` existe por compatibilidad con MySQL 5.6 y encapsula la lógica “último evento de impresión por comanda”.
- La vista está optimizada para tiempo real al restringirse a la **última operativa**.

---

## 10) Definiciones SQL (referencia)

### `vw_comanda_ultima_impresion`

```sql
CREATE DEFINER = 'root'@'localhost'
VIEW adminerp_copy.vw_comanda_ultima_impresion
AS
SELECT
    bci.id_comanda,
    bci.ind_estado_impresion
FROM adminerp_copy.bar_comanda_impresion bci
WHERE bci.id = (
    SELECT MAX(bci2.id)
    FROM adminerp_copy.bar_comanda_impresion bci2
    WHERE bci2.id_comanda = bci.id_comanda
);
```

### `comandas_v7`

> Nota: se omite aquí el SQL completo para no duplicar; se asume que ya está creado y validado con `EXPLAIN` en la base de datos.

---

🦇 **Fin de la guía.**  
Si luego quieres, armamos la guía hermana para una vista histórica o parametrizable por `id_operacion` para análisis a largo plazo.
