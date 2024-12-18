import { expect, use } from 'chai';
import chaiJsonSchema from 'chai-json-schema';

import { getEnv } from '../src/utils';
import { runExample } from '../src';

use(chaiJsonSchema);

describe('Testing Lit decryption using a Solana SIWS message', () => {
  const EXPECTED_DECRYPTED_STRING =
    'The answer to life, the universe, and everything is 42.';

  it('should decrypt the string', async () => {
    const decryptedString = await runExample();
    expect(decryptedString).to.equal(EXPECTED_DECRYPTED_STRING);
  }).timeout(120_000);
});
