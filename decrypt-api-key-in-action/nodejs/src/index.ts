import { accessControlConditions, LitServer } from "./lit";
import { SessionSigsMap } from "@lit-protocol/types";
import { litActionCode } from "./litAction";
import * as ethers from "ethers";

(async () => {
  try {
    const lit = new LitServer();
    const userAccount = new ethers.Wallet("3faafe8744f6f69d571001d8b52149448020a95752798191fe2adc28988803d8")
    const das = await lit.createDelegateAuthSig(userAccount.address);
    const sessionSigs = await lit.generateSessionSigs(userAccount, das);

    console.log("HAHAHAHAHAHA -1 ")
    const litActionResult = await lit.client.executeJs({
      code: litActionCode,
      sessionSigs,
      jsParams: {
        conditions: accessControlConditions.public,
        chain: "baseSepolia",
        nonce: 1,
        exp: Date.now() + 5 * 60 * 1000,
        publicKey: '04a68733c38c2c08d1ac9e78b8d00b8edbc6a9f6f5ff6020deb82e3494470f157af788264d18988cc0d2cca468b71b35ecc5df8497f399c70f7779484731de9bb7',
      },
    });
    console.log("HAHAHAHAHAHA - 2")
    const res = litActionResult.response as string;
    console.log(res)

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();