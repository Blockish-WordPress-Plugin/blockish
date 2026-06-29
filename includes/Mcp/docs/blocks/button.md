### `blockish/button`

A call-to-action link. **Accepts children: no.**

**Hard rule — check this every single time you place a button:** does this button need to be centered, right-aligned, or anything other than flush-left in its parent? If yes, you **must** set `buttonPlacement` on the button itself. Setting `alignItems`/`justifyContent` on the parent `blockish/container` has **no effect** on a button's position — that is the single most common mistake when placing buttons. There is no other attribute, on any block, that positions a button. If a button looks stuck on the left when it should be centered, the fix is always `buttonPlacement`, never a parent attribute.

**The button's own wrapper is hard-coded `width: 100%`** in its stylesheet (unlike other blocks, where the global `widthType` defaults to unset/auto-sizing). This is harmless for `buttonPlacement` (which works regardless), but if you instead need to move the button using `position`/`margin`/transform-style attributes, the 100% wrapper width will fight you. In that case set the global `widthType` to `{"value":"auto"}` on the button first — that emits an explicit `width: auto` that overrides the hard-coded 100%, only then will positioning attributes move the visible button rather than just shifting empty space.

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `text` | Scalar (string) | `"Click Here"` | |
| `url` | Link | unset | |
| `icon` | Icon | unset | |
| `iconPosition` | Scalar (string) | `"row"` | `"row"` (icon before text) `"row-reverse"` (icon after) — order of icon vs. text inside the button |
| `buttonPlacement` | Responsive-Option | unset | **Required whenever the button isn't meant to sit flush-left.** `"flex-start"` `"center"` `"flex-end"` — horizontal position of the **whole button** within its parent container. The parent's `alignItems`/`justifyContent` does NOT center a button; use this instead. Mobile-only centering: `{"Desktop":{"value":"flex-end"},"Mobile":{"value":"center"}}` |
| `buttonAlignment` | Responsive-Option | unset | `"left"` `"center"` `"right"` — aligns the icon+text **inside** the button (text-align + justify-content on the inner link), independent of `buttonPlacement` |
| `buttonContentSpacing` | Responsive | unset | Gap between icon and text inside the button |
| `buttonTextColor` | Color | unset | Normal |
| `buttonHoverTextColor` | Color | unset | Hover |
| `buttonBackground` | Stringified-JSON (Background) | unset | Normal |
| `buttonHoverBackground` | Stringified-JSON (Background) | unset | Hover |
| `buttonBorder` | Stringified-JSON (Border) | unset | Normal |
| `buttonHoverBorderColor` | Color | unset | Hover border color override |
| `buttonBorderRadius` | Border-Radius | unset | |
| `buttonPadding` | Spacing | unset | |
| `buttonTypography` | Stringified-JSON (Typography) | unset | |
| `buttonTextShadow` | Stringified-JSON (Box Shadow) | unset | |
| `buttonBoxShadow` | Stringified-JSON (Box Shadow) | unset | Normal |
| `buttonHoverBoxShadow` | Stringified-JSON (Box Shadow) | unset | Hover |
| `buttonHoverTransition` | Scalar (number, seconds) | unset | |
| `buttonWidth` | Responsive | unset | |
| `buttonMinHeight` | Responsive | unset | |
| `buttonIconSize` | Responsive | unset | |

`blockish/button` does **not** support `anchor` or `align` (no `id`, no wide/full alignment) — unlike almost every other Blockish block. See §7.1.

Minimal schema:
```json
{
  "name": "blockish/button",
  "attributes": { "text": "Get Started Free", "url": { "url": "/signup", "newTab": false } }
}
```

---

