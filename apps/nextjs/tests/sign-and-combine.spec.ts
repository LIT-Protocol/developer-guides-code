import { test, expect } from '@playwright/test';

test.describe('Sign and Combine Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/sign-and-combine');
    });

    test('shows correct states during transaction flow', async ({ page }) => {
        // Verify initial state
        const button = page.getByTestId('button-signAndCombine');
        await expect(button).toBeEnabled();
        await expect(button).toBeVisible();
        await expect(page.getByTestId('success-signAndCombine')).not.toBeVisible();
        await expect(page.getByTestId('loading-signAndCombine')).not.toBeVisible();
        
        // Click the button and verify loading state
        await button.click();
        await expect(button).toBeDisabled();
        await expect(page.getByTestId('loading-signAndCombine')).toBeVisible();
        
        // Wait for success message (assuming the operation succeeds)
        await expect(page.getByTestId('success-signAndCombine')).toBeVisible({ 
            timeout: 30000
        });
        
        // Verify final state
        await expect(button).toBeEnabled();
        await expect(page.getByTestId('loading-signAndCombine')).not.toBeVisible();
    });

    test('shows error state when transaction fails', async ({ page }) => {
        const button = page.getByTestId('button-signAndCombine');
        await button.click();
        
        await expect(page.getByTestId('error-signAndCombine')).toBeVisible({
            timeout: 30000
        });
    });
});