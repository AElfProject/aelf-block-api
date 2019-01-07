/**
 * @file utils/checkURL.js
 * @author huangzongzhe
 */
module.exports = checkUrl;

function checkUrl(url) {
    const strReg
        // = '/((http|ftp|https|file):\/\/([\w\-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/ig';
        = '/((http|https):\/\/([\w\-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/ig';
    const re = new RegExp(strReg);
    if (!re.test(url)) {
        return false;
    }
    return true;
}
