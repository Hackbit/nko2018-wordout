import { socket } from './socket';

export interface IAddResponse {
    isDuplicated: boolean;
    isValid: boolean;
    isCommon: boolean;
    points: number|Array<{ points: number, isHost: boolean }>;
    wordPoints: number;
    word: string;
    isMe: boolean;
}

export interface IStartResponse {
    letter: string;
    count: number;
}

export interface IStartResponse {
    letter: string;
    count: number;
}

export interface IStartMultiResponse {
    key: string;
    success: boolean;
}

export enum GameType {
    SINGLE = 'SINGLE_PLAYER',
    MULTI = 'TWO_PLAYER',
    GLOBAL = 'GLOBAL',
}

export interface IStartResponseTypes {
    [GameType.SINGLE]: IStartResponse,
    [GameType.MULTI]: any,
    [GameType.GLOBAL]: IStartResponse,
}

export class Api {
    public async isWord(word: string): Promise<boolean> {
        return (await socket.call('is-word', word)).isWord;
    }

    public async submitWord(word: string): Promise<IAddResponse> {
        return await socket.call('add', word) as IAddResponse;
    }

    public async startGame<K extends GameType>(gameType: K, time: number = 60, key?: string|null): Promise<
        IStartResponseTypes[K]
    > {
        return await socket.call('start', {
            type: gameType,
            time,
            key,
        }) as IStartResponse;
    }

    public async onGameStart(handler: (data: IStartResponse) => void) {
        return socket.addHandler('game-start', handler);
    }

    public onGameEnd(handler: () => void) {
        return socket.addHandler('game-end', handler);
    }


    public onWordAdded(handler: (word: IAddResponse) => void) {
        return socket.addHandler('add-word', handler);
    }
}

export const api = new Api();
