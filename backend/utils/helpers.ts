export function isEmptyString(value: string): boolean {
    return value.trim().length <= 0;
}

export function isValidApiId(value: any): boolean {
    return isEmptyString(value);
}

export function isValidStringLength(text: string, value: number): boolean{
    return text.trim().length <= value;
}