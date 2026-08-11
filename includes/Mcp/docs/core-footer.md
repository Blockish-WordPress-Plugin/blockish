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
3. **Designing a header template part:** leave container `tagName` as default `div` — WordPress already wraps the part in `<header>`.

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
          "attributes": {},
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
              }
            }
          ]
        },
        {
          "name": "blockish/offcanvas",
          "attributes": {
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
    "presetOptions": {
      "duration": 600,
      "delay": 0,
      "once": true
    },
    "eventName": "",
    "phase": "start",
    "callbacks": [
      ""
    ]
  }
}
```

| Field | Notes |
|---|---|
| `when.source` | `"dom"` \| `"listen"` |
| `when.event` (dom) | `"ready"` \| `"click"` \| `"mouseenter"` \| `"focus"` \| `"inView"` |
| `when.selector` | Optional CSS selector relative to this block |
| `action.type` | `"preset"` \| `"emit"` \| `"custom"` |
| `action.preset` | `"fadeIn"` `"fadeUp"` `"fadeDown"` `"fadeLeft"` `"fadeRight"` `"zoomIn"` |

**Emit/listen:** one block `action.type:"emit"` + `eventName`; another `when.source:"listen"` + same `eventName`.

**Custom JS:** use `when.event:"ready"` — not `DOMContentLoaded`.

**Animation target:** defaults to the outer wrapper. For buttons animate `.blockish-button-link` via `when.selector`. Prefer Class Manager classes as stable selectors.

Global / page libraries: `blockish/manage-interactions` with `scope:"global"` or `scope:"page"` + `post_id` (replaces manage-global-interactions).

---
