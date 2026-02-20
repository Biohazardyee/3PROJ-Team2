export function isEmptyString(value: any): boolean {
    return typeof value !== "string" || value.trim().length === 0;
}


export function isValidApiId(value: any): boolean {
    return typeof value === "string" && !isEmptyString(value);
}


export function isValidStringLength(text: string, value: number): boolean {
    return text.trim().length <= value;
}

export function isValidBoolean(value: unknown): boolean {
    return typeof value === 'boolean';
}


