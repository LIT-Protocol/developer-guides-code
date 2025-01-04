import { test, expect } from "@playwright/test";
import path from "path";

const fileName = path.basename(__filename).replace(".spec.ts", "");

// Convert kebab-case to Title Case for page name
const testPageName = fileName
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") + " Page";

test.describe.serial(`${testPageName}`, () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    test.beforeEach(async ({ page }) => {
        await page.goto("/session-signatures");
    }, { timeout: 30000 });

    async function testOperationFlow(page: any, operationId: string) {
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
    }

    test("Lit Action operation shows correct states", async ({ page }) => {
        await testOperationFlow(page, "lit-action");
    });

    test("PKP operation shows correct states", async ({ page }) => {
        await testOperationFlow(page, "pkp");
    });

    test("AuthSig operation shows correct states", async ({ page }) => {
        await testOperationFlow(page, "auth-sig");
    });
});
