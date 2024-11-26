// @ts-nocheck

const _litActionCode = async () => {
    try {
        const tokenId = await Lit.Actions.pubkeyToTokenId({ publicKey: pkpPublicKey });
        const permittedAuthMethods = await Lit.Actions.getPermittedAuthMethods({ tokenId });
        const isPermitted = permittedAuthMethods.some((permittedAuthMethod) => {
            if (permittedAuthMethod["auth_method_type"] === "0x4e663" && 
                permittedAuthMethod["id"] === customAuthMethod.authMethodId) {
                return true;
            }
            return false;
        });
        LitActions.setResponse({ response: isPermitted ? "true" : "false" });
        return "hahahahaa";
    } catch (error) {
        LitActions.setResponse({ response: error.message });
    }
  };
  
  export const litActionCode = `(${_litActionCode.toString()})();`;