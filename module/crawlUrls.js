/**
 * Created by kayslay on 5/28/17.
 */
const request = require('request');
const util = require('./util');
const dom = require('./dom');
const _ = require('lodash');
let getDomContents, visitedLinks = [];

const getUrlOut = util.getUrlOut; //util.getUrlOut is used frequently; setting a const for its function

let configured = false;

let fetchSelector, fetchSelectBy, nextSelector, nextSelectBy, formatUrl,

    //set all defaultDynamicSchemas props when the variable reference is undefined
    defaultDynamicSchemas = {
        fetchSelector, fetchSelectBy, nextSelector, nextSelectBy
    };

let fetchFn, nextFn;

/**
 *
 * @param urls
 * @param resolve
 */
function crawlUrl(urls, resolve) {
    let visitedUrls = 0;
    let initialLink = [];
    let scrapedData = [];
    if (!Array.isArray(urls)) throw  new Error('the property urls must be an Array');

    urls.forEach((url) => {
        "use strict";
        if (visitedLinks.indexOf(getUrlOut(url)) === -1) { //Todo: improve the visitedLinks check
            visitedUrls++;
            visitedLinks.push(getUrlOut(url));
            req(url);
        } else {
            console.log(`${getUrlOut(url)} has been visited`)
        }
    });


    /**
     *
     * @param url
     * @private
     */

    function req(url) {

        request(url, function (err, response, body) {
            visitedUrls--;
            if (err) {
                console.error(err.message);
            } else {
                getDomContents = dom(body).getDomContents; //
                scrapedData.push(fetchFromPage(url));
                let newLink = _.uniq(util.sortDataToArray([selectNextCrawlContent(url)])).map(url => {
                    "use strict";
                    return formatUrl(url)
                });
                initialLink = initialLink.concat(newLink);
            }

            if (visitedUrls == 0) {
                resolve({fetchedData: scrapedData, nextLinks: initialLink})
            }
        });

    }

}


//returns the scraped data gotten from the page
function fetchFromPage(url) {
    let selector = util.dynamicSelection(url, defaultDynamicSchemas.fetchSelector, fetchSelector);
    let selectBy = util.dynamicSelection(url, defaultDynamicSchemas.fetchSelectBy, fetchSelectBy);

    return getDomContents(selector, selectBy, fetchFn, url);
}

//get the url's to crawl next
function selectNextCrawlContent(url) {
    let selector = util.dynamicSelection(url, defaultDynamicSchemas.nextSelector, nextSelector);
    let selectBy = util.dynamicSelection(url, defaultDynamicSchemas.nextSelectBy, nextSelectBy);
    return getDomContents(selector, selectBy, nextFn, url);
}

/**
 *
 * @param urls
 * @param config
 * @return {Promise}
 */
function crawlUrls(urls, config) {
    "use strict";
    if (!configured) {
        let dynamicSchemas;  // define the variable to hold the dynamic data
        (function (config = {}) {

            ({
                fetchSelector,
                fetchSelectBy,
                nextSelector,
                nextSelectBy,
                fetchFn,
                nextFn,
                dynamicSchemas={},
                formatUrl = util.formatUrl
            } = config);
            Object.assign(defaultDynamicSchemas, dynamicSchemas)
        })(config);
        configured = true
    }

    return new Promise((resolve, reject) => crawlUrl(urls, resolve))
}


module.exports = {crawlUrls};