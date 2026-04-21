# Block Spec: `blockish/image`

Important prerequisite: AI must read `ai-context/global/advanced-controls.ai.md` first.

## Block Summary

- Name: `blockish/image`
- Role: image media block with optional caption and style controls
- Typical use: hero/media visuals, content images, gallery-like single image
- Can contain: no inner blocks

## When AI Should Use It

Use image when AI needs:
- one visual media element,
- optional caption display,
- responsive dimension and hover styling controls.

Avoid image block when user needs complex gallery/carousel behavior.

## Core Behavioral Notes

- Wrapper tag/class: `<figure class="blockish-image-wrapper">`.
- Image class: `blockish-image`.
- Caption class: `blockish-image-caption` (rendered as `<figcaption>`).
- Source selection prefers selected size URL:
  - `image.sizes[imageSize.value].url` -> fallback to `image.url`
- Width/height attributes also prefer selected size metadata.
- Caption rendering logic:
  - `captionType = custom` -> uses `customCaption`
  - otherwise -> uses `image.caption`
  - `captionType = none` -> caption hidden

## Important Attributes (AI-Relevant)

1. Media/content
- `image` (object)
  - selected/uploaded media object or URL object
- `imageSize` (object `{value,label}`)
  - default: `{ value: "full", label: "Full Size" }`
- `alt` (string)
- `title` (string)
- `captionType` (string)
  - allowed: `none`, `attachment`, `custom`
  - default: `none`
- `customCaption` (string)

2. Image layout
- `alignment` (object by device)
  - default: `Desktop: center`
  - values: `left`, `center`, `right`
- `imageWidth` (object by device)
- `imageMaxWidth` (object by device)
- `imageHeight` (object by device)
- `objectFit` (object by device)
  - meaningful when image height is set
  - values from UI: `none`, `fill`, `cover`, `contain`

3. Image style (normal/hover)
- `imageOpacityNormal` (number)
- `imageOpacityHover` (number)
- `imageBorderNormal`
- `imageBorderHover`
- `imageBorderRadiusNormal` (object by device)
- `imageBorderRadiusHover` (object by device)
- `imageBoxShadowNormal`
- `imageBoxShadowHover`
- `imageCSSFiltersNormal`
- `imageCSSFiltersHover`
- `imageHoverTransition` (number, seconds)

4. Caption style
- `captionAlignment` (object by device)
- `captionColor` (string)
- `captionBackgroundColor` (string)
- `captionTypography` (string)
- `captionTextShadow` (string)
- `captionSpacing` (object by device)

## Known Defaults

- `imageSize.value`: `full`
- `captionType`: `none`
- `alignment.Desktop`: `center`

## Editor Behavior Notes

- If an external URL image is used (`image.url` without `image.id`), editor can upload it to Media Library and convert it to media object.
- Inspector is shown only when an image URL exists.

## AI Safe-Write Rules

- Ensure `image.url` exists before writing style/caption decisions.
- Prefer media object with `id` and `sizes` when available; fallback to plain URL safely.
- Set `alt` text when image conveys meaningful content.
- Use `captionType = custom` only when `customCaption` is provided.
- Keep opacity/filter values readable and non-destructive.
- Apply `objectFit` only when height-driven cropping is intended.

## Failure/Fallback Guidance

If exact media details are missing:
- preserve layout with available image URL,
- avoid over-asserting metadata (alt/title) without user intent,
- keep caption off (`none`) unless caption text is explicitly provided.
