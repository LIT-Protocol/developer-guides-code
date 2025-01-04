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
        await page.goto("/wrapped-keys");
    }, { timeout: 30000 });

    // Helper function to test a single operation flow
    async function testOperationFlow(page: any, operationId: string) {
        // Get elements using data-testid
        const button = page.getByTestId(`button-${operationId}`);

        // Verify initial state
        await expect(button).toBeEnabled();
        await expect(button).toBeVisible();
        await expect(page.getByTestId(`success-${operationId}`)).not.toBeVisible();
        await expect(page.getByTestId(`loading-${operationId}`)).not.toBeVisible();

        // Click button and verify loading state
        await button.click();
        await expect(button).toBeDisabled();
        await expect(page.getByTestId(`loading-${operationId}`)).toBeVisible();

        // Wait for success message
        await expect(page.getByTestId(`success-${operationId}`)).toBeVisible({
            timeout: 60000, // These operations might take longer
        });

        // Verify final state
        await expect(button).toBeEnabled();
        await expect(page.getByTestId(`loading-${operationId}`)).not.toBeVisible();
    }

    test("EIP-712 signing operation shows correct states", async ({ page }) => {
        await testOperationFlow(page, "eip-712");
    });

    test("Ethereum transaction signing operation shows correct states", async ({
        page,
    }) => {
        await testOperationFlow(page, "ethereum");
    });

    test("Solana transaction signing operation shows correct states", async ({
        page,
    }) => {
        await testOperationFlow(page, "solana");
    });
});
