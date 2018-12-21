/**
 * @file utils/formatOutput.js
 * @author huangzongzhe
 * @type {formatOutput}
 */
module.exports = formatOutput;

function formatOutput(ctx, type, result, errcode) {
    switch (type) {
        case 'get':
            ctx.status = 200;
            break;
        case 'post':
            ctx.status = 201;
            break;
        // https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html
        // If an existing resource is modified, either the 200 (OK) or 204 (No Content) response codes
        // SHOULD be sent to indicate successful completion of the request.
        case 'put':
            // ctx.status = 204;
            ctx.status = 200;
            break;
        case 'error':
            ctx.status = parseInt(errcode, 10);
            result = {
                message: result.message,
                // stack: result.stack
            };
            break;
        default:
    }
    ctx.body = JSON.stringify(result);
}