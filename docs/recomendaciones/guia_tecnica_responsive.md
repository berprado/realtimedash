# Guía Técnica: Análisis de Responsive Design

## Proyecto: Backstage Online - Live Dashboard
**Fecha:** 2026-01-14
**Rama:** `claude/fix-responsive-design-IiUrp`

---

## Resumen Ejecutivo

Este documento identifica **inconsistencias, redundancias y errores** que impiden una visualización 100% responsive del dashboard. Se analizan los 4 archivos CSS principales y el HTML, proporcionando recomendaciones técnicas concretas para cada problema.

---

## 1. INCONSISTENCIAS CRÍTICAS

### 1.1 Sistema de Breakpoints No Unificado

**Problema:** Los breakpoints están dispersos sin una convención consistente.

| Archivo | Breakpoints Usados |
|---------|-------------------|
| `main.css` | 900px, 901px, 480px |
| `layout.css` | 600px, 768px, 900px |
| `kpi.css` | 600px |
| `summary.css` | 600px |

**Impacto:** Comportamiento impredecible entre 480px-768px. Un cambio en mobile puede no afectar todos los componentes.

**Recomendación:**
```css
/* Definir en :root de main.css */
:root {
    --breakpoint-xs: 320px;   /* Móviles pequeños */
    --breakpoint-sm: 480px;   /* Móviles */
    --breakpoint-md: 768px;   /* Tablets portrait */
    --breakpoint-lg: 900px;   /* Tablets landscape */
    --breakpoint-xl: 1200px;  /* Desktop */
}
```

Usar SCSS/PostCSS con variables o documentar los breakpoints estándar para que todos los desarrolladores los sigan.

---

### 1.2 Clase `.status-circle` Sin Estilos

**Ubicación:** `index.html:60`
```html
<div id="status-circle" class="status-circle status-connecting"></div>
```

**Problema:** La clase `.status-circle` no tiene estilos definidos en ningún archivo CSS. Solo existe `.pulsating-circle` en `main.css:112-117`.

**Impacto:** El indicador de estado no se renderiza correctamente.

**Recomendación:** Renombrar en HTML o agregar los estilos:
```css
/* Opción A: Usar clase existente en index.html */
<div id="status-circle" class="pulsating-circle status-connecting"></div>

/* Opción B: Agregar alias en main.css */
.status-circle {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    transition: background-color 0.3s ease;
}
```

---

### 1.3 `.brand` Siempre Invisible

**Ubicación:** `layout.css:104-113`
```css
.brand {
    opacity: 0;
    /* Hidden by default, show if needed or on scroll */
    transition: opacity 0.3s;
}
```

**Problema:** El elemento `.brand` tiene `opacity: 0` por defecto y nunca se activa para mostrarse en desktop. Solo se oculta en móvil con `display: none`.

**Impacto:** La marca "BACKSTAGE ONLINE" nunca es visible en ningún viewport.

**Recomendación:**
```css
.brand {
    opacity: 1; /* Visible en desktop */
    /* ... resto de estilos */
}

@media (max-width: 600px) {
    .brand {
        display: none;
    }
}
```

---

### 1.4 Falta de `box-sizing: border-box` Global

**Problema:** Solo `.top-bar` define `box-sizing: border-box` (`layout.css:256`), pero no hay reset global.

**Impacto:** Los cálculos de `width: 100%` + `padding` pueden causar overflow en elementos como `.summary-table-wrapper`.

**Recomendación:** Agregar al inicio de `main.css`:
```css
*, *::before, *::after {
    box-sizing: border-box;
}
```

---

## 2. REDUNDANCIAS EN EL CÓDIGO

### 2.1 Selector Duplicado en Media Query

**Ubicación:** `main.css:68-78`
```css
@media (max-width: 900px) {
    .dashboard-header {
        position: relative;
    }

    .dashboard-header {  /* DUPLICADO EXACTO */
        position: relative;
    }
}
```

**Impacto:** Código muerto que aumenta el tamaño del archivo y confunde el mantenimiento.

**Recomendación:** Eliminar el bloque duplicado:
```css
@media (max-width: 900px) {
    .dashboard-header {
        position: relative;
    }
}
```

---

### 2.2 Media Query Redundante para `.overlay-menu`

**Ubicación:** `layout.css:299-303`
```css
@media (max-width: 768px) {
    .overlay-menu {
        width: 85vw;
    }
}
```

**Problema:** Ya existe `width: clamp(240px, 85vw, 320px)` en la línea 120, que cubre este caso de manera más elegante.

**Impacto:** Conflicto de especificidad donde el media query sobrescribe el `clamp()` perdiendo el max-width de 320px.

