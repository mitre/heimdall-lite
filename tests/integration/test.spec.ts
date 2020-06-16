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

  it("Click Samples Tab", async () => {
    await expect(page).toClick("a", { text: "Samples" });
    //await expect(true).toBe(true)
  });
  it("Click Sample", async () => {
    await expect(page).toClick("button", { text: "TEST" });
    await page.waitForNavigation();
  });

  it("Click Sample", async () => {
    await expect(page).toClick("button", { text: "Upload" });
    // await page.waitForNavigation();
  });

  it("Click Local Files", async () => {
    await expect(page).toClick("a", { text: "Local Files" });
    await expect(page).toClick("a", { text: "Local Files" });

    await page.waitForNavigation();
  });
  it("Click Local Files", async () => {
    await expect(page).toClick("button", { text: "Upload" });
    await page.waitForNavigation();
  });
});
