/**
 * Created by kayslay on 5/28/17.
 */
const request = require('request');
const util = require('./util');
const dom = require('./dom');
const _ = require('lodash');
const {
    TimeoutErr,
    AllLinksVisitErr,
    KeyMatchErr
} = require("./errors")
const {
    genUniqueVisitedString,
    delay
} = util;

module.exports = function () {
    let visitedLinks = [],
        getDomContents;
    let configured = false;
    //The configuration variables. They would be set by the initCrawl function
    let fetchSelector, fetchSelectBy, nextSelector, nextSelectBy, formatUrl, timeOut = false,
        groups, _groupSet = {},
        skipDuplicates = true,
        rateLimit,
        //set all _dynamicSchemas props when the variable reference is undefined
        _dynamicSchemas = {},
        fetchFn, nextFn;

    /**
     * @description visit and crawls all the urls @argument {urls}. It resolves a Promise
     *  or rejects the promise depending on success or error
     * @param {String[]|{url,method,FormData,multipart}[]} urls an array containing the urls to visit next
     * @param {Function} resolve Promise.resole
     * @param {Function} reject Promise.reject
     */
    async function crawlUrls(urls, resolve, reject) {
        let visitedUrls = 0; //keeps track of the urls visited. It increases by 1 when a url's request is pending and decreases by 1 when complete
        //visitedUrls must == 0 before the promise can resolve 
        let initialLink = [];
        let scrapedData = [];
        if (!Array.isArray(urls)) throw new Error('the parameter urls must be an Array');

        for (let url of urls) {
            const visitedUrlString = genUniqueVisitedString(url)
            // skip if skipDuplicates is true and the link has been visited 
            if (!(skipDuplicates && visitedLinks.indexOf(visitedUrlString) !== -1)) {
                visitedUrls++;
                if (rateLimit) { //checks if ratelimit is set, and wait for the rateLimit before continuing
                    await delay(rateLimit)
                }
                visitedLinks.push(visitedUrlString);
                // make request
                request(url, function (err, response, body) {
                    visitedUrls--;
                    if (err) {
                        console.error(`${(new Date())} ERROR ${err.message}`);
                    } else {
                        getDomContents = dom(body).getDomContents; //
                        scrapedData.push(fetchFromPage(url));
                        let newLink = _.uniq(util.sortDataToArray([selectNextCrawlContent(url)]).map(url => {
                            return formatUrl(url)
                        }));
                        initialLink = initialLink.concat(newLink);
                    }

                    if (visitedUrls == 0) {
                        resolve({
                            fetchedData: scrapedData,
                            nextLinks: initialLink
                        })
                    }
                });
            } else {
                console.info(`${(new Date())} INFO ${visitedUrlString} has been visited`)
            }
        }

        if (visitedUrls == 0) { //if visited links is 0 it means it there is no more link to crawl. Fail.
            reject(new AllLinksVisitErr())
        }

    }


    /**
     * @description sets the dynamic selection and calls the getDomContent to fetch data from the page
     * @param {String|Object} url 
     */
    function fetchFromPage(url) {
        let selector = util.dynamicSelection(url, _dynamicSchemas.fetchSelector, fetchSelector);
        let selectBy = util.dynamicSelection(url, _dynamicSchemas.fetchSelectBy, fetchSelectBy);

        return getDomContents(selector, selectBy, fetchFn, url, {
            _groupSet,
            groups
        });
    }
    /**
     * @description sets the dynamic selection and calls the getDomContent to fetch the links to crawl next
     * @param {String|Object} url 
     */
    function selectNextCrawlContent(url) {
        let selector = util.dynamicSelection(url, _dynamicSchemas.nextSelector, nextSelector);
        let selectBy = util.dynamicSelection(url, _dynamicSchemas.nextSelectBy, nextSelectBy);
        return getDomContents(selector, selectBy, nextFn, url);
    }

    /**
     * @description configures the [fetch|next]Selector and [fetch|next]SelectBy. This functions performs the following:
     * - makes sure the [fetch|next]Selector and [fetch|next]SelectBy match
     * - sets the selector to their respective groups
     */
    function configSelectors() {
        // check if the fetchSelector has a fetchSelectBy that matches key
        if (!util.keyMatch(fetchSelector, fetchSelectBy)) throw new KeyMatchErr("fetchSelector", "fetchSelectBy");
        // check if the nextSelector has a nextSelectBy that match in keys 
        if (!util.keyMatch(nextSelector, nextSelectBy)) throw new KeyMatchErr("nextSelector", "nextSelectBy");
        // sort group in the fetchSelector to their respective _groupSet
        Object.entries(fetchSelector).forEach(selector => {
            if (selector[1]._group) {
                if (!_groupSet[selector[1]._group]) {
                    _groupSet[selector[1]._group] = {}
                }
                _groupSet[selector[1]._group][selector[0]] = selector[1]._selector
                delete fetchSelector[selector[0]]
            }
        })

    }

    /**
     * @description initializes the crawl. configures the config variables and calls the crawlUrls function.
     * starts a single step in the crawl steps.
     * @param urls
     * @param config
     * @return {Promise}
     */
    function initCrawl(urls, config = {}) {

        if (!configured) {
            let dynamicSchemas; // define the variable to hold the dynamic data
            ({
                fetchSelector,
                fetchSelectBy,
                nextSelector = {},
                nextSelectBy = {},
                fetchFn,
                nextFn,
                timeOut,
                groups = {},
                rateLimit = 0,
                dynamicSchemas = {},
                formatUrl = util.formatUrl,
                skipDuplicates
            } = config);
            configSelectors()
            Object.assign(_dynamicSchemas, dynamicSchemas)
            configured = true
        }

        return new Promise((resolve, reject) => {
            if (timeOut) {
                setTimeout(() => reject(new TimeoutErr(timeOut)), timeOut)
            }
            crawlUrls(urls, resolve, reject)
        })
    }

    return {
        initCrawl
    }
}