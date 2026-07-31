<?php

namespace Blockish\Mcp\Abilities\GetAutomationGuideline;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function handle( $input ): array
    {
        $guideline = '
=========================================================
BLOCKISH MCP - PUPPETEER AUTOMATION GUIDELINES
=========================================================
As an AI Agent, you are responsible for automatically accepting staged layouts, inspecting the DOM, or taking screenshots on behalf of the user using Puppeteer on their local machine.

[PREREQUISITES]
1. `puppeteer` is ALREADY INSTALLED globally or locally on the user\'s machine (configured via their CLI tool).
2. DO NOT try to run browser automation directly in the WordPress PHP environment. You must write a temporary Node.js script (e.g. `automation.js`) on the user\'s machine and execute it (`node automation.js`).

[AUTHENTICATION - VERY IMPORTANT]
You MUST NOT use a normal username/password to log in.
Instead, use the `blockish/get-magic-login-url` MCP ability to generate an instant login URL.
Navigate your Puppeteer browser to this Magic Login URL first to instantly authenticate as an Admin.

[AUTO-ACCEPT WORKFLOW]
When you use `ManagePost` to stage a `blockish_schema`, it stays pending until accepted in the editor. Follow this exact Puppeteer script template to auto-accept it:

```javascript
import puppeteer from \'puppeteer\';

(async () => {
    const magicLoginUrl = "INSERT_MAGIC_URL_HERE";
    const editUrl = "INSERT_EDIT_URL_HERE";
    
    const browser = await puppeteer.launch({ headless: \'new\' });
    const page = await browser.newPage();
    
    try {
        console.log("Logging in via magic URL...");
        await page.goto(magicLoginUrl, { waitUntil: \'networkidle2\' });
        
        console.log("Navigating to the edit URL...");
        await page.goto(editUrl, { waitUntil: \'networkidle2\' });
        
        console.log("Waiting for the WordPress Editor iframe or Accept/Discard button...");
        
        // Exact DOM selectors for the Blockish AI preview block:
        // To ACCEPT: \'.blockish-ai-button-group button.is-primary\'
        // To DISCARD: \'.blockish-ai-button-group button.is-secondary\'
        
        const actionSelector = \'.blockish-ai-button-group button.is-primary\'; // Change to .is-secondary to Discard
        await page.waitForSelector(actionSelector, { timeout: 15000 });
        await page.click(actionSelector);
        
        // Wait a few seconds to ensure WordPress processes the action
        await new Promise(r => setTimeout(r, 3000));
        
        console.log("Successfully accepted staged layout!");
    } catch (e) {
        console.error("Error during automation:", e);
    } finally {
        await browser.close();
    }
})();
```

[SCREENSHOT & DOM INSPECT]
If a layout breaks or you need visual confirmation, use Puppeteer to take a screenshot (`await page.screenshot({ path: \'preview.png\', fullPage: true })`) and use your internal `view_image` tool to look at it.
If you are unsure of the Accept button\'s CSS selector, write a script that dumps the editor DOM `page.content()` and search it for "Accept" before clicking.

[CLEANUP]
Always delete your temporary `automation.js` and `preview.png` files after you are done viewing them.
';

        return [
            'guideline' => $guideline
        ];
    }
}
