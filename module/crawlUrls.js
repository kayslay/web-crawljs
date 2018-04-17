/**
 * Created by kayslay on 5/28/17.
 */
const request = require('request');
const util = require('./util');
const dom = require('./dom');
const _ = require('lodash');
const {TimeoutErr,AllLinksVisitErr,KeyMatchErr} = require("./errors")
const {genUniqueVisitedString} = util;

module.exports = function () {
    let gen, visitedLinks = [],
        getDomContents;
    let configured = false;
    //The configuration variables. They would be set by the initCrawl function
    let fetchSelector, fetchSelectBy, nextSelector, nextSelectBy, formatUrl, timeOut = false,
        groups, _groupSet ={}, rateLimit,
        //set all defaultDynamicSchemas props when the variable reference is undefined
        defaultDynamicSchemas = {
            fetchSelector: undefined,
            fetchSelectBy: undefined,
            nextSelector: undefined,
            nextSelectBy: undefined
        },
     fetchFn, nextFn;

    /**
     * @description visit and crawls all the urls @argument {urls}. It resolves a Promise
     *  or rejects the promise depending on success or error
     * @param {String[]|{url,method,FormData,multipart}[]} urls an array containing the urls to visit next
     * @param {Function} resolve Promise.resole
     * @param {Function} reject Promise.reject
     */
    function* crawlUrls(urls, resolve, reject) {
        let visitedUrls = 0; //keeps track of the urls visited. It increases by 1 when a url's request is pending and decreases by 1 when complete
        //visitedUrls must == 0 before the promise can resolve 
        let initialLink = [];
        let scrapedData = [];
        if (!Array.isArray(urls)) throw new Error('the parameter urls must be an Array');

        for (let url of urls) {
            const visitedUrlString = genUniqueVisitedString(url)
            if (visitedLinks.indexOf(visitedUrlString) === -1) { //Todo: improve the visitedLinks check
                visitedUrls++;
                if (rateLimit) {
                    yield new Promise((resolve, reject) => setTimeout(args => {
                        gen.next()
                    }, rateLimit))
                }
                visitedLinks.push(visitedUrlString);
                req(url);
            } else {
                console.info(`${(new Date())} INFO ${visitedUrlString} has been visited`)
            }
        }

        if (visitedUrls == 0) { //if visited links is 0 it means it there is no more link to crawl. Fail.
            reject(new AllLinksVisitErr())
        }

        /**
         * @description handles the request success and failure, decreases the visitedUrl count, scrapes and returns all the fetched data
         * 
         * @param url
         * @private
         */

        function req(url) {

            request(url, function (err, response, body) {
                visitedUrls--;
                if (err) {
                    //todo: context kill
                    console.error(`${(new Date())} ERROR ${err.message}`);
                } else {
                    //Todo: context kill
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

        }

    }


    /**
     * @description sets the dynamic selection and calls the getDomContent to fetch data from the page
     * @param {String|Object} url 
     */
    function fetchFromPage(url) {
        let selector = util.dynamicSelection(url, defaultDynamicSchemas.fetchSelector, fetchSelector);
        let selectBy = util.dynamicSelection(url, defaultDynamicSchemas.fetchSelectBy, fetchSelectBy);

        return getDomContents(selector, selectBy, fetchFn, url, {_groupSet,groups});
    }
  /**
     * @description sets the dynamic selection and calls the getDomContent to fetch the links to crawl next
     * @param {String|Object} url 
     */
    function selectNextCrawlContent(url) {
        let selector = util.dynamicSelection(url, defaultDynamicSchemas.nextSelector, nextSelector);
        let selectBy = util.dynamicSelection(url, defaultDynamicSchemas.nextSelectBy, nextSelectBy);
        return getDomContents(selector, selectBy, nextFn, url);
    }

    /**
     * @description configures the [fetch|next]Selector and [fetch|next]SelectBy. This functions performs the following:
     * - makes sure the [fetch|next]Selector and [fetch|next]SelectBy match
     * - sets the selector to their respective groups
     */
    function configSelectors() {
        if (!util.keyMatch(fetchSelector, fetchSelectBy)) throw new KeyMatchErr("fetchSelector","fetchSelectBy");
        if (!util.keyMatch(nextSelector, nextSelectBy)) throw new KeyMatchErr("nextSelector","nextSelectBy");

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
    function initCrawl(urls, config) {

        if (!configured) {
            let dynamicSchemas; // define the variable to hold the dynamic data
            (function (config = {}) {

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
                    formatUrl = util.formatUrl
                } = config);
                configSelectors()
                Object.assign(defaultDynamicSchemas, dynamicSchemas)

            })(config);
            configured = true
        }

        return new Promise((resolve, reject) => {
            if (timeOut) {
                setTimeout(() => reject(new TimeoutErr(timeOut)), timeOut)
            }
            gen = crawlUrls(urls, resolve, reject)
            gen.next()
            return gen
        })
    }

    return {
        initCrawl
    }
}