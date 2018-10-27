import { socket } from './socket';

export interface IAddResponse {
    isDuplicated: boolean;
    isValid: boolean;
    points: number;
}

export interface IStartResponse {
    letter: string;
    count: number;
}

export class Api {
    public async isWord(word: string): Promise<boolean> {
        return (await socket.call('is-word', word)).isWord;
    }

    public async submitWord(word: string): Promise<IAddResponse> {
        return await socket.call('add', word) as IAddResponse;
    }

    public async startGame(): Promise<IStartResponse> {
        return await socket.call('start') as IStartResponse;
    }
}

export const api = new Api();
