# Validaciones del registro de usuario

## 1. Resumen general

Se ha reforzado el registro de usuario para que las validaciones sean claras,
seguras y coherentes entre frontend y backend. El formulario valida antes de
enviar, muestra errores cerca de cada campo y repite las reglas criticas en la
server action `registerAction`.

El registro ahora cubre:

- Fecha de nacimiento obligatoria, real, no futura y con edad minima.
- Usuario obligatorio, unico y no demasiado parecido a usuarios existentes.
- Email obligatorio, valido y no duplicado en base de datos.
- Contrasena obligatoria con longitud minima, mayuscula, numero y caracter
  especial.
- Confirmacion obligatoria y exacta de la contrasena.
- Checkbox obligatorio de terminos y condiciones.
- Modal profesional de terminos y condiciones sin perder datos del formulario.
- Estado de carga y mensaje de exito antes de redirigir.

## 2. Archivos modificados

### `lib/validators/auth.ts`

Se centralizan las reglas con Zod y utilidades compartidas:

- Edad minima de registro: 16 anos.
- Parseo estricto de fechas `YYYY-MM-DD`.
- Validacion de fecha futura e invalida.
- Reglas de contrasena.
- Normalizacion de nombres de usuario para comparacion.
- Mensajes de error claros.
- Normalizacion segura de `redirectTo` para evitar redirecciones externas.

### `lib/auth/actions.ts`

Se refuerza la server action de registro:

- Valida el payload con `registerSchema`.
- Consulta Prisma para detectar email duplicado.
- Consulta Prisma para detectar username exacto o demasiado parecido.
- Devuelve errores por campo.
- Hashea la contrasena con `bcrypt`.
- Evita registrar contrasenas o payloads sensibles en logs.
- Mantiene la defensa `@unique` de Prisma para duplicados exactos.

### `components/auth/register-form.tsx`

Se mejora el formulario:

- Validacion frontend con el mismo `registerSchema`.
- `noValidate` para evitar mensajes nativos del navegador y usar errores visuales propios.
- Errores cerca del campo correspondiente.
- Icono de ojo en contrasena y confirmar contrasena.
- Checkbox obligatorio de terminos.
- Enlace clicable a terminos y condiciones.
- Mensaje de exito y redireccion tras alta correcta.
- Mantiene los datos cuando se abre/cierra el modal de terminos.

### `components/auth/terms-and-conditions-modal.tsx`

Nuevo modal de terminos:

- Header con titulo.
- Boton de cierre visible.
- Contenido largo con scroll.
- Estilo `sb-window`/`sb-titlebar` coherente con la estetica retro del proyecto.
- Trampa de foco basica y cierre con Escape.
- Secciones legales adaptadas a una web musical con tienda y multimedia.

### `components/auth/auth-modal.tsx`

Se ajusta el modal de autenticacion:

- Recalcula elementos focusables.
- No captura Escape/Tab cuando hay un modal anidado de terminos.
- Permite scroll interno para formularios largos.

### `components/auth/auth-submit-button.tsx`

Se anade prop opcional `disabled` para bloquear el boton tras registro correcto
mientras se redirige.

### `app/registro/page.tsx`

Se amplia el ancho maximo del panel de registro a `max-w-2xl` para que el
formulario profesional respire mejor en escritorio sin romper movil.

## 3. Validaciones implementadas

### Frontend

El formulario ejecuta `registerSchema.safeParse(...)` antes de enviar:

- Nombre y apellidos obligatorios con longitud minima.
- Fecha obligatoria, valida, no futura y edad minima.
- Pais obligatorio.
- Username obligatorio y con caracteres permitidos.
- Email obligatorio y con formato valido.
- Contrasena obligatoria con reglas de seguridad.
- Confirmacion obligatoria y coincidente.
- Terminos aceptados.

Si hay errores, se cancela el envio y se muestran mensajes junto al campo.

### Backend / server action

`registerAction` repite las validaciones con el mismo `registerSchema`:

