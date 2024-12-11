import { test, expect } from "@playwright/test";

test.describe.serial("Wrapped Keys Page", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/wrapped-keys");
    });

    // Helper function to test a single operation flow
    async function testOperationFlow(page: any, operationId: string) {
        // Get elements using data-testid
        const button = page.getByTestId(`button-${operationId}`);
        const loadingMessage = page.getByTestId(`loading-${operationId}`);
        const successMessage = page.getByTestId(`success-${operationId}`);

        // Verify initial state
        await expect(button).toBeEnabled();
        await expect(button).toBeVisible();
        await expect(successMessage).not.toBeVisible();
        await expect(loadingMessage).not.toBeVisible();

        // Click button and verify loading state
        await button.click();
        await expect(button).toBeDisabled();
        await expect(loadingMessage).toBeVisible();

        // Wait for success message
        await expect(successMessage).toBeVisible({
            timeout: 30000, // These operations might take longer
        });

        // Verify final state
        await expect(button).toBeEnabled();
        await expect(loadingMessage).not.toBeVisible();
    }

    test("EIP-712 signing operation shows correct states", async ({ page }) => {
        await testOperationFlow(page, "eip712");
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
