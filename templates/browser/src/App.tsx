import { ethers, providers } from "ethers";
import { METAMASK_CHAIN_INFO_BY_NETWORK } from '@lit-protocol/constants';

import { Bulkie } from 'bulkie.js';

const NETWORK = 'datil';

function App() {

  const getSigner = async () => {

    // -- Request user to connect their wallet and switch network if needed
    const provider = new providers.Web3Provider((window as any).ethereum);
    await provider.send("eth_requestAccounts", []);

    // Check current network and switch if necessary
    const network = await provider.getNetwork();
    if (network.chainId !== METAMASK_CHAIN_INFO_BY_NETWORK[NETWORK].chainId) {
      try {
        await provider.send("wallet_switchEthereumChain", [{ chainId: ethers.utils.hexValue(METAMASK_CHAIN_INFO_BY_NETWORK[NETWORK].chainId) }]);
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await provider.send("wallet_addEthereumChain", [METAMASK_CHAIN_INFO_BY_NETWORK[NETWORK]]);
        } else {
          throw switchError;
        }
      }
    }

    const signer = provider.getSigner();
    const address = await signer.getAddress();
    console.log(`   ✅ Wallet connected: ${address}`);
    console.log(`     - Network: ${await provider.getNetwork()}`);
    console.log(`     - Address: ${address}`);
    console.log(`     - Balance: ${ethers.utils.formatEther(await signer.getBalance())} ETH`);
    return signer;
  };

  const go = async () => {

    console.log("Starting Bulkie");
    const signer = await getSigner();

    const alice = new Bulkie({
      network: NETWORK,
      signer: signer || window.ethereum.signer,
      guides: true,
      debug: true,
      litDebug: false,
    });

    await alice.connectToLitNodeClient()
      .then((client) => client.connectToLitContracts())
      .then((client) => client.mintPKP({ selfFund: true, amountInEth: "0.0001" }))
      .then((client) => client.mintCreditsToken({
        requestsPerKilosecond: 200,
        daysUntilUTCMidnightExpiration: 2
      }))
      .then((client) => client.createCreditsDelegationToken({
        creditsTokenId: client.getOutput('mintCreditsToken')!
      }))
      .then((client) => client.grantAuthMethodToUsePKP({
        pkpTokenId: client.getOutput('mintPKP')?.tokenId?.hex!,
        authMethodId: 'app-id-xxx:user-id-yyy',
        authMethodType: 918232,
        scopes: ['sign_anything']
      }));

    const litActionCode = `(async () => {
      const jsParams = {
        magicNumber: magicNumber,
        pkpPublicKey: pkpPublicKey,
        // privateKey: privateKey,
        // amountInEth: amountInEth,
        rpcUrl: rpcUrl,
      };
  
      const a = 1;
      const b = 2;
  
      const res = await Lit.Actions.runOnce(
        { waitForResponse: true, name: '002-bulkie-testing' },
        async () => {
          const provider = new ethers.providers.JsonRpcProvider(jsParams.rpcUrl);
          const wallet = ethers.Wallet.createRandom().connect(provider);
          
          // const wallet = new ethers.Wallet(jsParams.privateKey, provider);
  
          // const tx = await wallet.sendTransaction({
          //   to: wallet.address,
          //   value: ethers.utils.parseEther(jsParams.amountInEth),
          // });
  
          // await tx.wait();
  
          return JSON.stringify({ 
            MO: 'FO',
            privateKey: wallet.privateKey,
          });
        }
      );
  
      if(a + b === jsParams.magicNumber){
        Lit.Actions.setResponse({
          response: JSON.stringify(\`(true, $\{res}\)\`),
        });
      }else{
        LitActions.setResponse({ response: "false" });  
      }
  
    })()`;

    await alice.createAccessToken({
      type: 'custom_auth',
      pkpPublicKey: alice.getOutput('mintPKP')?.publicKey as `0x${string}`,
      creditsDelegationToken: alice.getOutput('createCreditsDelegationToken'),
      resources: [
        { type: 'pkp-signing', request: '*' },
        { type: 'lit-action-execution', request: '*' },
      ],
      permissions: {
        grantIPFSCIDtoUsePKP: {
          scopes: ['sign_anything']
        },
      },
      code: litActionCode,
      // ipfsCid: ipfsCid,
      jsParams: {
        pkpPublicKey: alice.getOutput('mintPKP')?.publicKey as `0x${string}`,
        rpcUrl: 'https://yellowstone-rpc.litprotocol.com',
        magicNumber: 3,
        // privateKey: process.env.PRIVATE_KEY as string,
        // amountInEth: "0.00001",
      },
    });

    const accessToken = alice.getOutput('createAccessToken');

    const litNodeClient = alice.getOutput('connectToLitNodeClient');

    const res = await litNodeClient?.executeJs({
      sessionSigs: accessToken!,
      code: `(async () => {
        console.log("Testing");
      })();`,
    })

    console.log("res:", res);

  };

  return (
    <>
      <div className="card">
        <hr />
        <h3>REPLACE_ME</h3>
        <button onClick={async () => await go()}>
          go
        </button>
        <h5> Check the browser console! </h5>
        <hr />
      </div>
    </>
  );
}

export default App;