- No depende del frontend.
- Protege contra peticiones manipuladas.
- Normaliza email y username.
- Hashea la contrasena antes de guardar.
- Devuelve errores estructurados por campo.

### Contra base de datos

La server action consulta el modelo `User` con Prisma y solo selecciona:

- `email`
- `username`

Con esos datos comprueba:

- Email duplicado ignorando mayusculas/minusculas.
- Username duplicado o demasiado parecido segun clave normalizada.

### Como se valida en esta app

El registro se valida en varias capas para combinar buena experiencia de usuario
con seguridad real:

1. El usuario escribe los datos en `components/auth/register-form.tsx`.
2. Al enviar, el formulario construye un objeto con los campos del formulario.
3. Ese objeto se valida en frontend con `registerSchema.safeParse(...)`.
4. Si hay errores, el envio se cancela con `event.preventDefault()` y los
   mensajes se muestran debajo del campo correspondiente.
5. Si el frontend no encuentra errores, el formulario llama a la server action
   `registerAction`.
6. `registerAction` vuelve a validar el mismo payload con `registerSchema`.
7. Despues consulta la base de datos con Prisma para comprobar email duplicado y
   nombres de usuario iguales o demasiado parecidos.
8. Si todo es correcto, se genera el hash de la contrasena con `bcrypt`, se crea
   el usuario, se crea el carrito y se inicia sesion.

Esta doble validacion es importante: el frontend ayuda al usuario a corregir
rapido, pero el backend es el que garantiza que nadie pueda saltarse las reglas
enviando una peticion manipulada.

### Que hace Zod en este proyecto

Zod es la libreria que define y ejecuta las reglas de validacion. En esta app se
usa como contrato comun entre frontend y backend.

En `lib/validators/auth.ts`, `registerSchema` define:

- que campos son obligatorios;
- que tipo o formato debe tener cada campo;
- que transformaciones se aplican, como pasar email y username a minusculas;
- que mensajes de error se muestran;
- validaciones personalizadas, como fecha real, edad minima y coincidencia de
  contrasenas.

La llamada `registerSchema.safeParse(payload)` no lanza una excepcion si hay
datos invalidos. Devuelve un resultado con esta forma:

- `success: true` si todo es valido;
- `success: false` si hay errores;
- `error.flatten().fieldErrors` con los mensajes agrupados por campo.

Gracias a eso, el formulario puede pintar errores como `fieldErrors.email` o
`fieldErrors.password` justo debajo del input correcto. La server action usa el
mismo mecanismo para devolver errores estructurados al formulario.

Zod no consulta la base de datos. Por eso las reglas de formato viven en Zod,
pero los duplicados de email y username se comprueban aparte con Prisma dentro
de `registerAction`.

## 4. Validacion del nombre de usuario

El username se normaliza con `normalizeUsernameForComparison`:

1. `trim()`
2. minusculas
3. eliminacion de acentos
4. eliminacion de todo lo que no sea letra o numero

Ejemplos que generan la misma clave:

- `JohnnyFunk`
- `johnnyfunk`
- `johnny_funk`
- `johnny-funk`
- `johnny.funk`

Todos se convierten en `johnnyfunk`, por lo que se bloquean como demasiado
parecidos.

Limitacion documentada: no se aplica distancia Levenshtein ni IA de similitud.
Por ejemplo, `johnnyfunk1` no se bloquea por parecido salvo que coincida su clave
normalizada. Se ha elegido esta solucion porque es sencilla, explicable y evita
falsos positivos para un TFC. Para una plataforma con miles de usuarios podria
anadirse en Prisma un campo `usernameNormalized` con indice unico.

## 5. Validacion de contrasena

Reglas aplicadas:

- Obligatoria.
- Minimo 8 caracteres.
- Al menos una letra mayuscula.
- Al menos un numero.
- Al menos un caracter especial.

Mensajes:

