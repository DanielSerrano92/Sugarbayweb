# Flujo de autenticacion en carrito (login modal)

## 1. Resumen del problema

### Que ocurria antes

Cuando un usuario no autenticado intentaba anadir un producto al carrito, la
accion de servidor `addToCartAction` llamaba a `requireSession(...)`.
`requireSession(...)` hacia `redirect("/login?...")`, por lo que la app
navegaba a una pagina de login y se perdia el contexto visual de la pagina de
producto.

### Que se ha corregido

Se ha cambiado el flujo para que el login se abra en modal desde la propia
interfaz:

- anadir al carrito sin sesion ya no redirige a `/login`;
- ahora devuelve estado `auth_required`;
- el frontend reacciona a ese estado y solicita apertura del modal de login;
- el usuario se mantiene en la misma pagina.

### Por que era necesario

El flujo modal evita romper la navegacion del usuario en mitad de compra y
mantiene la coherencia con el registro, que ya funciona en modal.

## 2. Archivos modificados

### `lib/auth/events.ts`

- Se creo un evento global `AUTH_MODAL_OPEN_EVENT`.
- Se anadio `dispatchAuthModalOpen(...)` para pedir apertura del modal desde
  cualquier componente cliente.
- Afecta al flujo: login/registro modal desde carrito, drawer y acciones
  protegidas en UI.

### `components/layout/header-client.tsx`

- Se anadio escucha global de `AUTH_MODAL_OPEN_EVENT`.
- Se anadio estado `authRedirectTo` para pasar `redirectTo` a `AuthModalPanel`.
- Se reforzo `openAuthModal(...)` para abrir login/registro con contexto de ruta
  actual.
- Afecta al flujo: controlador unico de modales auth.

### `lib/cart/actions.ts`

- `addToCartAction` paso a usarse con `useActionState`:
  firma nueva `(previousState, formData)`.
- Ya no usa `requireSession` para esta accion concreta.
- Ahora usa `getSessionUser()` y, si no hay sesion, devuelve:
  `status: "auth_required"` + `redirectTo` contextual.
- Mantiene reglas de seguridad y no anade al carrito sin sesion.
- Afecta al flujo: elimina redireccion a pagina `/login` al anadir carrito.

### `components/shop/add-to-cart-form.tsx`

- Se convirtio a cliente con `useActionState(addToCartAction, initialState)`.
- Si llega `status: "auth_required"`, lanza `dispatchAuthModalOpen({ mode:
  "login" })`.
- Envia `authRedirectTo` con la ruta actual para no perder contexto.
- Afecta al flujo: boton "Anadir al carrito" abre login modal en no autenticado.

### `components/store/store-product-purchase-form.tsx`

- Se convirtio a cliente con `useActionState`.
- Aplica el mismo manejo `auth_required` que el formulario anterior.
- Conserva UX visual del formulario de compra y su comportamiento responsive.
- Afecta al flujo: compra desde detalle de producto tambien abre modal.

### `components/cart/cart-drawer.tsx`

- Se reemplazo el enlace a `/login?redirect=/checkout` por boton que dispara
  `dispatchAuthModalOpen({ mode: "login", redirectTo: "/checkout" })`.
- Afecta al flujo: desde drawer ya no se navega a pagina login.

### `lib/auth/actions.ts`

- `loginAction` ahora respeta `redirectTo` validado por schema:
  `redirect(parsed.data.redirectTo ?? "/")`.
- Afecta al flujo: tras login desde modal vuelve al contexto solicitado.

## 3. Documentacion del codigo modificado

### Cambio 1: donde antes se redirigia al login al anadir carrito

Archivo: `lib/cart/actions.ts`

Codigo anterior:

```ts
const session = await requireSession(nextPath ?? "/carrito");
```

Codigo nuevo:

```ts
const session = await getSessionUser();

if (!session) {
  return {
    status: "auth_required",
    message: "Inicia sesion para anadir productos al carrito.",
    redirectTo: authRedirectTo ?? nextPath ?? "/store",
  };
}
```

Por que era necesario:
`requireSession` redirige a `/login`. Para este caso concreto (anadir carrito),
el requisito exige modal.

### Cambio 2: sustitucion por apertura de modal en el frontend

