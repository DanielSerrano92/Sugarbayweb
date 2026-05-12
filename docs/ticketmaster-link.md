# Enlace de compra en Ticketmaster

En la seccion de proximos conciertos, el boton "Comprar" redirige al usuario a
Ticketmaster realizando una busqueda del grupo Sugarbay.

URL utilizada:

```txt
https://www.ticketmaster.es/search?q=Sugarbay
```

Al tratarse de una aplicacion de demostracion para clase, los conciertos de
Sugarbay no existen realmente en Ticketmaster. Por ese motivo, no se utiliza una
URL especifica de un evento real, sino una busqueda por el nombre del grupo.

## Funcionamiento

Cuando el usuario pulsa el boton "Comprar", se abre Ticketmaster en una nueva
pestana con la busqueda de "Sugarbay". Esto simula la integracion con una
plataforma externa de venta de entradas.

El enlace se implementa como enlace externo:

```tsx
<a
  href="https://www.ticketmaster.es/search?q=Sugarbay"
  target="_blank"
  rel="noopener noreferrer"
>
  Comprar
</a>
```

## Caso real con conciertos publicados

Si Sugarbay tuviese conciertos reales publicados en Ticketmaster, cada concierto
tendria su propia pagina de evento dentro de Ticketmaster. En ese caso, no se
usaria la URL de busqueda general, sino la URL concreta del evento.

Ejemplo:

```txt
https://www.ticketmaster.es/event/ID_DEL_EVENTO
```

En la aplicacion, lo recomendable seria guardar esa URL en los datos del
concierto mediante un campo como `ticketUrl`.

Ejemplo:

```ts
const concert = {
  id: 1,
  title: "Sugarbay Live Madrid",
  city: "Madrid",
  venue: "Sala El Sol",
  date: "2026-06-20",
  ticketUrl: "https://www.ticketmaster.es/event/ID_DEL_EVENTO",
};
```

Y el boton "Comprar" usaria ese campo:

```tsx
<a
  href={concert.ticketUrl}
  target="_blank"
  rel="noopener noreferrer"
>
  Comprar
</a>
```

De esta forma, cada tarjeta de concierto podria llevar directamente a su evento
real de Ticketmaster.

## Como obtener el ID real de un evento

Ticketmaster documenta su Discovery API como la forma de buscar eventos,
atracciones y recintos. Para consultar la API hace falta una API key y la raiz
oficial es:

```txt
https://app.ticketmaster.com/discovery/v2/
```

Para encontrar eventos se usa el endpoint de busqueda:

```txt
GET https://app.ticketmaster.com/discovery/v2/events.json?keyword=Sugarbay&apikey=TU_API_KEY
```

En la respuesta, cada evento incluye un campo `id` y un campo `url`. El `id` es
el identificador unico del evento en la Discovery API, y `url` es la pagina web
del evento que se puede usar para comprar entradas.

Ticketmaster tambien documenta el endpoint de detalle de evento:

```txt
GET https://app.ticketmaster.com/discovery/v2/events/{id}.json?apikey=TU_API_KEY
```

Ese endpoint recibe el `id` del evento y devuelve detalles del evento, incluyendo
la URL web de Ticketmaster para comprar entradas.

Fuentes oficiales:

- Ticketmaster Discovery API: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
- En esa documentacion estan las secciones oficiales `Event Search` y
  `Get Event Details`, donde se explica que `/discovery/v2/events` sirve para
  buscar eventos y que `/discovery/v2/events/{id}` usa el identificador unico
  del evento para obtener sus detalles y la URL web de Ticketmaster.
