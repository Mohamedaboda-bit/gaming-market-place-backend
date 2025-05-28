export const convertBigIntsToStrings = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(convertBigIntsToStrings);
    } else if (obj && typeof obj === "object") {
        const result = {};
        for (const key in obj) {
            const value = obj[key];
            if (typeof value === "bigint") {
                result[key] = value.toString();
            } else if (value instanceof Date) {
                result[key] = value.toISOString();
            } else if (typeof value === "object" && value !== null) {
                result[key] = convertBigIntsToStrings(value);
            } else {
                result[key] = value;
            }
        }
        return result;
    }
    return obj;
}
