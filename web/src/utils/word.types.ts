
export interface IWord {
    isValid: boolean|null;
    isDuplicated: boolean;
    isCommon: boolean|null;
    points: number;
    word: string;
}