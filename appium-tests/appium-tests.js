/**
 * ============================================================================
 * Appium Mobile E2E Test Suite Entry Point
 * Framework: Appium / WebDriverIO (Node.js)
 * Target Application: CitizenAware Mobile Frontend (React Native / Expo)
 * File: appium-tests/appium-tests.js
 * ============================================================================
 */

const { runAppiumTestSuite, CitizenAwareMobilePage } = require('./tests/app-e2e-tests');

if (require.main === module) {
  runAppiumTestSuite();
}

module.exports = { runAppiumTestSuite, CitizenAwareMobilePage };
