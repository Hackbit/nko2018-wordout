
export interface IWord {
    isValid: boolean|null;
    isDuplicated: boolean;
    isCommon: boolean;
    points: number;
    word: string;
}