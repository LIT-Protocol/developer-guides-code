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
var lit_1 = require("./lit");
var litAction_1 = require("./litAction");
var ethers = require("ethers");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var lit, userAccount, das, sessionSigs, litActionResult, res, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                lit = new lit_1.LitServer();
                userAccount = new ethers.Wallet("3faafe8744f6f69d571001d8b52149448020a95752798191fe2adc28988803d8");
                return [4 /*yield*/, lit.createDelegateAuthSig(userAccount.address)];
            case 1:
                das = _a.sent();
                return [4 /*yield*/, lit.generateSessionSigs(userAccount, das)];
            case 2:
                sessionSigs = _a.sent();
                console.log("HAHAHAHAHAHA -1 ");
                return [4 /*yield*/, lit.client.executeJs({
                        code: litAction_1.litActionCode,
                        sessionSigs: sessionSigs,
                        jsParams: {
                            conditions: lit_1.accessControlConditions.public,
                            chain: "baseSepolia",
                            nonce: 1,
                            exp: Date.now() + 5 * 60 * 1000,
                            publicKey: '04a68733c38c2c08d1ac9e78b8d00b8edbc6a9f6f5ff6020deb82e3494470f157af788264d18988cc0d2cca468b71b35ecc5df8497f399c70f7779484731de9bb7',
                        },
                    })];
            case 3:
                litActionResult = _a.sent();
                console.log("HAHAHAHAHAHA - 2");
                res = litActionResult.response;
                console.log(res);
                process.exit(0);
                return [3 /*break*/, 5];
            case 4:
                e_1 = _a.sent();
                console.error(e_1);
                process.exit(1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); })();
