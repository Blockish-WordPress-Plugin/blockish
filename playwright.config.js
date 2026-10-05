/**
 * E2E tests run against the wp-env site (http://localhost:8889, one site,
 * no separate dev site: see .wp-env.json).
 * Start it with `npm run wp-env start`; `npm run test:e2e` starts it too.
 */
const baseConfig = require( '@wordpress/scripts/config/playwright.config.js' );

module.exports = {
	...baseConfig,
	testDir: './tests/e2e',
};
