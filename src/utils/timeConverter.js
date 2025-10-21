// utcString: YYYYMMDD-HHMMSS
export function convertUTCtoLocal(utcString) {
    const match = utcString.match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})$/);
    if (!match) {
        throw new Error("Invalid UTC string format. Expected format: YYYYMMDD-HHMMSS");
    }
    const [_, year, month, day, hour, minute, second] = match;

    const utcDate = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1, // Month is 0-indexed
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
    ));
    return new Date(utcDate.getTime());
}