- `La contraseña es obligatoria.`
- `La contraseña debe tener al menos 8 caracteres.`
- `Debe incluir al menos una letra mayúscula.`
- `Debe incluir al menos un número.`
- `Debe incluir al menos un carácter especial.`
- `Las contraseñas no coinciden.`

La contrasena no se escribe en logs. En backend solo se usa para generar el hash
con `bcrypt.hash(..., 12)` y se guarda en `passwordHash`, no en texto plano.

## 6. Modal de terminos y condiciones

El texto `terminos y condiciones` abre `TermsAndConditionsModal`.

Funcionamiento:

- El formulario sigue montado debajo del modal.
- Los inputs no se reinician.
- Al cerrar, se vuelve al registro con los datos intactos.
- El modal tiene header, cierre con X, cierre por fondo, cierre por Escape,
  scroll interno y boton `Volver al registro`.

Incluye estas secciones:

- Introduccion.
- Objeto de la plataforma.
- Registro de usuario.
- Uso permitido de la web.
- Compras, pagos y pedidos.
- Productos fisicos y digitales.
- Contenido multimedia.
- Propiedad intelectual.
- Proteccion de datos.
- Responsabilidad del usuario.
- Limitacion de responsabilidad.
- Modificaciones de los terminos.
- Contacto.

## 7. Cambios de base de datos

No se ha tocado Prisma.

- No se modifica `schema.prisma`.
- No se crea ninguna tabla nueva.
- No hace falta ejecutar migracion.
- Se reutiliza el modelo `User` existente con `email`, `username`,
  `passwordHash`, `birthDate` y `termsAcceptedAt`.

Comando de migracion: no aplica.

## 8. Errores encontrados

Durante la implementacion aparecieron errores de entorno y tambien problemas de
integracion propios del registro y del modal de terminos. Se resolvieron sin
cambiar rutas ni tocar el schema de Prisma.

| Error encontrado | Parte afectada | Causa probable | Solucion aplicada | Estado |
|---|---|---|---|---|
| `npm.ps1` bloqueado por politica de ejecucion | Verificacion | PowerShell no permite ejecutar scripts `.ps1` | Se uso `npm.cmd run lint` | Resuelto |
| Build sin red no pudo descargar Google Font | `next build` | Sandbox sin acceso a Google Fonts | Se repitio `npm.cmd run build` con permiso de red | Resuelto |
| Script inline interpreto `$disconnect` | Prueba Prisma | PowerShell expandio `$disconnect` | Se cambio la estrategia de prueba | Resuelto |
| `server-only` no disponible en script suelto | Prueba Prisma | `lib/db.ts` esta pensado para Next/server | Se instancio Prisma directo con `@next/env` | Resuelto |
| El formulario dependia demasiado de validaciones nativas del navegador | Registro frontend | Los mensajes nativos no siguen el estilo del proyecto ni son faciles de controlar | Se anadio `noValidate` y validacion visual con Zod | Resuelto |
| Habia que evitar que el modal de terminos cerrase o rompiese el modal de registro | Modal de terminos | El registro puede vivir dentro de `AuthModal`, y un modal anidado puede interferir con Escape/Tab | Se marco el modal anidado con `data-auth-nested-modal` y `AuthModal` ignora Escape/Tab mientras esta abierto | Resuelto |
| El formulario de registro crecio y podia no caber bien en modal | UI registro | Nuevos campos, mensajes e informacion legal ocupan mas altura | Se anadio scroll interno al modal de autenticacion | Resuelto |
| El boton de terminos podia enviar el formulario si no se declaraba el tipo | Checkbox de terminos | En HTML, un `button` dentro de un formulario puede actuar como submit por defecto | Se uso `type="button"` en el enlace visual de terminos y en botones del modal | Resuelto |
| Era necesario mostrar exito sin perder el control del formulario | Registro correcto | La action anterior redirigia directamente y no habia estado visual de exito | La action devuelve `status: "success"` y el formulario redirige despues de mostrar mensaje | Resuelto |
| La validacion de username parecido no podia depender solo de `@unique` | Registro backend | Prisma solo bloquea coincidencias exactas del campo `username` | Se anadio consulta a `User` y comparacion normalizada con `normalizeUsernameForComparison` | Resuelto |

