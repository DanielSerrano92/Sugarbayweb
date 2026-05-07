# Setup de Stripe en Sugarbay

Esta guia documenta el proceso completo para dejar funcionando Stripe Checkout en
Sugarbay: crear la cuenta, obtener credenciales, configurar `.env`, probar en
localhost, crear el webhook de produccion y entender que codigo del proyecto se
ejecuta durante el checkout.

## Objetivo del setup

Sugarbay usa Stripe Checkout hospedado. El usuario rellena el checkout en
`/checkout`, la app crea una orden pendiente, llama a Stripe desde el servidor y
redirige al usuario a la URL de pago que devuelve Stripe.

El flujo esperado es:

1. Usuario autenticado entra en `/checkout`.
2. `components/checkout/checkout-flow.tsx` envia `POST /api/checkout`.
3. `app/api/checkout/route.ts` valida datos, guarda direcciones y crea una orden
   pendiente desde el carrito.
4. La API crea una `Checkout Session` con Stripe.
5. El frontend redirige a la URL hospedada de Stripe.
6. Stripe devuelve al usuario a `/checkout/success?session_id=...`.
7. `app/checkout/success/page.tsx` consulta la sesion de Stripe y sincroniza el
   pedido.
8. El webhook `/api/stripe/webhook` confirma eventos asincronos de Stripe.

## Crear cuenta y obtener credenciales

1. Crear o entrar en una cuenta de Stripe:
   `https://dashboard.stripe.com/`.
2. Activar el modo de prueba o sandbox.
3. Ir a `Developers > API keys`.
4. Copiar estas claves:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

La clave `STRIPE_SECRET_KEY` es la imprescindible para crear sesiones de
checkout desde el servidor. La clave publicable existe en el schema de entorno,
pero el flujo actual de Sugarbay no monta Stripe Elements en cliente, asi que no
es la pieza critica para redirigir a Stripe Checkout.

Nunca se deben hardcodear claves secretas en el codigo. Deben vivir en variables
de entorno o en el gestor de secretos de la plataforma de despliegue.

Fuente oficial:

- Stripe API keys: https://docs.stripe.com/keys
- Buenas practicas para claves secretas: https://docs.stripe.com/keys-best-practices

## Variables de entorno necesarias

En local, `.env` debe contener al menos:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Notas:

- Despues de editar `.env`, hay que parar y arrancar de nuevo `npm run dev`.
- `STRIPE_SECRET_KEY` empieza por `sk_test_` en pruebas o `sk_live_` en
  produccion.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` empieza por `pk_test_` o `pk_live_`.
- `STRIPE_WEBHOOK_SECRET` empieza por `whsec_`.
- No mezclar claves test con claves live.

## Instalar Stripe CLI para localhost

Para probar webhooks en localhost no hace falta crear un webhook desde el
Dashboard. Se usa Stripe CLI como puente temporal entre Stripe y tu servidor
local.

Instalacion recomendada en Windows:

1. Descargar la ultima release de Stripe CLI:
   `https://github.com/stripe/stripe-cli/releases/latest`.
2. Descargar el ZIP de Windows, por ejemplo `stripe_X.X.X_windows_x86_64.zip`.
3. Descomprimirlo en una carpeta estable, por ejemplo:

```txt
C:\Tools\stripe
```

4. Confirmar que existe:

```txt
C:\Tools\stripe\stripe.exe
```

5. Anadir `C:\Tools\stripe` al `Path` de Windows.
6. Cerrar y abrir PowerShell.
7. Verificar:

```powershell
stripe --version
```

8. Iniciar sesion:

```powershell
stripe login
```

Fuente oficial:

- Instalacion de Stripe CLI: https://docs.stripe.com/stripe-cli/install

## Probar webhook en localhost

Con la app corriendo en otro terminal:

```powershell
npm run dev
```

Ejecutar Stripe CLI:

```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Stripe CLI mostrara un secreto similar a:

```txt
Ready! Your webhook signing secret is whsec_...
```

Ese valor se copia en `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

Tambien se puede escuchar solo los eventos que Sugarbay maneja:

```powershell
stripe listen --events checkout.session.completed,checkout.session.async_payment_failed,checkout.session.expired,payment_intent.payment_failed --forward-to localhost:3000/api/stripe/webhook
```

Fuente oficial:

- Probar webhooks localmente con `stripe listen --forward-to`:
  https://docs.stripe.com/webhooks/test
- Webhooks con Node y verificacion de firma:
  https://docs.stripe.com/webhooks?lang=node

## Webhook en produccion

Cuando la app este desplegada con URL publica HTTPS, se crea el webhook desde el
Dashboard de Stripe.

