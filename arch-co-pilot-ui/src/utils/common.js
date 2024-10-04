import { COMPLEX, SIMPLE } from "../constants/app";

export const generateUUID = () => {
    return crypto.randomUUID();
}
export const buildS3GetUrl = (uploadUrl, fileName) => {
    return `s3://${uploadUrl.replace("https://", "").replace(".s3.amazonaws.com", "")}${fileName}`
}
export const getDate = (ts) => {
    const today = new Date(ts);
    return today.toLocaleDateString();
}
export const getDateWithTime = (ts) => {
    const today = new Date(ts);
    return today.toLocaleString().replace(",", "");
}
export const getCurrentTs = () => {
    return new Date().getTime();
}
export const getCurrentDate = () => {
    return getDate(getCurrentTs());
}
export const getPeriod = (dateInput) => {
    const dateToday = getCurrentDate();
    const dateYt = new Date();
    dateYt.setDate(dateYt.getDate() - 1);
    const dateYesterday = getDate(dateYt.getTime());
    if (dateInput === dateToday)
        return "Today";
    else if (dateInput === dateYesterday)
        return "Yesterday";
    else
        return dateInput;
}
export const copyToClipboard = (type, value) => {
    switch (type) {
        case SIMPLE:
            return navigator.clipboard.writeText(value)
        case COMPLEX:
            let textToBeCopied = "";
            for (let i = 0; i < value.length; i++) {
                textToBeCopied += value[i].text_response;
                for (let j = 0; j < value[i].image_response.length; j++) {
                    if (value[i].image_response[j] && value[i].image_response[j].image_description && value[i].image_response[j].image_summary)
                        textToBeCopied += value[i].image_response[j].image_description + value[i].image_response[j].image_summary;
                }
            }
            return navigator.clipboard.writeText(textToBeCopied);
        default:
            return null;
    }
}   
