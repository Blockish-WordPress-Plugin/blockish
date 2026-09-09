<?php

namespace Blockish\Mcp\Abilities\GetAutomationGuideline;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function handle( $input ): array
    {
        $guideline = '
=========================================================
BLOCKISH MCP - BROWSER / PUPPETEER GUIDELINES
=========================================================
Staged layouts use blockish/ai-preview. Frontend stays empty until RESOLVE
writes children into the wrapper (Accept-all logic, no unwrap).

Resolve ≠ Accept:
- Resolve: schema → markup as ai-preview children (queue / selected / all).
- Accept: Settings unwrap to normal content. Discard restores previousSchema.

[OPEN PRIORITY]
1. Agent browser if available.
2. Puppeteer only if no agent browser.
3. User opens the resolve link.

[AUTHENTICATION]
blockish/get-magic-login-url — ask permission ONCE per chat session.
redirect_to = manage-post `resolve_url` (preferred), or manually:

  {edit_url}&blockish_ai_resolve=1&blockish_ai_resolve_redirect={post_url}
  Optional: &blockish_ai_resolve_ids=12,34  (omit = resolve entire pending queue)

[RESOLVE WORKFLOW]
```javascript
import puppeteer from \'puppeteer\';

(async () => {
    // magic login URL already includes redirect_to = edit_url + resolve query args
    const magicLoginUrl = "INSERT_MAGIC_URL_HERE";

    const browser = await puppeteer.launch({ headless: \'new\' });
    const page = await browser.newPage();
    try {
        await page.goto(magicLoginUrl, { waitUntil: \'networkidle2\' });
        // Editor boots → resolves queue → redirects to frontend
        await page.waitForNavigation({ waitUntil: \'networkidle2\', timeout: 60000 });
        await page.screenshot({ path: \'preview.png\', fullPage: true });
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
})();
```

[SETTINGS]
Settings → AI Preview also has Resolve / Resolve all (same logic, no unwrap),
plus Accept / Discard for finalize.

[CLEANUP]
Delete temporary automation.js / preview.png when done.
';

        return [
            'guideline' => $guideline
        ];
    }
}
