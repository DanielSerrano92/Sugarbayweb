# Proceso de resolucion de conflictos del merge con main

## Contexto

Se reviso el estado del proyecto tras el merge de `sugar/main` en la rama
`daniel`.

Commit de merge identificado:

```bash
3d2d2a4 Merge remote-tracking branch 'sugar/main' into daniel
```

El estado inicial no mostraba conflictos abiertos para Git:

```bash
git diff --name-only --diff-filter=U
```

Resultado: sin archivos en estado `U`.

Sin embargo, al revisar los archivos tocados por el merge y ejecutar validacion,
se detectaron artefactos tipicos de una resolucion manual incompleta:

- imports duplicados,
- funciones duplicadas,
- props JSX duplicadas,
- bloques JSX repetidos,
- constantes repetidas,
- estructura JSX desbalanceada.

Esto significa que Git ya consideraba el merge resuelto, pero el codigo final no
era todavia valido.

## Archivos afectados

Los artefactos de merge se encontraron en:

- `components/layout/header-client.tsx`
- `components/concerts/concert-cards-client.tsx`
- `components/concerts/concert-filters.tsx`
- `components/concerts/concert-pagination.tsx`
- `components/concerts/concerts-catalog-page.tsx`

## Error detectado

Al ejecutar TypeScript:

```bash
npx.cmd tsc --noEmit
```

aparecieron errores de JSX roto en `components/concerts/concert-cards-client.tsx`,
por ejemplo:

```text
JSX fragment has no corresponding closing tag
JSX element 'div' has no corresponding closing tag
Expected corresponding JSX closing tag for 'div'
```

Al ejecutar ESLint:

```bash
npm.cmd run lint
```

aparecio un error de parseo:

```text
components/concerts/concert-cards-client.tsx
Parsing error: Expected corresponding JSX closing tag for 'div'
```

Tambien aparecieron avisos relacionados con imports no usados o duplicaciones
que venian del mismo problema de merge.

## Diagnostico

Se reviso el merge commit con:

```bash
git show --stat --oneline --decorate HEAD
git show --cc --name-status --oneline HEAD
git show --cc -- components/layout/header-client.tsx
git show --cc -- components/concerts/concert-cards-client.tsx
```

Esto permitio ver que el merge habia mezclado partes de la rama local y de
`main`, pero algunas zonas quedaron duplicadas.

Ejemplos encontrados:

### 1. Funcion duplicada en el header

En `components/layout/header-client.tsx` aparecia dos veces la funcion
`UserIcon`.

Antes:

```tsx
function UserIcon() {
  return (
    <svg>
      ...
    </svg>
  );
}

function UserIcon() {
  return (
    <svg>
      ...
    </svg>
  );
}
```

Solucion:

```tsx
function UserIcon() {
  return (
    <svg>
      ...
    </svg>
  );
}
```

### 2. JSX duplicado en tarjetas de conciertos

En `components/concerts/concert-cards-client.tsx` habia bloques repetidos:

- dos wrappers de grid seguidos,
- dos `className` en el mismo `article`,
- cabecera de concierto repetida,
- cuerpo de tarjeta repetido,
- enlace a Google Maps repetido,
- descripcion repetida,
- bloque de acciones repetido,
- props `className` repetidas en modal y botones.

Antes:

```tsx
<div className="grid ...">
<div className="grid ...">
  <article
    key={concert.id}
    className="retro-concert-card ..."
    className="retro-concert-card ..."
  >
```

Despues:

```tsx
<div className="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
  {concerts.map((concert) => (
    <article
      key={concert.id}
      className="retro-concert-card w-full max-w-[280px] overflow-hidden"
    >
```

### 3. Directiva e imports duplicados en filtros

En `components/concerts/concert-filters.tsx` habia una doble directiva
`"use client"` y doble import de React.

Antes:

```tsx
"use client";

import { useEffect, useState } from "react";
"use client";

import { useEffect, useState } from "react";
```

Despues:

```tsx
"use client";

import { useEffect, useState } from "react";
```

