# Block Spec: `blockish/google-map`

Important prerequisite: AI must read `ai-context/global/advanced-controls.ai.md` first.

## Block Summary

- Name: `blockish/google-map`
- Role: embedded Google Maps iframe block
- Typical use: contact/location sections
- Can contain: no inner blocks

## When AI Should Use It

Use Google Map block when AI needs:
- a visual map embed for an address/place query,
- quick contact/location section map.

Avoid using it when user asks for a custom map provider or advanced map interactivity (markers, routes, clustering).

## Core Behavioral Notes

- Wrapper class: `blockish-google-map-wrapper`.
- Iframe class: `blockish-google-map__iframe`.
- Embed URL is generated as:
  - `https://www.google.com/maps?q=<encoded-location>&z=<zoom>&output=embed`
- Input safety in runtime helper:
  - empty location falls back to `New York, NY`,
  - zoom is parsed to integer and clamped to `0..21`,
  - invalid zoom falls back to `14`.

## Important Attributes (AI-Relevant)

1. Content controls
- `location` (string)
  - default: `New York, NY`
- `zoom` (number)
  - default: `14`
  - allowed/range: `0..21` (clamped)
- `mapHeight` (string)
  - default: `360px`
  - applies to iframe height

2. Style controls
- `mapCSSFiltersNormal`
- `mapCSSFiltersHover`
- `mapHoverTransition` (number, seconds)
  - UI range: `0..10`

## Known Defaults

- `location`: `New York, NY`
- `zoom`: `14`
- `mapHeight`: `360px`

## AI Safe-Write Rules

- Keep `location` human-readable (city, address, or place name).
- Keep `zoom` within `0..21`; prefer practical ranges:
  - `10-13` city/area view
  - `14-17` neighborhood/street focus
  - `18+` very close detail
- Use simple CSS filter adjustments; avoid over-filtering that hurts map readability.
- Keep hover transition in a reasonable range (usually `0..1.5s` unless user requests slower).

## Failure/Fallback Guidance

If exact location is unclear:
- use the closest known location string,
- mention that user can refine location text for precision.

If map embed is not desired/possible:
- fallback to plain address text + external map link.