## 9. Pruebas realizadas

| Caso probado | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|
| Registro correcto | Schema acepta datos validos | `OK` | OK |
| Fecha vacia | Error de fecha obligatoria | Error en `birthDate` | OK |
| Fecha invalida | Error de fecha valida | Error en `birthDate` | OK |
| Fecha futura | Error de fecha futura | Error en `birthDate` | OK |
| Usuario existente | Detectable contra BBDD | Consulta BBDD OK y comparacion true | OK |
| Usuario demasiado parecido | Detecta variantes `._-` y mayusculas | `true` para todos los ejemplos | OK |
| Email invalido | Error de formato | Error en `email` | OK |
| Email ya registrado | Detectable contra BBDD | Consulta BBDD OK | OK |
| Contrasena con menos de 8 caracteres | Error de longitud | Error en `password` | OK |
| Contrasena sin mayuscula | Error de mayuscula | Error en `password` | OK |
| Contrasena sin numero | Error de numero | Error en `password` | OK |
| Contrasena sin caracter especial | Error de caracter especial | Error en `password` | OK |
| Confirmar contrasena vacia | Error de confirmacion | Error en `confirmPassword` | OK |
| Confirmar contrasena diferente | Error de coincidencia | Error en `confirmPassword` | OK |
| Checkbox sin aceptar | Error de terminos | Error en `acceptTerms` | OK |
| Abrir modal de terminos | Boton `type=button` abre modal | Implementado y compilado | OK |
| Cerrar modal y volver al registro | No se desmonta el formulario | Implementado y compilado | OK |
| Mostrar contrasena | Cambia a `type=\"text\"` | Implementado y compilado | OK |
| Ocultar contrasena | Cambia a `type=\"password\"` | Implementado y compilado | OK |
| Carga de `/registro` | La ruta responde en local | HTTP 200 en `http://127.0.0.1:3000/registro` | OK |
| Responsive movil/escritorio | Layout fluido con scroll | Build OK; pendiente de revision visual final en navegador real | Pendiente visual |

Comandos ejecutados:

```bash
npm.cmd run lint
npm.cmd run build
```

Tambien se ejecuto una prueba con `tsx` para validar reglas de Zod y otra
consulta read-only a Prisma para verificar acceso a `email` y `username`. La
ruta `/registro` se comprobo en servidor local con respuesta HTTP 200.

## 10. Explicacion para defender en el TFC

Estas validaciones son necesarias porque el registro es una entrada critica de
datos a la aplicacion. Si se validara solo en el navegador, un usuario podria
saltarse las reglas enviando una peticion manipulada. Por eso se valida dos
veces: primero en frontend para mejorar la experiencia de usuario y despues en
backend para garantizar seguridad.

El email y el nombre de usuario se consultan en base de datos porque no basta
con comprobar formato. El sistema debe saber si ya existen cuentas registradas.
En el caso del username, ademas se normaliza el texto para bloquear pequenas
variaciones como mayusculas, guiones, puntos o guiones bajos.

La contrasena nunca se guarda en claro. Se valida la fortaleza minima y despues
se guarda un hash generado con bcrypt. Asi, aunque alguien accediera a la base
de datos, no podria leer directamente las contrasenas.

El modal de terminos y condiciones mejora la transparencia legal sin sacar al
usuario del registro. Como se abre encima del formulario, los datos introducidos
se conservan y la experiencia resulta mas fluida.

Visualmente se mantiene la identidad de Sugarbay: ventanas `sb-window`, barra
`sb-titlebar`, colores neon, bordes y sombras ya usados en el proyecto. La
solucion no cambia rutas ni el modelo de datos, por lo que encaja con la
arquitectura existente y es facil de explicar.