URL del punto de conexion:

```txt
https://TU-DOMINIO.com/api/stripe/webhook
```

Ejemplo:

```txt
https://sugarbayweb.vercel.app/api/stripe/webhook
```

Nombre del destino sugerido:

```txt
Sugarbay Checkout Webhook
```

Eventos que conviene seleccionar porque el codigo los maneja:

```txt
checkout.session.completed
checkout.session.async_payment_failed
checkout.session.expired
payment_intent.payment_failed
```

Al crear el endpoint, Stripe permite revelar el signing secret. Ese valor
`whsec_...` debe guardarse como `STRIPE_WEBHOOK_SECRET` en las variables de
entorno del despliegue.

Fuente oficial:

- Crear endpoints de webhook y usar URLs HTTPS publicas:
  https://docs.stripe.com/webhooks/test

## Codigo clave del checkout

### Cliente: boton "Continuar a pago seguro"

Archivo: `components/checkout/checkout-flow.tsx`

El formulario envia los datos validados a la API interna:

```tsx
const response = await fetch("/api/checkout", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    shipping: validationResult.data.shipping,
    billing: validationResult.data.billing,
    useSameAddress: validationResult.data.useSameAddress,
    paymentMethod: validationResult.data.paymentMethod,
  }),
});
```

Si la API devuelve una URL, el navegador redirige a Stripe:

```tsx
window.location.assign(payload.url);
```

Si la API falla, el mensaje se muestra debajo del boton:

```tsx
setApiError(
  error instanceof Error ? error.message : "No se pudo iniciar el checkout",
);
```

### Servidor: crear sesion de Stripe Checkout

Archivo: `app/api/checkout/route.ts`

La ruta exige usuario autenticado, valida payload, guarda direcciones, bloquea
PayPal porque es solo UI por ahora y crea una orden pendiente desde el carrito.

La parte central de Stripe es:

