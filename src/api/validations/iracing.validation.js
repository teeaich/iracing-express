const Joi = require('joi');

module.exports = {

  // GET /v1/users
  getSessionData: {
    params: {
      type: Joi.string(),
      year: Joi.number(),
      season: Joi.number().min(1).max(10),
    },
  },
  getSubsessionData: {
    body: {
      type: Joi.string(),
      year: Joi.number(),
      season: Joi.number().min(1).max(10),
    },
  },
};
