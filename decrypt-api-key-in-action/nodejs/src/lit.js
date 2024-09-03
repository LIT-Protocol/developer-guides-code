"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.LitServer = exports.LitWeb = exports.accessControlConditions = void 0;
require("dotenv/config");
var LitSDK = require("@lit-protocol/lit-node-client");
var auth_helpers_1 = require("@lit-protocol/auth-helpers");
var constants_1 = require("@lit-protocol/constants");
var ethers = require("ethers");
var APP_CHAIN = "baseSepolia";
var LIT_CHAIN_NAME = "baseSepolia";
var CLIENT_OPTIONS = {
    alertWhenUnauthorized: false,
    litNetwork: constants_1.LitNetwork.DatilTest,
    debug: true,
};
exports.accessControlConditions = {
    public: [
        {
            conditionType: "evmBasic",
            contractAddress: "",
            standardContractType: "",
            chain: LIT_CHAIN_NAME,
            method: "eth_getBalance",
            parameters: [":userAddress", "latest"],
            returnValueTest: {
                comparator: ">=",
                value: "0",
            },
        },
    ],
};
var LitWeb = /** @class */ (function () {
    function LitWeb() {
        this.client = undefined;
    }
    LitWeb.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.client) {
                            return [2 /*return*/, this.client];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        client = new LitSDK.LitNodeClient(CLIENT_OPTIONS);
                        return [4 /*yield*/, client.connect()];
                    case 2:
                        _a.sent();
                        this.client = client;
                        return [2 /*return*/, this.client];
                    case 3:
                        e_1 = _a.sent();
                        console.error("Unable to initialize Lit client", e_1);
                        throw new Error("Unable to initialize Lit client");
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    LitWeb.prototype.createAuthSig = function (params, account) {
        return __awaiter(this, void 0, void 0, function () {
            var address, preparedMessage, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        if (!this.client) {
                            throw new Error("Unable to initialize Lit client");
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        address = account.address;
                        return [4 /*yield*/, (0, auth_helpers_1.createSiweMessageWithRecaps)({
                                uri: String(params.uri),
                                expiration: String(params.expiration),
                                resources: params.resourceAbilityRequests,
                                walletAddress: address,
                                nonce: params.nonce,
                                litNodeClient: this.client,
                                statement: params.statement,
                                chainId: 84532,
                            })];
                    case 3:
                        preparedMessage = _a.sent();
                        return [2 /*return*/, (0, auth_helpers_1.generateAuthSig)({ signer: account, toSign: preparedMessage, address: address })];
                    case 4:
                        e_2 = _a.sent();
                        console.error(e_2);
                        return [2 /*return*/, Promise.reject("Error signing message")];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return LitWeb;
}());
exports.LitWeb = LitWeb;
var LitServer = /** @class */ (function (_super) {
    __extends(LitServer, _super);
    function LitServer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LitServer.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.client) {
                            return [2 /*return*/, this.client];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        client = new LitSDK.LitNodeClientNodeJs(CLIENT_OPTIONS);
                        return [4 /*yield*/, client.connect()];
                    case 2:
                        _a.sent();
                        this.client = client;
                        return [2 /*return*/, this.client];
                    case 3:
                        e_3 = _a.sent();
                        console.error("Unable to initialize Lit client", e_3);
                        throw new Error("Unable to initialize Lit client");
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    LitServer.prototype.generateSessionSigs = function (account, capacityDelegationAuthSig) {
        return __awaiter(this, void 0, void 0, function () {
            var e_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        if (!this.client) {
                            throw new Error("Unable to initialize Lit client");
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.client.getSessionSigs({
                                chain: LIT_CHAIN_NAME,
                                resourceAbilityRequests: [
                                    {
                                        resource: new auth_helpers_1.LitActionResource("*"),
                                        ability: auth_helpers_1.LitAbility.LitActionExecution,
                                    },
                                    {
                                        resource: new auth_helpers_1.LitPKPResource("*"),
                                        ability: auth_helpers_1.LitAbility.PKPSigning,
                                    },
                                ],
                                capabilityAuthSigs: capacityDelegationAuthSig ? [capacityDelegationAuthSig] : undefined,
                                authNeededCallback: function (params) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, this.createAuthSig(params, account)];
                                            case 1: return [2 /*return*/, _a.sent()];
                                        }
                                    });
                                }); },
                            })];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        e_4 = _a.sent();
                        return [2 /*return*/, Promise.reject(e_4)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    LitServer.prototype.createDelegateAuthSig = function (address, expiration) {
        return __awaiter(this, void 0, void 0, function () {
            var walletWithCapacityNFT, capacityDelegationAuthSig, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        if (!this.client) {
                            return [2 /*return*/, Promise.reject("Unable to initialize Lit client")];
                        }
                        walletWithCapacityNFT = new ethers.Wallet(String('3faafe8744f6f69d571001d8b52149448020a95752798191fe2adc28988803d8'));
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.client.createCapacityDelegationAuthSig({
                                dAppOwnerWallet: walletWithCapacityNFT,
                                delegateeAddresses: [address],
                                statement: "Delegate Lit capacity to user",
                                capacityTokenId: '671',
                                expiration: expiration,
                            })];
                    case 3:
                        capacityDelegationAuthSig = (_a.sent()).capacityDelegationAuthSig;
                        return [2 /*return*/, capacityDelegationAuthSig];
                    case 4:
                        e_5 = _a.sent();
                        console.error("Error creating delegate auth sig", e_5);
                        return [2 /*return*/, Promise.reject(e_5)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return LitServer;
}(LitWeb));
exports.LitServer = LitServer;
