"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCurve = exports.getHash = void 0;
const hmac_1 = require("../hashes/hmac");
const utils_1 = require("../hashes/utils");
const weierstrass_1 = require("./abstract/weierstrass");
function getHash(hash) {
    return {
        hash,
        hmac: (key, ...msgs) => (0, hmac_1.hmac)(hash, key, (0, utils_1.concatBytes)(...msgs)),
        randomBytes: utils_1.randomBytes,
    };
}
exports.getHash = getHash;
function createCurve(curveDef, defHash) {
    const create = (hash) => (0, weierstrass_1.weierstrass)({ ...curveDef, ...getHash(hash) });
    return Object.freeze({ ...create(defHash), create });
}
exports.createCurve = createCurve;
