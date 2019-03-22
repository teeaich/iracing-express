// const httpStatus = require('http-status');
const iracingScrapeProviders = require('../services/iracingScrapeProviders');


/**
 * Get iracing data
 * @public
 */
exports.getData = async (req, res, next) => {
  try {
    const data = await iracingScrapeProviders.getCoreData(req.cookie);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get iracing session data
 * @public
 */
exports.getSessionData = async (req, res, next) => {
  try {
    const { data } = await iracingScrapeProviders.getSessionData(req.cookie, req.params);
    res.json(data);
  } catch (error) {
    next(error);
  }
};
