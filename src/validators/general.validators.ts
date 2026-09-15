/**
 * String Utilities
 */

export const trimString = (value: string): string => {
    return value.trim();
};

export const toLowerCase = (value: string): string => {
    return value.toLowerCase();
};

export const toUpperCase = (value: string): string => {
    return value.toUpperCase();
};

export const normalizeSpaces = (value: string): string => {
    return value.trim().replace(/\s+/g, " ");
};

export const normalizeEmail = (email: string): string => {
    return email.trim().toLowerCase();
};

export const isNonEmptyString = (
    value: unknown
): value is string => {
    return (
        typeof value === "string" &&
        value.trim().length > 0
    );
};


/**
 * Email
 */

export const isValidEmail = (
    email: string
): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};


/**
 * Phone Number
 *
 * Uses a basic E.164-compatible format.
 * Example: +2348012345678
 */

export const normalizePhoneNumber = (
    phone: string
): string => {
    return phone
        .trim()
        .replace(/[\s()-]/g, "");
};

export const isValidPhoneNumber = (
    phone: string
): boolean => {
    return /^\+[1-9]\d{7,14}$/.test(phone);
};


/**
 * Character Validation
 */

export const isNumeric = (
    value: string
): boolean => {
    return /^\d+$/.test(value);
};

export const isAlphabetic = (
    value: string
): boolean => {
    return /^[A-Za-z]+$/.test(value);
};

export const isAlphabeticWithSpaces = (
    value: string
): boolean => {
    return /^[A-Za-z\s]+$/.test(value);
};

export const isAlphaNumeric = (
    value: string
): boolean => {
    return /^[A-Za-z0-9_-]+$/.test(value);
};


/**
 * Number Validation
 */

export const isInteger = (
    value: unknown
): value is number => {
    return (
        typeof value === "number" &&
        Number.isInteger(value)
    );
};

export const isPositiveNumber = (
    value: unknown
): value is number => {
    return (
        typeof value === "number" &&
        Number.isFinite(value) &&
        value > 0
    );
};

export const isWithinRange = (
    value: number,
    min: number,
    max: number
): boolean => {
    return value >= min && value <= max;
};


/**
 * URL / UUID
 */

export const isValidUrl = (
    value: string
): boolean => {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
};

export const isValidUUID = (
    value: string
): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value
    );
};


/**
 * Date Validation
 */

export const isValidDate = (
    value: string | Date
): boolean => {
    const date = new Date(value);

    return !Number.isNaN(date.getTime());
};

export const isPastDate = (
    value: string | Date
): boolean => {
    const date = new Date(value);

    return (
        !Number.isNaN(date.getTime()) &&
        date.getTime() < Date.now()
    );
};

export const isFutureDate = (
    value: string | Date
): boolean => {
    const date = new Date(value);

    return (
        !Number.isNaN(date.getTime()) &&
        date.getTime() > Date.now()
    );
};