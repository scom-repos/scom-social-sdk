/**
 * Portions of this file are derived from [node-geohash](https://github.com/sunng87/node-geohash)
 * by Ning Sun, licensed under the MIT License.
 */

const BASE32_CODES = "0123456789bcdefghjkmnpqrstuvwxyz";
const BASE32_CODES_DICT: { [key: string]: number } = {};
for (let i = 0; i < BASE32_CODES.length; i++) {
    BASE32_CODES_DICT[BASE32_CODES.charAt(i)] = i;
}

const ENCODE_AUTO = 'auto';
const MAX_LAT = 90;
const MIN_LAT = -90;
const MAX_LON = 180;
const MIN_LON = -180;

/**
 * Significant Figure Hash Length
 *
 * This is a quick and dirty lookup to figure out how long our hash
 * should be in order to guarantee a certain amount of trailing
 * significant figures. This was calculated by determining the error:
 * 45/2^(n-1) where n is the number of bits for a latitude or
 * longitude. Key is # of desired sig figs, value is minimum length of
 * the geohash.
 * @type Array
 */
//     Desired sig figs:  0  1  2  3  4   5   6   7   8   9  10
const SIGFIG_HASH_LENGTH = [0, 5, 7, 8, 11, 12, 13, 15, 16, 17, 18];
/**
 * Encode
 *
 * Create a Geohash out of a latitude and longitude that is
 * `numberOfChars` long.
 *
 * @param {Number|String} latitude
 * @param {Number|String} longitude
 * @param {Number} numberOfChars
 * @returns {String}
 */
const encode = (
    latitude: number | string,
    longitude: number | string,
    numberOfChars: number | 'auto' = 9
): string => {
    if (numberOfChars === ENCODE_AUTO) {
        if (typeof (latitude) === 'number' || typeof (longitude) === 'number') {
            throw new Error('string notation required for auto precision.');
        }
        const decSigFigsLat = latitude.split('.')[1].length;
        const decSigFigsLong = longitude.split('.')[1].length;
        let numberOfSigFigs = Math.max(decSigFigsLat, decSigFigsLong);
        numberOfChars = SIGFIG_HASH_LENGTH[numberOfSigFigs];
    } else if (numberOfChars === undefined) {
        numberOfChars = 9;
    }

    let chars: string[] = [];
    let bits = 0;
    let bitsTotal = 0;
    let hash_value = 0;
    let maxLat = MAX_LAT;
    let minLat = MIN_LAT;
    let maxLon = MAX_LON;
    let minLon = MIN_LON;
    let mid;

    while (chars.length < numberOfChars) {
        if (bitsTotal % 2 === 0) {
            mid = (maxLon + minLon) / 2;
            if (longitude > mid) {
                hash_value = (hash_value << 1) + 1;
                minLon = mid;
            } else {
                hash_value = (hash_value << 1) + 0;
                maxLon = mid;
            }
        } else {
            mid = (maxLat + minLat) / 2;
            if (latitude > mid) {
                hash_value = (hash_value << 1) + 1;
                minLat = mid;
            } else {
                hash_value = (hash_value << 1) + 0;
                maxLat = mid;
            }
        }

        bits++;
        bitsTotal++;
        if (bits === 5) {
            let code = BASE32_CODES[hash_value];
            chars.push(code);
            bits = 0;
            hash_value = 0;
        }
    }
    return chars.join('');
};

/**
 * Encode Integer
 *
 * Create a Geohash out of a latitude and longitude that is of 'bitDepth'.
 *
 * @param {Number} latitude
 * @param {Number} longitude
 * @param {Number} bitDepth
 * @returns {Number}
 */
const encode_int = (latitude: number, longitude: number, bitDepth?: number) => {
    bitDepth = bitDepth || 52;

    let bitsTotal = 0;
    let maxLat = MAX_LAT;
    let minLat = MIN_LAT;
    let maxLon = MAX_LON;
    let minLon = MIN_LON;
    let mid;
    let combinedBits = 0;

    while (bitsTotal < bitDepth) {
        combinedBits *= 2;
        if (bitsTotal % 2 === 0) {
            mid = (maxLon + minLon) / 2;
            if (longitude > mid) {
                combinedBits += 1;
                minLon = mid;
            } else {
                maxLon = mid;
            }
        } else {
            mid = (maxLat + minLat) / 2;
            if (latitude > mid) {
                combinedBits += 1;
                minLat = mid;
            } else {
                maxLat = mid;
            }
        }
        bitsTotal++;
    };
    return combinedBits;
}

