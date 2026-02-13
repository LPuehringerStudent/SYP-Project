export function isNullOrWhiteSpace(value: string | null | undefined): boolean {
    return value == null || value.trim() === ''
}