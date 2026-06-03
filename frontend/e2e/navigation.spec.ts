import { test, expect } from "@playwright/test";

test.describe("Navigation & theme", () => {
  test("nav links route between pages and highlight the active one", async ({ page }) => {
    await page.goto("/logs");

    const dashboardLink = page.getByRole("link", { name: "Dashboard" });
    await dashboardLink.click();
    // `next dev` compiles the route on-demand on first navigation.
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
    await expect(dashboardLink).toHaveClass(/navbar__link--active/);

    await page.getByRole("link", { name: "Logs", exact: true }).click();
    await expect(page).toHaveURL(/\/logs$/, { timeout: 30_000 });
  });

  test("theme toggle flips the theme and persists across reload", async ({ page }) => {
    await page.goto("/logs");

    const html = page.locator("html");
    const toDark = page.getByRole("button", { name: /switch to dark theme/i });
    await toDark.click();
    await expect(html).toHaveAttribute("data-theme", "dark");

    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");
    // The toggle now offers switching back to light — i.e. dark persisted.
    await expect(page.getByRole("button", { name: /switch to light theme/i })).toBeVisible();
  });
});
