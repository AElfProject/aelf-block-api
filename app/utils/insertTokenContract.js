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
// When insert nodes info, insert the token contract info
module.exports = async function insertTokenContract(ctx, apiUrl, contract_address, connection, table) {
  const { data = false } = await ctx.curl(`${apiUrl}/api/contract/detail?contract_address=${contract_address}`, {
    dataType: 'json'
  });
  try {
    if (data && data[0]) {
      const {
        contract_address,
        chain_id,
        block_hash,
        tx_id,
        symbol,
        name,
        total_supply,
        decimals
      } = data[0];

      const keys = [
        'contract_address',
        'chain_id',
        'block_hash',
        'tx_id',
        'symbol',
        'name',
        'total_supply',
        'decimals'
      ];

      const valuesBlank = keys.map(() => '?');
      const keysStr = `(${keys.join(',')})`;
      const valuesBlankStr = `(${valuesBlank.join(',')})`;
      const values = [ contract_address, chain_id, block_hash, tx_id, symbol, name, total_supply, decimals ];

      const sql = `insert into ${table} ${keysStr} VALUES ${valuesBlankStr}`
                + 'ON DUPLICATE KEY UPDATE contract_address=VALUES(contract_address);';

      const sqlResult = connection.query(sql, values);
      return sqlResult;
    }
    throw Error('Can not get Contract Info for the Node:' + apiUrl);
  } catch (error) {
    return {
      error,
      msg: 'Please insert Token Contract manually',
    };
  }
};
