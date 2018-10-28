
export interface IWord {
    isValid: boolean|null;
    isDuplicated: boolean;
    isCommon: boolean|null;
    isMe: boolean;
    points: number;
    word: string;
}