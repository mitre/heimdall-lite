import "expect-puppeteer";

describe("Google", () => {
  beforeAll(async () => {
    await page.goto("http://localhost:8080/login");
  });

  it("Fill out login", async () => {
    await expect(page).toFillForm('form[name="saurabform"]', {
      login: "saurabjdc@gmail.com",
      password: "password"
    });
  });

  it("Click Login", async () => {
    await expect(page).toClick("button", { text: "Login" });
    await page.waitForNavigation();
  });

  it('should display "google" text on page', async () => {
    let text = await page.evaluate(() => document.body.textContent);
    expect(text).toContain("heimdall-lite");
  });

  it('should display "google" text on page', async () => {
    let text = await page.evaluate(() => document.body.textContent);
    await expect(page).toClick("a", { text: "S3 Bucket" });
    await page.waitForNavigation();
  });
});
