---
title: Exa App
summary: Una billetera autocustodiada con tarjeta Visa, en iOS, Android y web. Lidero su equipo de frontend.
role: Líder de frontend
team: Dos personas en frontend
period:
  start: "2024-07"
stack: [TypeScript, React Native, Expo, Expo Router, Tamagui, TanStack Query, wagmi, viem, LI.FI, Account Kit, Hono]
links:
  live: https://exactly.app
  repo: https://github.com/exactly/exa
  ios: https://apps.apple.com/app/exa-app/id6572315454
  android: https://play.google.com/store/apps/details?id=app.exactly
metrics:
  - label: Volumen procesado por Exa
    value: US$17M+
  - label: Mis commits en main
    stat: commits
  - label: Mis pull requests integrados
    stat: pulls
  - label: Releases móviles desde noviembre de 2024
    stat: releases
job: exa-labs
---

## Contexto

[Exa App](https://exactly.app) es una billetera autocustodiada con tarjeta Visa. Las personas depositan criptomonedas, que generan rendimiento, y gastan con la tarjeta: pagan en el momento con su saldo o dividen una compra en hasta nueve cuotas a tasa fija, con un préstamo respaldado por sus propias criptomonedas, sin cuenta bancaria ni historial crediticio. Exa Labs nunca tiene sus fondos, y no emite la tarjeta ni presta: la tarjeta la emite un emisor con licencia de Visa y el crédito sale de los mercados de préstamo de código abierto de Exactly Protocol. La billetera es una cuenta de contrato inteligente, así que se entra con una passkey en lugar de una frase semilla y la app paga el gas. Funciona en OP Mainnet y en Base. Un solo código en Expo se publica en iOS, Android y la web, con un servidor en Hono detrás. El monorepo es [público en GitHub](https://github.com/exactly/exa).

Desde junio de 2026 lidero su equipo de frontend. Entré en julio de 2024 como desarrollador frontend senior.

## Problema

El dinero de una billetera autocustodiada está repartido entre redes y activos. Cada funcionalidad tiene que servirle a alguien que nunca piensa en cadenas, gas ni puentes, en el teléfono y en el navegador, desde el mismo código.

## Restricciones

- Las claves quedan en manos del usuario, en su passkey, así que la app tiene que prevenir errores que después nadie puede deshacer.
- Un solo código para iOS, Android y la web.

## Enfoque

- **Flujos centrales**: alta de usuarios, gestión de la tarjeta, pagos y portfolio, integrados con los mercados on-chain de Exactly Protocol para depósitos, préstamos y pagos en cuotas.
- **Servidor**: integré la verificación de identidad de Persona con la [emisión de tarjetas](https://github.com/exactly/exa/commit/37df050c6355dec315cc9b42544a4036c9bf1b7a) y su [congelamiento](https://github.com/exactly/exa/commit/6ee1292d3e422d54607ab6f58fa511fac928d8b8), y [corregí una caché de HTML web desactualizada](https://github.com/exactly/exa/pull/1289) que servía páginas viejas.
- **Lanzamiento en Base**: preparé la app para el lanzamiento en la red Base (integración del token, puentes, swaps y flujos de fondeo) junto a los equipos de backend y de contratos.
- **Swaps entre redes**: [implementé swaps entre redes](https://github.com/exactly/exa/pull/1300), sobre la base de la [recuperación de activos enviados por otras redes](https://github.com/exactly/exa/pull/970) y de las [llamadas agrupadas con `sendCalls`](https://github.com/exactly/exa/pull/879).
- **Envíos a cualquier red**: [envío de cualquier activo a cualquier red](https://github.com/exactly/exa/pull/1292), Bitcoin y Solana incluidas, con el swap o el puente vía LI.FI, y una [política de gas que paga los puentes con los tokens que ya están en esa red](https://github.com/exactly/exa/pull/1020).
- **Acciones tokenizadas**: una [interfaz propia para las acciones tokenizadas](https://github.com/exactly/exa/pull/1322), los tokens de Coinbase en Base que siguen acciones de EE. UU. y se operan con swaps.
- **Estructura de la app**: [ruteo](https://github.com/exactly/exa/pull/1238), [entrada por deep links](https://github.com/exactly/exa/pull/1243) y [chat de soporte desde cualquier pantalla](https://github.com/exactly/exa/pull/1260).
- **Calidad**: amplié las pruebas end-to-end con Maestro de los flujos de pago en iOS y Android y rastreé bloqueos de release hasta su causa raíz, incluidos errores en librerías de terceros. [Reporté algunos a sus mantenedores](https://github.com/reown-com/appkit-react-native/issues/496).

## Resultado

- **Tres idiomas**: la app sale en inglés, español y portugués desde que armé su localización, en mayo de 2025.
- **Releases**: alrededor de una release móvil por semana, desde la primera, en noviembre de 2024.
