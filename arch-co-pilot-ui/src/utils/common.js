export const buildS3GetUrl = (uploadUrl, fileName) => {    
    return `s3://${uploadUrl.replace("https://", "").replace(".s3.amazonaws.com", "")}${fileName}`
}
export const getDate = (ts) => {
    const today = new Date(ts);
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return mm + '/' + dd + '/' + yyyy;
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
    if(dateInput === dateToday)
        return "Today";
    else if(dateInput === dateYesterday)
        return "Yesterday";
    else
        return dateInput;
}
export const generateUUID = () => {
    return crypto.randomUUID();
}