Tambien habia dos veces `mode = "panel"` en la destructuracion de props.

### 4. Constantes duplicadas en paginacion

En `components/concerts/concert-pagination.tsx` habia doble import de
`Fragment` y calculos duplicados de `nextPage` y `visiblePages`.

Antes:

```tsx
import { Fragment } from "react";
import { Fragment } from "react";

const nextPage = Math.min(effectiveTotalPages, currentPage + 1);
const visiblePages = getVisiblePages(currentPage, effectiveTotalPages);
const nextPage = Math.min(effectiveTotalPages, currentPage + 1);
const visiblePages = getVisiblePages(currentPage, effectiveTotalPages);
```

Despues:

```tsx
import { Fragment } from "react";

const nextPage = Math.min(effectiveTotalPages, currentPage + 1);
const visiblePages = getVisiblePages(currentPage, effectiveTotalPages);
```

### 5. Imports duplicados en pagina de catalogo de conciertos

En `components/concerts/concerts-catalog-page.tsx` quedo un import no usado de
`next/link` y un import duplicado de `getConcertCatalog`.

Antes:

```tsx
import Link from "next/link";
import { getConcertCatalog } from "@/lib/repositories/concerts";
import { getConcertCatalog } from "@/lib/repositories/concerts";
```

Despues:

```tsx
import { getConcertCatalog } from "@/lib/repositories/concerts";
```

## Criterio de resolucion

La resolucion se hizo con estos criterios:

1. Mantener las funcionalidades existentes de la rama `daniel`.
2. Conservar las integraciones que venian de `main` cuando no rompian el flujo.
3. Eliminar solo duplicaciones mecanicas del merge.
4. No reescribir el comportamiento de conciertos, filtros, paginacion ni header.
5. Validar con ESLint y TypeScript despues de limpiar.

## Cambios aplicados

Se eliminaron artefactos duplicados en:

- `components/layout/header-client.tsx`
  - Se dejo una sola definicion de `UserIcon`.

- `components/concerts/concert-cards-client.tsx`
  - Se dejo un solo grid.
  - Se dejo un solo `article` con un solo `className`.
  - Se dejo una sola cabecera por tarjeta.
  - Se dejo un solo cuerpo de tarjeta.
  - Se dejo un solo enlace de ubicacion.
  - Se dejo una sola descripcion.
  - Se dejo un solo bloque de acciones.
  - Se dejo una sola `className` por elemento JSX.

- `components/concerts/concert-filters.tsx`
  - Se dejo una sola directiva `"use client"`.
  - Se dejo un solo import de `useEffect` y `useState`.
  - Se dejo una sola asignacion por defecto de `mode = "panel"`.

- `components/concerts/concert-pagination.tsx`
  - Se dejo un solo import de `Fragment`.
  - Se dejaron calculos unicos de `nextPage` y `visiblePages`.
  - Se eliminaron flechas duplicadas visualmente.

- `components/concerts/concerts-catalog-page.tsx`
  - Se elimino el import no usado de `Link`.
  - Se elimino el import duplicado de `getConcertCatalog`.

## Validacion final

Despues de limpiar los artefactos del merge, se ejecutaron:

```bash
npx.cmd tsc --noEmit
npm.cmd run lint
git diff --check
```

Resultado:

- TypeScript sin errores.
- ESLint sin errores.
- `git diff --check` sin errores de espacios o formato invalido.

## Resumen

El problema no era un conflicto activo para Git, sino una resolucion incompleta
del contenido resultante del merge. Git ya habia cerrado el merge, pero quedaron
fragmentos duplicados de ambas ramas dentro de los mismos archivos.

La solucion consistio en:

1. Identificar el merge commit.
2. Revisar los archivos mezclados con `git show --cc`.
3. Ejecutar TypeScript y ESLint para detectar errores reales.
4. Limpiar duplicaciones mecanicas sin cambiar funcionalidades.
5. Revalidar el proyecto hasta dejarlo compilable.
