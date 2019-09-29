/* eslint-disable camelcase */
const puppeteer = require('puppeteer');
const axios = require('axios');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');
/* eslint-disable */
const iracingCoreData = require('../mock/iracingCoreData');
const iracingSeasonData = require('../mock/iracingSeasonData');
/* eslint-enable */

const checkResultFor = async (page, selector) => {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    return true;
  } catch (err) {
    return false;
  }
};

const createCookieString = cookieArray => cookieArray
  .reduce((current, acc) => `${current}${acc.name}=${acc.value};`, '');

exports.loginAndGetCookies = async ({ email, password }) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
    ],
  });
  const page = await browser.newPage();
  await page.goto('https://members.iracing.com/membersite/login.jsp');

  await page.type('.username', email);
  await page.type('.password', password);
  await page.click('#submit');

  const selectorIsAvailable = await checkResultFor(page, '#ui_content');

  if (selectorIsAvailable) {
    // Get cookies
    const cookies = await page.cookies();
    /* eslint-disable */
    const js_custid = await page.evaluate(() => ({
      js_custid,
    }));
    await browser.close();
    return {
      cookies,
      js_custid: js_custid.js_custid,
    };
    /* eslint-enable */
  }

  if (page.url().includes('account_auth.jsp')) {
    throw new APIError({
      message: 'User has no valid subscription',
      status: httpStatus.UNAUTHORIZED,
    });
  }

  throw new APIError({
    message: 'User does not exist on iracing',
    status: httpStatus.UNAUTHORIZED,
  });
};

// todo for testing purpose
/* exports.getSeasonData = async (cookies) => {
  return iracingSeasonData;
}; */

exports.getSeasonData = async (cookies) => {
  const browser = await puppeteer.launch({
    headless: true,
    args:
      [
        '--no-sandbox',
      ],
  });

  const page = await browser.newPage();
  await page.setCookie(...cookies);

  await page.goto('https://members.iracing.com/membersite/member/Series.do');
  /* eslint-disable */
  return await page.evaluate(() => ({
    currentSeason,
  }));
  /* eslint-enable */
};

// todo for testing purpose
/* exports.getCoreData = (cookies) => {
  return iracingCoreData;
}; */

exports.getCoreData = async (cookies) => {
  const browser = await puppeteer.launch({
    headless: true,
    args:
      [
        '--no-sandbox',
      ],
  });
  const page = await browser.newPage();
  await page.setCookie(...cookies);

  await page.goto('https://members.iracing.com/membersite/member/Series.do');
  /* eslint-disable */
  return await page.evaluate(() => ({
    SeasonListing,
    TrackListing,
    CarListing,
    CarClassListing,
    licenseGroups,
    CategoryListing,
    currentSeason,
    js_custid,
    imageserver
  }));
  /* eslint-enable */
};

exports.getSessionData = async (cookies, {
  custid, type, year, season,
}) => {
  const headers = {
    Cookie: createCookieString(cookies),
  };
  const practice = type === 'practice' ? 1 : 0;
  const race = type === 'race' ? 1 : 0;
  const url = `https://members.iracing.com/memberstats/member/GetResults?custid=${custid}&showraces=${race}&showquals=0&showtts=0&showops=${practice}&showofficial=1&showunofficial=0&showrookie=1&showclassd=1&showclassc=1&showclassb=1&showclassa=1&showpro=1&showprowc=1&lowerbound=0&upperbound=25&sort=start_time&order=desc&format=json&category%5B%5D=1&category%5B%5D=2&category%5B%5D=3&category%5B%5D=4&seasonyear=${year}&seasonquarter=${season}&raceweek=`;
  console.log(url);
  const data = await axios.get(url, { headers });
  return data;
};

exports.getSubsessionData = async (cookies, {
  custid,
  id,
}) => {
  const headers = {
    Cookie: createCookieString(cookies),
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  const url = 'https://members.iracing.com/membersite/member/GetSubsessionResults';
  const data = await axios.post(url, `subsessionID=${id}&custid=${custid}`, { headers });
  return data;
};

exports.validateSession = async (cookies) => {
  const browser = await puppeteer.launch({
    headless: true,
    args:
      [
        '--no-sandbox',
      ],
  });
  const page = await browser.newPage();
  await page.setCookie(...cookies);
  page.on('response', (response) => {
    const status = response.status();
    if ((status >= 300) && (status <= 399)) {
      console.log('login');
      return false;
    }
    console.log('alles gut');
    return true;
  });
  await page.goto('http://members.iracing.com/membersite/member/GetMember');
};
