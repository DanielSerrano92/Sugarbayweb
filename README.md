# Sugarbayweb

Aplicacion web full-stack para la banda **Sugarbay** con:

- Next.js 16 (App Router)
- TypeScript estricto
- Tailwind CSS v4
- Prisma + Neon PostgreSQL
- Stripe Checkout
- ImageKit

## Estructura principal

- `app/` rutas App Router (landing, banda, musica, media, tienda, auth, cuenta, carrito, checkout)
- `components/` UI reusable por dominio (`layout`, `shop`, `cart`, `auth`, `ui`)
- `lib/auth` sesion persistente (cookie JWT), DAL y acciones de auth
- `lib/repositories` capa de acceso a datos modular (contenido, tienda, carrito)
- `lib/services` integracion Stripe/ImageKit y navegacion
- `prisma/schema.prisma` modelo de dominio completo
- `app/api/*` route handlers para checkout Stripe, webhook y auth de ImageKit
- `proxy.ts` proteccion optimista de rutas privadas

## Variables de entorno

Usa `.env.example` como base y crea `.env`:

```bash
cp .env.example .env
```

Variables clave:

- `DATABASE_URL`
- `DIRECT_URL`
- `SESSION_SECRET` (minimo 32 caracteres)
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`
- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`

Guia detallada de Stripe: [`docs/STRIPE_SETUP.md`](docs/STRIPE_SETUP.md)

## Desarrollo

```bash
npm install
npm run dev
```

## Prisma

Regenerar cliente:

```bash
npx prisma generate
```

Sincronizar esquema con Neon (cuando proceda):

```bash
npx prisma db push
```

## Rutas funcionales

- `/` landing
- `/conciertos`
- `/banda`
- `/musica`
- `/media`
- `/fanclub`
- `/tienda`
- `/tienda/[slug]`
- `/login`, `/registro`
- `/cuenta` (privada)
- `/carrito` (privada)
- `/checkout` (privada)

## Seguridad y arquitectura

- Server Components por defecto
- Validacion de formularios en cliente y servidor (Zod)
- Sesion persistente con cookie `httpOnly`
- Proteccion de rutas con `proxy.ts` y comprobacion en servidor
- Secretos solo por variables de entorno
- Estados `loading`, `empty` y `error`
