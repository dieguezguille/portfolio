---
title: Exa App
summary: A self-custodial wallet with a Visa card, on iOS, Android and the web. I lead its frontend team.
role: Head of frontend
team: Two in frontend
period:
  start: "2024-07"
stack: [TypeScript, React Native, Expo, Expo Router, Tamagui, TanStack Query, wagmi, viem, LI.FI, Account Kit, Hono]
links:
  live: https://exactly.app
  repo: https://github.com/exactly/exa
  ios: https://apps.apple.com/app/exa-app/id6572315454
  android: https://play.google.com/store/apps/details?id=app.exactly
metrics:
  - label: Volume processed by Exa
    value: US$17M+
  - label: My commits on main
    stat: commits
  - label: My merged pull requests
    stat: pulls
  - label: Mobile releases since November 2024
    stat: releases
screens:
  - image: ../../../assets/exa/home.png
    alt: The Exa App home, with the portfolio balance, the deposit, send, swap and borrow actions, and the card's pay mode set to pay now.
    caption: Home
  - image: ../../../assets/exa/swap.png
    alt: A swap of ETH for EXA, with the amount on each side, the exchange rate, the network cost, the fee and the maximum slippage.
    caption: Swap
  - image: ../../../assets/exa/swap-successful.png
    alt: The confirmation of a successful swap worth US$200.
    caption: Swap completed
  - image: ../../../assets/exa/stocks.png
    alt: The welcome to tokenized stocks, which invites people to invest in companies they know, such as Tesla, Apple and Meta.
    caption: Tokenized stocks
job: exa-labs
---

## Context

[Exa App](https://exactly.app) is a self-custodial wallet with a Visa card. People deposit crypto and earn yield on it, then spend with the card: they pay now from their balance, or split a purchase into up to nine fixed-rate installments borrowed against their own crypto, with no bank account or credit score. Exa Labs never holds their funds, and it neither issues the card nor lends: a licensed issuer issues the card under Visa, and the credit comes from the open-source lending markets of Exactly Protocol. The wallet is a smart contract account, so people sign in with a passkey instead of a seed phrase and the app pays their gas. It runs on OP Mainnet and on Base. One Expo codebase ships iOS, Android and the web, and a Hono server sits behind them. The monorepo is [public on GitHub](https://github.com/exactly/exa).

Since June 2026 I have led its frontend team. I joined in July 2024 as a senior frontend developer.

## Problem

Money in a self-custodial wallet lives across networks and assets. Every feature has to work for someone who never thinks about chains, gas or bridges, on a phone and in a browser, from the same code.

## Constraints

- The keys stay with the user, in their passkey, so the app has to prevent mistakes that nobody can undo afterwards.
- One codebase serves iOS, Android and the web.

## Approach

- **Core flows**: onboarding, card management, payments and portfolio, integrated with Exactly Protocol's on-chain markets for deposits, borrows and installment payments.
- **Server**: integrated identity verification through Persona with [card issuance](https://github.com/exactly/exa/commit/37df050c6355dec315cc9b42544a4036c9bf1b7a) and [card freezing](https://github.com/exactly/exa/commit/6ee1292d3e422d54607ab6f58fa511fac928d8b8), and [fixed a stale web HTML cache](https://github.com/exactly/exa/pull/1289) that served outdated pages.
- **Base launch**: shipped the app side of the Base network launch (token integration, bridging, swaps and funding flows) with the backend and smart contract teams.
- **Multi-chain swaps**: [implemented multi-chain swaps](https://github.com/exactly/exa/pull/1300), on top of [recovering assets sent on other networks](https://github.com/exactly/exa/pull/970) and [batched calls with `sendCalls`](https://github.com/exactly/exa/pull/879).
- **Send to any network**: [sending any asset to any network](https://github.com/exactly/exa/pull/1292), Bitcoin and Solana included, with the swap or bridge routed through LI.FI, and a [gas policy that pays bridge fees with the tokens already on that network](https://github.com/exactly/exa/pull/1020).
- **Tokenized stocks**: a [distinct interface for tokenized stocks](https://github.com/exactly/exa/pull/1322), the Coinbase-issued tokens on Base that track US shares and trade through swaps.
- **App shell**: [app routing](https://github.com/exactly/exa/pull/1238), [deep link entry](https://github.com/exactly/exa/pull/1243) and [support chat from any route](https://github.com/exactly/exa/pull/1260).
- **Quality**: extended the Maestro end-to-end tests for payment flows on iOS and Android and traced release blockers to their root cause, including bugs in third-party libraries. I [reported some of them upstream](https://github.com/reown-com/appkit-react-native/issues/496).

## Outcome

- **Three languages**: the app ships in English, Spanish and Portuguese since I set up its localization in May 2025.
- **Releases**: about one mobile release a week, since the first in November 2024.
