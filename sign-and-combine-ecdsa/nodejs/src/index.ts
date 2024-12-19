import { LitClient } from '@lit-protocol/lit-agent-signer';

import { CHAIN_INFO, SWAP_PARAMS } from "./utils";
import { litActionCode } from "./litAction";

export const swapAITest = async () => {
  const client = await LitClient.create(process.env.LIT_AUTH_KEY!);
  const pkp = client.getPkp();

  const baseResult = await client.executeJs({
    code: litActionCode,
    jsParams: {
      pkp,
      params: SWAP_PARAMS.base,
      chainInfo: CHAIN_INFO.base
    }
  });

  const arbitrumResult = await client.executeJs({
    code: litActionCode,
    jsParams: {
      pkp,
      params: SWAP_PARAMS.arbitrum,
      chainInfo: CHAIN_INFO.arbitrum
    }
  });

  const optimismResult = await client.executeJs({
    code: litActionCode,
    jsParams: {
      pkp,
      params: SWAP_PARAMS.optimism,
      chainInfo: CHAIN_INFO.optimism
    }
  });

  console.log('Base Result:', baseResult);
  console.log('Arbitrum Result:', arbitrumResult);
  console.log('Optimism Result:', optimismResult);

  client.disconnect();
  return { baseResult, arbitrumResult, optimismResult };
};
