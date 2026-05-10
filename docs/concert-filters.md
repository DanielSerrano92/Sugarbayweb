# Filtros de conciertos por continente y pais

Se ha mejorado el sistema de filtros de la seccion de conciertos para que el
selector de paises dependa del continente seleccionado.

Antes, el usuario podia seleccionar cualquier pais independientemente del
continente elegido. Esto podia generar combinaciones poco coherentes, como
seleccionar Europa y despues un pais de Asia.

Ahora, cuando el usuario selecciona un continente, el filtro de paises muestra
unicamente los paises pertenecientes a ese continente.

## Funcionamiento

Si el usuario selecciona un continente concreto, por ejemplo Europa, el selector
de paises muestra solo paises europeos como Espana, Francia, Alemania, Reino
Unido, Italia o Portugal.

Si el usuario selecciona "Todos los continentes", el selector de paises muestra
todos los paises disponibles.

La relacion entre continentes y paises esta definida en
`lib/concerts/locations.ts` mediante la constante `COUNTRIES_BY_CONTINENT`.
Cada pais se guarda con un codigo ISO corto, como `ES`, `FR` o `JP`, porque la
base de datos de conciertos ya utiliza codigos de pais.

## Reinicio del pais seleccionado

Cuando el usuario cambia de continente, se comprueba si el pais seleccionado
pertenece al nuevo continente.

Si el pais seleccionado no pertenece al continente seleccionado, el filtro de
pais se reinicia automaticamente a "Todos los paises".

Esto evita combinaciones incorrectas entre continente y pais.

Ejemplo:

1. Continente seleccionado: Europa.
2. Pais seleccionado: Espana.
3. El usuario cambia el continente a Asia.
4. Como Espana no pertenece a Asia, el pais vuelve a "Todos los paises".

## Paises incluidos

No se han incluido todos los paises del mundo, sino una seleccion de paises
relevantes para giras y conciertos musicales.

Los paises se agrupan por continente para mantener el codigo mas claro y
facilitar futuras ampliaciones.

Paises incluidos:

- Europa: Espana, Francia, Alemania, Reino Unido, Italia, Portugal, Paises
  Bajos, Belgica, Irlanda y Suecia.
- Norteamerica: Estados Unidos, Canada y Mexico.
- Sudamerica: Argentina, Chile, Colombia, Brasil y Peru.
- Asia: Japon, Corea del Sur, China, India, Tailandia y Singapur.
- Oceania: Australia y Nueva Zelanda.
- Africa: Sudafrica, Marruecos y Egipto.

## Aplicacion en la web

Esta logica se aplica tanto a la seccion de proximos conciertos como a la
seccion de conciertos anteriores.

De esta forma, ambas secciones comparten un comportamiento coherente y mas facil
de usar para el usuario.

## Archivos modificados

- `lib/concerts/locations.ts`: contiene la estructura
  `COUNTRIES_BY_CONTINENT` y las funciones para obtener paises por continente.
- `components/concerts/concert-filters.tsx`: actualiza el selector de paises
  cuando cambia el continente y reinicia el pais si ya no corresponde.
- `components/concerts/concerts-catalog-page.tsx`: usa el filtro compartido en
  proximos conciertos y conciertos anteriores.
- `lib/concerts/types.ts`: elimina del resultado del catalogo la lista antigua
  de paises disponibles que ya no necesita el componente.
- `lib/repositories/concerts.ts`: deja de hacer la consulta extra para construir
  esa lista antigua de paises.
