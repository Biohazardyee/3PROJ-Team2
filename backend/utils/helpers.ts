export function isNonEmptyString(value: string): boolean {
    console.log(`coucou ${value}`);
    return value.trim().length > 0;
}

export function isValidApiId(value: any): boolean {
    return isNonEmptyString(value);
}

export function isValidStringLength(text: string, value: number): boolean{
    return text.trim().length <= value;
}