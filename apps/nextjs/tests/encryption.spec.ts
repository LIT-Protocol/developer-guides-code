import { test, expect } from "@playwright/test";
import path from "path";

const fileName = path.basename(__filename).replace(".spec.ts", "");

// Convert kebab-case to Title Case for page name
const testPageName = fileName
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") + " Page";

const operationId = "encryption-string";

test.describe(`${testPageName}`, () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    test.beforeEach(async ({ page }) => {
        await page.goto(`/encryption`);
    }, { timeout: 30000 });

    test(`shows correct states during transaction flow`, async ({ page }) => {
        // Verify initial state
        const button = page.getByTestId(`button-${operationId}`);
        await expect(button).toBeEnabled();
        await expect(button).toBeVisible();
        await expect(
            page.getByTestId(`success-${operationId}`)
        ).not.toBeVisible();
        await expect(
            page.getByTestId(`loading-${operationId}`)
        ).not.toBeVisible();

        // Click the button and verify loading state
        await button.click();
        await expect(button).toBeDisabled();
        await expect(page.getByTestId(`loading-${operationId}`)).toBeVisible();

        // Wait for success message (assuming the operation succeeds)
        await expect(page.getByTestId(`success-${operationId}`)).toBeVisible({
            timeout: 30000,
        });

        // Verify final state
        await expect(button).toBeEnabled();
        await expect(
            page.getByTestId(`loading-${operationId}`)
        ).not.toBeVisible();
    });
});
