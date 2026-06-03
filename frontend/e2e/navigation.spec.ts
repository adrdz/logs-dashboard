import { test, expect } from "@playwright/test";

test.describe("Navigation & theme", () => {
  test("sidebar links route between pages and highlight the active one", async ({ page }) => {
    await page.goto("/logs");

    const summaryLink = page.getByRole("link", { name: "Summary" });
    await summaryLink.click();
    // `next dev` compiles the route on-demand on first navigation.
    await expect(page).toHaveURL(/\/$/, { timeout: 30_000 });
    await expect(summaryLink).toHaveClass(/sidebar__link--active/);

    await page.getByRole("link", { name: "Logs List" }).click();
    await expect(page).toHaveURL(/\/logs$/, { timeout: 30_000 });
    await expect(page.getByRole("link", { name: "Logs List" })).toHaveClass(
      /sidebar__link--active/
    );
  });

  test("brand title links back to the Summary home", async ({ page }) => {
    await page.goto("/logs");
    await page.getByRole("link", { name: /logs dashboard/i }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 30_000 });
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

  test("mobile hamburger opens the overlay menu and a link closes it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    // Sidebar is hidden on mobile; navigation lives behind the hamburger.
    const burger = page.getByRole("button", { name: /open menu/i });
    await expect(burger).toBeVisible();
    await burger.click();

    const overlayLink = page.getByRole("link", { name: "Logs List" });
    await expect(overlayLink).toBeVisible();

    await overlayLink.click();
    await expect(page).toHaveURL(/\/logs$/, { timeout: 30_000 });
    // Overlay closed after navigating.
    await expect(page.getByRole("button", { name: /open menu/i })).toBeVisible();
  });
});
