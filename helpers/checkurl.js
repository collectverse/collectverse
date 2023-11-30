module.exports.checkurl = function (url) {
    const regex = /^(ftp|http|https):\/\/[^ "]+$/;
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp)$/i;
    return regex.test(url) && imageRegex.test(url)
};