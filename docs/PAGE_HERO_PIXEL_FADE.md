# Ajuste final PageHero y background (version que funciona)

## Objetivo

Corregir la visualizacion del hero y del bloque de background para que:

1. El `PageHero` se vea correctamente con la imagen indicada.
2. El background de la pagina empiece justo despues del hero.
3. No haya huecos ni solapamiento visual entre ambos bloques.

## Archivos modificados

- `components/ui/page-hero.tsx`
- `app/page.tsx`

---

## Cambios realizados

### 1) `components/ui/page-hero.tsx`

Se hicieron 3 cambios clave en la imagen del hero:

```tsx
<section>
  <div
    className="relative block w-screen overflow-hidden"
    style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
  >
    <Image
      src="https://ik.imagekit.io/gq1enkszp/fotos/proximos.png?updatedAt=1777405652441"
      alt={`Hero ${title}`}
      width={2400}
      height={760}
      priority
      sizes="100vw"
      unoptimized
      className="block h-auto w-full"
    />
  </div>
</section>
```

Que se cambio respecto a la version anterior:

- Se elimino el margen negativo del wrapper (`-mt-6 lg:-mt-10`).
- Se uso la URL directa de la imagen (sin `tr=...`).
- Se activo `unoptimized` en `next/image`.

---

### 2) `app/page.tsx`

Se consolido la estructura en dos bloques consecutivos dentro de un solo contenedor:

```tsx
<div className="space-y-0">
  <PageHero ... />

  <section
    className="relative w-screen"
    style={{
      marginLeft: "calc(50% - 50vw)",
      marginRight: "calc(50% - 50vw)",
      backgroundColor: "var(--sb-bg-main)",
      backgroundImage: "url('https://ik.imagekit.io/gq1enkszp/fotos/background.png')",
      backgroundPosition: "top center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "100% auto",
    }}
  >
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 lg:px-8 lg:py-8">
      {/* contenido */}
    </div>
  </section>
</div>
```

Que se cambio:

- Se mantiene `PageHero` primero.
- Justo despues empieza la `section` con la imagen de background.
- Todo el contenido principal vive dentro de esa `section`.
- `space-y-0` evita separacion vertical entre hero y bloque de background.

---

## Por que esta version funciona

- Al quitar el margen negativo del hero, se evita desplazarlo y crear una union visual inconsistente.
- Al usar la URL directa en `src`, se elimina la dependencia de transformaciones de recorte anteriores (`tr=..., cm-extract...`).
- `unoptimized` evita pasar por el pipeline de optimizacion de Next para ese asset remoto concreto.
- El layout final queda en 2 bloques consecutivos (`Hero` + `Background section`) y sin hueco entre ambos.

---

## Validacion

Comando ejecutado:

```bash
npm.cmd run lint
```

Resultado: sin errores de ESLint.

---

## Fuentes

Fuentes oficiales usadas para decidir e implementar el ajuste:

- Next.js `Image` component (props `src`, `priority`, `sizes`, `unoptimized`, uso de URLs remotas):  
  https://nextjs.org/docs/app/api-reference/components/image
- Next.js `images.remotePatterns` (permitir dominios remotos en `next.config`):  
  https://nextjs.org/docs/pages/api-reference/components/image#remotepatterns
- Tailwind spacing utilities (`space-y-*`) y separacion entre hijos:  
  https://tailwindcss.com/docs/space
- CSS `background-size` (uso de `100% auto`) en MDN:  
  https://developer.mozilla.org/en-US/docs/Web/CSS/background-size

## Nota

La configuracion de `next.config.ts` ya incluye `ik.imagekit.io` en `remotePatterns`, por eso no hizo falta tocar esa parte para este ajuste final.
