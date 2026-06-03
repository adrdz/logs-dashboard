import { test, expect } from "@playwright/test";

test.describe("Logs list page", () => {
  test("renders the toolbar, filters and a populated grid", async ({ page }) => {
    await page.goto("/logs");

    await expect(page.getByRole("heading", { name: "Logs" })).toBeVisible();
    await expect(page.getByRole("button", { name: /export csv/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /new log/i })).toBeVisible();

    // Filter panel.
    await expect(page.getByText("Filters")).toBeVisible();
    await expect(page.getByLabel(/search messages/i)).toBeVisible();

    // Seeded data renders rows in the grid.
    await expect(page.locator(".MuiDataGrid-row").first()).toBeVisible({ timeout: 15_000 });
  });

  test("clicking a row opens its detail page", async ({ page }) => {
    await page.goto("/logs");
    await page.locator(".MuiDataGrid-row").first().click();
    await expect(page).toHaveURL(/\/logs\/\d+$/);
    await expect(page.getByRole("heading", { name: /log #\d+/i })).toBeVisible();
  });

  test("search input filters the grid without error", async ({ page }) => {
    await page.goto("/logs");
    await expect(page.locator(".MuiDataGrid-row").first()).toBeVisible({ timeout: 15_000 });
    await page.getByLabel(/search messages/i).fill("zzz-unlikely-match-zzz");
    // Either no rows, or an explicit "no rows" overlay — the grid must not crash.
    await expect(page.locator(".MuiDataGrid-root")).toBeVisible();
  });
});
