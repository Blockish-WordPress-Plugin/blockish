<?php

namespace Blockish\Mcp\Abilities\GetAutomationGuideline;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function handle( $input ): array
    {
        $guideline = '
=========================================================
BLOCKISH MCP - BROWSER AUTOMATION
=========================================================
After staging: AGENT opens the editor → waits 10–15s → verifies on the
frontend (screenshot) → only then hand off. Fix design issues after that.

WHO OPENS THE BROWSER
- Default: the AGENT runs the browser (agent browser, else Puppeteer/Playwright).
- Only hand the user a magic-login link if they ask to open it themselves, or
  the agent cannot drive a browser in this environment.
- Do not skip resolve and dump raw edit_url as the main handoff.

RESOLVE SCOPE (one open is usually enough)
- Opening ANY editor auto-resolves ALL unresolved AI Preview queue items
  (patterns, forms, megas, pages, templates) — not just the post you opened.
- New page flow: stage patterns → stage page with refs → open the PAGE
  edit_url once (preferred). Do NOT open every pattern editor separately.
- Pattern-only update while a parent page is already in use: restage the
  pattern, then restage that parent with its current schema, then open ONE
  editor (parent preferred).

VERIFY LOOP (required)
1. Ask magic-login permission ONCE per chat session.
2. magic-login redirect_to = preferred edit_url (page/template when assembling;
   otherwise the staged post you just wrote).
3. Open that URL with waitUntil: "domcontentloaded" (or equivalent).
   Do NOT use networkidle / networkidle2 — Site Editor keeps background
   requests open and those waits often time out (~60s).
4. After the editor UI is up, wait **10–15 seconds** (do not close early).
5. Close (or leave) the editor, then open the **frontend** view URL
   (post_url / home / relevant WP view).
6. Check resolve: content should show real sections (not empty / only a
   neon ai-preview shell). Take a **screenshot**.
7. If NOT resolved: open the editor again → wait **10–15 seconds** →
   re-check frontend. Retry once (max ~2 editor opens total unless clearly
   still failing).
8. When resolved: take a final frontend screenshot, then give the user the
   frontend URL.
9. If the screenshot shows design issues (width mismatch, contrast, spacing,
   missing styles): fix via Class Manager / restage, then re-run this loop
   for the affected items — do not declare done on a broken layout.

Do not explain resolve internals. Do not push Accept/Discard.
After verify: call `get-ai-preview-pending`. If count > 0, tell the user how many
designs are pending and that they should Accept manually in Settings → AI Preview.
';

        return [
            'guideline' => $guideline
        ];
    }
}
