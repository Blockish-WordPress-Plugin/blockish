### `blockish/modal`

Accessible popup modal dialog with customizable trigger button (or external CSS selector), optional header/close button, animations, Escape/backdrop close, scroll lock, and full inner blocks support. **Accepts children: yes** — any inner blocks inside `.blockish-modal-body`. Dynamic (`render.php`).

> [!WARNING]
> **Hard rule — no transform on the root:** Do not apply CSS `transform` on `.blockish-modal` root (animations belong on `.blockish-modal-dialog`; stylesheet forces `transform: none !important`). `view.js` and `edit.js` use `acquireFixedEscape` automatically when opened.
>
> **Hard rule — external trigger:** Set `showTrigger: false` and `triggerSelector: ".your-trigger"` (any valid CSS selector) when opening the modal from another button/link instead of rendering the built-in trigger button.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `showTrigger` | Scalar | `true` (default). Renders `.blockish-modal-trigger-wrap` + `.blockish-modal-trigger`. |
| `triggerText` | Scalar | `"Open Modal"` (default). Button label inside `.blockish-modal-trigger-label`. |
| `triggerIcon` | Icon | Optional; prefer `blockish/get-icons`. Renders `.blockish-modal-trigger-icon` SVG. |
| `triggerIconPosition` | Scalar | `"left"` (default) \| `"right"`. |
| `triggerAlign` | Scalar | `"left"` (default) \| `"center"` \| `"right"` \| `"full"` → class `trigger-align-*`. |
| `triggerSelector` | Scalar | `""` (default). Optional CSS selector (e.g. `".open-signup"`) → `data-trigger-selector`. |
| `showHeader` | Scalar | `true` (default). Renders `h2.blockish-modal-title` inside `.blockish-modal-header` + `aria-labelledby`. |
| `modalTitle` | Scalar | `"Modal Title"` (default). Used as heading text and dialog `aria-label` when `showHeader: false`. |
| `showCloseButton` | Scalar | `true` (default). Renders `.blockish-modal-close`. |
| `modalPosition` | Scalar | `"center"` (default) \| `"top"` \| `"bottom"` → class `modal-pos-*`. |
| `modalAnimation` | Scalar | `"scale"` (default) \| `"fade"` \| `"slideUp"` \| `"slideDown"` → class `modal-anim-*`. |
| `closeOnOverlay` | Scalar | `true` (default) → `data-close-on-overlay`. |
| `closeOnEsc` | Scalar | `true` (default) → `data-close-on-esc`. |
| `lockScroll` | Scalar | `true` (default) → `data-lock-scroll` (`body.blockish-modal-scroll-locked` while open). |
| `anchor` | Scalar | Optional HTML `id`. No `align` support. |

#### Markup

Default from `render.php`:

```html
<div class="wp-block-blockish-modal blockish-modal modal-pos-center modal-anim-scale trigger-align-left" data-close-on-overlay="true" data-close-on-esc="true" data-lock-scroll="true">
  <div class="blockish-modal-trigger-wrap">
    <button type="button" class="blockish-modal-trigger" aria-haspopup="dialog" aria-expanded="false" aria-controls="blockish-modal-dialog-1">
      <span class="blockish-modal-trigger-label">Open Modal</span>
    </button>
  </div>
  <div class="blockish-modal-backdrop" hidden>
    <div class="blockish-modal-overlay" aria-hidden="true"></div>
    <div id="blockish-modal-dialog-1" class="blockish-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="blockish-modal-dialog-1-title" tabindex="-1">
      <div class="blockish-modal-header">
        <h2 id="blockish-modal-dialog-1-title" class="blockish-modal-title">Modal Title</h2>
        <button type="button" class="blockish-modal-close" aria-label="Close modal">&times;</button>
      </div>
      <div class="blockish-modal-body">
        <!-- innerBlocks -->
      </div>
    </div>
  </div>
</div>
```

| When | What changes |
|---|---|
| `showTrigger: false` | Trigger wrapper omitted; use `triggerSelector` (or external JS) to open. |
| `triggerIcon` set | `<span class="blockish-modal-trigger-icon">` added before or after `.blockish-modal-trigger-label` per `triggerIconPosition`. |
| `showHeader: false` & `showCloseButton: true` | `.blockish-modal-header` renders empty `<span>` + `.blockish-modal-close`; dialog switches to `aria-label`. |
| `showHeader: false` & `showCloseButton: false` | `.blockish-modal-header` omitted completely. |
| `modalPosition` / `modalAnimation` / `triggerAlign` | Root modifier classes `modal-pos-*`, `modal-anim-*`, `trigger-align-*`. |
| Open state (`view.js` / editor preview) | Root gains `is-open`; `[hidden]` removed from `.blockish-modal-backdrop`; `body.blockish-modal-scroll-locked` added when `lockScroll: true`. |

