const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/iracing.controller');
const { authorize, LOGGED_USER_IRACING } = require('../../middlewares/auth');
const {
  getSessionData,
} = require('../../validations/iracing.validation');


const router = express.Router();


router
  .route('/')
  /**
   * @api {get} v1/iracing Get iRacing Data
   * @apiDescription Get all core iRacing Data
   * @apiVersion 1.0.0
   * @apiName GetIRacingData
   * @apiGroup Iracing
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiSuccess {Object[]} data
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(authorize(LOGGED_USER_IRACING), controller.getData);
router
  .route('/session/:custid/:type/:year/:season')
  /**
   * @api {get} v1/iracing/session Get iRacing Data
   * @apiDescription Get iracing session data
   * @apiVersion 1.0.0
   * @apiName GetIRacingData for last session type
   * @apiGroup Iracing
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiSuccess {Object[]} data
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(authorize(LOGGED_USER_IRACING), validate(getSessionData), controller.getSessionData);

module.exports = router;
