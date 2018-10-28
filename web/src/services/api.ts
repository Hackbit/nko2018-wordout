import { socket } from './socket';

export interface IAddResponse {
    isDuplicated: boolean;
    isValid: boolean;
    points: number;
    wordPoints: number;
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

    public async startGame(time: number = 60): Promise<IStartResponse> {
        return await socket.call('start', time) as IStartResponse;
    }

    public onGameEnd(handler: () => void) {
        return socket.addHandler('game-end', handler);
    }
}

export const api = new Api();