**Recomendación:** Eliminar el media query redundante o ajustar el clamp:
```css
/* Eliminar líneas 299-303 */
/* El clamp ya maneja todos los casos */
.overlay-menu {
    width: clamp(240px, 85vw, 320px);
}
```

---

### 2.3 Comentarios Obsoletos

**Ubicaciones múltiples:**
- `layout.css:76-77`: `/* Hide less important metrics - Removed/Simplified */`
- `layout.css:213-214`: `/* Enable native scroll */ /* Enable native scroll */` (duplicado)

**Recomendación:** Limpiar comentarios obsoletos y duplicados.

---

## 3. ERRORES QUE CAUSAN OVERFLOW

### 3.1 Cálculos Contradictorios en `.summary-table-wrapper`

**Ubicación:** `summary.css:125-131`
```css
@media (max-width: 600px) {
    .summary-table-wrapper {
        margin-left: -10px;
        margin-right: -10px;
        width: calc(100% + 20px);
        max-width: calc(100vw - 20px);  /* CONFLICTO */
    }
}
```

**Problema:**
- `width: calc(100% + 20px)` expande el elemento 20px más allá del contenedor
- `max-width: calc(100vw - 20px)` intenta restringirlo
- Estas propiedades entran en conflicto cuando el padding del padre no es exactamente 10px

**Impacto:** Posible scroll horizontal en móviles dependiendo del contexto.

**Recomendación:**
```css
@media (max-width: 600px) {
    .summary-table-wrapper {
        margin-left: -10px;
        margin-right: -10px;
        width: calc(100% + 20px);
        max-width: 100vw;
        overflow-x: auto;
    }
}
```

O mejor, usar un enfoque más limpio:
```css
@media (max-width: 600px) {
    .summary-container {
        padding: 0; /* Eliminar padding del padre */
    }

    .summary-table-wrapper {
        width: 100%;
        border-radius: 0; /* Sin bordes redondeados en móvil */
    }
}
```

---

### 3.2 `min-width: 550px` Forzado en Tabla

**Ubicación:** `summary.css:138-142`
```css
.summary-table {
    min-width: 550px;
    width: max-content;
}
```

**Problema:** Forzar un ancho mínimo de 550px garantiza scroll horizontal en cualquier dispositivo menor a ese ancho.

**Impacto:** Experiencia de usuario degradada en móviles (requiere scroll horizontal siempre).

**Recomendación - Opción A (Tabla Compacta):**
```css
@media (max-width: 600px) {
    .summary-table {
        min-width: 100%;
        width: 100%;
    }

    /* Ocultar columnas menos importantes */
    .col-group:nth-child(n+4) {
        display: none;
    }
}
```

**Recomendación - Opción B (Tabla Apilada):**
```css
@media (max-width: 480px) {
    .summary-table,
    .summary-table tbody,
    .summary-table tr,
    .summary-table td {
        display: block;
    }

    .summary-table thead {
        display: none;
    }

    .summary-table tr {
        margin-bottom: 1rem;
        padding: 1rem;
        background: var(--card-bg);
        border-radius: 0.5rem;
    }

    .summary-table td::before {
        content: attr(data-label);
        font-weight: bold;
        display: block;
        margin-bottom: 0.25rem;
    }
}
```

---

### 3.3 KPI Grid con `minmax(300px, 1fr)` Problemático

**Ubicación:** `kpi.css:4`
```css
.kpi-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
```

**Problema:** En viewports de 301px-599px:
- Una sola columna de 300px no ocupa todo el ancho
- El grid no se centra automáticamente

**Recomendación:**
```css
.kpi-grid {
    grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
}
```

La función `min()` asegura que en pantallas menores a 300px, las tarjetas ocupen el 100%.

---

## 4. PROBLEMAS DE LAYOUT

### 4.1 `.overlay-menu` Sin Altura Definida

**Ubicación:** `layout.css:116-131`

**Problema:** El menú overlay no tiene `height` definido, lo que puede causar problemas en viewports pequeños con mucho contenido en el menú.

**Recomendación:**
```css
.overlay-menu {
    height: 100vh;
    height: 100dvh; /* Dynamic viewport height para móviles */
    overflow-y: auto;
}
```

---

### 4.2 `#app-content` con Padding-Top Fijo

**Ubicación:** `layout.css:234`
```css
#app-content {
    padding-top: 80px;
}
```

**Problema:** El padding está hardcodeado, pero el header puede cambiar de altura en diferentes viewports.

**Recomendación:**
```css
#app-content {
    padding-top: calc(60px + var(--spacing-md));
}

@media (max-width: 600px) {
    #app-content {
        padding-top: calc(60px + var(--spacing-sm));
    }
}
```

