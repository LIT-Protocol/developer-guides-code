import { test, expect } from '@playwright/test';

test.describe('Wrapped Keys Page', () => {
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
            timeout: 30000 // These operations might take longer
        });

        // Verify final state
        await expect(button).toBeEnabled();
        await expect(loadingMessage).not.toBeVisible();
    }

    test('EIP-712 signing operation shows correct states', async ({ page }) => {
        await page.goto('/wrappedKeys');
        await testOperationFlow(page, 'eip712');
    });

    test('Ethereum transaction signing operation shows correct states', async ({ page }) => {
        await page.goto('/wrappedKeys');
        await testOperationFlow(page, 'ethereum');
    });

    test('Solana transaction signing operation shows correct states', async ({ page }) => {
        await page.goto('/wrappedKeys');
        await testOperationFlow(page, 'solana');
    });

    test('can execute all operations sequentially', async ({ page }) => {
        await page.goto('/wrappedKeys');
        
        // Test all operations in sequence
        const operations = ['eip712', 'ethereum', 'solana'];
        
        for (const operationId of operations) {
            const button = page.getByTestId(`button-${operationId}`);
            const loadingMessage = page.getByTestId(`loading-${operationId}`);
            const successMessage = page.getByTestId(`success-${operationId}`);

            await button.click();
            await expect(loadingMessage).toBeVisible();
            await expect(successMessage).toBeVisible({ timeout: 30000 });
        }

        // Verify all operations show success
        for (const operationId of operations) {
            await expect(page.getByTestId(`success-${operationId}`)).toBeVisible();
        }
    });

    test('handles errors appropriately', async ({ page }) => {
        await page.goto('/wrappedKeys');

        // Mock failed API calls
        await page.route('**/*', (route) => {
            route.fulfill({
                status: 500,
                body: 'Internal Server Error'
            });
        });

        // Test error state for each operation
        const operations = ['eip712', 'ethereum', 'solana'];
        
        for (const operationId of operations) {
            const button = page.getByTestId(`button-${operationId}`);
            const errorMessage = page.getByTestId(`error-${operationId}`);
            const successMessage = page.getByTestId(`success-${operationId}`);

            await button.click();
            await expect(errorMessage).toBeVisible();
            await expect(successMessage).not.toBeVisible();
        }
    });

    // Additional test for environment variable dependency
    test('handles missing environment variables gracefully', async ({ page }) => {
        await page.goto('/wrappedKeys');

        // Clear env variables through the page context
        await page.evaluate(() => {
            delete window.process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY;
        });

        // Test ethereum operation which requires env variable
        const button = page.getByTestId('button-ethereum');
        const errorMessage = page.getByTestId('error-ethereum');
        
        await button.click();
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toHaveText('NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY is not defined');
    });

    test('maintains UI responsiveness during long operations', async ({ page }) => {
        await page.goto('/wrappedKeys');

        // Start a long operation
        const ethereumButton = page.getByTestId('button-ethereum');
        await ethereumButton.click();

        // Verify other buttons remain clickable
        const eip712Button = page.getByTestId('button-eip712');
        const solanaButton = page.getByTestId('button-solana');

        await expect(eip712Button).toBeEnabled();
        await expect(solanaButton).toBeEnabled();

        // Verify the clicked button is disabled
        await expect(ethereumButton).toBeDisabled();
    });
});