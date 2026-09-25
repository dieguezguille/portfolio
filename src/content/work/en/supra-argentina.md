---
# cspell:ignore fuzzystrmatch unaccent
title: Supra Argentina
summary: An inventory system for a construction company, in development. It records each movement of materials where it happens. I am its sole developer.
highlights:
  - Build a construction company's inventory system, in development, that records movements where they happen.
  - Map each flow with the people at Supra and validate the diagrams with them before building it.
role: Sole developer
period:
  start: "2026-03"
stack: [Next.js, TypeScript, Supabase, Postgres, Drizzle, shadcn/ui, TanStack Table, Valibot, Sentry]
---

## Context

Supra Argentina is a construction company. Its materials move between warehouses and building sites, and site managers order what each site needs. Since March 2026 I have been the sole developer of the system that records all of it: inventory, movements, orders, direct purchases and permissions.

## Problem

Knowing what is where only works if whoever moves the material records every movement at the moment it happens, on site and not at a desk. Each record also has to say who made it, what it moved and which order it serves.

## Constraints

- Operators record movements on a device at each location, without typing credentials, and every movement still has to be traced to a person.
- Permissions have two axes: a role defines the allowed actions and the assigned locations define where they apply.

## Approach

- **Documentation first**: I meet with the people at Supra who run each flow to map it, put the data model and every flow (movements, orders, direct purchases, sessions, permissions) into diagrams, and validate them with those people before building. I keep the diagrams up to date.
- **Point of sale**: a five-step wizard (origin, items, destination, confirmation, ticket) that only lists items with stock at the origin and validates stock before confirming.
- **Two kinds of session**: a location session ties a device to one place, and the operator identifies themselves with a pattern or an access token. People at a desk sign in with email and password.
- **Orders**: state lives on each item of an order, and the order's state is derived, never stored. What each role can edit depends on that state.
- **Direct purchases**: material bought outside the usual suppliers comes in from a virtual location, and the system offers to link it to open orders for the same destination.
- **Search**: Postgres `unaccent` and `fuzzystrmatch`, plus aliases per item, so the same material is found however it is typed.

## Outcome

Since March 2026: 242 commits, 8 database migrations and 7 design documents with diagrams.
