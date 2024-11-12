// @ts-nocheck

export const signEthTransaction = `(async () => {
  function getValidatedUnsignedTx(unsignedTransaction) {
    try {
      if (!unsignedTransaction.toAddress) {
        throw new Error("Missing required field: toAddress");
      }

      if (!unsignedTransaction.chain) {
        throw new Error("Missing required field: chain");
      }

      if (!unsignedTransaction.chainId) {
        throw new Error("Missing required field: chainId");
      }

      return {
        to: unsignedTransaction.toAddress,
        value: ethers.utils.hexlify(
          ethers.utils.parseEther(unsignedTransaction.value)
        ),
        chainId: unsignedTransaction.chainId,
        data: unsignedTransaction.dataHex,
      };
    } catch (err) {
      throw new Error(
        \`Invalid unsignedTransaction - \${err.message}\`
      );
    }
  }

  async function getLatestNonce({ walletAddress, chain }) {
    try {
      const nonce = await Lit.Actions.getLatestNonce({
        address: walletAddress,
        chain: chain,
      });
      return nonce;
    } catch (err) {
      throw new Error(\`Unable to get latest nonce - \${err.message}\`);
    }
  }

  async function getEthersRPCProvider({ chain }) {
    try {
      const rpcUrl = await Lit.Actions.getRpcUrl({ chain });
      return new ethers.providers.JsonRpcProvider(rpcUrl);
    } catch (err) {
      throw new Error(
        \`Getting the rpc for the chain: \${chain} - \${err.message}\`
      );
    }
  }

  async function getGasPrice({ userProvidedGasPrice, provider }) {
    try {
      if (userProvidedGasPrice) {
        return ethers.utils.parseUnits(userProvidedGasPrice, "gwei");
      } else {
        return await provider.getGasPrice();
      }
    } catch (err) {
      throw new Error(\`When getting gas price - \${err.message}\`);
    }
  }

  async function getGasLimit({ provider, userProvidedGasLimit, validatedTx }) {
    if (userProvidedGasLimit) {
      return userProvidedGasLimit;
    } else {
      try {
        return await provider.estimateGas(validatedTx);
      } catch (err) {
        throw new Error(\`When estimating gas - \${err.message}\`);
      }
    }
  }

  async function signTransaction({ validatedTx, pkpPublicKey }) {
    try {
      const serializedTx = ethers.utils.serializeTransaction(validatedTx);
      const messageHash = ethers.utils.keccak256(serializedTx);
      
      const sig = await Lit.Actions.signAndCombineEcdsa({
        toSign: ethers.utils.arrayify(messageHash),
        // Remove the 0x prefix
        publicKey: pkpPublicKey.substring(2),
        sigName: "tx-signature",
      });

      const jsonSignature = JSON.parse(sig);
      jsonSignature.r = "0x" + jsonSignature.r.substring(2);
      jsonSignature.s = "0x" + jsonSignature.s;
      const hexSignature = ethers.utils.joinSignature(jsonSignature);

      return ethers.utils.serializeTransaction(
        validatedTx,
        hexSignature
      );
    } catch (err) {
      throw new Error(\`When signing transaction - \${err.message}\`);
    }
  }

  const validatedTx = getValidatedUnsignedTx(unsignedTransaction);
  const [nonce, provider] = await Promise.all([
    getLatestNonce({
      walletAddress: pkpEthAddress,
      chain: unsignedTransaction.chain,
    }),
    getEthersRPCProvider({
      chain: unsignedTransaction.chain,
    }),
  ]);

  validatedTx.nonce = nonce;

  validatedTx.gasPrice = await getGasPrice({
    provider,
    userProvidedGasPrice: unsignedTransaction.gasPrice,
  });

  validatedTx.gasLimit = await getGasLimit({
    provider,
    validatedTx,
    userProvidedGasLimit: unsignedTransaction.gasLimit,
  });

  const signedTx = await signTransaction({
    validatedTx,
    pkpPublicKey,
  });

  if (!broadcast) {
    return LitActions.setResponse({ response: signedTx });
  }

  const txHash = await Lit.Actions.runOnce(
    { waitForResponse: true, name: "txSender" },
    async () => {
      try {
        const tx = await provider.sendTransaction(signedTx);
        return tx.hash;
      } catch (error) {
        throw new Error(\`When sending transaction - \${error.message}\`);
      }
    }
  );

  Lit.Actions.setResponse({ response: txHash });
})()`;
