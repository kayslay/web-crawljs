/**
 * Created by kayslay on 5/28/17.
 */
const request = require('request');
const util = require('./util');
const dom = require('./dom');
const _ = require('lodash');
let getDomContents, visitedLinks = [];

let configured = false;

let fetchSelector, fetchSelectBy, nextSelector, nextSelectBy,

    //set all defaultdynamicSchemas props when the variable reference is undefined
    defaultdynamicSchemas = {
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
        if (visitedLinks.indexOf(url) === -1) { //Todo: improve the visitedLinks check
            visitedUrls++;
            visitedLinks.push(url);
            req(url);
        } else {
            console.log(`${url} has been visited`)
        }
    });


    /**
     *
     * @param url
     * @private
     */

    function req(url) {

        request(url, function (err, response, body) {
            if (err) return console.log(err.message);
            visitedUrls--;
            getDomContents = dom(body).getDomContents; //
            scrapedData.push(fetchFromPage(url));
            initialLink.push(selectNextCrawlContent(url));
            //next after hook

            if (visitedUrls == 0) {
                resolve({fetchedData: scrapedData, nextLinks: _.uniq(util.sortDataToArray(initialLink))})
            }
        });

    }

}
//returns the scraped data gotten from the page
function fetchFromPage(url) {
    let selector = util.dynamicSelection(url, defaultdynamicSchemas.fetchSelector, fetchSelector);
    let selectBy = util.dynamicSelection(url, defaultdynamicSchemas.fetchSelectBy, fetchSelectBy);

    return getDomContents(selector, selectBy, fetchFn, url);
}
//get the url's to crawl next
function selectNextCrawlContent(url) {
    let selector = util.dynamicSelection(url, defaultdynamicSchemas.nextSelector, nextSelector);
    let selectBy = util.dynamicSelection(url, defaultdynamicSchemas.nextSelectBy, nextSelectBy);
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
    if(!configured) {
        let dynamicSchemas;  // define the variable to hold the dynamic data
        (function (config = {}) {

            ({
                fetchSelector,
                fetchSelectBy,
                nextSelector,
                nextSelectBy,
                fetchFn,
                nextFn,
                dynamicSchemas={}

            } = config)
            Object.assign(defaultdynamicSchemas,dynamicSchemas)
        })(config);
        configured = true
    }

    return new Promise((resolve, reject) => crawlUrl(urls, resolve))
}


module.exports = {crawlUrls};