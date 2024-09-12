"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var lit_node_client_1 = require("@lit-protocol/lit-node-client");
var constants_1 = require("@lit-protocol/constants");
var contracts_sdk_1 = require("@lit-protocol/contracts-sdk");
var auth_helpers_1 = require("@lit-protocol/auth-helpers");
var lit_auth_client_1 = require("@lit-protocol/lit-auth-client");
var ethers = require("ethers");
var ETHEREUM_PRIVATE_KEY = "addfe92d4342a89960aaacdb27fe097094354264915aa39529d902bee3764475";
var getSessionSigsPKP = function (pkp, capacityTokenId) { return __awaiter(void 0, void 0, void 0, function () {
    var litNodeClient, ethersSigner, litContracts, authMethod, pkp_1, capacityDelegationAuthSig, sessionSigs, permAuthMethod, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 10, 11, 12]);
                ethersSigner = new ethers.Wallet(ETHEREUM_PRIVATE_KEY, new ethers.providers.JsonRpcProvider(constants_1.LIT_RPC.CHRONICLE_YELLOWSTONE));
                console.log("🔄 Connecting LitNodeClient to Lit network...");
                litNodeClient = new lit_node_client_1.LitNodeClient({
                    litNetwork: constants_1.LitNetwork.DatilTest,
                    debug: false,
                });
                return [4 /*yield*/, litNodeClient.connect()];
            case 1:
                _a.sent();
                console.log("✅ Connected LitNodeClient to Lit network");
                console.log("🔄 Connecting LitContracts client to network...");
                litContracts = new contracts_sdk_1.LitContracts({
                    signer: ethersSigner,
                    network: constants_1.LitNetwork.DatilTest,
                    debug: false,
                });
                return [4 /*yield*/, litContracts.connect()];
            case 2:
                _a.sent();
                console.log("✅ Connected LitContracts client to network");
                console.log("🔄 Creating AuthMethod using the ethersSigner...");
                return [4 /*yield*/, lit_auth_client_1.EthWalletProvider.authenticate({
                        signer: ethersSigner,
                        litNodeClient: litNodeClient,
                    })];
            case 3:
                authMethod = _a.sent();
                console.log("✅ Finished creating the AuthMethod");
                return [4 /*yield*/, litContracts.mintWithAuth({
                        authMethod: authMethod,
                        scopes: [constants_1.AuthMethodScope.PersonalSign],
                    })];
            case 4:
                pkp_1 = (_a.sent()).pkp;
                if (!!capacityTokenId) return [3 /*break*/, 6];
                console.log("🔄 Minting Capacity Credits NFT...");
                return [4 /*yield*/, litContracts.mintCapacityCreditsNFT({
                        requestsPerKilosecond: 10,
                        daysUntilUTCMidnightExpiration: 1,
                    })];
            case 5:
                capacityTokenId = (_a.sent()).capacityTokenIdStr;
                console.log("\u2705 Minted new Capacity Credit with ID: ".concat(capacityTokenId));
                _a.label = 6;
            case 6:
                console.log("🔄 Creating capacityDelegationAuthSig...");
                return [4 /*yield*/, litNodeClient.createCapacityDelegationAuthSig({
                        dAppOwnerWallet: ethersSigner,
                        capacityTokenId: capacityTokenId,
                        delegateeAddresses: [pkp_1.ethAddress],
                        uses: "1",
                    })];
            case 7:
                capacityDelegationAuthSig = (_a.sent()).capacityDelegationAuthSig;
                console.log("\u2705 Created the capacityDelegationAuthSig");
                console.log("🔄 Getting the Session Sigs for the PKP...");
                return [4 /*yield*/, litNodeClient.getPkpSessionSigs({
                        pkpPublicKey: pkp_1.publicKey,
                        authMethods: [authMethod],
                        capabilityAuthSigs: [capacityDelegationAuthSig],
                        resourceAbilityRequests: [
                            {
                                resource: new auth_helpers_1.LitPKPResource("*"),
                                ability: auth_helpers_1.LitAbility.PKPSigning,
                            },
                        ],
                        expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // 15 minutes
                    })];
            case 8:
                sessionSigs = _a.sent();
                console.log("✅ Got PKP Session Sigs");
                return [4 /*yield*/, litContracts.pkpPermissionsContract.read.getPermittedAuthMethods(pkp_1.tokenId)];
            case 9:
                permAuthMethod = _a.sent();
                console.log(permAuthMethod);
                return [2 /*return*/, sessionSigs];
            case 10:
                error_1 = _a.sent();
                console.error(error_1);
                return [3 /*break*/, 12];
            case 11:
                litNodeClient.disconnect();
                return [7 /*endfinally*/];
            case 12: return [2 /*return*/];
        }
    });
}); };
getSessionSigsPKP();
