# Incidencia TFG: Inconsistencia de imágenes de producto entre Tienda, detalle, carrito y checkout

## 1. Contexto del problema
Durante la integración de imágenes reales en la sección **Tienda**, se observó un comportamiento inconsistente:

1. En algunas vistas (cards de Tienda) la imagen del producto se mostraba correctamente.
2. En otras vistas relacionadas (detalle, carrito modal, carrito en tienda, resumen de checkout) seguía apareciendo:
   - imagen antigua,
   - imagen vacía/rota,
   - o una imagen distinta a la definida para el producto.

Esto afectaba directamente a la coherencia visual y a la trazabilidad del producto en el flujo de compra.

## 2. Síntoma funcional
El mismo producto no mantenía la misma imagen en todos los puntos del journey:

1. Catálogo Tienda (`/store`).
2. Detalle de producto (`/store/[slug]` y modal).
3. Carrito (drawer y vista en tienda).
4. Checkout.
5. Snapshot usado para construir `line_items` de Stripe.
6. Historial de pedidos en cuenta.

## 3. Causa raíz
La causa no era de CSS ni de layout, sino de **arquitectura de datos de imagen**:

1. La imagen se consumía desde múltiples capas (UI + repositorios + snapshots).
2. El primer ajuste de imágenes se aplicó solo en componentes visuales de Tienda.
3. Carrito/checkout/pedidos seguían usando fuentes distintas:
   - `coverImage` obtenido desde consulta de carrito,
   - `imageUrlSnapshot` guardado en pedido,
   - `productName` en payload de Stripe.
4. Algunas capas tenían `slug` de producto y otras solo `nombre`, por lo que un override solo por `slug` no cubría todos los casos.

En resumen: existía un acoplamiento parcial de imágenes por vista, no una resolución centralizada.

## 4. Objetivo de la corrección
Garantizar que la imagen oficial de cada producto objetivo se resuelva de forma consistente en **todas** las vistas relacionadas, sin modificar:

1. Layout general.
2. Filtros.
3. Lógica de carrito/checkout.
4. Estructura de cards.

## 5. Estrategia técnica aplicada
Se implementó una resolución de imagen centralizada en una utilidad de dominio de tienda:

1. Override por `slug` (caso ideal).
2. Fallback por `nombre de producto` (para snapshots o capas sin `slug`).
3. Resolución de `object-fit` también centralizada para mantener encuadre coherente.

Archivo clave:
- `lib/store/product-image-overrides.ts`

## 6. Archivos modificados en esta incidencia

### 6.1 Núcleo de resolución de imagen
1. `lib/store/product-image-overrides.ts`

### 6.2 Vistas de tienda
1. `components/store/store-product-card.tsx`
2. `components/store/store-product-detail-panel.tsx`

### 6.3 Vistas de carrito y checkout
1. `components/cart/cart-drawer.tsx`
2. `components/cart/cart-line-item.tsx`
3. `components/checkout/checkout-flow.tsx`

### 6.4 Repositorios/snapshots y pago
1. `lib/repositories/cart.ts`
2. `lib/repositories/orders.ts`
3. `lib/repositories/account.ts`
4. `app/api/checkout/route.ts`

## 7. Cambios concretos relevantes

1. Se creó `resolveStoreProductImageUrl(slug, fallback, productName)` para unificar resolución.
2. Se creó `resolveStoreProductImageFitClass(slug, productName)` para unificar encuadre.
3. Se aplicó en UI de catálogo y detalle.
4. Se aplicó en UI de carrito y resumen de checkout.
5. Se aplicó en mapeos de repositorio (carrito/pedido) para que snapshots nuevos guarden imagen correcta.
6. Se aplicó en creación de `line_items` de Stripe para que el checkout remoto use la misma imagen.
7. Se aplicó en lectura de pedidos de cuenta para mantener consistencia incluso cuando la fuente llega por snapshot.

## 8. Riesgos y mitigación

### Riesgo 1
Capas sin `slug` podían quedar fuera del override.

Mitigación:
1. Fallback por `productName` normalizado.

### Riesgo 2
Diferencias de encuadre entre vistas.

Mitigación:
1. Centralización de `object-fit` (`object-contain object-center`) para productos objetivo.

### Riesgo 3
Regresiones en flujo de pago.

Mitigación:
1. La corrección no altera cantidades, precios ni estructura de checkout.
2. Solo reemplaza la URL de imagen resuelta.

## 9. Validación funcional
Se verificó coherencia de imagen en:

1. Card de catálogo de Tienda.
2. Vista “Ver detalle” del producto.
3. Carrito modal (header).
4. Carrito en tienda (líneas de producto).
5. Resumen lateral de checkout.
6. Payload de imágenes enviado a Stripe.
7. Listado de pedidos de cuenta (snapshot).

## 10. Resultado final
La imagen de producto queda alineada transversalmente en todo el flujo de compra para los productos objetivo, corrigiendo el problema de “imagen correcta en una vista pero ausente/incorrecta en otra”.

## 11. Lección técnica para TFG
Cuando una entidad de dominio (producto) se renderiza en múltiples contextos, la política de resolución de assets (imágenes) debe vivir en una **capa compartida de dominio** y no en componentes aislados.  
Esta incidencia evidencia la importancia de centralizar reglas de presentación crítica para mantener consistencia funcional y visual end-to-end.
