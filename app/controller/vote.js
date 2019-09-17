/**
 * @file controller/vote.js
 * @author huangzongzhe
 * 2019.01
 */
const { Controller } = require('egg');
const Schema = require('async-validator/dist-node/index').default;
const formatOutput = require('../utils/formatOutput.js');

const addTeamDescriptor = {
  isActive: {
    type: 'boolean',
    default: true,
    required: true
  },
  name: {
    type: 'string',
    required: true,
    pattern: /^[\.\-\_a-zA-Z0-9]+$/
  },
  publicKey: {
    type: 'string',
    required: true
  },
  address: {
    type: 'string',
    required: true
  },
  txId: {
    type: 'string',
    default: ''
  },
  officialWebsite: {
    type: 'url',
    default: ''
  },
  location: {
    type: 'string',
    default: ''
  },
  mail: {
    type: 'string',
    default: ''
  },
  intro: {
    type: 'string',
    default: ''
  },
  avatar: {
    type: 'url',
    default: ''
  },
  socials: {
    type: 'array'
  }
};
const addTeamValidator = new Schema(addTeamDescriptor);

const getTeamDescriptor = {
  publicKey: {
    type: 'string',
    required: true
  }
};
const getTeamValidator = new Schema(getTeamDescriptor);

const getAllTeamDescriptor = {
  isActive: {
    type: 'enum',
    enum: [ 'true', 'false' ],
    required: true,
    default: 'true'
  }
};
const getAllTeamValidator = new Schema(getAllTeamDescriptor);

const upateTeamDescriptor = {
  isActive: {
    type: 'boolean',
    required: true,
    default: true
  },
  publicKey: {
    type: 'string',
    required: true
  }
};
const updateTeamValidator = new Schema(upateTeamDescriptor);

class VoteController extends Controller {
  async addTeamDesc() {
    const { ctx } = this;
    const params = ctx.request.body;
    try {
      await addTeamValidator.validate(params);
      const result = await ctx.service.vote.addTeamDesc(params);
      formatOutput(ctx, 'post', result);
    } catch (e) {
      const err = ctx.service.vote.error(e);
      formatOutput(ctx, 'post', err);
    }
  }

  async getTeamDesc() {
    const { ctx } = this;
    const params = ctx.request.query;
    try {
      await getTeamValidator.validate(params);
      const result = await ctx.service.vote.getTeamDesc(params);
      formatOutput(ctx, 'get', result);
    } catch (e) {
      const err = ctx.service.vote.error(e);
      formatOutput(ctx, 'get', err);
    }
  }

  async getAllTeams() {
    const { ctx } = this;
    const params = ctx.request.query;
    try {
      await getAllTeamValidator.validate(params);
      const result = await ctx.service.vote.getAllTeams(params);
      formatOutput(ctx, 'get', result);
    } catch (e) {
      const err = ctx.service.vote.error(e);
      formatOutput(ctx, 'get', err);
    }
  }

  async updateTeam() {
    const { ctx } = this;
    const params = ctx.request.body;
    try {
      await updateTeamValidator.validate(params);
      const result = await ctx.service.vote.updateTeam(params);
      formatOutput(ctx, 'post', result);
    } catch (e) {
      const err = ctx.service.vote.error(e);
      formatOutput(ctx, 'post', err);
    }
  }
}

module.exports = VoteController;
