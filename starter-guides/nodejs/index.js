require('dotenv').config();
const { LitNodeClientNodeJs } = require('@lit-protocol/lit-node-client-nodejs');
const { LitNetwork } = require('@lit-protocol/constants');
const { LitContracts } = require('@lit-protocol/contracts-sdk');
const { ethers, BigNumber, utils } = require('ethers');
const { EthWalletProvider } = require('@lit-protocol/lit-auth-client');

const connectToLit = async () => {
  const ethersWallet = new ethers.Wallet(process.env.PRIVATE_KEY);

  // First connect to LitNodeClient
  const litNodeClient = new LitNodeClientNodeJs({
    litNetwork: LitNetwork.DatilDev,
    debug: true
  });
  await litNodeClient.connect();
  
  // Then setup contracts client
  const contractClient = new LitContracts({
    litNetwork: LitNetwork.DatilDev,
    debug: true,
    signer: ethersWallet
  });
  await contractClient.connect();

  const authMethod = await EthWalletProvider.authenticate({signer: ethersWallet, litNodeClient});
  console.log("Auth Method:", authMethod);

  console.log("Claiming Key ID...");
    const { derivedKeyId, signatures } = await litNodeClient.claimKeyId({
      authMethod,
      signer: ethersWallet
    });
  console.log("Claimed Key ID:", derivedKeyId);
  console.log("Signatures:", signatures);

    // Now mint the PKP with the claimed key
    const claimTx = await contractClient.pkpHelperContract.write.claimAndMint(
      derivedKeyId,
      signatures,
      2, // keyType 2 for ECDSA
    );
    console.log("Claim Tx:", claimTx);

    const claimTxReceipt = await claimTx.wait(1);
    console.log("[mintPKP] PKP claim receipt:", claimTxReceipt);

};

connectToLit();
