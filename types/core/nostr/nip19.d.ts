export declare const utf8Decoder: TextDecoder;
export declare const utf8Encoder: TextEncoder;
export declare const BECH32_REGEX: RegExp;
export type ProfilePointer = {
    pubkey: string;
    relays?: string[];
};
export type EventPointer = {
    id: string;
    relays?: string[];
    author?: string;
    kind?: number;
};
export type AddressPointer = {
    identifier: string;
    pubkey: string;
    kind: number;
    relays?: string[];
};
type Prefixes = {
    nprofile: ProfilePointer;
    nrelay: string;
    nevent: EventPointer;
    naddr: AddressPointer;
    nsec: string;
    npub: string;
    note: string;
};
type DecodeValue<Prefix extends keyof Prefixes> = {
    type: Prefix;
    data: Prefixes[Prefix];
};
export type DecodeResult = {
    [P in keyof Prefixes]: DecodeValue<P>;
}[keyof Prefixes];
export declare function decode<Prefix extends keyof Prefixes>(nip19: `${Lowercase<Prefix>}1${string}`): DecodeValue<Prefix>;
export declare function decode(nip19: string): DecodeResult;
export declare function nsecEncode(hex: string): `nsec1${string}`;
export declare function npubEncode(hex: string): `npub1${string}`;
export declare function noteEncode(hex: string): `note1${string}`;
export declare function nprofileEncode(profile: ProfilePointer): `nprofile1${string}`;
export declare function neventEncode(event: EventPointer): `nevent1${string}`;
export declare function naddrEncode(addr: AddressPointer): `naddr1${string}`;
export declare function nrelayEncode(url: string): `nrelay1${string}`;
export {};
