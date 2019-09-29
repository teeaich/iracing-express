const mongoose = require('mongoose');
/* eslint-disable
const APIError = require('../utils/APIError');
/* eslint-enable

 */
/**
 * IRacing Schema
 * @private
 */
const iracingSchema = new mongoose.Schema({
  SeasonListing: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  TrackListing: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  CarListing: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  CarClassListing: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  licenseGroups: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  CategoryListing: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  currentSeason: {
    year: Number,
    quarter: Number,
  },
  imageserver: {
    type: String,
    required: true,
  },
  jsCustid: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
iracingSchema.pre('save', async (next) => {
  try {
    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
iracingSchema.method({

});

/**
 * Statics
 */
iracingSchema.statics = {

  /**
   * Get latest iracing data
   *
   * @returns {Promise<IRacing, false>}
   */
  async getLatest() {
    try {
      const data = await this.findOne().sort({ created_at: -1 }).exec();

      if (data) {
        return data;
      }
      return false;
    } catch (error) {
      throw error;
    }
  },
};


/**
 * @typedef IRacing
 */
module.exports = mongoose.model('IRacing', iracingSchema);
