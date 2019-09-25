/**
 * @file vote service
 * @author atom-yang
 * @date 2019.09.09
 */
const camelCase = require('lodash.camelcase');
const BaseService = require('../core/baseService');
const {
  camelCaseToUnderScore,
  isObject
} = require('../utils/utils');

class VoteService extends BaseService {
  async addTeamDesc(params) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const sqlData = {};
    Object.entries(params).forEach(([ key, value ]) => {
      if (isObject(value)) {
        sqlData[camelCaseToUnderScore(key)] = JSON.stringify(value);
        return;
      }
      sqlData[camelCaseToUnderScore(key)] = value;
    });
    const keys = Object.keys(sqlData);
    const keysStr = `(${keys.join(',')})`;
    const valuesBlank = `(${keys.map(() => '?').join(',')})`;
    const noDuplicateNameSql = 'select name from vote_teams where name = ? and public_key <> ?';
    const duplicateNames = await this.selectQuery(aelf0, noDuplicateNameSql, [ sqlData.name, sqlData.public_key ]);
    if (duplicateNames.length > 0) {
      return this.error({
        code: 501,
        message: 'has duplicate names'
      });
    }
    const sql = `insert into vote_teams ${keysStr} VALUES ${valuesBlank}`;
    await this.selectQuery(aelf0, sql, Object.values(sqlData));
    return this.setBody({});
  }

  async getTeamDesc(params) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    const {
      publicKey
    } = params;
    const sql = `SELECT * FROM vote_teams WHERE public_key=\'${publicKey}\' ORDER BY id DESC limit 1`;
    const result = await this.selectQuery(aelf0, sql);
    if (result.length === 0) {
      return this.error({
        code: 400,
        message: 'not found'
      });
    }
    const camelCaseData = {};
    Object.entries(result[0]).forEach(([ key, value ]) => {
      camelCaseData[camelCase(key)] = value;
    });
    camelCaseData.isActive = camelCaseData.isActive === 1;
    try {
      camelCaseData.socials = JSON.parse(camelCaseData.socials) || [];
    } catch {
      camelCaseData.socials = [];
    }
    return this.setBody(camelCaseData);
  }

  async getAllTeams(params) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    let {
      isActive = true
    } = params;
    isActive = isActive === 'true' ? 1 : 0;
    const sql = `SELECT * FROM vote_teams
        INNER JOIN (SELECT max(id) id FROM vote_teams WHERE is_active=${isActive}
        GROUP BY public_key) as ids USING (id)`;
    const result = await this.selectQuery(aelf0, sql);
    return this.setBody(result);
  }

  async updateTeam(params) {
    const aelf0 = this.ctx.app.mysql.get('aelf0');
    let {
      isActive = true,
      publicKey
    } = params;
    isActive = isActive ? 1 : 0;
    const sql = `UPDATE vote_teams SET is_active=${isActive} WHERE public_key=\'${publicKey}\'`;
    await this.selectQuery(aelf0, sql);
    return this.setBody({});
  }

  setBody(data = {}) {
    return {
      msg: 'success',
      code: 0,
      ...this.ctx.body,
      data,
    };
  }

  error(err) {
    return {
      msg: err.message || 'error',
      code: err.code || 500,
      errors: err.errors
    };
  }
}

module.exports = VoteService;
