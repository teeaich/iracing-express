// const httpStatus = require('http-status');
const iracingScrapeProviders = require('../services/iracingScrapeProviders');
const IRacing = require('../models/iracing.model');

/**
 * Get iracing data
 * @public
 */
exports.getData = async (req, res, next) => {
  try {
    const savedData = await IRacing.getLatest();

    if (savedData) {
      // there is data already saved
      // async in app checks if newer data is available
      res.json(savedData);
    } else {
      // no data yet saved - get it
      const {
        SeasonListing,
        TrackListing,
        CarListing,
        CarClassListing,
        licenseGroups,
        CategoryListing,
        currentSeason,
        imageserver,
        /* eslint-disable */
        js_custid,
        /* eslint-enable */
      } = await iracingScrapeProviders.getCoreData(req.cookie);

      const iracing = new IRacing({
        SeasonListing,
        TrackListing,
        CarListing,
        CarClassListing,
        licenseGroups,
        CategoryListing,
        currentSeason,
        imageserver,
        jsCustid: js_custid,
      });
      const savedIracing = await iracing.save();
      res.json(savedIracing);
    }
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
/**
 * Get iracing subsession data
 * @public
 */
exports.getSubsessionData = async (req, res, next) => {
  try {
    const { data } = await iracingScrapeProviders.getSubsessionData(req.cookie, req.params);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get iracing season data
 * @public
 */
exports.getSeasonData = async (req, res, next) => {
  try {
    const { data } = await iracingScrapeProviders.getSeasonData(req.cookie);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

