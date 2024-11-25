import { expect, use } from 'chai';
import chaiJsonSchema from 'chai-json-schema';
import { MintCapacityCreditsRes } from '@lit-protocol/types';
import ethers from 'ethers';

import { runExample as mintCapacityCredit } from 'via-contracts-sdk/src/index';
import { getEnv } from '../src/utils';
import { runExample } from '../src';

use(chaiJsonSchema);

const ETHEREUM_PRIVATE_KEY = getEnv('ETHEREUM_PRIVATE_KEY');

describe('Testing delegating Capacity Credit', () => {
  let delegatorEthersSigner: ethers.Wallet;
  let delegateeEthersSigner: ethers.Wallet;
  let mintedCapacityCredit: MintCapacityCreditsRes;

  before(async function () {
    this.timeout(120_000);
    delegatorEthersSigner = new ethers.Wallet(ETHEREUM_PRIVATE_KEY);
    delegateeEthersSigner = ethers.Wallet.createRandom();

    mintedCapacityCredit =
      (await mintCapacityCredit()) as MintCapacityCreditsRes;
  });

  it('should generate a delegation Auth Signature', async () => {
    const expectedDelegationAuthSigSchema = {
      type: 'object',
      required: ['sig', 'derivedVia', 'signedMessage', 'address'],
      properties: {
        sig: {
          type: 'string',
          pattern: '^0x[a-fA-F0-9]{130}$',
        },
        derivedVia: {
          type: 'string',
          const: 'web3.eth.personal.sign',
        },
        signedMessage: {
          type: 'string',
        },
        address: {
          type: 'string',
          const: delegatorEthersSigner.address,
        },
      },
    };

    const delegationAuthSig = await runExample(
      mintedCapacityCredit.capacityTokenIdStr,
      delegateeEthersSigner.address
    );
    expect(delegationAuthSig).to.be.jsonSchema(expectedDelegationAuthSigSchema);
  }).timeout(120_000);
});
