module.exports = formatOutput;

function formatOutput(ctx, type, result, errcode) {
	switch (type) {
		case 'get':
			ctx.status = 200;
			break
        case 'get':
            ctx.status = 201;
            break
		case 'put':
			ctx.status = 204;
			break
		case 'error':
			ctx.status = parseInt(errcode, 10);
			break
		default: ;
	}
    ctx.body = JSON.stringify(result);
}