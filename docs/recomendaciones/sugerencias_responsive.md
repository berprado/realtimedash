

A) Barra superior sin wrap y exceso de métricas en móvil.

#La top-bar y metrics-bar no permiten reflujo en pantallas pequeñas, lo que provoca compresión u overflow.
# Sugerencia: Hacer que la top-bar sea adaptable en móvil con wrap y colapso de métricas
1. En `css/layout.css`, agregar un breakpoint `@media (max-width: 600px)` para `#view-live-monitor` y `.summary-container`.
2. Dentro del breakpoint, ajustar `padding` a `12px` o `8px`.
3. Verificar que el contenido no pegue a los bordes pero que el espacio útil aumente en pantallas pequeñas.

B) Padding fijo en contenedores principales.

#view-live-monitor y .summary-container usan padding: 20px sin ajustes para móviles, reduciendo demasiado el ancho útil.
#Sugerencia: Reducir padding en contenedores principales para móviles
1. En `css/main.css`, añadir un breakpoint `@media (max-width: 480px)` para `.orders-grid`.
2. En el breakpoint, cambiar `grid-template-columns` a `1fr` o `repeat(auto-fill, minmax(220px, 1fr))`.
3. Validar que no haya scroll horizontal en 320px.

C) Grid de órdenes con minmax(280px, 1fr) rígido

#El min-width de 280px puede forzar overflow en dispositivos pequeños.
#Sugerencia: Ajustar el grid de órdenes para dispositivos pequeños.
1. En `css/layout.css`, reemplazar `width: 300px` en `.overlay-menu` por `width: clamp(240px, 85vw, 320px)`.
2. Mantener el breakpoint móvil o simplificarlo si el clamp cubre todos los casos.
3. Probar en 320px y 768px para confirmar que no hay overflow.

D) Menú lateral con ancho fijo

#.overlay-menu usa width: 300px fijo y luego 85vw en móvil, sin max-width.
#Sugerencia: Hacer el menú lateral fluido con clamp()
1. En `css/modules/summary.css`, agregar un breakpoint `@media (max-width: 600px)`.
2. Dentro del breakpoint, reducir `padding` en `th` y `td` y disminuir `font-size`.
3. Considerar una variante “stacked” (cada fila como tarjeta) usando `display: block` en `tr/td` o un layout alternativo para móvil.
4. Ajustar `.col-name` para que el `min-width` no fuerce scroll horizontal.


D) Tabla de resumen solo responsive por scroll horizontal

#La tabla depende de overflow-x: auto pero no refluye ni adapta sus columnas en móvil.
#Sugerencia: Hacer la tabla de resumen adaptable en móviles
1. En `css/modules/summary.css`, agregar un breakpoint `@media (max-width: 600px)`.
2. Dentro del breakpoint, reducir `padding` en `th` y `td` y disminuir `font-size`.
3. Considerar una variante “stacked” (cada fila como tarjeta) usando `display: block` en `tr/td` o un layout alternativo para móvil.
4. Ajustar `.col-name` para que el `min-width` no fuerce scroll horizontal.

