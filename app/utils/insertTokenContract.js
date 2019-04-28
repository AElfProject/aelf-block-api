/**
 * @file insertTokenContract.js
 * @author huangozongzhe
 * @param ctx
 * @param apiUrl
 * @param contract_address
 * @param connection
 * @param table
 * @return {Promise<*>}
 */
/* eslint-disable fecs-camelcase */
// When insert nodes info, insert the token contract info
module.exports = async function insertTokenContract(ctx, apiUrl, contract_address, connection, table) {
    const {data = false} = await ctx.curl(`${apiUrl}/api/contract/detail?contract_address=${contract_address}`, {
        dataType: 'json'
    });
    try {
        if (data && data[0]) {
            let {
                contract_address,
                chain_id,
                block_hash,
                tx_id,
                symbol,
                name,
                total_supply,
                decimals
            } = data[0];

            let keys = [
                'contract_address',
                'chain_id',
                'block_hash',
                'tx_id',
                'symbol',
                'name',
                'total_supply',
                'decimals'
            ];

            let valuesBlank = keys.map(() => '?');
            let keysStr = `(${keys.join(',')})`;
            let valuesBlankStr = `(${valuesBlank.join(',')})`;
            let values = [contract_address, chain_id, block_hash, tx_id, symbol, name, total_supply, decimals];

            let sql = `insert into ${table} ${keysStr} VALUES ${valuesBlankStr}`
                + 'ON DUPLICATE KEY UPDATE contract_address=VALUES(contract_address);';

            const sqlResult = connection.query(sql, values);
            return sqlResult;
        }
        throw Error('Can not get Contract Info for the Node:' + apiUrl);
    }
    catch (error) {
        return {
            error: error,
            msg: 'Please insert Token Contract manually',
        };
    }
}