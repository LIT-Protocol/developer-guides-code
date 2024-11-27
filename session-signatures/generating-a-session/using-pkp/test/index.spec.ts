import { expect, use } from 'chai';
import chaiJsonSchema from 'chai-json-schema';
import { LIT_NETWORK } from '@lit-protocol/constants';

import { getpkpSessionSigs } from '../src';
import { getEthersSigner } from '../src/utils';
import { mintPkp, getLitContracts } from './testUtils';

use(chaiJsonSchema);

describe('getSessionSigsPKP', () => {
  let pkp: {
    tokenId: any;
    publicKey: string;
    ethAddress: string;
  };

  before(async function () {
    this.timeout(120_000);

    const ethersSigner = getEthersSigner();
    const litContracts = await getLitContracts(ethersSigner);
    pkp = await mintPkp(litContracts);
  });

  it('Attempting to get session signatures...', async () => {
    const sessionSigResponseSchema = {
      type: 'object',
      patternProperties: {
        '^https://\\d+\\.\\d+\\.\\d+\\.\\d+:\\d+$': {
          type: 'object',
          properties: {
            sig: { type: 'string' },
            derivedVia: { type: 'string' },
            signedMessage: { type: 'string' },
            address: { type: 'string' },
            algo: { type: 'string' },
          },
          required: ['sig', 'derivedVia', 'signedMessage', 'address', 'algo'],
        },
      },
      additionalProperties: false,
    };

    const sessionSignatures = await getpkpSessionSigs(
      LIT_NETWORK.DatilTest,
      pkp
    );
    expect(sessionSignatures).to.be.jsonSchema(sessionSigResponseSchema);
  }).timeout(120_000);
});
