import type { Group, GroupConstructor, AffinePoint } from './curve';
import { IField } from './modular';
import { CHash } from './utils';
type UnicodeOrBytes = string | Uint8Array;
export type Opts = {
    DST: UnicodeOrBytes;
    p: bigint;
    m: number;
    k: number;
    expand: 'xmd' | 'xof';
    hash: CHash;
};
export declare function expand_message_xmd(msg: Uint8Array, DST: Uint8Array, lenInBytes: number, H: CHash): Uint8Array;
export declare function expand_message_xof(msg: Uint8Array, DST: Uint8Array, lenInBytes: number, k: number, H: CHash): Uint8Array;
export declare function hash_to_field(msg: Uint8Array, count: number, options: Opts): bigint[][];
export declare function isogenyMap<T, F extends IField<T>>(field: F, map: [T[], T[], T[], T[]]): (x: T, y: T) => {
    x: T;
    y: T;
};
export interface H2CPoint<T> extends Group<H2CPoint<T>> {
    add(rhs: H2CPoint<T>): H2CPoint<T>;
    toAffine(iz?: bigint): AffinePoint<T>;
    clearCofactor(): H2CPoint<T>;
    assertValidity(): void;
}
export interface H2CPointConstructor<T> extends GroupConstructor<H2CPoint<T>> {
    fromAffine(ap: AffinePoint<T>): H2CPoint<T>;
}
export type MapToCurve<T> = (scalar: bigint[]) => AffinePoint<T>;
export type htfBasicOpts = {
    DST: UnicodeOrBytes;
};
export declare function createHasher<T>(Point: H2CPointConstructor<T>, mapToCurve: MapToCurve<T>, def: Opts & {
    encodeDST?: UnicodeOrBytes;
}): {
    hashToCurve(msg: Uint8Array, options?: htfBasicOpts): H2CPoint<T>;
    encodeToCurve(msg: Uint8Array, options?: htfBasicOpts): H2CPoint<T>;
};
export {};
