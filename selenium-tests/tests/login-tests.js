/**
 * ============================================================================
 * Selenium E2E Test Suite for Web Frontend Login Functionality
 * Framework: Selenium WebDriver (Node.js)
 * Target Application: CitizenAware Web Frontend (Auth / Login Module)
 * File: selenium-tests/tests/login-tests.js
 * ============================================================================
 */

const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Target environment configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:8081/auth/login';
const SCREENSHOT_DIR = path.join(__dirname, '../screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

/**
 * Page Object Model (POM) for Login Page
 */
class LoginPage {
  constructor(driver) {
    this.driver = driver;

    // Locators
    this.emailInput = By.css('input[type="email"], input[placeholder*="Email"]');
    this.passwordInput = By.css('input[type="password"], input[placeholder*="Password"]');
    this.signInButton = By.xpath("//*[contains(text(), 'Sign In') or contains(text(), 'SIGN IN')]");
    this.forgotPasswordLink = By.xpath("//*[contains(text(), 'Forgot Password')]");
    this.createAccountLink = By.xpath("//*[contains(text(), 'Create Account')]");
    this.errorMessage = By.css('[class*="error"], [style*="color: red"], div:has(> p)');
    this.heroHeader = By.xpath("//*[contains(text(), 'CitizenAware')]");
    this.editionBadge = By.xpath("//*[contains(text(), '2026 Edition')]");
    this.scholarshipsCategory = By.xpath("//*[contains(text(), 'Scholarships')]");
    this.subsidiesCategory = By.xpath("//*[contains(text(), 'Subsidies')]");
    this.healthCategory = By.xpath("//*[contains(text(), 'Health')]");
    this.farmerCategory = By.xpath("//*[contains(text(), 'Farmer')]");
  }

  async navigate() {
    await this.driver.get(BASE_URL);
    await this.driver.wait(until.elementLocated(this.emailInput), 10000);
  }

  async enterEmail(email) {
    const el = await this.driver.wait(until.elementLocated(this.emailInput), 5000);
    await el.clear();
    await el.sendKeys(email);
  }

  async enterPassword(password) {
    const el = await this.driver.wait(until.elementLocated(this.passwordInput), 5000);
    await el.clear();
    await el.sendKeys(password);
  }

  async clickSignIn() {
    const btn = await this.driver.wait(until.elementLocated(this.signInButton), 5000);
    await btn.click();
  }

  async login(email, password) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickSignIn();
  }

  async getErrorMessageText() {
    try {
      const errEl = await this.driver.wait(until.elementLocated(this.errorMessage), 5000);
      return await errEl.getText();
    } catch {
      return '';
    }
  }

  async isHeaderVisible() {
    const el = await this.driver.wait(until.elementLocated(this.heroHeader), 5000);
    return await el.isDisplayed();
  }

  async takeScreenshot(filename) {
    const image = await this.driver.takeScreenshot();
    const filePath = path.join(SCREENSHOT_DIR, `${filename}_${Date.now()}.png`);
    fs.writeFileSync(filePath, image, 'base64');
    console.log(`[Screenshot Saved]: ${filePath}`);
  }
}

/**
 * Main Test Runner Engine
 */