Archivo: `components/shop/add-to-cart-form.tsx`

Codigo nuevo relevante:

```ts
const [state, formAction] = useActionState(addToCartAction, initialState);

useEffect(() => {
  if (state.status !== "auth_required") return;

  dispatchAuthModalOpen({
    mode: "login",
    redirectTo: state.redirectTo ?? authRedirectTo,
  });
}, [authRedirectTo, state.redirectTo, state.status]);
```

Por que era necesario:
la apertura de modal debe producirse en cliente, sin navegacion a otra pagina.

### Cambio 3: controlador unico de modal reutilizado

Archivo: `components/layout/header-client.tsx`

Codigo nuevo relevante:

```ts
window.addEventListener(AUTH_MODAL_OPEN_EVENT, handleAuthModalOpen);
...
openAuthModal(requestedMode, requestedRedirect);
```

Por que era necesario:
evitar sistemas paralelos. El modal auth ya estaba en Header; ahora se reutiliza
como punto central para todo el proyecto.

### Cambio 4: drawer sin enlace a pagina login

Archivo: `components/cart/cart-drawer.tsx`

Codigo anterior:

```tsx
<Link href="/login?redirect=/checkout">Login</Link>
```

Codigo nuevo:

```tsx
<button
  type="button"
  onClick={() => {
    onClose();
    dispatchAuthModalOpen({ mode: "login", redirectTo: "/checkout" });
  }}
>
  Login
</button>
```

Por que era necesario:
el drawer formaba parte del flujo de compra y rompia el requisito de modal.

### Cambio 5: post-login con redirect contextual

Archivo: `lib/auth/actions.ts`

Codigo anterior:

```ts
redirect("/");
```

Codigo nuevo:

```ts
redirect(parsed.data.redirectTo ?? "/");
```

Por que era necesario:
si el login se abre encima de una pagina concreta, el usuario debe volver ahi al
autenticarse.

## 4. Flujo anterior vs flujo nuevo

### Flujo anterior

1. Usuario no logueado pulsa "Anadir al carrito".
2. `addToCartAction` llama a `requireSession`.
3. `requireSession` hace redirect a `/login?redirect=...`.
4. Se navega a pagina de login y se pierde contexto visual del producto.

### Flujo nuevo

1. Usuario no logueado pulsa "Anadir al carrito".
2. `addToCartAction` detecta sesion ausente y devuelve `auth_required`.
3. El formulario cliente dispara `dispatchAuthModalOpen({ mode: "login" })`.
4. `HeaderClient` abre `AuthModalPanel` encima de la pagina actual.
5. No hay navegacion a pagina `/login`.
6. El contexto del producto se mantiene.
7. Registro sigue en modal desde el propio `AuthModalPanel`.

## 5. Sistema de modales usado

- Login modal: `AuthModalPanel` ya existente.
- Registro modal: `AuthModalPanel` (mode `register`) ya existente.
- Controlador usado: `HeaderClient` (reutilizado, no sistema paralelo).
- Mecanismo nuevo minimo: evento global `AUTH_MODAL_OPEN_EVENT` para poder abrir
  el modal desde otros componentes cliente.
- Cierre modal: sigue igual (`onClose` en `AuthModalPanel`), sin navegacion
  forzada.

## 6. Codigo relevante modificado

### Antes: redireccion a login desde carrito

- `lib/cart/actions.ts`: `requireSession(...)` en `addToCartAction`.
- `components/cart/cart-drawer.tsx`: `href="/login?redirect=/checkout"`.

### Ahora: apertura de modal

- `lib/cart/actions.ts`: estado `auth_required`.
- `components/shop/add-to-cart-form.tsx`: escucha estado y lanza evento auth.
- `components/store/store-product-purchase-form.tsx`: mismo patron.
- `components/layout/header-client.tsx`: escucha evento y abre `AuthModalPanel`.
- `components/cart/cart-drawer.tsx`: boton login abre modal via evento.
- `lib/auth/actions.ts`: login redirige a `redirectTo` validado.

## 7. Errores encontrados durante la implementacion

Error 1:
- Descripcion: al convertir `store-product-purchase-form` a cliente, el build
  fallo por imports server-only.
