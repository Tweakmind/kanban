import { expect, test } from "@playwright/test";

test.describe("Kanban board", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("kanban-board")).toBeVisible({
      timeout: 30_000,
    });
  });

  test("loads dummy board data", async ({ page }) => {
    await expect(page.getByTestId("kanban-board")).toBeVisible();
    await expect(page.getByTestId("column-col-backlog")).toBeVisible();
    await expect(page.getByText("Design board chrome")).toBeVisible();
    await expect(page.getByText("Pick drag-and-drop library")).toBeVisible();
  });

  test("renames a column", async ({ page }) => {
    const col = page.getByTestId("column-col-review");
    await col.scrollIntoViewIfNeeded();
    await col.getByTestId("column-title-col-review").click();
    const input = col.getByTestId("column-title-input-col-review");
    await expect(input).toBeVisible();
    await input.fill("Code review");
    await input.blur();
    await expect(col.getByTestId("column-title-col-review")).toHaveText(
      "Code review"
    );
  });

  test("adds a card to a column", async ({ page }) => {
    const col = page.getByTestId("column-col-backlog");
    await col.scrollIntoViewIfNeeded();
    await col.getByTestId("add-card-open-col-backlog").click();
    const titleInput = col.getByTestId("add-card-title-col-backlog");
    await expect(titleInput).toBeVisible();
    await titleInput.fill("E2E card");
    await col.getByTestId("add-card-details-col-backlog").fill("From Playwright");
    await col.getByRole("button", { name: "Add card" }).click();
    await expect(col.getByText("E2E card")).toBeVisible();
    await expect(col.getByText("From Playwright")).toBeVisible();
  });

  test("deletes a card", async ({ page }) => {
    const col = page.getByTestId("column-col-done");
    await col.scrollIntoViewIfNeeded();
    await expect(col.getByTestId("card-card-7")).toBeVisible();
    await col.getByTestId("delete-card-card-7").click();
    await expect(col.getByTestId("card-card-7")).toHaveCount(0);
  });

  test("drags a card between columns", async ({ page }) => {
    const source = page.getByTestId("column-col-backlog");
    const target = page.getByTestId("column-col-ready");
    await source.scrollIntoViewIfNeeded();
    await target.scrollIntoViewIfNeeded();
    const handle = page.getByTestId("card-title-card-2");
    const handleBox = await handle.boundingBox();
    const targetBox = await target.boundingBox();
    expect(handleBox).toBeTruthy();
    expect(targetBox).toBeTruthy();
    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      targetBox!.x + targetBox!.width / 2,
      targetBox!.y + Math.min(160, targetBox!.height / 2 + 40),
      { steps: 28 }
    );
    await page.mouse.up();
    await expect(target.getByTestId("card-card-2")).toBeVisible({
      timeout: 10_000,
    });
    await expect(source.getByTestId("card-card-2")).toHaveCount(0);
  });
});
