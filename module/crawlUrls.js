/**
 * Created by kayslay on 5/28/17.
 */
const request = require('request');
const util = require('./util');
const dom = require('./dom');
const _ =require('lodash')
let getDomContents, visitedLinks = [];

let fetchSelector, fetchSelectBy, nextSelector, nextSelectBy;

let fetchFn, nextFn;


function crawlUrl(urls, resolve) {
    let visitedUrls = 0;
    let initialLink = [];
    urls.forEach((url) => {
        "use strict";
        if (visitedLinks.indexOf(url) === -1) {
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
            getDomContents = dom(body).getDomContents;
            let fetchedData = fetchFromPage(url);
            initialLink.push(selectNextCrawlContent(url));

            if (visitedUrls == 0) {
                resolve({fetchedData, nextLinks: _.uniq(util.sortDataToArray(initialLink))})
            }
        })
    }
}

function fetchFromPage(url) {
    return getDomContents(fetchSelector, fetchSelectBy, fetchFn, url);
}

function selectNextCrawlContent(url) {
    return getDomContents(nextSelector, nextSelectBy, nextFn, url);
}


function crawlUrls(urls, config) {
    "use strict";
    (function (config = {}) {
        ({
            fetchSelector,
            fetchSelectBy,
            nextSelector,
            nextSelectBy,
            fetchFn,
            nextFn,

        } = config)
    })(config);

    return new Promise((resolve, reject) => crawlUrl(urls, resolve))
}

module.exports = crawlUrls;