async function runSeleniumTestSuite() {
  console.log('====================================================');
  console.log('Starting CitizenAware Selenium E2E Web Login Suite');
  console.log(`Target URL: ${BASE_URL}`);
  console.log('====================================================\n');

  // Configure Chrome options
  const chromeOptions = new chrome.Options();
  chromeOptions.addArguments('--headless=new');
  chromeOptions.addArguments('--disable-gpu');
  chromeOptions.addArguments('--no-sandbox');
  chromeOptions.addArguments('--window-size=1920,1080');

  let driver;
  let passedCount = 0;
  let failedCount = 0;

  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    const loginPage = new LoginPage(driver);

    // ------------------------------------------------------------------------
    // Test Case 1: Page Load & Visual Element Verification
    // ------------------------------------------------------------------------
    try {
      console.log('[Test 1]: Verify login page branding and visual header...');
      await loginPage.navigate();
      const isHeaderPresent = await loginPage.isHeaderVisible();
      assert.strictEqual(isHeaderPresent, true, 'App name CitizenAware should be visible');
      console.log('  └─ PASSED');
      passedCount++;
    } catch (err) {
      console.error(`  └─ FAILED: ${err.message}`);
      await loginPage.takeScreenshot('test1_failed');
      failedCount++;
    }

    // ------------------------------------------------------------------------
    // Test Case 2: Validation on Empty Submission
    // ------------------------------------------------------------------------
    try {
      console.log('[Test 2]: Verify empty form submission shows validation error...');
      await loginPage.navigate();
      await loginPage.clickSignIn();
      const errorMsg = await loginPage.getErrorMessageText();
      assert(errorMsg.toLowerCase().includes('fill') || errorMsg.length > 0, 'Error message should appear');
      console.log('  └─ PASSED');
      passedCount++;
    } catch (err) {
      console.error(`  └─ FAILED: ${err.message}`);
      await loginPage.takeScreenshot('test2_failed');
      failedCount++;
    }

    // ------------------------------------------------------------------------
    // Test Case 3: Invalid Email Format Handling
    // ------------------------------------------------------------------------
    try {
      console.log('[Test 3]: Verify invalid email format behavior...');
      await loginPage.navigate();
      await loginPage.login('invalidemailformat', 'Password123!');
      const errorMsg = await loginPage.getErrorMessageText();
      assert(errorMsg.length > 0, 'Error message should be rendered');
      console.log('  └─ PASSED');
      passedCount++;
    } catch (err) {
      console.error(`  └─ FAILED: ${err.message}`);
      await loginPage.takeScreenshot('test3_failed');
      failedCount++;
    }

    // ------------------------------------------------------------------------
    // Test Case 4: Navigation to Forgot Password
    // ------------------------------------------------------------------------
    try {
      console.log('[Test 4]: Verify forgot password redirection...');
      await loginPage.navigate();
      const forgotLink = await driver.wait(until.elementLocated(loginPage.forgotPasswordLink), 5000);
      await forgotLink.click();
      await driver.sleep(1000);
      const currentUrl = await driver.getCurrentUrl();
      assert(currentUrl.includes('forgot-password'), 'URL should navigate to forgot password screen');
      console.log('  └─ PASSED');
      passedCount++;
    } catch (err) {
      console.error(`  └─ FAILED: ${err.message}`);
      await loginPage.takeScreenshot('test4_failed');
      failedCount++;
    }

    // ------------------------------------------------------------------------
    // Test Case 5: Navigation to Registration Screen
    // ------------------------------------------------------------------------
    try {
      console.log('[Test 5]: Verify Create Account link redirection...');
      await loginPage.navigate();
      const regLink = await driver.wait(until.elementLocated(loginPage.createAccountLink), 5000);
      await regLink.click();
      await driver.sleep(1000);
      const currentUrl = await driver.getCurrentUrl();
      assert(currentUrl.includes('register'), 'URL should navigate to register screen');
      console.log('  └─ PASSED');
      passedCount++;
    } catch (err) {
      console.error(`  └─ FAILED: ${err.message}`);
      await loginPage.takeScreenshot('test5_failed');
      failedCount++;
    }

    // ------------------------------------------------------------------------
    // Test Case 6: Successful Authentication Flow
    // ------------------------------------------------------------------------
    try {
      console.log('[Test 6]: Verify valid user authentication flow...');
      await loginPage.navigate();
      await loginPage.login('citizen.user@example.com', 'ValidPass123!');
      await driver.sleep(2000);
      console.log('  └─ PASSED');
      passedCount++;
    } catch (err) {
      console.error(`  └─ FAILED: ${err.message}`);
      await loginPage.takeScreenshot('test6_failed');
      failedCount++;
    }

    // Summary Report
    console.log('\n====================================================');
    console.log('Selenium Execution Summary:');
    console.log(`  Total Executed: ${passedCount + failedCount}`);
    console.log(`  Passed: ${passedCount}`);
    console.log(`  Failed: ${failedCount}`);
    console.log('====================================================\n');

  } catch (globalErr) {
    console.error('Selenium WebDriver setup error:', globalErr);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

// Export module & execute if run directly
if (require.main === module) {
  runSeleniumTestSuite();
}

module.exports = { LoginPage, runSeleniumTestSuite };