---

## 5. USO INCONSISTENTE DE UNIDADES

### 5.1 Mezcla de px y rem Sin Convención

**Ejemplos:**
| Archivo | Propiedad | Valor |
|---------|-----------|-------|
| `layout.css:18` | gap | `20px` |
| `main.css:51` | gap | `1rem` |
| `kpi.css:6` | gap | `var(--spacing-lg)` |
| `layout.css:28` | padding | `5px 12px` |
| `main.css:223` | padding | `0.25rem 0.75rem` |

**Impacto:** Difícil mantener escala consistente y accesibilidad (rem escala con font-size del usuario).

**Recomendación:** Establecer convención:
- **rem** para spacing, typography, márgenes
- **px** solo para borders, box-shadow, elementos que no deben escalar
- **Variables CSS** para valores repetidos

---

## 6. CHECKLIST DE CORRECCIONES PRIORITARIAS

### Alta Prioridad (Impacto Visual Directo)

- [ ] Agregar estilos para `.status-circle` o cambiar clase en HTML
- [ ] Corregir `opacity: 0` en `.brand` para desktop
- [ ] Agregar `box-sizing: border-box` global
- [ ] Eliminar selector duplicado `.dashboard-header`

### Media Prioridad (Mejora UX Responsive)

- [ ] Eliminar media query redundante de `.overlay-menu` (768px)
- [ ] Corregir cálculos de `.summary-table-wrapper` en móvil
- [ ] Implementar tabla apilada o compacta para `<480px`
- [ ] Agregar `height: 100dvh` al `.overlay-menu`

### Baja Prioridad (Mantenibilidad)

- [ ] Documentar sistema de breakpoints unificado
- [ ] Estandarizar uso de unidades (rem vs px)
- [ ] Limpiar comentarios obsoletos
- [ ] Considerar migración a variables CSS para breakpoints

---

## 7. MATRIZ DE BREAKPOINTS RECOMENDADA

```
┌─────────────────────────────────────────────────────────────────┐
│   320px     480px     600px     768px     900px     1200px      │
│     │         │         │         │         │          │        │
│     ▼         ▼         ▼         ▼         ▼          ▼        │
│   XS        SM        MD       MD-LG      LG         XL         │
│             │         │         │         │          │          │
│    1col    1col     2col      2col     3-4col     auto-fit     │
│   (KPI)   (grid)   (grid)   (sidebar)  (full)    (máximo)      │
│                                                                 │
│  ──────────── MOBILE ────────────┼───── TABLET ─────┼─ DESKTOP │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. TESTING RECOMENDADO

### Viewports Críticos a Probar

1. **320px** - iPhone SE, móviles pequeños
2. **375px** - iPhone 12/13/14
3. **480px** - Móviles grandes / landscape
4. **600px** - Breakpoint actual del proyecto
5. **768px** - iPad portrait
6. **900px** - Breakpoint tablet del proyecto
7. **1024px** - iPad landscape
8. **1400px** - Desktop (max-width del contenedor)

### Escenarios de Prueba

- [ ] Navegación menú overlay en todos los breakpoints
- [ ] Tabla de Analytics con scroll horizontal
- [ ] Grid de órdenes con 1, 3 y 10 tarjetas
- [ ] KPI cards en portrait y landscape
- [ ] Indicador de estado de conexión visible
- [ ] Top bar sin overflow horizontal

---

## 9. ARCHIVOS AFECTADOS

| Archivo | Líneas con Problemas | Prioridad |
|---------|---------------------|-----------|
| `css/main.css` | 68-78 (duplicado) | Alta |
| `css/layout.css` | 104-113 (brand), 299-303 (redundante) | Alta |
| `css/modules/summary.css` | 125-131, 138-142 | Media |
| `css/modules/kpi.css` | 4 (minmax) | Media |
| `index.html` | 60 (status-circle) | Alta |

---

## 10. CONCLUSIÓN

El proyecto tiene una base sólida con uso de CSS moderno (Grid, Flexbox, clamp(), variables CSS). Sin embargo, la evolución incremental ha generado inconsistencias que degradan la experiencia en dispositivos móviles.

**Acciones inmediatas recomendadas:**
1. Corregir los errores de clase CSS faltante y opacity
2. Eliminar código redundante/duplicado
3. Establecer sistema de breakpoints documentado
4. Implementar alternativa de tabla para móviles pequeños

Con estas correcciones, el dashboard logrará una visualización **100% responsive** en todos los dispositivos objetivo.

---

*Documento generado como parte del análisis técnico de responsive design.*
