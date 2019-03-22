const httpStatus = require('http-status');
const passport = require('passport');
const User = require('../models/user.model');
const APIError = require('../utils/APIError');

const ADMIN = 'admin';
const LOGGED_USER = '_loggedUser';
const LOGGED_USER_IRACING = '_loggedUserIracing';

const handleJWT = (req, res, next, roles) => async (err, user, info) => {
  let error = false;
  if (info) {
    error = info.name === 'TokenExpiredError' ? info : false;
  }

  error = err || error;


  const logIn = Promise.promisify(req.logIn);
  const apiError = new APIError({
    message: error ? error.message : 'Unauthorized',
    status: httpStatus.UNAUTHORIZED,
    stack: error ? error.stack : undefined,
  });

  try {
    if (error || !user) throw error;
    await logIn(user, { session: false });
  } catch (e) {
    return next(apiError);
  }

  if (roles === LOGGED_USER) {
    if (user.role !== 'admin' && req.params.userId !== user._id.toString()) {
      apiError.status = httpStatus.FORBIDDEN;
      apiError.message = 'Forbidden';
      return next(apiError);
    }
  } else if (roles === LOGGED_USER_IRACING) {
    apiError.status = httpStatus.FORBIDDEN;
    apiError.message = 'Forbidden';
    if (info.find(cookiePart => cookiePart.name === 'XROUTE_UID').expires !== -1) {
      req.cookie = info;
    } else {
      return next(apiError);
    }
  } else if (!roles.includes(user.role)) {
    apiError.status = httpStatus.FORBIDDEN;
    apiError.message = 'Forbidden';
    return next(apiError);
  } else if (err || !user) {
    return next(apiError);
  }

  req.user = user;

  return next();
};

exports.ADMIN = ADMIN;
exports.LOGGED_USER = LOGGED_USER;
exports.LOGGED_USER_IRACING = LOGGED_USER_IRACING;

exports.authorize = (roles = User.roles) => (req, res, next) =>
  passport.authenticate(
    'jwt', { session: false },
    handleJWT(req, res, next, roles),
  )(req, res, next);

exports.oAuth = service =>
  passport.authenticate(service, { session: false });
