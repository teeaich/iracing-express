/* eslint-disable camelcase */
const puppeteer = require('puppeteer');
const axios = require('axios');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');

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
    await browser.close();
    return cookies;
  }

  throw new APIError({
    message: 'User does not exist on iracing',
    status: httpStatus.UNAUTHORIZED,
  });
};

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

  await page.goto('http://members.iracing.com/membersite/member/Series.do');
  const SeasonListing = await page.evaluate(() => Promise.resolve(SeasonListing));
  const TrackListing = await page.evaluate(() => Promise.resolve(TrackListing));
  const CarListing = await page.evaluate(() => Promise.resolve(CarListing));
  const CarClassListing = await page.evaluate(() => Promise.resolve(CarClassListing));
  const currentSeason = await page.evaluate(() => Promise.resolve(currentSeason));
  const js_custid = await page.evaluate(() => Promise.resolve(js_custid));
  return {
    TrackListing,
    CarListing,
    CarClassListing,
    SeasonListing,
    currentSeason,
    js_custid,
  };
};

exports.getSessionData = async (cookies, {
  custid, type, year, season,
}) => {
  const headers = {
    Cookie: createCookieString(cookies),
  };
  const practice = type === 'practice' ? 1 : 0;
  const race = type === 'race' ? 1 : 0;
  const url = `http://members.iracing.com/memberstats/member/GetResults?custid=${custid}&showraces=${race}&showquals=0&showtts=0&showops=${practice}&showofficial=1&showunofficial=0&showrookie=1&showclassd=1&showclassc=1&showclassb=1&showclassa=1&showpro=1&showprowc=1&lowerbound=0&upperbound=25&sort=start_time&order=desc&format=json&category%5B%5D=1&category%5B%5D=2&category%5B%5D=3&category%5B%5D=4&seasonyear=${year}&seasonquarter=${season}&raceweek=`;
  const data = await axios.get(url, { headers });
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
