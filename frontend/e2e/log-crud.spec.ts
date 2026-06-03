import { test, expect } from "@playwright/test";

/**
 * Full create → read → update → delete round-trip. Self-cleaning and
 * deterministic against the seeded DB because it only touches the entry it
 * creates (identified by a unique message).
 */
test("creates, edits and deletes a log entry", async ({ page }) => {
  const stamp = Date.now();
  const message = `E2E created ${stamp}`;
  const editedMessage = `E2E edited ${stamp}`;

  // ── Create ────────────────────────────────────────────────────────────
  await page.goto("/logs/new");
  await expect(page.getByRole("heading", { name: /create log entry/i })).toBeVisible();

  await page.getByLabel(/message/i).fill(message);
  await page.getByLabel(/severity/i).click();
  await page.getByRole("option", { name: "ERROR" }).click();
  await page.getByLabel(/source/i).click();
  await page.getByRole("option", { name: "auth-service" }).click();
  await page.getByRole("button", { name: /create log/i }).click();

  // Lands on the new detail page showing the created content.
  await expect(page).toHaveURL(/\/logs\/\d+$/);
  await expect(page.getByText(message)).toBeVisible();
  await expect(page.getByText("auth-service")).toBeVisible();

  // ── Update ────────────────────────────────────────────────────────────
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel(/message/i).fill(editedMessage);
  await page.getByRole("button", { name: /save changes/i }).click();

  await expect(page.getByText(editedMessage)).toBeVisible();

  // ── Delete ────────────────────────────────────────────────────────────
  await page.getByRole("button", { name: "Delete" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Delete" }).click();

  // Redirected back to the list.
  await expect(page).toHaveURL(/\/logs$/);
});