const decode_bbox = (hashString: string): number[] => {
    let isLon = true;
    let maxLat = MAX_LAT;
    let minLat = MIN_LAT;
    let maxLon = MAX_LON;
    let minLon = MIN_LON;
    let mid;

    const hashValueList = hashString
        .toLowerCase()
        .split('')
        .map((char) => BASE32_CODES_DICT[char]);

    for (const hashValue of hashValueList) {
        for (let bits = 4; bits >= 0; bits--) {
            const bit = (hashValue >> bits) & 1;
            if (isLon) {
                mid = (maxLon + minLon) / 2;
                if (bit === 1) {
                    minLon = mid;
                } else {
                    maxLon = mid;
                }
            } else {
                mid = (maxLat + minLat) / 2;
                if (bit === 1) {
                    minLat = mid;
                } else {
                    maxLat = mid;
                }
            }
            isLon = !isLon;
        }
    }
    return [minLat, minLon, maxLat, maxLon];
};

const decode_bbox_int = (
    hashInt: number,
    bitDepth: number = 52
): number[] => {
    let maxLat = MAX_LAT;
    let minLat = MIN_LAT;
    let maxLon = MAX_LON;
    let minLon = MIN_LON;

    let latBit = 0,
        lonBit = 0;
    const step = bitDepth / 2;

    for (let i = 0; i < step; i++) {
        lonBit = get_bit(hashInt, (step - i) * 2 - 1);
        latBit = get_bit(hashInt, (step - i) * 2 - 2);

        if (latBit === 0) {
            maxLat = (maxLat + minLat) / 2;
        } else {
            minLat = (maxLat + minLat) / 2;
        }

        if (lonBit === 0) {
            maxLon = (maxLon + minLon) / 2;
        } else {
            minLon = (maxLon + minLon) / 2;
        }
    }
    return [minLat, minLon, maxLat, maxLon];
};

const get_bit = (bits: number, position: number): number =>
    (bits / Math.pow(2, position)) & 0x01;

const decode = (hashString: string): {
    latitude: number;
    longitude: number;
    error: { latitude: number; longitude: number };
} => {
    const bbox = decode_bbox(hashString);
    const lat = (bbox[0] + bbox[2]) / 2;
    const lon = (bbox[1] + bbox[3]) / 2;
    const latErr = bbox[2] - lat;
    const lonErr = bbox[3] - lon;
    return {
        latitude: lat,
        longitude: lon,
        error: { latitude: latErr, longitude: lonErr },
    };
};

const decode_int = (
    hashInt: number,
    bitDepth: number = 52
): {
    latitude: number;
    longitude: number;
    error: { latitude: number; longitude: number };
} => {
    const bbox = decode_bbox_int(hashInt, bitDepth);
    const lat = (bbox[0] + bbox[2]) / 2;
    const lon = (bbox[1] + bbox[3]) / 2;
    const latErr = bbox[2] - lat;
    const lonErr = bbox[3] - lon;
    return {
        latitude: lat,
        longitude: lon,
        error: { latitude: latErr, longitude: lonErr },
    };
};

const neighbor = (
    hashString: string,
    direction: [number, number]
): string => {
    const lonLat = decode(hashString);
    const neighborLat =
        lonLat.latitude + direction[0] * lonLat.error.latitude * 2;
    const neighborLon =
        lonLat.longitude + direction[1] * lonLat.error.longitude * 2;
    const validLon = ensure_valid_lon(neighborLon);
    const validLat = ensure_valid_lat(neighborLat);
    return encode(validLat, validLon, hashString.length);
};

const neighbor_int = (
    hashInt: number,
    direction: [number, number],
    bitDepth: number = 52
): number => {
    const lonlat = decode_int(hashInt, bitDepth);
    const neighborLat =
        lonlat.latitude + direction[0] * lonlat.error.latitude * 2;
    const neighborLon =
        lonlat.longitude + direction[1] * lonlat.error.longitude * 2;
    const validLon = ensure_valid_lon(neighborLon);
    const validLat = ensure_valid_lat(neighborLat);
    return encode_int(validLat, validLon, bitDepth);
};

const neighbors = (hashString: string): string[] => {
    const hashstringLength = hashString.length;
    const lonlat = decode(hashString);
    const lat = lonlat.latitude;
    const lon = lonlat.longitude;
    const latErr = lonlat.error.latitude * 2;
    const lonErr = lonlat.error.longitude * 2;

    const neighborHashList = [
        encodeNeighbor(1, 0),
        encodeNeighbor(1, 1),
        encodeNeighbor(0, 1),
        encodeNeighbor(-1, 1),
        encodeNeighbor(-1, 0),
        encodeNeighbor(-1, -1),
        encodeNeighbor(0, -1),
        encodeNeighbor(1, -1),
    ];

    function encodeNeighbor(neighborLatDir: number, neighborLonDir: number): string {
        const neighbor_lat = lat + neighborLatDir * latErr;
        const neighbor_lon = lon + neighborLonDir * lonErr;
        const validLon = ensure_valid_lon(neighbor_lon);
        const validLat = ensure_valid_lat(neighbor_lat);
        return encode(validLat, validLon, hashstringLength);
    }

    return neighborHashList;
};

