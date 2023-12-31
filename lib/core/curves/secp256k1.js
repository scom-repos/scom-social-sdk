"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schnorrGetExtPubKeyY = exports.encodeToCurve = exports.hashToCurve = exports.schnorr = exports.secp256k1 = void 0;
const sha256_1 = require("../hashes/sha256");
const utils_1 = require("../hashes/utils");
const modular_1 = require("./abstract/modular");
const weierstrass_1 = require("./abstract/weierstrass");
const utils_2 = require("./abstract/utils");
const hash_to_curve_1 = require("./abstract/hash-to-curve");
const _shortw_utils_1 = require("./_shortw_utils");
const secp256k1P = BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f');
const secp256k1N = BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141');
const _1n = BigInt(1);
const _2n = BigInt(2);
const divNearest = (a, b) => (a + b / _2n) / b;
function sqrtMod(y) {
    const P = secp256k1P;
    const _3n = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
    const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
    const b2 = (y * y * y) % P;
    const b3 = (b2 * b2 * y) % P;
    const b6 = ((0, modular_1.pow2)(b3, _3n, P) * b3) % P;
    const b9 = ((0, modular_1.pow2)(b6, _3n, P) * b3) % P;
    const b11 = ((0, modular_1.pow2)(b9, _2n, P) * b2) % P;
    const b22 = ((0, modular_1.pow2)(b11, _11n, P) * b11) % P;
    const b44 = ((0, modular_1.pow2)(b22, _22n, P) * b22) % P;
    const b88 = ((0, modular_1.pow2)(b44, _44n, P) * b44) % P;
    const b176 = ((0, modular_1.pow2)(b88, _88n, P) * b88) % P;
    const b220 = ((0, modular_1.pow2)(b176, _44n, P) * b44) % P;
    const b223 = ((0, modular_1.pow2)(b220, _3n, P) * b3) % P;
    const t1 = ((0, modular_1.pow2)(b223, _23n, P) * b22) % P;
    const t2 = ((0, modular_1.pow2)(t1, _6n, P) * b2) % P;
    const root = (0, modular_1.pow2)(t2, _2n, P);
    if (!Fp.eql(Fp.sqr(root), y))
        throw new Error('Cannot find square root');
    return root;
}
const Fp = (0, modular_1.Field)(secp256k1P, undefined, undefined, { sqrt: sqrtMod });
exports.secp256k1 = (0, _shortw_utils_1.createCurve)({
    a: BigInt(0),
    b: BigInt(7),
    Fp,
    n: secp256k1N,
    Gx: BigInt('55066263022277343669578718895168534326250603453777594175500187360389116729240'),
    Gy: BigInt('32670510020758816978083085130507043184471273380659243275938904335757337482424'),
    h: BigInt(1),
    lowS: true,
    endo: {
        beta: BigInt('0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee'),
        splitScalar: (k) => {
            const n = secp256k1N;
            const a1 = BigInt('0x3086d221a7d46bcde86c90e49284eb15');
            const b1 = -_1n * BigInt('0xe4437ed6010e88286f547fa90abfe4c3');
            const a2 = BigInt('0x114ca50f7a8e2f3f657c1108d9d44cfd8');
            const b2 = a1;
            const POW_2_128 = BigInt('0x100000000000000000000000000000000');
            const c1 = divNearest(b2 * k, n);
            const c2 = divNearest(-b1 * k, n);
            let k1 = (0, modular_1.mod)(k - c1 * a1 - c2 * a2, n);
            let k2 = (0, modular_1.mod)(-c1 * b1 - c2 * b2, n);
            const k1neg = k1 > POW_2_128;
            const k2neg = k2 > POW_2_128;
            if (k1neg)
                k1 = n - k1;
            if (k2neg)
                k2 = n - k2;
            if (k1 > POW_2_128 || k2 > POW_2_128) {
                throw new Error('splitScalar: Endomorphism failed, k=' + k);
            }
            return { k1neg, k1, k2neg, k2 };
        },
    },
}, sha256_1.sha256);
const _0n = BigInt(0);
const fe = (x) => typeof x === 'bigint' && _0n < x && x < secp256k1P;
const ge = (x) => typeof x === 'bigint' && _0n < x && x < secp256k1N;
const TAGGED_HASH_PREFIXES = {};
function taggedHash(tag, ...messages) {
    let tagP = TAGGED_HASH_PREFIXES[tag];
    if (tagP === undefined) {
        const tagH = (0, sha256_1.sha256)(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
        tagP = (0, utils_2.concatBytes)(tagH, tagH);
        TAGGED_HASH_PREFIXES[tag] = tagP;
    }
    return (0, sha256_1.sha256)((0, utils_2.concatBytes)(tagP, ...messages));
}
const pointToBytes = (point) => point.toRawBytes(true).slice(1);
const numTo32b = (n) => (0, utils_2.numberToBytesBE)(n, 32);
const modP = (x) => (0, modular_1.mod)(x, secp256k1P);
const modN = (x) => (0, modular_1.mod)(x, secp256k1N);
const Point = exports.secp256k1.ProjectivePoint;
const GmulAdd = (Q, a, b) => Point.BASE.multiplyAndAddUnsafe(Q, a, b);
function schnorrGetExtPubKey(priv) {
    let d_ = exports.secp256k1.utils.normPrivateKeyToScalar(priv);
    let p = Point.fromPrivateKey(d_);
    const scalar = p.hasEvenY() ? d_ : modN(-d_);
    return { scalar: scalar, bytes: pointToBytes(p) };
}
function lift_x(x) {
    if (!fe(x))
        throw new Error('bad x: need 0 < x < p');
    const xx = modP(x * x);
    const c = modP(xx * x + BigInt(7));
    let y = sqrtMod(c);
    if (y % _2n !== _0n)
        y = modP(-y);
    const p = new Point(x, y, _1n);
    p.assertValidity();
    return p;
}
function challenge(...args) {
    return modN((0, utils_2.bytesToNumberBE)(taggedHash('BIP0340/challenge', ...args)));
}
function schnorrGetPublicKey(privateKey) {
    return schnorrGetExtPubKey(privateKey).bytes;
}
function schnorrSign(message, privateKey, auxRand = (0, utils_1.randomBytes)(32)) {
    const m = (0, utils_2.ensureBytes)('message', message);
    const { bytes: px, scalar: d } = schnorrGetExtPubKey(privateKey);
    const a = (0, utils_2.ensureBytes)('auxRand', auxRand, 32);
    const t = numTo32b(d ^ (0, utils_2.bytesToNumberBE)(taggedHash('BIP0340/aux', a)));
    const rand = taggedHash('BIP0340/nonce', t, px, m);
    const k_ = modN((0, utils_2.bytesToNumberBE)(rand));
    if (k_ === _0n)
        throw new Error('sign failed: k is zero');
    const { bytes: rx, scalar: k } = schnorrGetExtPubKey(k_);
    const e = challenge(rx, px, m);
    const sig = new Uint8Array(64);
    sig.set(rx, 0);
    sig.set(numTo32b(modN(k + e * d)), 32);
    if (!schnorrVerify(sig, m, px))
        throw new Error('sign: Invalid signature produced');
    return sig;
}
function schnorrVerify(signature, message, publicKey) {
    const sig = (0, utils_2.ensureBytes)('signature', signature, 64);
    const m = (0, utils_2.ensureBytes)('message', message);
    const pub = (0, utils_2.ensureBytes)('publicKey', publicKey, 32);
    try {
        const P = lift_x((0, utils_2.bytesToNumberBE)(pub));
        const r = (0, utils_2.bytesToNumberBE)(sig.subarray(0, 32));
        if (!fe(r))
            return false;
        const s = (0, utils_2.bytesToNumberBE)(sig.subarray(32, 64));
        if (!ge(s))
            return false;
        const e = challenge(numTo32b(r), pointToBytes(P), m);
        const R = GmulAdd(P, s, modN(-e));
        if (!R || !R.hasEvenY() || R.toAffine().x !== r)
            return false;
        return true;
    }
    catch (error) {
        return false;
    }
}
exports.schnorr = (() => ({
    getPublicKey: schnorrGetPublicKey,
    sign: schnorrSign,
    verify: schnorrVerify,
    utils: {
        randomPrivateKey: exports.secp256k1.utils.randomPrivateKey,
        lift_x,
        pointToBytes,
        numberToBytesBE: utils_2.numberToBytesBE,
        bytesToNumberBE: utils_2.bytesToNumberBE,
        taggedHash,
        mod: modular_1.mod,
    },
}))();
const isoMap = (() => (0, hash_to_curve_1.isogenyMap)(Fp, [
    [
        '0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa8c7',
        '0x7d3d4c80bc321d5b9f315cea7fd44c5d595d2fc0bf63b92dfff1044f17c6581',
        '0x534c328d23f234e6e2a413deca25caece4506144037c40314ecbd0b53d9dd262',
        '0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa88c',
    ],
    [
        '0xd35771193d94918a9ca34ccbb7b640dd86cd409542f8487d9fe6b745781eb49b',
        '0xedadc6f64383dc1df7c4b2d51b54225406d36b641f5e41bbc52a56612a8c6d14',
        '0x0000000000000000000000000000000000000000000000000000000000000001',
    ],
    [
        '0x4bda12f684bda12f684bda12f684bda12f684bda12f684bda12f684b8e38e23c',
        '0xc75e0c32d5cb7c0fa9d0a54b12a0a6d5647ab046d686da6fdffc90fc201d71a3',
        '0x29a6194691f91a73715209ef6512e576722830a201be2018a765e85a9ecee931',
        '0x2f684bda12f684bda12f684bda12f684bda12f684bda12f684bda12f38e38d84',
    ],
    [
        '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffff93b',
        '0x7a06534bb8bdb49fd5e9e6632722c2989467c1bfc8e8d978dfb425d2685c2573',
        '0x6484aa716545ca2cf3a70c3fa8fe337e0a3d21162f0d6299a7bf8192bfd2a76f',
        '0x0000000000000000000000000000000000000000000000000000000000000001',
    ],
].map((i) => i.map((j) => BigInt(j)))))();
const mapSWU = (() => (0, weierstrass_1.mapToCurveSimpleSWU)(Fp, {
    A: BigInt('0x3f8731abdd661adca08a5558f0f5d272e953d363cb6f0e5d405447c01a444533'),
    B: BigInt('1771'),
    Z: Fp.create(BigInt('-11')),
}))();
const htf = (() => (0, hash_to_curve_1.createHasher)(exports.secp256k1.ProjectivePoint, (scalars) => {
    const { x, y } = mapSWU(Fp.create(scalars[0]));
    return isoMap(x, y);
}, {
    DST: 'secp256k1_XMD:SHA-256_SSWU_RO_',
    encodeDST: 'secp256k1_XMD:SHA-256_SSWU_NU_',
    p: Fp.ORDER,
    m: 1,
    k: 128,
    expand: 'xmd',
    hash: sha256_1.sha256,
}))();
exports.hashToCurve = (() => htf.hashToCurve)();
exports.encodeToCurve = (() => htf.encodeToCurve)();
function schnorrGetExtPubKeyY(priv) {
    let d_ = exports.secp256k1.utils.normPrivateKeyToScalar(priv);
    let p = Point.fromPrivateKey(d_);
    return p.toRawBytes(false).slice(1 + 32);
}
exports.schnorrGetExtPubKeyY = schnorrGetExtPubKeyY;
