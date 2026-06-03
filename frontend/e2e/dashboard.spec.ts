import { test, expect } from "@playwright/test";

test.describe("Dashboard page", () => {
  test("renders summary cards, filters and both charts", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Filters")).toBeVisible();

    // Summary cards populate from the analytics summary endpoint.
    await expect(page.locator(".summary__card").first()).toBeVisible({ timeout: 15_000 });

    // Chart sections.
    await expect(page.getByText(/log trend over time/i)).toBeVisible();
    await expect(page.getByText(/severity distribution/i)).toBeVisible();
    // X-Charts render inline SVG.
    await expect(page.locator("svg").first()).toBeVisible();
  });

  test("changing the interval keeps the trend chart rendered", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/log trend over time/i)).toBeVisible({ timeout: 15_000 });

    await page.getByLabel("Interval").click();
    await page.getByRole("option", { name: "Week" }).click();

    await expect(page.getByText(/log trend over time/i)).toBeVisible();
  });

  test("toggling group-by to source updates the trend chart", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("button", { name: /by source/i })).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: /by source/i }).click();
    await expect(page.getByText(/log trend over time/i)).toBeVisible();
  });
});
