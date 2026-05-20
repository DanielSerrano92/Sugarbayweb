# Informe TFG: Ajuste de margen lateral derecho en sección Tienda

## 1. Objetivo del ajuste
Corregir únicamente el margen lateral derecho de la zona de productos/cards en la sección `Tienda`, manteniendo intactos:

- Filtros (ancho, posición y diseño).
- Margen lateral izquierdo.
- Hero, header, rutas, lógica, datos, modales y estilos globales no relacionados.

## 2. Archivos modificados

### Implementación de layout
1. `app/store/page.tsx`
2. `app/globals.css`

### Documentación técnica
1. `docs/proceso-ajuste-margen-derecho-tienda-tfg.txt`
2. `docs/tfg-ajuste-margen-derecho-tienda.md`

## 3. Problemas encontrados en la implementación
1. Había reglas de layout de Tienda repartidas entre bloque base y media queries, lo que dificultaba un control estable del borde derecho.
2. Existían ajustes con valores fijos en distintos breakpoints, provocando resultados visuales inconsistentes según ancho de pantalla.
3. El requisito de no tocar filtros ni margen izquierdo restringía la solución: el ajuste debía resolverse solo desde la columna de productos.
4. La alineación conjunta de cards y breadcrumb requería usar la misma referencia horizontal para evitar desajustes visuales.

## 4. Decisiones técnicas para el resultado final
1. Se creó una variable CSS scoped de Tienda para centralizar el offset derecho:
   - `--store-products-right-offset`.
2. Se aplicó esa variable únicamente al área de productos:
   - `.store-catalog-products { padding-right: var(--store-products-right-offset); }`
3. Se alineó el breadcrumb con el mismo offset para conservar coherencia de borde derecho.
4. Se mantuvo `2 cards por fila` en desktop sin alterar filtros ni mover la primera card respecto al bloque izquierdo.

## 5. Pasos del desarrollo
1. Se auditó la estructura de `app/store/page.tsx` para confirmar que el ajuste podía limitarse al contenedor de productos.
2. Se revisó `app/globals.css` para localizar reglas activas de:
   - `store-catalog-content`
   - `store-catalog-products`
   - `store-products-grid`
   - alineación de breadcrumb/paginación en desktop.
3. Se añadió una clase explícita al wrapper de productos en Tienda (`store-catalog-products`) y `w-full` al grid para asegurar estirado interno.
4. Se unificó el margen derecho con variable CSS y se eliminaron dependencias de valores dispersos.
5. Se calibraron valores responsive del offset derecho en desktop para que el margen fuese claramente visible.
6. Se verificó que el cambio afectase solo a Tienda y no a filtros/margen izquierdo.

## 6. Cambios concretos aplicados

### `app/store/page.tsx`
1. Wrapper de productos:
   - de `className="lg:col-start-2"`
   - a `className="store-catalog-products min-w-0 lg:col-start-2"`
2. Grid de productos:
   - de `className="store-products-grid grid gap-5"`
   - a `className="store-products-grid grid w-full gap-5"`

### `app/globals.css`
1. Se declaró variable scoped:
   - `.page-content-wrapper.store-catalog-content { --store-products-right-offset: ... }`
2. Se aplicó al contenedor de productos:
   - `padding-right: var(--store-products-right-offset)`
3. Se aplicó al breadcrumb de Tienda en desktop:
   - `margin-right: var(--store-products-right-offset)`
4. Se mantuvieron sin cambios las reglas de filtros (`store-catalog-sidebar` y `store-filters-window`).

## 7. Estado final validado
1. Ajuste aplicado solo a la zona de productos/cards de Tienda.
2. Filtros intactos.
3. Margen lateral izquierdo intacto.
4. Estructura general `[filtros] [productos]` mantenida.
5. Desktop con 2 cards por fila preservado.
