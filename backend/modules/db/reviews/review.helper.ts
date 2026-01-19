function isValidFloatRating(value: any): boolean {
    return (
        typeof value === 'number' &&
        Number.isFinite(value) &&
        value >= 0 &&
        value <= 5
    );
}

function normalizeRating(value: number): number {
    return Math.round(value * 10) / 10;
}