### `blockish/tab-item`

Must be a child of `blockish/tab`. **Accepts children: yes** (any blocks — this is the panel's content area).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `title` | Scalar (string) | `"Tab"` | |
| `tabIcon` | Icon | unset | |
| `defaultActive` | Scalar (boolean) | `false` | Set `true` on exactly one item — index must match parent's `defaultActiveTab` |

---

### The navigation family (`navigation` → `navmenu` + `offcanvas` → `navmenu-item`)

A site nav menu is **never** a single block — it's a fixed nesting tree, and the blocks are parent-locked so they only validate in this exact arrangement:

```
blockish/navigation              (top-level wrapper — the only one you place directly)
├── blockish/navmenu             (the desktop horizontal menu)
│   └── blockish/navmenu-item …  (each link)
└── blockish/offcanvas           (the mobile slide-in drawer + hamburger)
    └── blockish/navmenu-item …  (auto-mirrored from navmenu — usually leave empty)
```

Hard rules:
- **Always start from `blockish/navigation`.** `navmenu` and `offcanvas` are `parent`-locked to `navigation`; `navmenu-item` is locked to `navmenu`/`offcanvas`. Emitting any of them at the top level (or in any other parent) produces an invalid block.
- **Set `"hasStarted": true` on `blockish/navigation`** (same idea as container's `isVariationPicked` — without it the block can render its empty "Start Blank" placeholder instead of your menu).
- **The `offcanvas` mirrors the `navmenu` automatically** when its `syncWithMenu` is `true` (the default): leave its `innerBlocks` empty `[]` and it copies the navmenu's items as the mobile menu. Only set `syncWithMenu: false` and give it its own `navmenu-item` children if you deliberately want a *different* mobile menu. Never duplicate the same items into both by hand while sync is on — they'll be overwritten.
- The `navigation` block's breakpoint controls when desktop↔mobile swap happens; the `offcanvas` is hidden on desktop and the `navmenu` is hidden on mobile automatically.

Minimal working menu (this is the canonical shape — copy it):
```json
{
  "name": "blockish/navigation",
  "attributes": { "hasStarted": true },
  "innerBlocks": [
    {
      "name": "blockish/navmenu",
      "attributes": {},
      "innerBlocks": [
        { "name": "blockish/navmenu-item", "attributes": { "label": "Home", "url": "/" } },
        { "name": "blockish/navmenu-item", "attributes": { "label": "About", "url": "/about" } },
        { "name": "blockish/navmenu-item", "attributes": { "label": "Contact", "url": "/contact" } }
      ]
    },
    { "name": "blockish/offcanvas", "attributes": {}, "innerBlocks": [] }
  ]
}
```

---

