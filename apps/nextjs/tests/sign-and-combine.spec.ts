/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';

test('sign and combine functionality returns expected output', async ({ page }) => {
  // Navigate to the sign-and-combine page
  await page.goto('/sign-and-combine');
  
  // Create a promise that will resolve with the console log
  const consolePromise = new Promise<any>(resolve => {
    page.on('console', async msg => {
      if (msg.type() === 'log') {
        const args = await Promise.all(msg.args().map(arg => arg.jsonValue()));
        resolve(args[0]);
      }
    });
  });
  
  // Click the button that triggers the sign and combine operation
  await page.getByText('Demonstrate signAndCombineEcdsa on a Lit Action').click();
  
  // Wait for the console log and validate its structure
  const result = await consolePromise;
  
  // Validate the response structure
  expect(result).toHaveProperty('success');
  expect(result).toHaveProperty('signedData');
  expect(result).toHaveProperty('decryptedData');
  expect(result).toHaveProperty('claimData');
  expect(result).toHaveProperty('response');
  expect(result).toHaveProperty('logs');
  
  // Validate specific properties
  expect(result.success).toBe(true);
  expect(result.response).toMatch(/^Transaction Sent Successfully\. Transaction Hash: 0x[0-9a-fA-F]{64}$/);
  expect(result.logs).toMatch(/^Recovered Address: 0x[0-9a-fA-F]{40}\n$/);
});