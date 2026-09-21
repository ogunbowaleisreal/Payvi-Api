import { randomBytes } from "node:crypto";

export const generateVtpassRequestId = (): string => {
    const now = new Date();

    const lagosTime = new Date(
        now.toLocaleString("en-US", {
            timeZone: "Africa/Lagos",
        })
    );

    const year = lagosTime.getFullYear();

    const month = String(
        lagosTime.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        lagosTime.getDate()
    ).padStart(2, "0");

    const hours = String(
        lagosTime.getHours()
    ).padStart(2, "0");

    const minutes = String(
        lagosTime.getMinutes()
    ).padStart(2, "0");

    const timestamp =
        `${year}${month}${day}${hours}${minutes}`;

    const uniquePart =
        randomBytes(8).toString("hex");

    return `${timestamp}${uniquePart}`;
};