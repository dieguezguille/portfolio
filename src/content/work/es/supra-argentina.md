---
# cspell:ignore fuzzystrmatch unaccent
title: Supra Argentina
summary: Un sistema de inventario para una constructora, en desarrollo. Registra cada movimiento de materiales en el lugar donde ocurre. Soy su único desarrollador.
highlights:
  - Construyo el sistema de inventario de una constructora, en desarrollo, que registra cada movimiento donde ocurre.
  - Relevo cada flujo con la gente de Supra y valido los diagramas con ellos antes de construirlo.
role: Único desarrollador
period:
  start: "2026-03"
stack: [Next.js, TypeScript, Supabase, Postgres, Drizzle, shadcn/ui, TanStack Table, Valibot, Sentry]
---

## Contexto

Supra Argentina es una constructora. Sus materiales se mueven entre depósitos y obras, y los jefes de obra piden lo que cada obra necesita. Desde marzo de 2026 soy el único desarrollador del sistema que registra todo eso: inventario, movimientos, pedidos, compras directas y permisos.

## Problema

Saber qué hay y dónde solo funciona si quien mueve el material registra cada movimiento en el momento, en la obra y no en una oficina. Cada registro además tiene que decir quién lo hizo, qué movió y a qué pedido responde.

## Restricciones

- Los operarios registran movimientos en un dispositivo de cada ubicación, sin escribir credenciales, y aun así cada movimiento tiene que quedar asociado a una persona.
- Los permisos tienen dos ejes: el rol define qué acciones se permiten y las ubicaciones asignadas definen dónde.

## Enfoque

- **Primero, documentación**: me reúno con la gente de Supra que lleva adelante cada flujo para relevarlo, paso a diagramas el modelo de datos y cada flujo (movimientos, pedidos, compras directas, sesiones y permisos) y los valido con ellos antes de construir. Mantengo los diagramas al día.
- **Punto de venta**: un asistente de cinco pasos (origen, ítems, destino, confirmación y comprobante) que solo lista ítems con stock en el origen y valida el stock antes de confirmar.
- **Dos tipos de sesión**: una sesión de ubicación vincula un dispositivo a un lugar, y el operario se identifica con un patrón o un token de acceso. Quien trabaja en una oficina entra con email y contraseña.
- **Pedidos**: el estado vive en cada ítem del pedido, y el estado del pedido se deriva, nunca se guarda. Lo que cada rol puede editar depende de ese estado.
- **Compras directas**: el material comprado fuera de los proveedores habituales entra desde una ubicación virtual, y el sistema ofrece vincularlo con pedidos abiertos para el mismo destino.
- **Búsqueda**: `unaccent` y `fuzzystrmatch` de Postgres, más alias por ítem, para encontrar el mismo material se escriba como se escriba.

## Resultado

Desde marzo de 2026: 242 commits, 8 migraciones de base de datos y 7 documentos de diseño con diagramas.
