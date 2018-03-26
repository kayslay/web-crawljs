/**
 * Created by kayslay on 5/28/17.
 */
const request = require('request');
const util = require('./util');
const dom = require('./dom');
const _ = require('lodash');



function KEY_ERROR(arg1, arg2) {
    return `the keys don't match. Make sure keys in ${arg1} matches keys in ${arg2}`
}

const getUrlOut = util.getUrlOut; //util.getUrlOut is used frequently; setting a const for its function

module.exports = function () {
    let gen, visitedLinks = [],
        getDomContents;
    let configured = false;
    //the variables to be configured
    let fetchSelector, fetchSelectBy, nextSelector, nextSelectBy, formatUrl, timeOut = false,
        groups, _groupSet ={}, rateLimit,

        //set all defaultDynamicSchemas props when the variable reference is undefined
        defaultDynamicSchemas = {
            fetchSelector: undefined,
            fetchSelectBy: undefined,
            nextSelector: undefined,
            nextSelectBy: undefined
        };

    let fetchFn, nextFn;

    /**
     *
     * @param urls
     * @param resolve
     */
    function* crawlUrl(urls, resolve, reject) {
        let visitedUrls = 0;
        let initialLink = [];
        let scrapedData = [];
        if (!Array.isArray(urls)) throw new Error('the property urls must be an Array');

        for (let url of urls) {

            if (visitedLinks.indexOf(getUrlOut(url)) === -1) { //Todo: improve the visitedLinks check
                visitedUrls++;
                if (rateLimit) {
                    yield new Promise((resolve, reject) => setTimeout(args => {
                        gen.next()
                    }, rateLimit))
                }
                visitedLinks.push(getUrlOut(url));
                req(url);
            } else {
                console.log(`${getUrlOut(url)} has been visited`)
            }
        }

        if (visitedUrls == 0) { //if visited links is 0 it means it
            reject("All the links have been visited")
        }


        /**
         *
         * @param url
         * @private
         */

        function req(url) {

            request(url, function (err, response, body) {
                visitedUrls--;
                if (err) {
                    //todo: conext kill
                    console.error(err.message);
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


    //returns the scraped data gotten from the page
    function fetchFromPage(url) {
        let selector = util.dynamicSelection(url, defaultDynamicSchemas.fetchSelector, fetchSelector);
        let selectBy = util.dynamicSelection(url, defaultDynamicSchemas.fetchSelectBy, fetchSelectBy);

        return getDomContents(selector, selectBy, fetchFn, url, {_groupSet,groups});
    }

    //get the url's to crawl next
    function selectNextCrawlContent(url) {
        let selector = util.dynamicSelection(url, defaultDynamicSchemas.nextSelector, nextSelector);
        let selectBy = util.dynamicSelection(url, defaultDynamicSchemas.nextSelectBy, nextSelectBy);
        return getDomContents(selector, selectBy, nextFn, url);
    }

    /**
     * @description configures the 
     */
    function configSelectors() {
        Object.entries(fetchSelector).forEach(selector => {
            if (selector[1]._group) {
                if (!_groupSet[selector[1]._group]) {
                    _groupSet[selector[1]._group] = {}
                }
                _groupSet[selector[1]._group][selector[0]] = selector[1]._selector
                delete fetchSelector[selector[0]]
            }
        })

        if (!util.keyMatch(fetchSelector, fetchSelectBy)) throw new Error(`An Error Occurred:  ${KEY_ERROR("fetchSelector","fetchSelectBy")}`);
        if (!util.keyMatch(nextSelector, nextSelectBy)) throw new Error(`An Error Occurred: ${KEY_ERROR("nextSelector","nextSelectBy")}`);

    }

    /**
     *
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
                setTimeout(() => reject(`timeout after ${timeOut}ms`), timeOut)
            }
            gen = crawlUrl(urls, resolve, reject)
            gen.next()
            return gen
        })
    }

    return {
        initCrawl
    }
}