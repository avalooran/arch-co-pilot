export const buildS3GetUrl = (uploadUrl, fileName) => {    
    return `s3://${uploadUrl.replace("https://", "").replace(".s3.amazonaws.com", "")}${fileName}`
}