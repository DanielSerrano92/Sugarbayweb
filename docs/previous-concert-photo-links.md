# Enlace entre conciertos anteriores y albumes de fotos

Se ha anadido una relacion entre las tarjetas de conciertos anteriores y los
albumes de fotos de la seccion `media/photos`.

El objetivo es que, cuando el usuario pulse el boton "Fotos" en un concierto
anterior, la aplicacion le lleve directamente al detalle del album de fotos
correspondiente.

## Revision de Prisma

Antes de aplicar el cambio, se reviso `prisma/schema.prisma`.

Los modelos implicados son:

- `Concert`: guarda los conciertos y eventos.
- `PhotoAlbum`: guarda los albumes de fotos.
- `Photo`: guarda cada foto y ya tiene una relacion con `PhotoAlbum` mediante
  `photoAlbumId`.

El schema actual no tiene una relacion directa entre `Concert` y `PhotoAlbum`.
Por eso no se ha cambiado el modelo de datos ni se ha creado una migracion. La
solucion usa un identificador estable que ya existe: el `slug` del album de
fotos.

## Motivo del cambio

Antes, el boton "Fotos" de conciertos anteriores podia llevar a una imagen
individual o quedar desconectado del album concreto del concierto.

Ahora, el concierto puede indicar que album de fotos tiene asociado mediante
`photoAlbumSlug`.

## Relacion mediante identificador

Aunque el concierto y el album puedan tener el mismo titulo, no es recomendable
relacionarlos comparando texto.

El titulo puede cambiar, puede contener acentos, espacios o incluso repetirse en
mas de un concierto.

Por ese motivo se usa el `slug` del album:

```ts
photoAlbumSlug: "sugarbay-sunset-session-barcelona-gallery"
```

Ese valor se define en `lib/concerts/content.ts`, dentro del contenido extra del
concierto `sugarbay-barcelona-closing-night-2025`.

Durante la carga de conciertos anteriores, `lib/repositories/concerts.ts`
comprueba que ese `slug` existe entre los albumes publicados cargados desde
Prisma. Si existe, genera la ruta interna del detalle.

## Navegacion

Cuando el usuario pulsa el boton "Fotos", la aplicacion genera esta ruta:

```txt
/media/photos/sugarbay-sunset-session-barcelona-gallery
```

Esa es la ruta real del proyecto, definida por:

```txt
app/media/photos/[slug]/page.tsx
```

## Conciertos sin fotos asociadas

Si un concierto anterior no tiene `photoAlbumSlug`, o si el `slug` indicado no
existe entre los albumes publicados, el boton "Fotos" se muestra deshabilitado.

Se ha elegido esta opcion porque mantiene la logica visual que ya tenia el
proyecto: cuando no hay destino disponible, la accion aparece sin enlace y con
opacidad reducida.

## Migracion y seed

No se ha creado migracion porque no se ha anadido ningun campo nuevo a
`prisma/schema.prisma`.

Si en el futuro se quisiera una relacion totalmente gestionada por base de
datos, se podria anadir una relacion entre `Concert` y `PhotoAlbum`, por ejemplo
con `photoAlbumId`. En ese caso si haria falta crear una migracion de Prisma.

El seed se ha actualizado para que el album demo de Barcelona tenga el titulo:

```txt
Sugarbay Sunset Session Barcelona
```

El `slug` del album se mantiene estable:

```txt
sugarbay-sunset-session-barcelona-gallery
```

## Archivos modificados

- `lib/concerts/content.ts`: anade `photoAlbumSlug` al concierto anterior de
  Barcelona.
- `lib/concerts/types.ts`: anade `photoAlbumSlug` y `photoAlbumHref` al detalle
  de conciertos anteriores.
- `lib/repositories/concerts.ts`: valida el `photoAlbumSlug` contra los albumes
  publicados y genera `/media/photos/${slug}`.
- `components/concerts/concert-cards-client.tsx`: el boton "Fotos" usa la ruta
  interna del album.
- `prisma/seed.ts`: actualiza el titulo del album demo de Barcelona.

## Como anadir nuevos enlaces en el futuro

Para enlazar otro concierto anterior con su album de fotos:

1. Crear o identificar el album en `media/photos`.
2. Copiar su `slug`.
3. Ir a `lib/concerts/content.ts`.
4. Buscar el contenido extra del concierto por su `slug`.
5. Anadir `photoAlbumSlug` con el `slug` del album.

Ejemplo:

```ts
"sugarbay-barcelona-closing-night-2025": {
  photoAlbumSlug: "sugarbay-sunset-session-barcelona-gallery",
}
```

Despues, el boton "Fotos" llevara directamente al detalle del album.