```ts
const stripe = getStripeClient();
const baseUrl = env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

const checkoutSession = await stripe.checkout.sessions.create({
  mode: "payment",
  payment_method_types: ["card"],
  client_reference_id: pendingOrder.id,
  customer_email: sessionUser.email,
  line_items: pendingOrder.items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: pendingOrder.currency.toLowerCase(),
      unit_amount: Math.round(item.unitPrice * 100),
      product_data: {
        name: item.productName,
        images: item.imageUrl ? [resolveImageUrl(item.imageUrl)] : [],
      },
    },
  })),
  success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/checkout?payment=cancelled`,
  metadata: {
    userId: String(sessionUser.userId),
    orderId: pendingOrder.id,
  },
});
```

Luego guarda los identificadores de Stripe en la orden:

```ts
await attachStripeCheckoutSessionToOrder({
  orderId: pendingOrder.id,
  checkoutSessionId: checkoutSession.id,
  paymentIntentId:
    typeof checkoutSession.payment_intent === "string"
      ? checkoutSession.payment_intent
      : undefined,
});
```

Y devuelve la URL al cliente:

```ts
return Response.json({ url: checkoutSession.url });
```

Fuente oficial:

- Checkout Sessions API: https://docs.stripe.com/payments/checkout-sessions
- Como funciona Stripe Checkout: https://docs.stripe.com/payments/checkout/how-checkout-works

### Servicio Stripe

Archivo: `lib/services/stripe.ts`

El cliente de Stripe se crea solo en servidor y requiere `STRIPE_SECRET_KEY`:

```ts
stripeClient = new Stripe(
  requireEnv(env.STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY"),
);
```

Si `STRIPE_SECRET_KEY` esta vacia o falta, `requireEnv` lanza un error y no se
puede crear la sesion de pago.

### Webhook: recibir eventos de Stripe

Archivo: `app/api/stripe/webhook/route.ts`

La ruta lee la firma `stripe-signature`, conserva el body raw con
`request.text()` y verifica el evento con `STRIPE_WEBHOOK_SECRET`:

```ts
const rawBody = await request.text();
const stripe = getStripeClient();
event = stripe.webhooks.constructEvent(
  rawBody,
  signature,
  requireEnv(env.STRIPE_WEBHOOK_SECRET, "STRIPE_WEBHOOK_SECRET"),
);
```

Eventos manejados:

```ts
if (event.type === "checkout.session.completed") {
  await markOrderAsPaid(...);
}

if (
  event.type === "checkout.session.async_payment_failed" ||
  event.type === "checkout.session.expired"
) {
  await markOrderAsFailed(...);
}

if (event.type === "payment_intent.payment_failed") {
  await markOrderAsFailedByPaymentIntent(paymentIntent.id);
}
```

Esto confirma pagos completados y marca como fallidos pagos expirados o
rechazados.

Stripe recomienda verificar la firma de los webhooks con sus librerias
oficiales. Tambien advierte que la verificacion necesita el body sin modificar,
por eso esta ruta usa `request.text()`.

Fuente oficial:

- Verificacion de firma de webhooks:
  https://docs.stripe.com/webhooks?lang=node

### Pagina de exito

Archivo: `app/checkout/success/page.tsx`

Al volver de Stripe, la pagina toma `session_id`, sincroniza el pedido con
Stripe y muestra el estado:

```ts
await syncOrderWithStripeCheckoutSession(sessionId);
```

La sincronizacion consulta Stripe:

```ts
const stripe = getStripeClient();
const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
```

Si `session.payment_status === "paid"`, marca el pedido como pagado. Si esta
expirada o impagada, lo marca como fallido.

### Sincronizacion visual del carrito tras pago

Archivos:

- `components/checkout/checkout-cart-sync.tsx`
- `components/layout/header-client.tsx`
- `lib/cart/events.ts`
- `app/checkout/success/page.tsx`

Cuando Stripe redirige a `/checkout/success?session_id=...`, la pagina de exito
sincroniza el pedido con Stripe y, si el pago esta confirmado, la base de datos
vacia el carrito mediante `markOrderAsPaid`.

El problema era visual: el header y el drawer del carrito viven en el layout de
Next.js. Los layouts se conservan entre navegaciones y pueden mostrar estado o
props anteriores hasta que se solicita un refresco de los Server Components. Por
eso el checkout ya veia el carrito vacio en base de datos, pero el icono y el
drawer aun ensenaban el producto hasta hacer refresh manual del navegador.

La correccion hace dos cosas cuando `isPaid === true` en la pagina de exito:

1. Dispara un evento de navegador `sugarbay:cart-cleared` para vaciar el header y
   el drawer de forma inmediata.
2. Ejecuta `router.refresh()` una sola vez por `checkoutSessionId` para pedir al
   servidor un nuevo payload de React Server Components y traer el carrito real
   ya actualizado.

Componente nuevo:

```tsx
<CheckoutCartSync checkoutSessionId={sessionId} shouldClearCart={isPaid} />
```

La proteccion con `sessionStorage` evita refrescos repetidos si la misma pagina
de exito se vuelve a renderizar:

```tsx
const refreshKey = `sugarbay.checkout.cart-sync.${checkoutSessionId}`;
if (window.sessionStorage.getItem(refreshKey)) return;

window.sessionStorage.setItem(refreshKey, "1");
window.dispatchEvent(new Event(CART_CLEARED_EVENT));
router.refresh();
```

En `HeaderClient`, el carrito visible pasa a ser estado local derivado de los
props del servidor. Cuando llega el evento `CART_CLEARED_EVENT`, se vacian
`items`, `totalItems` y `subtotal`:

```tsx
setVisibleCart((currentCart) =>
  currentCart
    ? {
        ...currentCart,
        totalItems: 0,
        subtotal: 0,
        items: [],
      }
    : currentCart,
);
```

Fuentes oficiales:

- Next.js `router.refresh()`: https://nextjs.org/docs/app/api-reference/functions/use-router
- Next.js layouts: https://nextjs.org/docs/app/building-your-application/routing/defining-routes
- Next.js `revalidatePath`: https://nextjs.org/docs/app/api-reference/functions/revalidatePath
- Stripe recomienda cumplir/sincronizar pedidos con webhooks y tambien desde la
  landing de exito usando el `Checkout Session ID`:
  https://docs.stripe.com/checkout/fulfillment

## Errores encontrados durante el setup

### 1. Error al crear la sesion de pago de Stripe

Mensaje mostrado en la UI:

```txt
Error al crear la sesion de pago de Stripe
```

Causa encontrada en este proyecto:

- Las variables `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` y
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` existian en `.env`, pero estaban vacias.
- `lib/env.ts` convierte cadenas vacias en `undefined`.
- `lib/services/stripe.ts` exige `STRIPE_SECRET_KEY`.
- La ruta `app/api/checkout/route.ts` captura el error y responde con el mensaje
  generico.

Solucion:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Despues, reiniciar el servidor:

```powershell
npm run dev
```

### 2. URL no valida en el Dashboard

Error visto:

```txt
URL no valida: Las URL no pueden contener espacios en blanco.
```

Causa:

Se pego este comando en el campo "URL del punto de conexion":

```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Ese campo acepta una URL publica HTTPS, no comandos de terminal.

Solucion:

- En Dashboard, usar una URL publica:

```txt
https://TU-DOMINIO.com/api/stripe/webhook
```

- En localhost, ejecutar el comando en PowerShell:

```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 3. `stripe` no se reconoce en PowerShell

Error visto:

```txt
stripe : El termino 'stripe' no se reconoce como nombre de un cmdlet...
```

Causa:

Stripe CLI no estaba instalada o `stripe.exe` no estaba en el `Path`.

Solucion:

1. Instalar Stripe CLI.
2. Anadir la carpeta de `stripe.exe` al `Path`.
3. Abrir una nueva terminal.
4. Verificar:

```powershell
stripe --version
```

### 4. `scoop` no se reconoce en PowerShell

Error visto:

```txt
scoop : El termino 'scoop' no se reconoce como nombre de un cmdlet...
```

Causa:

Scoop no estaba instalado. Por eso no servian los comandos:

```powershell
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

Solucion usada/recomendada:

Instalar Stripe CLI manualmente desde la release oficial de GitHub y anadirlo al
`Path`.

### 5. Invalid Stripe signature

Mensaje devuelto por la API:

```txt
Invalid Stripe signature
```

Causas habituales:

- `STRIPE_WEBHOOK_SECRET` no corresponde al listener o endpoint actual.
- Se uso el `whsec_...` de Dashboard para CLI local, o al reves.
- El body del webhook fue modificado antes de verificar la firma.

Solucion:

- En local, usar el `whsec_...` que imprime `stripe listen`.
- En produccion, usar el `whsec_...` del endpoint creado en Dashboard.
- Mantener `request.text()` en `app/api/stripe/webhook/route.ts`.

### 6. El carrito se queda visible despues de pagar hasta refrescar

Sintoma:

```txt
La pagina de checkout dice que el carrito esta vacio, pero el icono del header
y el drawer siguen mostrando 1 producto. Al actualizar la pagina, se corrige.
```

Causa:

- `markOrderAsPaid` ya vaciaba el carrito en base de datos.
- La pagina `/checkout/success` sincronizaba correctamente la sesion de Stripe.
- El header/drawer estaba renderizado desde el layout y podia conservar el
  estado anterior del carrito hasta un refresh.

Solucion aplicada:

- Nuevo evento compartido `CART_CLEARED_EVENT` en `lib/cart/events.ts`.
- Nuevo componente cliente `CheckoutCartSync` en
  `components/checkout/checkout-cart-sync.tsx`.
- `app/checkout/success/page.tsx` renderiza ese componente solo cuando el pedido
  esta pagado.
- `components/layout/header-client.tsx` escucha el evento, vacia el carrito
  visible y recibe despues el estado real mediante `router.refresh()`.

Esta solucion respeta el flujo recomendado por Stripe: el pago se confirma con
la `Checkout Session`, el pedido se sincroniza en servidor y la UI se refresca
despues de la mutacion.

## Tarjetas de prueba

Para probar pagos con claves `sk_test_...` y `pk_test_...`, usar tarjetas de
prueba de Stripe. La tarjeta basica de exito es:

```txt
4242 4242 4242 4242
```

Datos de prueba:

- Fecha: cualquier fecha futura, por ejemplo `12/34`.
- CVC: cualquier codigo de 3 digitos.
- Codigo postal: cualquier valor valido.

No usar tarjetas reales en modo test.

Fuente oficial:

- Tarjetas de prueba: https://docs.stripe.com/testing

## Checklist rapido

Para localhost:

1. `.env` tiene `STRIPE_SECRET_KEY=sk_test_...`.
2. `.env` tiene `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`.
3. `npm run dev` esta corriendo.
4. Stripe CLI esta instalada y `stripe --version` funciona.
5. `stripe login` esta hecho.
6. `stripe listen --forward-to localhost:3000/api/stripe/webhook` esta corriendo.
7. `.env` tiene el `STRIPE_WEBHOOK_SECRET=whsec_...` que imprime la CLI.
8. Se reinicio `npm run dev` despues de editar `.env`.
9. El checkout usa tarjeta de prueba, no tarjeta real.

Para produccion:

1. Usar `sk_live_...` y `pk_live_...`.
2. Configurar variables secretas en la plataforma de hosting.
3. Crear webhook en Dashboard con URL HTTPS publica:
   `https://TU-DOMINIO.com/api/stripe/webhook`.
4. Seleccionar los eventos manejados por Sugarbay.
5. Guardar el `whsec_...` de ese endpoint como `STRIPE_WEBHOOK_SECRET`.
6. No subir `.env` real al repositorio.
