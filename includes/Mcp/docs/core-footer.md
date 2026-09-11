## 7.1 Shared WP supports: `anchor` and `align`

Most Blockish blocks support:

| Attribute | Type | Notes |
|---|---|---|
| `anchor` | Scalar (string) | Wrapper HTML `id`. |
| `align` | Scalar (string) | `"wide"` or `"full"` when `supports.align` is on. |

**Exceptions:** `blockish/button` (no `anchor` / `align`), `blockish/navmenu-item` (no `anchor`), and some child-only blocks.

---

## 8. Composite examples (content + structure)

Styles omitted on purpose — produce them with `blockish/convert-css`, then merge.

### Hero (structure only)

```json
{
  "name": "blockish/container",
  "attributes": {
    "metadata": {
      "name": "Hero"
    }
  },
  "innerBlocks": [
    {
      "name": "blockish/heading",
      "attributes": {
        "content": "Welcome",
        "tag": {
          "label": "H1",
          "value": "h1"
        }
      }
    },
    {
      "name": "blockish/button",
      "attributes": {
        "text": "Get Started Free",
        "url": {
          "url": "/signup",
          "newTab": false
        }
      }
    }
  ]
}
```

Hard rule: convert `justify-content:center` on the button root; parent alignment does not place the visible button.

### Stats row

```json
{
  "name": "blockish/container",
  "attributes": {
    "gridLayoutType": "fixed"
  },
  "innerBlocks": [
    {
      "name": "blockish/counter",
      "attributes": {
        "endNumber": 500,
        "numberSuffix": "+",
        "title": "Happy Clients"
      }
    },
    {
      "name": "blockish/counter",
      "attributes": {
        "endNumber": 99,
        "numberSuffix": "%",
        "title": "Uptime"
      }
    },
    {
      "name": "blockish/counter",
      "attributes": {
        "endNumber": 24,
        "numberSuffix": "/7",
        "title": "Support"
      }
    }
  ]
}
```

`gridLayoutType:"fixed"` enables an exact converted column count; the default `"auto"` uses responsive minimum-width tracks.

### FAQ accordion

```json
{
  "name": "blockish/accordion",
  "attributes": {
    "faqSchema": true
  },
  "innerBlocks": [
    {
      "name": "blockish/accordion-item",
      "attributes": {
        "title": "What is Blockish?",
        "defaultOpen": true
      },
      "innerBlocks": [
        {
          "name": "core/paragraph",
          "attributes": {
            "content": "Blockish is a Gutenberg block plugin."
          }
        }
      ]
    },
    {
      "name": "blockish/accordion-item",
      "attributes": {
        "title": "Is it free?"
      },
      "innerBlocks": [
        {
          "name": "core/paragraph",
          "attributes": {
            "content": "Yes, the core plugin is free."
          }
        }
      ]
    }
  ]
}
```

### Site header / template parts

1. **`manage-post` (page):** never include `core/template-part` header/footer — the theme template already provides chrome. Pattern refs only; full-bleed needs `"align":"full"`.
2. **`manage-template` (`wp_template`):** may include `core/template-part` with `slug` + `theme`.
3. **Designing a header or footer template part:** leave container `tagName` as default `div`. WordPress already wraps the header part in `<header>` and the footer part in `<footer>`. Never set `tagName` to `header` or `footer` here — that doubles the landmark.

```json
{
  "name": "blockish/container",
  "attributes": {},
  "innerBlocks": [
    {
      "name": "blockish/site-logo",
      "attributes": {
        "linkToHome": true
      }
    },
    {
      "name": "blockish/navigation",
      "attributes": {
        "menuBreakpoint": "tablet"
      },
      "innerBlocks": [
        {
          "name": "blockish/navmenu",
          "attributes": {
            "submenuTrigger": "hover",
            "submenuRevealAnimation": { "label": "Slide", "value": "slide" }
          },
          "innerBlocks": [
            {
              "name": "blockish/navmenu-item",
              "attributes": {
                "label": "Home",
                "url": "/"
              }
            },
            {
              "name": "blockish/navmenu-item",
              "attributes": {
                "label": "Features",
                "url": "/features"
              },
              "innerBlocks": [
                {
                  "name": "blockish/navmenu-submenu",
                  "attributes": { "positionAlign": "left" },
                  "innerBlocks": [
                    {
                      "name": "blockish/navmenu-item",
                      "attributes": {
                        "label": "Overview",
                        "url": "/features"
                      }
                    },
                    {
                      "name": "blockish/navmenu-item",
                      "attributes": {
                        "label": "MCP",
                        "url": "/mcp"
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "name": "blockish/offcanvas",
          "attributes": {
            "syncWithMenu": true,
            "offcanvasSide": "right"
          },
          "innerBlocks": []
        }
      ]
    }
  ]
}
```

