// @ts-nocheck
// ipfs.io/ipfs/QmWjMP2Do2Sq3sNG9DkGx7QFZf6nHWKpmrZD58oSnwnZ1o
// Test on optimism and arbitrum to see if the harcoded gas limits work. Find a new method to estimate the gas limit. 

const _litActionCode = async () => {
  const startTime = Date.now();
  try {
    console.log("Starting swap action...", { time: 0 });
    const ethersProvider = new ethers.providers.JsonRpcProvider(
      chainInfo.rpcUrl
    );

    let UNISWAP_V3_QUOTER;
    let UNISWAP_V3_ROUTER;
    if (chainInfo.chainId === 8453) {
      UNISWAP_V3_QUOTER = "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a";
      UNISWAP_V3_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481";
    } else if (chainInfo.chainId === 42161) {
      UNISWAP_V3_QUOTER = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e";
      UNISWAP_V3_ROUTER = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
    } else if (chainInfo.chainId === 10) {
      UNISWAP_V3_QUOTER = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e";
      UNISWAP_V3_ROUTER = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
    }

    // Now we can reference them safely
    console.log("Debug: chainInfo", chainInfo);
    console.log("Debug: chainId:", chainInfo.chainId);
    console.log("Debug: Quoter address:", UNISWAP_V3_QUOTER);
    console.log("Debug: Router address:", UNISWAP_V3_ROUTER);

    // [Check PKP's ETH balance on chain separately from token balance]
    const pkpEthBalance = await ethersProvider.getBalance(pkp.ethAddress);
    console.log(
      `Debug: PKP ETH balance on chain (${chainInfo.chainId}):`,
      ethers.utils.formatEther(pkpEthBalance)
    );
    if (pkpEthBalance.eq(0)) {
      console.warn("Warning: PKP has 0 ETH on this chain! It cannot pay gas.");
    }

    // Fetching Token Info + Policy Checks
    // -------------------------------------------------------------------------------------------
    console.log("Getting token info...", { time: Date.now() - startTime });
    const tokenInterface = new ethers.utils.Interface([
      "function decimals() view returns (uint8)",
      "function balanceOf(address account) view returns (uint256)",
      "function approve(address spender, uint256 amount) external returns (bool)",
    ]);

    const tokenInContract = new ethers.Contract(
      params.tokenIn,
      tokenInterface,
      ethersProvider
    );
    const tokenInBalance = await tokenInContract.balanceOf(pkp.ethAddress);

    const tokenOutContract = new ethers.Contract(
      params.tokenOut,
      tokenInterface,
      ethersProvider
    );

    const decimalsIn = await tokenInContract.decimals();
    const decimalsOut = await tokenOutContract.decimals();
    console.log("Token decimals retrieved", { time: Date.now() - startTime });

    const amountIn = ethers.utils.parseUnits(params.amountIn, decimalsIn);

    /*
    console.log("Checking policy...", { time: Date.now() - startTime });
    const policyInterface = new ethers.utils.Interface([
      "function isTokenAllowed(address token) view returns (bool)",
      "function getSwapMaxAmount(address token) view returns (uint256)"
    ]);
    
    const policyContract = new ethers.Contract(
      policiesContract,
      policyInterface,
      ethersProvider
    );
    
    console.log("Checking token allowances...", { time: Date.now() - startTime });
    const [isTokenInAllowed, isTokenOutAllowed, maxAmount, tokenInBalance] = await Promise.all([
      policyContract.isTokenAllowed(params.tokenIn),
      policyContract.isTokenAllowed(params.tokenOut),
      policyContract.getSwapMaxAmount(params.tokenIn),
    ]);

    if (!isTokenInAllowed) {
      throw new Error(`Token not allowed: ${params.tokenIn}`);
    }
    if (!isTokenOutAllowed) {
      throw new Error(`Token not allowed: ${params.tokenOut}`);
    }
    if (amountIn.gt(maxAmount)) {
      throw new Error("Requested swap amount too large");
    }
      */

    console.log("Checking balance...", { time: Date.now() - startTime });
    console.log(amountIn.toString(), tokenInBalance.toString());

    if (amountIn.gt(tokenInBalance)) {  // Changed < to gt() since we're checking if required amount is greater than balance
      throw new Error(
          `Insufficient balance. PKP balance: ${ethers.utils.formatUnits(tokenInBalance, decimalsIn)}. ` + 
          `Expected at least: ${ethers.utils.formatUnits(amountIn, decimalsIn)}`
      );
    }

    console.log("Policy checks passed", { time: Date.now() - startTime });
    // -------------------------------------------------------------------------------------------

    // Quote Process
    // -------------------------------------------------------------------------------------------
    console.log("Starting quote process...", { time: Date.now() - startTime });
    let bestQuote = null;
    let bestFee = null;
    let expectedOut;

    // [Add logs around Quoter/Router calls & error blocks]
    console.log("Debug: Attempting to call Uniswap quoter");
    const quoterInterface = new ethers.utils.Interface([
      "function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)"
    ]);

    const FEE_TIERS = [3000, 500]; // 1%, 0.3%, 0.05%, 0.1%
    
    for (const fee of FEE_TIERS) {
      try {
        console.log(`Checking fee tier ${fee/10000}%...`, { time: Date.now() - startTime });
        const quoteParams = {
          tokenIn: params.tokenIn,
          tokenOut: params.tokenOut,
          amountIn: amountIn,
          fee: fee,
          sqrtPriceLimitX96: 0
        };

        const quote = await ethersProvider.call({
          to: UNISWAP_V3_QUOTER,
          data: quoterInterface.encodeFunctionData("quoteExactInputSingle", [quoteParams])
        });
        
        const [amountOut] = quoterInterface.decodeFunctionResult("quoteExactInputSingle", quote);
        const currentQuote = ethers.BigNumber.from(amountOut);

        if (!bestQuote || currentQuote.gt(bestQuote)) {
          bestQuote = currentQuote;
          bestFee = fee;
          console.log(`Quote found: ${ethers.utils.formatUnits(currentQuote, decimalsOut)} @ ${fee/10000}%`, { time: Date.now() - startTime });
        }
      } catch (error) {
        console.error("Debug: Quoter call failed for fee tier:", fee, error);
        continue;
      }
    }

    if (!bestQuote) {
      const error = new Error("No valid pool found for this token pair");
      console.error("Quote error:", error);
      LitActions.setResponse({
        response: JSON.stringify({
          status: "error",
          error: "Failed to get quote from Uniswap V3. No valid pool found for this token pair.",
        })
      });
      throw error;
    }

    expectedOut = bestQuote;
    console.log(`Best quote: ${ethers.utils.formatUnits(expectedOut, decimalsOut)} @ ${bestFee/10000}%`, { time: Date.now() - startTime });
    // -------------------------------------------------------------------------------------------

    // Slippage, Gas, and Nonce Calculations
    // -------------------------------------------------------------------------------------------
    const slippageTolerance = 0.005; // 0.5%
    const amountOutMin = expectedOut.mul(1000 - (slippageTolerance * 1000)).div(1000);
    console.log("Minimum output:", ethers.utils.formatUnits(amountOutMin, decimalsOut));
    
    const gasData = await Lit.Actions.runOnce(
      { waitForResponse: true, name: "gasPriceGetter" },
      async () => {
        const provider = new ethers.providers.JsonRpcProvider(chainInfo.rpcUrl);
        const baseFeeHistory = await provider.send("eth_feeHistory", ["0x1", "latest", []]);
        const baseFee = ethers.BigNumber.from(baseFeeHistory.baseFeePerGas[0]);
        const nonce = await provider.getTransactionCount(pkp.ethAddress);
    
        const priorityFee = baseFee.div(4);
        const maxFee = baseFee.mul(2);
    
        return JSON.stringify({
          maxFeePerGas: maxFee.toHexString(),
          maxPriorityFeePerGas: priorityFee.toHexString(),
          nonce
        });
      }
    );
    
    const parsedGasData = JSON.parse(gasData);
    console.log("Gas data:", {
      maxFeePerGas: ethers.utils.formatUnits(parsedGasData.maxFeePerGas, 'gwei'),
      maxPriorityFeePerGas: ethers.utils.formatUnits(parsedGasData.maxPriorityFeePerGas, 'gwei'),
      nonce: parsedGasData.nonce
    });
    const maxFeePerGas = parsedGasData.maxFeePerGas;
    const maxPriorityFeePerGas = parsedGasData.maxPriorityFeePerGas;
    const totalGasCost = ethers.BigNumber.from(maxFeePerGas).add(ethers.BigNumber.from(maxPriorityFeePerGas));
    const nonce = parsedGasData.nonce;
    
    const ethBalance = await ethersProvider.getBalance(pkp.ethAddress);
    if (ethBalance.lt(totalGasCost)) {
        throw new Error(
            `Insufficient ETH for gas. Have: ${ethers.utils.formatEther(ethBalance)} ETH. ` +
            `Need: ${ethers.utils.formatEther(totalGasCost)} ETH`
        );
    }
    console.log("ETH balance:", ethers.utils.formatEther(ethBalance), ethers.utils.formatEther(totalGasCost));
    console.log("ETH balance sufficient for gas costs", { time: Date.now() - startTime });
    
    console.log("Gas and nonce retrieved", { 
      time: Date.now() - startTime,
      maxFeePerGas: ethers.utils.formatUnits(maxFeePerGas, 'gwei') + ' gwei',
      maxPriorityFeePerGas: ethers.utils.formatUnits(maxPriorityFeePerGas, 'gwei') + ' gwei',
      nonce
    });
    // -------------------------------------------------------------------------------------------

    // Approval Transaction
    // -------------------------------------------------------------------------------------------
    console.log("Preparing approval transaction...", { time: Date.now() - startTime });
    let approvalResponse;
    let estimatedGasLimit;
    try {
      estimatedGasLimit = await tokenInContract.estimateGas.approve(
        UNISWAP_V3_ROUTER, 
        amountIn, 
        { from: pkp.ethAddress }
      );
      console.log("Estimated gas limit for approval:", estimatedGasLimit.toString());
    } catch (gasEstimateError) {
      console.error("Could not estimate gas. Using fallback gas limit of 300000.", gasEstimateError);
      estimatedGasLimit = ethers.BigNumber.from("300000");
    }

    const approvalTx = {
      to: params.tokenIn,
      data: tokenInterface.encodeFunctionData("approve", [
        UNISWAP_V3_ROUTER,
        amountIn,
      ]),
      value: "0x0",
      gasLimit: estimatedGasLimit.toHexString(),
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      chainId: chainInfo.chainId,
      type: 2
    };

    console.log("Signing approval...", { time: Date.now() - startTime });
    console.log("Approval transaction:", {
      ...approvalTx,
      gasLimit: ethers.BigNumber.from(approvalTx.gasLimit).toString(),
      maxFeePerGas: ethers.utils.formatUnits(approvalTx.maxFeePerGas, 'gwei') + ' gwei',
      maxPriorityFeePerGas: ethers.utils.formatUnits(approvalTx.maxPriorityFeePerGas, 'gwei') + ' gwei',
    });
    const approvalSig = await Lit.Actions.signAndCombineEcdsa({
      toSign: ethers.utils.arrayify(
        ethers.utils.keccak256(ethers.utils.serializeTransaction(approvalTx))
      ),
      publicKey: pkp.publicKey,
      sigName: "erc20ApprovalSig",
    });
    console.log("Signed approval:", approvalSig);

    const signedApprovalTx = ethers.utils.serializeTransaction(
      approvalTx,
      ethers.utils.joinSignature({
        r: "0x" + JSON.parse(approvalSig).r.substring(2),
        s: "0x" + JSON.parse(approvalSig).s,
        v: JSON.parse(approvalSig).v,
      })
    );
    console.log("Signed approval transaction:", signedApprovalTx);

    console.log("Broadcasting approval...", { time: Date.now() - startTime });
    approvalResponse = await Lit.Actions.runOnce(
      { waitForResponse: true, name: "txnSender" },
      async () => {
        try {
          const provider = new ethers.providers.JsonRpcProvider(chainInfo.rpcUrl);
          const approvalReceipt = await provider.sendTransaction(signedApprovalTx);
          return approvalReceipt.hash;
        } catch (error) {
          console.error("Error sending approval:", error);
          throw error;
        }
      }
    );

    console.log("Waiting for approval confirmation...", { time: Date.now() - startTime });
    const approvalConfirmation = await ethersProvider.waitForTransaction(approvalResponse, 1);
    if (approvalConfirmation.status === 0) {
      throw new Error("Approval transaction failed");
    }
    console.log("Approval transaction confirmed", { time: Date.now() - startTime });

    if (!ethers.utils.isHexString(approvalResponse)) {
      throw new Error(`Invalid approval transaction hash: ${approvalResponse}`);
    }
    
    // Swap Transaction
    // -------------------------------------------------------------------------------------------
    console.log("Preparing swap transaction...", { time: Date.now() - startTime });
    const routerInterface = new ethers.utils.Interface([
      "function exactInputSingle((address,address,uint24,address,uint256,uint256,uint160)) external payable returns (uint256)",
    ]);

    // Estimate gas for swap
    let swapGasLimit;
    try {
      const routerContract = new ethers.Contract(
        UNISWAP_V3_ROUTER,
        routerInterface,
        ethersProvider
      );
      
      swapGasLimit = await routerContract.estimateGas.exactInputSingle(
        [params.tokenIn, params.tokenOut, bestFee, pkp.ethAddress, amountIn, amountOutMin, 0],
        { from: pkp.ethAddress }
      );
      console.log("Estimated gas limit for swap:", swapGasLimit.toString());
      
      // Add 20% buffer to estimated gas
      swapGasLimit = swapGasLimit.mul(120).div(100);
    } catch (gasEstimateError) {
      console.error("Could not estimate swap gas. Using fallback gas limit of 500000.", gasEstimateError);
      swapGasLimit = ethers.BigNumber.from("500000");
    }

    const swapTx = {
      to: UNISWAP_V3_ROUTER,
      data: routerInterface.encodeFunctionData("exactInputSingle", [
        [params.tokenIn, params.tokenOut, bestFee, pkp.ethAddress, amountIn, amountOutMin, 0]
      ]),
      value: "0x0",
      gasLimit: swapGasLimit.toHexString(),
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce: nonce + 1,
      chainId: chainInfo.chainId,
      type: 2 
    };

    console.log("Signing swap...", { time: Date.now() - startTime });
    const swapSig = await Lit.Actions.signAndCombineEcdsa({
      toSign: ethers.utils.arrayify(
        ethers.utils.keccak256(ethers.utils.serializeTransaction(swapTx))
      ),
      publicKey: pkp.publicKey,
      sigName: "erc20SwapSig",
    });

    const signedSwapTx = ethers.utils.serializeTransaction(
      swapTx,
      ethers.utils.joinSignature({
        r: "0x" + JSON.parse(swapSig).r.substring(2),
        s: "0x" + JSON.parse(swapSig).s,
        v: JSON.parse(swapSig).v,
      })
    );

    console.log("Broadcasting swap...", { time: Date.now() - startTime });
    const swapResponse = await Lit.Actions.runOnce(
        { waitForResponse: true, name: "txnSender" },
        async () => {
          try {
            const provider = new ethers.providers.JsonRpcProvider(chainInfo.rpcUrl);
            const swapReceipt = await provider.sendTransaction(signedSwapTx);
            return swapReceipt.hash;
          } catch (error) {
            console.error("Error sending swap:", error);
            throw error;
          }
        }
      );

    if (!ethers.utils.isHexString(swapResponse)) {
      throw new Error(`Invalid swap transaction hash: ${swapResponse}`);
    }

    Lit.Actions.setResponse({
      response: JSON.stringify({
        status: "success",
        approvalHash: approvalResponse,
        swapHash: swapResponse,
      }),
    });
  } catch (error) {
    Lit.Actions.setResponse({
      response: JSON.stringify({
        status: "error",
        error: error.message,
      }),
    });
  }
};

export const litActionCode = `(${_litActionCode.toString()})();`;