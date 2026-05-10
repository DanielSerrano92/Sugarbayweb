# Colecciones de videos

Se ha creado una estructura de tarjetas y detalle para la seccion de videos de
Sugarbayweb usando la estructura existente de Prisma.

Cada tarjeta muestra:

- Imagen de portada
- Titulo
- Numero de videos de la coleccion

Al hacer hover en la tarjeta:

- Cambia el borde
- Sube ligeramente
- Usa transicion suave

## Que problema se resuelve

Antes, la vista de videos mezclaba colecciones y videos sueltos con filtros. Con
este cambio, la seccion queda centrada en colecciones, con una navegacion mas
directa al detalle de cada una.

## Revision de Prisma y decision de arquitectura

Se reviso `prisma/schema.prisma` y ya existen modelos claros para este caso:

- `VideoCollection`
- `VideoItem`

Por eso se uso Prisma (opcion A) y no datos estaticos. No se anadieron modelos
nuevos.

## Modelos implicados

- `VideoCollection`: `title`, `slug`, `description`, `coverImageUrl`,
  `isPublished`, `sortOrder`.
- `VideoItem`: `title`, `slug`, `platform`, `videoUrl`, `sortOrder`, etc.

## Colecciones creadas

- Mitch Bucano and Johnny Funk (`mitch-bucano-and-johnny-funk`)
- Miscelanea (`miscelanea`)
- Colaboraciones (`colaboraciones`)
- Social (`social`)

## Datos por coleccion y por video

Cada coleccion usa:

- `id` (Prisma)
- `slug`
- `title`
- `description`
- `coverImageUrl`
- `videos[]`

Cada video usa:

- `id` (Prisma)
- `slug`
- `title`
- `videoUrl`
- `platform` (`YOUTUBE`)
- `sortOrder`

Adicionalmente, en runtime se deriva:

- `youtubeId` (extraido desde `videoUrl`)
- `type` (`normal` o `short`)
- `embedUrl` (`https://www.youtube.com/embed/ID`)

## YouTube embed

Los videos se renderizan con `iframe`, sin `dangerouslySetInnerHTML`.

Se aplican buenas practicas:

- `allowFullScreen`
- `referrerPolicy="strict-origin-when-cross-origin"`
- `title` descriptivo
- `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"`

No se guarda HTML completo del iframe en base de datos. Se guarda un valor limpio
en `videoUrl` (watch o shorts) y se genera `embedUrl` en codigo.

## Shorts vs videos normales

- Videos normales: contenedor `aspect-video` (16:9).
- Shorts: contenedor `aspect-[9/16]` (vertical).

La deteccion se hace leyendo si la URL original viene en formato
`youtube.com/shorts/...`.

## Navegacion y rutas

- Listado principal: `/media/videos`
- Detalle dinamico: `/media/videos/[slug]`

En detalle, debajo de la coleccion, se reutiliza el icono de navegacion ya
existente con texto `Videos` y enlace a `/media/videos`.

## Nota sobre descripciones visibles

Aunque `PageShell` recibe la propiedad `description`, ese componente la renderiza
en una capa `sr-only` (accesible para lectores de pantalla, pero no visible).

Por ese motivo, en la pagina de detalle de videos se renderiza tambien la
descripcion de la coleccion como texto visible dentro del contenido principal.
Asi queda legible para el usuario sin romper la accesibilidad general.

## Archivos creados

- `docs/videos-collections.md`

## Archivos modificados

- `app/media/videos/page.tsx`
- `app/media/videos/[slug]/page.tsx`
- `components/media/video-collection-viewer.tsx`
- `lib/media/types.ts`
- `lib/media/video.ts`
- `lib/repositories/media.ts`
- `prisma/seed.ts`

## Migraciones y seed

- Migracion Prisma: no se creo (no hizo falta cambiar `schema.prisma`).
- Seed: si se actualizo para crear las 4 colecciones y sus videos.

## Error encontrado y solucion aplicada

Durante la prueba en `http://localhost:3000/media/videos` aparecia:

- "Mostrando 0 colecciones"
- "No hay colecciones de videos publicadas"

La causa no era el codigo de la pagina, sino los datos en base de datos:

- `VideoCollection`: 0 registros publicados
- `VideoItem`: 0 registros publicados

Para comprobarlo se hizo una consulta directa con Prisma al entorno local y se
confirmo que no habia datos de videos.

La solucion aplicada fue cargar las 4 colecciones y sus 13 videos con un script
idempotente usando `upsert` (sin borrar datos existentes de otras secciones).

Resultado despues de la carga:

- `publishedCollections`: 4
- `publishedVideos`: 13

Con esto la pagina `/media/videos` volvio a mostrar tarjetas y los detalles por
slug (`/media/videos/[slug]`) pasaron a funcionar correctamente.

Nota importante: no se ejecuto el seed completo destructivo para resolver esta
incidencia, porque ese seed limpia tablas al inicio. Se uso una carga puntual
de videos para no afectar el resto del contenido de la base de datos.

## Errores evitados

- No se inserta HTML de terceros con `dangerouslySetInnerHTML`.
- No se dependio de titulos para resolver rutas (se usa `slug`).
- No se cambiaron nombres de modelos o rutas existentes.
- Se corrigio el valor de `allow` en embeds para usar `picture-in-picture`.

## Como anadir una nueva coleccion

1. Crear la coleccion en `prisma/seed.ts` (o en tu panel/admin si lo tienes).
2. Definir `slug`, `title`, `description`, `coverImageUrl`, `sortOrder`.
3. Asociar sus videos en `VideoItem` con `videoCollectionId`.

## Como anadir un nuevo video

1. Crear un `VideoItem` con `title`, `slug`, `platform: YOUTUBE`, `videoUrl`,
   `sortOrder`.
2. Si es short, usar URL tipo `https://www.youtube.com/shorts/ID`.
3. Si es video normal, usar URL tipo `https://www.youtube.com/watch?v=ID`.

## Fuentes oficiales consultadas

- YouTube Embedded Players and Player Parameters:
  https://developers.google.com/youtube/player_parameters
- Next.js Dynamic Route Segments (App Router):
  https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes
- Prisma Relations:
  https://www.prisma.io/docs/orm/prisma-schema/data-model/relations
- Prisma Seeding:
  https://docs.prisma.io/docs/orm/prisma-migrate/workflows/seeding
