import { ICalendarEventDetailInfo, ICalendarEventInfo, IChannelInfo, ICommunity, ICommunityDetailMetadata, ICommunityInfo, ICommunityLeaderboard, ICommunityMember, ICommunityPostScpData, IConversationPath, IEthWalletAccountsInfo, ILocationCoordinates, ILongFormContentInfo, IMessageContactInfo, INewCommunityInfo, INostrEvent, INostrMetadata, INostrMetadataContent, INoteActions, INoteCommunityInfo, INoteInfo, INoteInfoExtended, IPostStats, IRetrieveChannelMessageKeysOptions, IRetrieveCommunityPostKeysByNoteEventsOptions, IRetrieveCommunityPostKeysOptions, IRetrieveCommunityThreadPostKeysOptions, ISendTempMessageOptions, ISocialDataManagerConfig, ISocialEventManagerRead, ISocialEventManagerWrite, ITrendingCommunityInfo, IUpdateCalendarEventInfo, IUserActivityStats, IUserProfile, SocialDataManagerOptions } from "../utils/interfaces";
import { INostrCommunicationManager, INostrRestAPIManager, NostrRestAPIManager, NostrWebSocketManager } from "./communication";
import { SocialUtilsManager } from "./utilsManager";
import { NostrEventManagerWrite } from "./eventManagerWrite";
import { NostrEventManagerRead } from "./eventManagerRead";
import { NostrEventManagerReadV2 } from "./eventManagerReadV2";
declare class SocialDataManager {
    private _writeRelays;
    private _publicIndexingRelay;
    private _apiBaseUrl;
    private _ipLocationServiceBaseUrl;
    private _socialEventManagerRead;
    private _socialEventManagerWrite;
    private _privateKey;
    private mqttManager;
    private lightningWalletManager;
    constructor(config: ISocialDataManagerConfig);
    dispose(): Promise<void>;
    set privateKey(privateKey: string);
    get socialEventManagerRead(): ISocialEventManagerRead;
    get socialEventManagerWrite(): ISocialEventManagerWrite;
    set relays(value: string[]);
    private _initializeWriteRelaysManagers;
    subscribeToMqttTopics(topics: string[]): void;
    unsubscribeFromMqttTopics(topics: string[]): void;
    publishToMqttTopic(topic: string, message: string): void;
    retrieveCommunityEvents(creatorId: string, communityId: string, statsIncluded?: boolean): Promise<{
        notes: INoteInfo[];
        info: ICommunityInfo;
        metadataByPubKeyMap: Record<string, INostrMetadata>;
        notesCount: number;
    }>;
    fetchCommunityFeedInfo(creatorId: string, communityId: string, since?: number, until?: number): Promise<INoteInfo[]>;
    retrieveCommunityUri(noteEvent: INostrEvent, scpData: ICommunityPostScpData): string;
    retrievePostPrivateKey(event: INostrEvent, communityUri: string, communityPrivateKey: string): Promise<string>;
    retrieveChannelMessagePrivateKey(event: INostrEvent, channelId: string, communityPrivateKey: string): Promise<string>;
    retrieveCommunityPrivateKey(communityInfo: ICommunityInfo, selfPrivateKey: string): Promise<string>;
    private constructCommunityNoteIdToPrivateKeyMap;
    retrieveCommunityPostKeys(options: IRetrieveCommunityPostKeysOptions): Promise<Record<string, string>>;
    retrieveCommunityThreadPostKeys(options: IRetrieveCommunityThreadPostKeysOptions): Promise<Record<string, string>>;
    retrieveCommunityPostKeysByNoteEvents(options: IRetrieveCommunityPostKeysByNoteEventsOptions): Promise<Record<string, string>>;
    constructMetadataByPubKeyMap(notes: INostrEvent[]): Promise<Record<string, INostrMetadata>>;
    fetchUserProfiles(pubKeys: string[]): Promise<IUserProfile[]>;
    updateUserProfile(content: INostrMetadataContent): Promise<void>;
    fetchTrendingNotesInfo(): Promise<{
        notes: INoteInfo[];
        metadataByPubKeyMap: Record<string, INostrMetadata>;
    }>;
    fetchProfileFeedInfo(pubKey: string, since?: number, until?: number): Promise<{
        notes: INoteInfo[];
        metadataByPubKeyMap: Record<string, INostrMetadata>;
        quotedNotesMap: Record<string, INoteInfo>;
        earliest: number;
    }>;
    fetchProfileRepliesInfo(pubKey: string, since?: number, until?: number): Promise<{
        notes: INoteInfo[];
        metadataByPubKeyMap: Record<string, INostrMetadata>;
        quotedNotesMap: Record<string, INoteInfo>;
        earliest: number;
    }>;
    fetchNotesByIds(ids: string[]): Promise<INostrEvent[]>;
    fetchTempEvents(ids: string[]): Promise<INostrEvent[]>;
    private getEarliestEventTimestamp;
    fetchHomeFeedInfo(pubKey: string, since?: number, until?: number): Promise<{
        notes: INoteInfo[];
        metadataByPubKeyMap: Record<string, INostrMetadata>;
        quotedNotesMap: Record<string, INoteInfo>;
        earliest: number;
    }>;
    fetchUserFollowingFeedInfo(pubKey: string, until?: number): Promise<{
        notes: INoteInfo[];
        metadataByPubKeyMap: Record<string, INostrMetadata>;
        quotedNotesMap: Record<string, INoteInfo>;
        earliest: number;
    }>;
    createNoteEventMappings(events: INostrEvent[], parentAuthorsInfo?: boolean): {
        notes: INoteInfo[];
        metadataByPubKeyMap: Record<string, INostrMetadata>;
        quotedNotesMap: Record<string, INoteInfo>;
        noteToParentAuthorIdMap: Record<string, string>;
        noteStatsMap: Record<string, IPostStats>;
        noteToRepostIdMap: Record<string, string>;
        noteActionsMap: Record<string, INoteActions>;
    };
    fetchCommunityInfo(creatorId: string, communityId: string): Promise<ICommunityInfo>;
    private getRandomInt;
    private constructLeaderboard;
    fetchCommunityLeaderboard(community: ICommunityInfo): Promise<{
        allTime: ICommunityLeaderboard[];
        monthly: ICommunityLeaderboard[];
        weekly: ICommunityLeaderboard[];
    }>;
    fetchCommunitiesFeedInfo(since?: number, until?: number): Promise<INoteInfoExtended[]>;
    fetchUserRelatedCommunityFeedInfo(pubKey: string, since?: number, until?: number): Promise<INoteInfoExtended[]>;
    fetchThreadNotesInfo(focusedNoteId: string): Promise<{
        focusedNote: INoteInfo;
        ancestorNotes: INoteInfo[];
        replies: INoteInfo[];
        quotedNotesMap: Record<string, INoteInfo>;
        metadataByPubKeyMap: Record<string, INostrMetadata>;
        childReplyEventTagIds: string[];
        communityInfo: ICommunityInfo;
    }>;
    createNoteCommunityMappings(notes: INostrEvent[]): Promise<{
        noteCommunityInfoList: INoteCommunityInfo[];
        communityInfoList: ICommunityInfo[];
    }>;
    retrieveUserProfileDetail(pubKey: string): Promise<{
        userProfile: IUserProfile;
        stats: IUserActivityStats;
    }>;
    fetchUserContactList(pubKey: string): Promise<IUserProfile[]>;
    fetchUserFollowersList(pubKey: string): Promise<IUserProfile[]>;
    fetchUserRelayList(pubKey: string): Promise<string[]>;
    followUser(userPubKey: string): Promise<void>;
    unfollowUser(userPubKey: string): Promise<void>;
    generateGroupKeys(privateKey: string, encryptionPublicKeys: string[]): Promise<{
        groupPrivateKey: string;
        groupPublicKey: string;
        encryptedGroupKeys: Record<string, string>;
    }>;
    createCommunity(newInfo: INewCommunityInfo, creatorId: string): Promise<ICommunityInfo>;
    updateCommunity(info: ICommunityInfo): Promise<ICommunityInfo>;
    updateCommunityChannel(communityInfo: ICommunityInfo): Promise<import("../utils/interfaces").ISocialEventManagerWriteResult>;
    createChannel(channelInfo: IChannelInfo, memberIds: string[]): Promise<IChannelInfo>;
    updateChannel(channelInfo: IChannelInfo): Promise<import("../utils/interfaces").ISocialEventManagerWriteResult>;
    fetchCommunitiesMembers(communities: ICommunityInfo[]): Promise<Record<string, ICommunityMember[]>>;
    private getEventIdToMemberMap;
    fetchCommunities(query?: string): Promise<ICommunity[]>;
    fetchMyCommunities(pubKey: string): Promise<ICommunity[]>;
    joinCommunity(community: ICommunityInfo, pubKey: string): Promise<void>;
    leaveCommunity(community: ICommunityInfo, pubKey: string): Promise<void>;
    private encryptGroupMessage;
    submitCommunityPost(message: string, info: ICommunityInfo, conversationPath?: IConversationPath, timestamp?: number, isPublicPost?: boolean): Promise<import("../utils/interfaces").ISocialEventManagerWriteResult>;
    fetchAllUserRelatedChannels(pubKey: string): Promise<IChannelInfo[]>;
    retrieveChannelMessages(channelId: string, since?: number, until?: number): Promise<INostrEvent[]>;
    retrieveChannelEvents(creatorId: string, channelId: string): Promise<{
        messageEvents: INostrEvent[];
        info: IChannelInfo;
    }>;
    retrieveChannelMessageKeys(options: IRetrieveChannelMessageKeysOptions): Promise<Record<string, string>>;
    submitChannelMessage(message: string, channelId: string, communityPublicKey: string, conversationPath?: IConversationPath): Promise<void>;
    fetchDirectMessagesBySender(selfPubKey: string, senderPubKey: string, since?: number, until?: number): Promise<{
        decodedSenderPubKey: string;
        encryptedMessages: any[];
        metadataByPubKeyMap: Record<string, INostrMetadata>;
    }>;
    sendDirectMessage(chatId: string, message: string, replyToEventId?: string): Promise<import("../utils/interfaces").ISocialEventManagerWriteResult>;
    sendTempMessage(options: ISendTempMessageOptions): Promise<import("../utils/interfaces").ISocialEventManagerWriteResult>;
    resetMessageCount(selfPubKey: string, senderPubKey: string): Promise<void>;
    fetchMessageContacts(pubKey: string): Promise<IMessageContactInfo[]>;
    fetchUserGroupInvitations(pubKey: string): Promise<string[]>;
    private extractCalendarEventInfo;
    updateCalendarEvent(updateCalendarEventInfo: IUpdateCalendarEventInfo): Promise<string>;
    retrieveCalendarEventsByDateRange(start: number, end?: number, limit?: number, previousEventId?: string): Promise<{
        calendarEventInfoList: ICalendarEventInfo[];
        startDates: number[];
    }>;
    retrieveCalendarEvent(naddr: string): Promise<ICalendarEventDetailInfo>;
    acceptCalendarEvent(rsvpId: string, naddr: string): Promise<void>;
    declineCalendarEvent(rsvpId: string, naddr: string): Promise<void>;
    submitCalendarEventPost(naddr: string, message: string, conversationPath?: IConversationPath): Promise<any>;
    fetchTimezones(): Promise<any[]>;
    fetchCitiesByKeyword(keyword: string): Promise<any[]>;
    fetchCitiesByCoordinates(latitude: number, longitude: number): Promise<any[]>;
    fetchLocationInfoFromIP(): Promise<ILocationCoordinates>;
    private fetchEventMetadataFromIPFS;
    getAccountBalance(walletAddress: string): Promise<any>;
    getNFTsByOwner(walletAddress: string): Promise<any>;
    submitMessage(message: string, conversationPath?: IConversationPath, createdAt?: number): Promise<import("../utils/interfaces").ISocialEventManagerWriteResult>;
    submitLongFormContent(info: ILongFormContentInfo): Promise<import("../utils/interfaces").ISocialEventManagerWriteResult>;
    submitLike(postEventData: INostrEvent): Promise<void>;
    submitRepost(postEventData: INostrEvent): Promise<void>;
    sendPingRequest(pubkey: string, relayUrl?: string): Promise<any>;
    checkRelayStatus(pubkey: string, relayUrl?: string): Promise<any>;
    fetchUnreadMessageCounts(pubkey: string): Promise<any>;
    updateMessageLastReadReceipt(pubkey: string, walletAddress: string, signature: string, fromId: string): Promise<any>;
    searchUsers(query: string): Promise<IUserProfile[]>;
    addRelay(url: string): Promise<void>;
    removeRelay(url: string): Promise<void>;
    updateRelays(add: string[], remove: string[], defaultRelays: string[]): Promise<string[]>;
    makeInvoice(amount: string, comment: string): Promise<string>;
    createPaymentRequest(chainId: number, token: any, amount: string, to: string, comment: string): Promise<string>;
    parsePaymentRequest(paymentRequest: string): any;
    private sendToken;
    private isLightningInvoice;
    sendPayment(paymentRequest: string, comment: string): Promise<string>;
    zap(pubkey: string, lud16: string, amount: string, noteId: string): Promise<any>;
    fetchUserPaymentActivities(pubkey: string, since?: number, until?: number): Promise<import("../utils/interfaces").IPaymentActivity[]>;
    fetchPaymentReceiptInfo(paymentRequest: string): Promise<{
        status: 'pending' | 'completed';
        preimage?: string;
        tx?: string;
    }>;
    getLightningBalance(): Promise<any>;
    isLightningAvailable(): boolean;
    getBitcoinPrice(): Promise<any>;
    fetchUserPrivateRelay(pubkey: string): Promise<any>;
    fetchApps(keyword?: string): Promise<any>;
    fetchApp(pubkey: string, id: string): Promise<any>;
    fetchInstalledByPubKey(pubkey: string): Promise<any>;
    fetchInstalledApps(pubkey: string): Promise<any>;
    installApp(pubkey: string, appId: string, appVersionId: string): Promise<any>;
    fetchCommunityPinnedNotes(creatorId: string, communityId: string): Promise<{
        notes: INoteInfo[];
        metadataByPubKeyMap: Record<string, INostrMetadata>;
    }>;
    pinCommunityNote(creatorId: string, communityId: string, noteId: string): Promise<void>;
    unpinCommunityNote(creatorId: string, communityId: string, noteId: string): Promise<void>;
    fetchUserPinnedNotes(pubKey: string): Promise<INostrEvent[]>;
    pinUserNote(pubKey: string, noteId: string): Promise<void>;
    unpinUserNote(pubKey: string, noteId: string): Promise<void>;
    fetchUserBookmarks(pubKey: string): Promise<string[]>;
    addBookmark(pubKey: string, eventId: string, isArticle?: boolean): Promise<void>;
    removeBookmark(pubKey: string, eventId: string, isArticle?: boolean): Promise<void>;
    deleteEvents(eventIds: string[]): Promise<void>;
    fetchTrendingCommunities(): Promise<ITrendingCommunityInfo[]>;
    fetchUserEthWalletAccountsInfo(options: SocialDataManagerOptions.IFetchUserEthWalletAccountsInfoOptions): Promise<IEthWalletAccountsInfo>;
    updateUserEthWalletAccountsInfo(info: IEthWalletAccountsInfo, privateKey?: string): Promise<any>;
    fetchSubCommunities(creatorId: string, communityId: string): Promise<ICommunityInfo[]>;
    fetchCommunityDetailMetadata(creatorId: string, communityId: string): Promise<ICommunityDetailMetadata>;
}
export { NostrEventManagerRead, NostrEventManagerReadV2, NostrEventManagerWrite, SocialUtilsManager, SocialDataManager, NostrRestAPIManager, NostrWebSocketManager, INostrCommunicationManager, INostrRestAPIManager };