---

## 9. Extensions: Visibility & Interactions

### Visibility (`hideOn`)

```json
"hideOn": { "Desktop": false, "Tablet": true, "Mobile": true }
```

Prefer over `customCss` display hacks.

### Interactions (`interactionData`)

Prefer structured presets. Legacy `{ event, selector, callbacks }` still works as `action.type: "custom"`.

```json
{
  "id": "ix_unique",
  "title": "Entrance fade",
  "scope": "block",
  "when": {
    "source": "dom",
    "event": "inView",
    "selector": "",
    "eventName": "",
    "phase": "start"
  },
  "action": {
    "type": "preset",
    "preset": "fadeUp",
    "motion": {
      "tweens": [
        {
          "from": { "x": 0, "y": 40, "scale": 1, "rotation": 0, "opacity": 0 },
          "to": { "x": 0, "y": 0, "scale": 1, "rotation": 0, "opacity": 1 },
          "duration": 0.6,
          "delay": 0,
          "ease": "power2.out"
        }
      ]
    },
    "presetOptions": {
      "duration": 0.6,
      "delay": 0,
      "once": true
    },
    "applyTo": "",
    "eventName": "",
    "phase": "end",
    "callbacks": [
      ""
    ]
  }
}
```

| Field | Notes |
|---|---|
| `when.source` | `"dom"` \| `"listen"` |
| `when.event` (dom) | `"ready"` \| `"click"` \| `"mouseenter"` \| `"focus"` \| `"inView"` \| `"scroll"` \| `"scrollProgress"` |
| `when.selector` | Optional — listen/click target **inside this block** |
| `when.scrollY` | `scroll` only — px from top; reverses when scrolling back up |
| `action.applyTo` | Optional — where the action runs (any page selector). Empty = this block |
| `action.eventName` | `emit` = the signal. Other types = optional **then-signal** for sequences |
| `action.phase` | `emit`: signal tag. Other types: send then-signal when this `start`s or `end`s (default `end`) |
| `action.type` | `"preset"` \| `"show"` \| `"hide"` \| `"toggle"` \| `"toggleClass"` \| `"emit"` \| `"custom"` |
| `action.preset` | Seeds motion: `"fadeIn"` `"fadeUp"` `"fadeDown"` `"fadeLeft"` `"fadeRight"` `"zoomIn"` `"custom"` |
| `action.motion.tweens` | Canonical animation. One CSS tween: `from`/`to` with used keys only (`x`, `y`, `scale`, `rotation`, `opacity`), `duration`/`delay` in **seconds**, `ease`. Play `tweens[0]` only. |
| `action.className` | For `toggleClass` — class without the dot |
| `presetOptions` | Mirror of first tween: **seconds** duration/delay/stagger, once, flat fromX… if `motion` omitted |

Hover (`mouseenter`) reverses on leave. Click toggles class, visibility, and presets. `prefers-reduced-motion` skips transform. `show` / `toggle` start hidden until the trigger. `scrollProgress` + preset **scrubs** from→to with viewport progress (also `--blockish-ix-progress` 0–1).

**Emit/listen:** one block `action.type:"emit"` + `eventName`; another `when.source:"listen"` + same `eventName`.

**Custom JS:** use `when.event:"ready"` — not `DOMContentLoaded`.

**Animation target:** defaults to the outer wrapper. For buttons animate `.blockish-button-link` via `when.selector`. Prefer Class Manager classes as stable selectors.

Global / page libraries: `blockish/manage-interactions` with `scope:"global"` or `scope:"page"` + `post_id` (replaces manage-global-interactions).

---
