# Guía de Lineamientos para Diseño Responsive

## Proyecto de Referencia: Dashboard en Tiempo Real
**Versión:** 1.0
**Fecha:** 2026-01-15

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Configuración Inicial del Proyecto](#2-configuración-inicial-del-proyecto)
3. [Sistema de Breakpoints](#3-sistema-de-breakpoints)
4. [Arquitectura CSS Modular](#4-arquitectura-css-modular)
5. [Técnicas Fundamentales](#5-técnicas-fundamentales)
6. [Componentes Responsive](#6-componentes-responsive)
7. [Patrones de Navegación](#7-patrones-de-navegación)
8. [Tipografía Responsive](#8-tipografía-responsive)
9. [Optimización para Móviles](#9-optimización-para-móviles)
10. [Testing y Validación](#10-testing-y-validación)
11. [Checklist de Implementación](#11-checklist-de-implementación)

---

## 1. Introducción

Esta guía establece los lineamientos para crear proyectos web 100% responsive, basándose en las técnicas implementadas exitosamente en el dashboard de tiempo real. Los principios aquí descritos son aplicables a cualquier proyecto frontend moderno.

### Objetivos
- Visualización óptima en dispositivos de 320px a 1920px+
- Experiencia de usuario consistente en móvil, tablet y desktop
- Código CSS mantenible y escalable
- Performance optimizada en todos los dispositivos

---

## 2. Configuración Inicial del Proyecto

### 2.1 Meta Tag Viewport (OBLIGATORIO)

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**¿Por qué es crítico?**
- Sin este meta tag, los navegadores móviles renderizan la página como si fuera desktop
- `width=device-width` establece el ancho del viewport al ancho del dispositivo
- `initial-scale=1.0` establece el zoom inicial al 100%

**No usar:**
```html
<!-- EVITAR: Deshabilitar zoom afecta accesibilidad -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### 2.2 Reset Global de Box-Sizing (OBLIGATORIO)

```css
/* Agregar al INICIO de tu archivo CSS principal */
*,
*::before,
*::after {
    box-sizing: border-box;
}
```

**¿Por qué es crítico?**
- Sin `border-box`, los cálculos de `width: 100%` + `padding` causan overflow
- Previene el scroll horizontal no deseado
- Garantiza que padding y border se incluyan en el ancho total

### 2.3 Control de Overflow Global (OBLIGATORIO)

```css
html {
    overflow-x: hidden;
}

body {
    overflow-x: hidden;
    overflow-y: auto;
    min-height: 100vh;
}
```

**¿Por qué es crítico?**
- Previene scroll horizontal accidental en dispositivos móviles
- `overflow-y: auto` permite scroll vertical nativo
- `min-height: 100vh` garantiza altura mínima de pantalla completa

### 2.4 Variables CSS para Consistencia

```css
:root {
    /* Colores */
    --bg-color: #0f172a;
    --card-bg: rgba(30, 41, 59, 0.7);
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --accent-color: #38bdf8;

    /* Spacing (usar rem para escalabilidad) */
    --spacing-xs: 0.25rem;  /* 4px */
    --spacing-sm: 0.5rem;   /* 8px */
    --spacing-md: 1rem;     /* 16px */
    --spacing-lg: 2rem;     /* 32px */
    --spacing-xl: 3rem;     /* 48px */

    /* Tipografía */
    --font-primary: 'Inter', sans-serif;
    --font-secondary: 'Roboto Condensed', sans-serif;
}
```

**Beneficios:**
- Cambios globales desde un solo lugar
- Consistencia en todo el proyecto
- Facilita la creación de temas

---

## 3. Sistema de Breakpoints

### 3.1 Breakpoints Recomendados

| Breakpoint | Nombre | Dispositivos Target |
|------------|--------|---------------------|
| 320px | xs | Móviles pequeños (iPhone SE) |
| 480px | sm | Móviles estándar |
| 600px | md | Móviles grandes / Tablets pequeñas |
| 900px | lg | Tablets |
| 1200px | xl | Desktop |
| 1400px | xxl | Desktop grande |

### 3.2 Enfoque Mobile-First vs Desktop-First

**Mobile-First (RECOMENDADO):**
```css
/* Estilos base para móvil */
.component {
    width: 100%;
    padding: var(--spacing-sm);
}

/* Mejoras progresivas para pantallas más grandes */
@media (min-width: 600px) {
    .component {
        width: 50%;
        padding: var(--spacing-md);
    }
}

@media (min-width: 900px) {
    .component {
        width: 33.33%;
        padding: var(--spacing-lg);
    }
}
```

**Desktop-First:**
```css
/* Estilos base para desktop */
.component {
    width: 33.33%;
    padding: var(--spacing-lg);
}

/* Adaptaciones para pantallas más pequeñas */
@media (max-width: 900px) {
    .component {
        width: 50%;
        padding: var(--spacing-md);
    }
}

@media (max-width: 600px) {
    .component {
        width: 100%;
        padding: var(--spacing-sm);
    }
}
```

### 3.3 Breakpoints Implementados en Este Proyecto

```
┌─────────────────────────────────────────────────────────────────┐
│   320px     480px     600px     900px     901px+     1400px    │
│     │         │         │         │         │          │       │
│     ▼         ▼         ▼         ▼         ▼          ▼       │
│    XS        SM        MD        LG      Desktop    Max-Width  │
│             │         │         │         │          │         │
│   1col     1col     Adapt     Adapt    Sticky     Container   │
│  (grid)   (grid)   (padding) (header)  Header      Limit      │
│                                                                │
│  ─────────── MOBILE ────────────┼────── TABLET ─────┼─DESKTOP─│
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Arquitectura CSS Modular

### 4.1 Estructura de Archivos Recomendada

```
css/
├── main.css           # Variables globales, reset, estilos base
├── layout.css         # Header, footer, navegación, shell
└── modules/
    ├── cards.css      # Componente de tarjetas
    ├── grid.css       # Sistema de grid
    ├── tables.css     # Estilos de tablas
    └── forms.css      # Formularios
```

### 4.2 Orden de Importación en HTML

```html
<!-- Orden correcto: base -> layout -> módulos -->
<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="css/layout.css">
<link rel="stylesheet" href="css/modules/cards.css">
<link rel="stylesheet" href="css/modules/tables.css">
```

### 4.3 Estructura Interna de Cada Archivo CSS

```css
/* 1. Variables locales del módulo (si aplica) */
/* 2. Estilos base del componente */
/* 3. Variantes y estados */
/* 4. Media queries al FINAL del archivo */

/* Ejemplo: cards.css */

/* Estilos base */
.card {
    background: var(--card-bg);
    border-radius: 1rem;
    padding: var(--spacing-md);
}

/* Variantes */
.card--featured {
    border: 2px solid var(--accent-color);
}

/* Estados */
.card:hover {
    transform: translateY(-2px);
}

/* Media queries */
@media (max-width: 600px) {
    .card {
        padding: var(--spacing-sm);
        border-radius: 0.5rem;
    }
}
```

---

## 5. Técnicas Fundamentales

### 5.1 CSS Grid Fluido con auto-fill/auto-fit

```css
/* Grid que se adapta automáticamente */
.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-md);
}
```

**Diferencia entre auto-fill y auto-fit:**
- `auto-fill`: Crea columnas vacías si hay espacio
- `auto-fit`: Expande las columnas existentes para llenar el espacio

**Para pantallas ultra pequeñas, forzar 1 columna:**
```css
@media (max-width: 480px) {
    .grid-container {
        grid-template-columns: 1fr;
    }
}
```

### 5.2 Función clamp() para Dimensiones Dinámicas

```css
/* Ancho dinámico con mínimo y máximo */
.sidebar {
    width: clamp(240px, 85vw, 320px);
    /* Mínimo: 240px
       Ideal: 85% del viewport
       Máximo: 320px */
}

/* Tipografía fluida */
h1 {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
}
```

### 5.3 Unidades de Viewport Dinámicas (dvh, svh, lvh)

```css
/* Para navegadores móviles con barras dinámicas */
.full-height-element {
    height: 100vh;      /* Fallback */
    height: 100dvh;     /* Dynamic Viewport Height */
}
```

| Unidad | Descripción |
|--------|-------------|
| `vh` | Viewport height tradicional |
| `dvh` | Dynamic - ajusta cuando aparece/desaparece teclado o barra de navegación |
| `svh` | Small - altura mínima del viewport |
| `lvh` | Large - altura máxima del viewport |

### 5.4 Flexbox para Layouts Flexibles

```css
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;      /* Permite que los elementos bajen de línea */
    gap: var(--spacing-md);
}

.header-left {
    flex-shrink: 0;       /* No se comprime */
}

.header-right {
    flex-shrink: 1;       /* Se puede comprimir */
    min-width: 0;         /* Permite shrink más allá del contenido */
}
```

### 5.5 Contenedores con Max-Width

```css
.container {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: var(--spacing-md);
}

@media (max-width: 900px) {
    .container {
        padding: var(--spacing-sm);
    }
}
```

---

## 6. Componentes Responsive

### 6.1 Header Fijo/Sticky

```css
.top-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    max-width: 100vw;         /* CRÍTICO: Previene overflow */
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px;
    z-index: 1000;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(10px);
    box-sizing: border-box;   /* CRÍTICO: Incluir padding en el ancho */
}

/* Contenido principal debe tener padding-top */
.main-content {
    padding-top: 80px;        /* altura del header + margen */
}

/* En móvil, hacer background opaco */
@media (max-width: 600px) {
    .top-bar {
        background: rgba(15, 23, 42, 1);
    }
}
```

### 6.2 Grid de Tarjetas (Cards)

```css
/* Base */
.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-md);
    align-content: start;
}

/* Tarjeta individual */
.card {
    background: var(--card-bg);
    border-radius: 1rem;
    padding: var(--spacing-md);
    border: 1px solid rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(5px);
}

/* Ultra móvil: 1 columna */
@media (max-width: 480px) {
    .cards-grid {
        grid-template-columns: 1fr;
    }
}
```

### 6.3 Tablas Responsive con Scroll Horizontal

```css
/* Wrapper con scroll */
.table-wrapper {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;  /* Smooth scroll en iOS */
}

/* Tabla base */
.responsive-table {
    width: 100%;
    border-collapse: collapse;
}

/* Móvil: permitir scroll horizontal */
@media (max-width: 600px) {
    .table-wrapper {
        margin-left: -10px;
        margin-right: -10px;
        width: calc(100% + 20px);
        max-width: 100vw;
        overflow-x: scroll;
        padding: 0.25rem;
    }

    .responsive-table {
        min-width: 550px;          /* Forzar ancho mínimo */
        width: max-content;
    }

    .responsive-table th,
    .responsive-table td {
        padding: 0.4rem 0.25rem;
        font-size: 0.7rem;
        white-space: nowrap;
    }
}
```

### 6.4 Grid de KPIs/Métricas

```css
.kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-lg);
    padding: var(--spacing-md);
}

.kpi-card {
    background: var(--card-bg);
    border-radius: 1rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.kpi-card .metric-value {
    font-size: 3rem;
    font-weight: 700;
}

/* Móvil: 1 columna y tipografía reducida */
@media (max-width: 600px) {
    .kpi-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
    }

    .kpi-card .metric-value {
        font-size: 2.5rem;
    }
}
```

---

## 7. Patrones de Navegación

### 7.1 Menú Overlay (Hamburger Menu)

```css
/* Botón del menú (siempre visible) */
.menu-btn {
    background: rgba(30, 30, 30, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Panel del menú overlay */
.overlay-menu {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    height: 100dvh;                      /* Dynamic viewport para móviles */
    width: clamp(240px, 85vw, 320px);    /* Ancho dinámico */
    background: rgba(18, 18, 18, 0.95);
    backdrop-filter: blur(20px);
    z-index: 2000;
    display: flex;
    flex-direction: column;
    padding: 20px;
    transform: translateX(-100%);        /* Oculto por defecto */
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;                    /* Scroll si hay muchos items */
}

/* Estado activo (visible) */
.overlay-menu.active {
    transform: translateX(0);
}

/* Links del menú */
.menu-link {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    border-radius: 12px;
    color: var(--text-secondary);
    text-decoration: none;
    transition: all 0.2s;
}

.menu-link:hover,
.menu-link.active {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
    transform: translateX(5px);
}
```

### 7.2 Ocultar Elementos en Móvil

```css
/* Desktop: mostrar marca */
.brand {
    opacity: 1;
    transition: opacity 0.3s;
}

/* Móvil: ocultar marca para dar espacio */
@media (max-width: 600px) {
    .brand {
        display: none;
    }
}
```

---

## 8. Tipografía Responsive

### 8.1 Escalas de Fuente por Breakpoint

```css
/* Base (móvil) */
body {
    font-size: 16px;  /* 1rem base */
}

h1 { font-size: 1.5rem; }
h2 { font-size: 1.25rem; }
h3 { font-size: 1.1rem; }
p  { font-size: 0.9rem; }

/* Tablet */
@media (min-width: 600px) {
    h1 { font-size: 2rem; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }
    p  { font-size: 1rem; }
}

/* Desktop */
@media (min-width: 900px) {
    h1 { font-size: 2.5rem; }
    h2 { font-size: 2rem; }
    h3 { font-size: 1.5rem; }
}
```

### 8.2 Tipografía Fluida con clamp()

```css
/* Alternativa: tipografía que escala suavemente */
h1 {
    font-size: clamp(1.5rem, 4vw + 1rem, 2.5rem);
}

.metric-value {
    font-size: clamp(2rem, 5vw, 3rem);
}
```

### 8.3 Truncamiento de Texto

```css
/* Una línea con ellipsis */
.text-truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Múltiples líneas (webkit) */
.text-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
```

---

## 9. Optimización para Móviles

### 9.1 Touch Scrolling Suave

```css
.scrollable-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;  /* Momentum scroll en iOS */
    scroll-behavior: smooth;
}
```

### 9.2 Áreas de Toque Adecuadas

```css
/* Mínimo 44x44px para botones/links táctiles */
.touch-target {
    min-width: 44px;
    min-height: 44px;
    padding: 12px;
}

/* Links en móvil */
@media (max-width: 600px) {
    .menu-link {
        padding: 15px 20px;  /* Área de toque generosa */
    }
}
```

### 9.3 Prevenir Zoom en Inputs

```css
/* iOS hace zoom si font-size < 16px */
input, select, textarea {
    font-size: 16px;  /* Mínimo 16px en móvil */
}

@media (min-width: 600px) {
    input, select, textarea {
        font-size: 14px;  /* Puede ser menor en desktop */
    }
}
```

### 9.4 Optimización de Imágenes

```css
/* Imágenes responsivas básicas */
img {
    max-width: 100%;
    height: auto;
}

/* Con object-fit para contenedores fijos */
.image-container {
    width: 100%;
    aspect-ratio: 16 / 9;
}

.image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
```

---

## 10. Testing y Validación

### 10.1 Viewports Críticos a Probar

| Viewport | Dispositivo Representativo |
|----------|---------------------------|
| 320px | iPhone SE, móviles pequeños |
| 375px | iPhone 12/13/14/15 |
| 390px | iPhone 14 Pro |
| 480px | Móviles grandes / landscape |
| 600px | Breakpoint móvil del proyecto |
| 768px | iPad Mini portrait |
| 900px | Breakpoint tablet del proyecto |
| 1024px | iPad landscape |
| 1280px | Laptops |
| 1400px | Max-width del contenedor |
| 1920px | Desktop Full HD |

### 10.2 Checklist de Testing

**Layout:**
- [ ] Sin scroll horizontal en ningún viewport
- [ ] Contenido no se corta ni desborda
- [ ] Espaciado consistente entre elementos
- [ ] Grid de tarjetas se adapta correctamente

**Navegación:**
- [ ] Menú hamburger funciona en móvil
- [ ] Links tienen área de toque adecuada (44px+)
- [ ] Header no bloquea contenido

**Tipografía:**
- [ ] Texto legible en todos los tamaños
- [ ] No hay texto que se salga de su contenedor
- [ ] Contraste adecuado

**Interacciones:**
- [ ] Scroll suave en iOS
- [ ] Formularios no causan zoom
- [ ] Hover states funcionan (donde aplica)

**Componentes Específicos:**
- [ ] Tablas con scroll horizontal en móvil
- [ ] Imágenes escalan correctamente
- [ ] Modales/Overlays funcionan en móvil

### 10.3 Herramientas de Testing

1. **Chrome DevTools** - Device Mode (F12 → Toggle Device Toolbar)
2. **Firefox Responsive Design Mode** (Ctrl+Shift+M)
3. **Safari Web Inspector** - Responsive Design Mode
4. **BrowserStack** - Testing en dispositivos reales
5. **Lighthouse** - Auditoría de mobile-friendliness

### 10.4 Testing en Dispositivos Reales

**Prioritario probar en:**
- iPhone (Safari iOS) - por particularidades de WebKit
- Android (Chrome) - por variedad de tamaños
- iPad (Safari) - por comportamiento tablet

---

## 11. Checklist de Implementación

### Fase 1: Configuración Base

- [ ] Meta viewport configurado correctamente
- [ ] Box-sizing border-box global
- [ ] Overflow-x hidden en html/body
- [ ] Variables CSS definidas en :root
- [ ] Fuentes importadas (Google Fonts o locales)

### Fase 2: Layout Principal

- [ ] Header fijo/sticky con max-width: 100vw
- [ ] Contenedor principal con max-width y margin auto
- [ ] Padding-top en contenido para compensar header fijo
- [ ] Sistema de grid implementado

### Fase 3: Componentes

- [ ] Tarjetas con grid auto-fill/auto-fit
- [ ] Tablas con wrapper scrollable
- [ ] Menú overlay con clamp() para ancho
- [ ] Formularios con inputs de 16px+

### Fase 4: Media Queries

- [ ] Breakpoint 480px (ultra-móvil)
- [ ] Breakpoint 600px (móvil estándar)
- [ ] Breakpoint 900px (tablet)
- [ ] Breakpoint 901px+ (desktop)

### Fase 5: Optimización

- [ ] Touch scrolling (-webkit-overflow-scrolling)
- [ ] Áreas de toque de 44px mínimo
- [ ] Imágenes responsive (max-width: 100%)
- [ ] Tipografía escalable

### Fase 6: Testing

- [ ] Probar en 320px, 480px, 600px, 900px, 1200px
- [ ] Verificar sin scroll horizontal
- [ ] Probar en dispositivo iOS real
- [ ] Probar en dispositivo Android real
- [ ] Ejecutar Lighthouse mobile audit

---

## Resumen de Reglas de Oro

1. **Siempre incluir meta viewport** - Sin esto, nada funciona en móvil
2. **Box-sizing border-box global** - Previene 90% de problemas de overflow
3. **Overflow-x hidden en html/body** - Seguro contra scroll horizontal
4. **Mobile-first** - Escribir CSS base para móvil, agregar complejidad con min-width
5. **CSS Grid con auto-fill** - Grids que se adaptan automáticamente
6. **clamp() para dimensiones** - Valores dinámicos con límites
7. **100dvh en lugar de 100vh** - Para navegadores móviles con barras dinámicas
8. **max-width: 100vw en elementos fijos** - Previene overflow en headers/footers
9. **Áreas de toque de 44px** - Usabilidad en dispositivos táctiles
10. **Probar en dispositivos reales** - Los emuladores no capturan todo

---

*Guía generada como referencia para proyectos de dashboard responsive.*
*Basada en la implementación exitosa de Backstage Online Live Dashboard v4.2*
