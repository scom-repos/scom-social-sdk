import { Event } from "../core/index";
import { INostrFetchEventsResponse, INostrSubmitResponse, INostrCommunicationManager, INostrRestAPIManager } from "../interfaces";
declare class EventRetrievalCacheManager {
    private cache;
    constructor();
    protected generateCacheKey(endpoint: string, msg: any): string;
    protected fetchWithCache(cacheKey: string, fetchFunction: () => Promise<INostrFetchEventsResponse>, cacheDuration?: number): Promise<INostrFetchEventsResponse>;
}
declare class NostrRestAPIManager extends EventRetrievalCacheManager implements INostrRestAPIManager {
    protected _url: string;
    protected requestCallbackMap: Record<string, (response: any) => void>;
    constructor(url: string);
    get url(): string;
    set url(url: string);
    fetchEvents(...requests: any): Promise<INostrFetchEventsResponse>;
    fetchEventsFromAPI(endpoint: string, msg: any, authHeader?: string): Promise<INostrFetchEventsResponse>;
    fetchCachedEvents(eventType: string, msg: any): Promise<INostrFetchEventsResponse>;
    submitEvent(event: any, authHeader?: string): Promise<any>;
}
declare class NostrWebSocketManager implements INostrCommunicationManager {
    protected _url: string;
    protected ws: any;
    protected requestCallbackMap: Record<string, (message: any) => void>;
    protected messageListenerBound: any;
    constructor(url: any);
    get url(): string;
    set url(url: string);
    generateRandomNumber(): string;
    messageListener(event: any): void;
    establishConnection(requestId: string, cb: (message: any) => void): Promise<{
        ws: any;
        error: any;
    }>;
    fetchEvents(...requests: any): Promise<INostrFetchEventsResponse>;
    fetchCachedEvents(eventType: string, msg: any): Promise<INostrFetchEventsResponse>;
    submitEvent(event: Event.VerifiedEvent<number>): Promise<INostrSubmitResponse>;
}
export { INostrCommunicationManager, EventRetrievalCacheManager, INostrRestAPIManager, NostrRestAPIManager, NostrWebSocketManager };