const neighbors_int = (
    hashInt: number,
    bitDepth: number = 52
): number[] => {
    const lonlat = decode_int(hashInt, bitDepth);
    const lat = lonlat.latitude;
    const lon = lonlat.longitude;
    const latErr = lonlat.error.latitude * 2;
    const lonErr = lonlat.error.longitude * 2;

    const neighborHashIntList = [
        encodeNeighbor_int(1, 0),
        encodeNeighbor_int(1, 1),
        encodeNeighbor_int(0, 1),
        encodeNeighbor_int(-1, 1),
        encodeNeighbor_int(-1, 0),
        encodeNeighbor_int(-1, -1),
        encodeNeighbor_int(0, -1),
        encodeNeighbor_int(1, -1),
    ];

    function encodeNeighbor_int(neighborLatDir: number, neighborLonDir: number): number {
        const neighbor_lat = lat + neighborLatDir * latErr;
        const neighbor_lon = lon + neighborLonDir * lonErr;
        const validLon = ensure_valid_lon(neighbor_lon);
        const validLat = ensure_valid_lat(neighbor_lat);
        return encode_int(validLat, validLon, bitDepth);
    }

    return neighborHashIntList;
};

const bboxes = (
    minLat: number,
    minLon: number,
    maxLat: number,
    maxLon: number,
    numberOfChars: number
): string[] => {
    if (numberOfChars <= 0) {
        throw new Error('numberOfChars must be strictly positive');
    }
    numberOfChars = numberOfChars || 9;

    const hashSouthWest = encode(minLat, minLon, numberOfChars);
    const hashNorthEast = encode(maxLat, maxLon, numberOfChars);

    const latLon = decode(hashSouthWest);

    const perLat = latLon.error.latitude * 2;
    const perLon = latLon.error.longitude * 2;

    const boxSouthWest = decode_bbox(hashSouthWest);
    const boxNorthEast = decode_bbox(hashNorthEast);

    const latStep = Math.round((boxNorthEast[0] - boxSouthWest[0]) / perLat);
    const lonStep = Math.round((boxNorthEast[1] - boxSouthWest[1]) / perLon);

    const hashList: string[] = [];

    for (let lat = 0; lat <= latStep; lat++) {
        for (let lon = 0; lon <= lonStep; lon++) {
            hashList.push(neighbor(hashSouthWest, [lat, lon]));
        }
    }

    return hashList;
};

const bboxes_int = (
    minLat: number,
    minLon: number,
    maxLat: number,
    maxLon: number,
    bitDepth: number
): any[] => {
    bitDepth = bitDepth || 52;

    const hashSouthWest = encode_int(minLat, minLon, bitDepth);
    const hashNorthEast = encode_int(maxLat, maxLon, bitDepth);

    const latlon = decode_int(hashSouthWest, bitDepth);

    const perLat = latlon.error.latitude * 2;
    const perLon = latlon.error.longitude * 2;

    const boxSouthWest = decode_bbox_int(hashSouthWest, bitDepth);
    const boxNorthEast = decode_bbox_int(hashNorthEast, bitDepth);

    const latStep = Math.round((boxNorthEast[0] - boxSouthWest[0]) / perLat);
    const lonStep = Math.round((boxNorthEast[1] - boxSouthWest[1]) / perLon);

    const hashList: any[] = [];

    for (let lat = 0; lat <= latStep; lat++) {
        for (let lon = 0; lon <= lonStep; lon++) {
            hashList.push(neighbor_int(hashSouthWest, [lat, lon], bitDepth));
        }
    }

    return hashList;
};

const ensure_valid_lon = (lon: number): number => {
    if (lon > MAX_LON) return MIN_LON + (lon % MAX_LON);
    if (lon < MIN_LON) return MAX_LON + (lon % MAX_LON);
    return lon;
};

const ensure_valid_lat = (lat: number): number => {
    if (lat > MAX_LAT) return MAX_LAT;
    if (lat < MIN_LAT) return MIN_LAT;
    return lat;
};

const Geohash = {
    ENCODE_AUTO,
    encode,
    encode_uint64: encode_int,
    encode_int,
    decode,
    decode_int,
    decode_uint64: decode_int,
    decode_bbox,
    decode_bbox_uint64: decode_bbox_int,
    decode_bbox_int,
    neighbor,
    neighbor_int,
    neighbors,
    neighbors_int,
    bboxes,
    bboxes_int,
};

export default Geohash;