Style with Class Manager (`classManager` + `classManagerSubselector` / raw CSS targeting `.blockish-modal-trigger`, `.blockish-modal-overlay`, `.blockish-modal-dialog`, `.blockish-modal-header`, `.blockish-modal-title`, `.blockish-modal-close`, `.blockish-modal-body`) or modal/trigger attributes (`modalWidth`, `modalMaxHeight`, `overlayColor`, `triggerBackground`, etc.) — not invented markup.

#### Already-there CSS

Stylesheet (omit = these already apply). Write only overrides / deltas:

```css
body.blockish-modal-scroll-locked {
  overflow: hidden;
}

.blockish-modal,
.blockish-modal:hover {
  transform: none !important;
}

.blockish-modal .blockish-modal-trigger-wrap {
  display: flex;
  width: 100%;
}

.blockish-modal.trigger-align-left .blockish-modal-trigger-wrap { justify-content: flex-start; }
.blockish-modal.trigger-align-center .blockish-modal-trigger-wrap { justify-content: center; }
.blockish-modal.trigger-align-right .blockish-modal-trigger-wrap { justify-content: flex-end; }
.blockish-modal.trigger-align-full .blockish-modal-trigger { justify-content: center; width: 100%; }

.blockish-modal .blockish-modal-trigger {
  align-items: center;
  background-color: #111827;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  font-size: 15px;
  font-weight: 500;
  gap: 8px;
  justify-content: center;
  line-height: 1.4;
  padding: 12px 24px;
  transition: background-color .2s ease, color .2s ease, border-color .2s ease;
}

.blockish-modal .blockish-modal-trigger:hover {
  background-color: #1f2937;
}

.blockish-modal .blockish-modal-trigger-icon {
  align-items: center;
  display: inline-flex;
  justify-content: center;
  line-height: 1;
}

.blockish-modal .blockish-modal-trigger-icon svg {
  display: block;
  height: 1em;
  width: 1em;
}

.blockish-modal .blockish-modal-backdrop {
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  opacity: 0;
  padding: 20px;
  pointer-events: none;
  position: fixed;
  transition: opacity .25s ease, visibility .25s ease;
  visibility: hidden;
  z-index: 99999;
}

.blockish-modal .blockish-modal-backdrop[hidden] {
  display: none;
}

.blockish-modal.modal-pos-top .blockish-modal-backdrop {
  align-items: flex-start;
  padding-top: 48px;
}

.blockish-modal.modal-pos-bottom .blockish-modal-backdrop {
  align-items: flex-end;
  padding-bottom: 48px;
}

.blockish-modal .blockish-modal-overlay {
  background-color: rgba(15, 23, 42, .55);
  inset: 0;
  position: fixed;
}

.blockish-modal .blockish-modal-dialog {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 24px 48px -12px rgba(15, 23, 42, .25);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 48px);
  max-width: calc(100vw - 32px);
  overflow: hidden;
  position: relative;
  transition: transform .25s cubic-bezier(.16, 1, .3, 1), opacity .25s ease;
  width: 560px;
  z-index: 1;
}

.blockish-modal.modal-anim-scale .blockish-modal-dialog { opacity: 0; transform: scale(.95); }
.blockish-modal.modal-anim-fade .blockish-modal-dialog { opacity: 0; transform: none; }
.blockish-modal.modal-anim-slideUp .blockish-modal-dialog { opacity: 0; transform: translateY(20px); }
.blockish-modal.modal-anim-slideDown .blockish-modal-dialog { opacity: 0; transform: translateY(-20px); }

.blockish-modal.is-open .blockish-modal-backdrop {
  opacity: 1;
  pointer-events: auto;
  visibility: visible;
}

.blockish-modal.is-open .blockish-modal-dialog {
  opacity: 1;
  transform: none;
}

.blockish-modal .blockish-modal-header {
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 18px 24px;
}

.blockish-modal .blockish-modal-title {
  color: #111827;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.35;
  margin: 0;
}

.blockish-modal .blockish-modal-close {
  align-items: center;
  background-color: transparent;
  border: 0;
  border-radius: 8px;
  color: #4b5563;
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  font-size: 22px;
  height: 34px;
  justify-content: center;
  line-height: 1;
  padding: 0;
  transition: background-color .15s ease, color .15s ease;
  width: 34px;
}

.blockish-modal .blockish-modal-close:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.blockish-modal .blockish-modal-body {
  overflow-y: auto;
  padding: 24px;
}
```

#### Minimal schema

```json
{
  "name": "blockish/modal",
  "attributes": {
    "triggerText": "Get Started",
    "modalTitle": "Contact Us"
  },
  "innerBlocks": [
    {
      "name": "blockish/paragraph",
      "attributes": {
        "content": "Fill out the form below to get in touch."
      }
    }
  ]
}
```
