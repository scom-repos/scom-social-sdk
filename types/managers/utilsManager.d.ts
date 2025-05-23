import { IAgentInfo, ICalendarEventInfo, IChannelInfo, ICommunityBasicInfo, ICommunityInfo, ICommunityProductInfo, ICommunityStallInfo, IMarketplaceStallBasicInfo, INostrEvent, INostrMetadata, IPaymentActivityV2, IRetrievedMarketplaceOrder, IUserProfile } from "../interfaces";
declare class SocialUtilsManager {
    static hexStringToUint8Array(hexString: string): Uint8Array;
    static base64ToUtf8(base64: string): string;
    static utf8ToBase64(utf8: string): string;
    static convertPrivateKeyToPubkey(privateKey: string): string;
    static encryptMessage(ourPrivateKey: string, theirPublicKey: string, text: string): Promise<string>;
    static decryptMessage(ourPrivateKey: string, theirPublicKey: string, encryptedData: string): Promise<string>;
    static encryptMessageWithGeneratedKey(privateKey: string, theirPublicKey: string, message: string): Promise<{
        encryptedMessage: string;
        encryptedMessageKey: string;
    }>;
    private static pad;
    static getGMTOffset(timezone: string): string;
    static exponentialBackoffRetry<T>(fn: () => Promise<T>, retries: number, delay: number, maxDelay: number, factor: number, stopCondition?: (data: T) => boolean): Promise<T>;
    static getCommunityUri(creatorId: string, communityId: string): string;
    static getMarketplaceStallUri(merchantId: string, stallId: string): string;
    static getCommunityBasicInfoFromUri(communityUri: string): ICommunityBasicInfo;
    static getMarketplaceStallBasicInfoFromUri(stallUri: string): IMarketplaceStallBasicInfo;
    static extractCommunityInfo(event: INostrEvent): ICommunityInfo;
    static extractCommunityStallInfo(event: INostrEvent): ICommunityStallInfo;
    static extractCommunityProductInfo(event: INostrEvent): ICommunityProductInfo;
    static extractBookmarkedCommunities(event: INostrEvent, excludedCommunity?: ICommunityInfo): ICommunityBasicInfo[];
    static extractBookmarkedChannels(event: INostrEvent): string[];
    static extractScpData(event: INostrEvent, standardId: string): any;
    static parseContent(content: string): any;
    static extractChannelInfo(event: INostrEvent): IChannelInfo;
    static constructAuthHeader(privateKey: string): string;
    static constructUserProfile(metadata: INostrMetadata, followersCountMap?: Record<string, number>): IUserProfile;
    static extractCalendarEventInfo(event: INostrEvent): ICalendarEventInfo;
    static extractMarketplaceOrder(privateKey: string, event: INostrEvent, stallInfo: ICommunityStallInfo): Promise<IRetrievedMarketplaceOrder>;
    static extractPaymentActivity(privateKey: string, event: INostrEvent): Promise<IPaymentActivityV2>;
    static extractAgentInfo(privateKey: string, event: INostrEvent): Promise<IAgentInfo>;
    static flatMap<T, U>(array: T[], callback: (item: T) => U[]): U[];
    static getPollResult(readRelay: string, requestId: string, authHeader?: string): Promise<any>;
}
export { SocialUtilsManager };