- Archivo afectado: `components/store/store-product-purchase-form.tsx`.
- Parte del flujo afectada: compra desde detalle de producto.
- Causa: el componente cliente importaba funciones desde
  `lib/repositories/store.ts` (dependiente de `lib/db.ts` con `server-only`).
- Solucion: mover la logica simple de talla al propio componente cliente
  (`shouldShowSizeSelector` y `getSizeOptions`) sin importar repositorio.
- Estado final: resuelto.

Error 2:
- Descripcion: build fallaba al descargar fuente Google (`Press Start 2P`).
- Archivo afectado: `app/layout.tsx` (indirecto por `next/font`).
- Parte del flujo afectada: validacion tecnica (build), no logica auth.
- Causa: entorno sin red en compilacion.
- Solucion: repetir `npm.cmd run build` con permisos de red.
- Estado final: resuelto.

Error 3:
- Descripcion: el drawer seguia enviando al login page.
- Archivo afectado: `components/cart/cart-drawer.tsx`.
- Parte del flujo afectada: autenticacion desde carrito.
- Causa: enlace hardcoded a `/login?redirect=/checkout`.
- Solucion: sustituido por boton que abre modal via `dispatchAuthModalOpen`.
- Estado final: resuelto.

## 8. Pruebas realizadas

| Caso probado | Resultado esperado | Resultado obtenido | Estado | Observaciones |
|---|---|---|---|---|
| Build del proyecto | Compila sin errores | `next build` OK | OK | Requiere red para fuente |
| Lint del proyecto | Sin errores de lint | `eslint` OK | OK | Sin warnings de reglas |
| Busqueda de redireccion en flujo de carrito | No uso de `/login` en add-to-cart y drawer | Eliminado en esos puntos | OK | Queda `/login` en guardas de rutas |
| Usuario no logueado anade carrito | Se abre login modal y no navega a `/login` | Implementado por estado `auth_required` + evento modal | OK | Verificacion por codigo + build |
| Cerrar modal login | Mantener pagina actual | Flujo no fuerza navegacion al cerrar | OK | Reutiliza `onClose` existente |
| Login -> Registro desde modal | Registro en modal sin navegar | `AuthModalPanel` sin cambios funcionales | OK | Sigue el mismo conmutador |
| Usuario logueado anade carrito | Se anade producto y flujo normal | `addToCartAction` anade y redirige segun `redirectTo` | OK | Comportamiento original mantenido |
| Checkout/login desde drawer sin sesion | Login via modal | Boton abre modal con redirect `/checkout` | OK | Sin enlace a `/login` |
| Responsive modal | Mantener responsive existente | Sin cambios de CSS base de modal | OK | Pendiente revision visual manual en movil real |

Pruebas pendientes manuales en navegador:

- validar visualmente en movil escritorio los pasos de apertura/cierre;
- validar UX completa de una accion real add-to-cart sin sesion + login exitoso.

## 9. Explicacion para defender en el TFC

El login en modal mejora UX porque evita sacar al usuario del contexto de compra.
En ecommerce, cambiar de pagina en mitad de una accion reduce continuidad y puede
romper la intencion de compra.

La solucion mantiene coherencia con registro porque ambos viven en el mismo
`AuthModalPanel`. En vez de crear otro sistema, se reutiliza el modal ya
existente y se habilita su apertura desde otros componentes por evento global.

El contexto del producto se conserva porque:

- no hay redirect a `/login` al anadir carrito;
- el modal aparece encima de la pagina actual;
- el login respeta `redirectTo` validado.

Las piezas clave del flujo ahora son:

- `lib/cart/actions.ts`: detecta falta de sesion y devuelve `auth_required`.
- `components/shop/add-to-cart-form.tsx` y
  `components/store/store-product-purchase-form.tsx`: reaccionan y piden modal.
- `components/layout/header-client.tsx`: abre modal de login/registro.
- `components/cart/cart-drawer.tsx`: ya no usa enlace a pagina login.

No se redirige a pagina login en el caso critico (anadir carrito) porque ese era
el origen del problema funcional y de UX. El carrito y checkout no se rompen
porque la logica de seguridad sigue exigiendo sesion para operaciones reales.
