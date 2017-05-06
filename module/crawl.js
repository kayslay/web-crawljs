/**
 * Created by kayslay on 4/10/17.
 */
let request = require('request');
let util = require('./util');

let Crawler = function (config = {}) {

    //private
    let _priv = {
            returnedData: [],
            nextCrawlLinks: [],
            visitedLinks: [],
            initialLinks: []
        },
        urls, fetchFn, nextFn, finalLoopFn,finalFn, counter = 0,
        //
        {getDomContents} = require('./dom')(_priv);
    //default function
    function defaultFn(err, data,url) {
        if (err) return console.log(err.message);
        //console.log(data)
    }

//called after each call of the CrawlAllUrl fn
    function defaultFinalLoopFn() {
        console.log('-+'.repeat(30) + counter + '-+'.repeat(30));
        console.log(`the number of contents gotten so far is ${getPrivateProp('returnedData').length} `)
    }

    //called when the whole crawl is ending
    function defaultFinalFn() {
        console.log('-+'.repeat(30) + counter + '-+'.repeat(30));
        console.log(`through with crawl after ${counter} number of loops.
         Got ${getPrivateProp('returnedData').length} contents after the whole crawl`);
    }

    /**
     *
     * @param config
     */
    function init(config) {
        ({
            fetchSelector: _priv.fetchSelector,
            fetchSelectBy: _priv.fetchSelectBy,
            nextSelector: _priv.nextSelector,
            nextSelectBy: _priv.nextSelectBy,
            nextFn= defaultFn,
            fetchFn = defaultFn,
            finalLoopFn = defaultFinalLoopFn,
            finalFn= defaultFinalFn,
            loop: _priv.loop = 1,
            urls
        } = config);
        _priv.nextCrawlLinks = urls;
    }

    /**
     *@description get a private function
     * prevent direct access to the _priv object
     * @param prop
     * @return {*}
     */
    function getPrivateProp(prop) {
        return _priv[prop];
    }

    /**
     *@description push to a private property that is of the type Array
     * @param prop
     * @param data
     * @return {Number|*|Object}
     */
    function pushToPrivateProp(prop, data) {
        return _priv[prop].push(data)
    }

    /**
     *@description set the private function
     * @param prop
     * @param data
     * @return {*}
     * Todo: set the allowed prop
     */
    function setPrivateProp(prop, data) {
        return _priv[prop] = data
    }

    /**
     *@description get the content needed to be extracted from the page
     * @private
     */
    function fetchFromPage(url) {
        let fetchedData = getDomContents(_priv.fetchSelector, _priv.fetchSelectBy, fetchFn,url);
        pushToPrivateProp('returnedData',(fetchedData));
        return fetchedData
    }

    /**
     *
     *@private
     */
    function selectNextCrawlContent(url) {
        let contentData = getDomContents(_priv.nextSelector, _priv.nextSelectBy, nextFn, url);
        pushToPrivateProp('initialLinks', contentData);
        return contentData
    }


    /**
     *crawls all the links available in the urls ar
     * @public
     */
    function CrawlAllUrl() {
        "use strict";
        counter++;
        let visitedLoop = 0;
        _priv.nextCrawlLinks.forEach((url, index) => {
            if (_priv.visitedLinks.indexOf(url) === -1) {
                visitedLoop++;
                crawlUrl(url);
                _priv.visitedLinks.push(util.getUrlOut(url));
            } else {
                // console.log('visited '+url)
            }
        });

        /**
         *
         * @param url
         * @private
         */
        function req(url) {

            request(url, function (err, response, body) {
                visitedLoop--;
                if (err) {
                    console.log(err.message);
                } else {
                    let _url= util.getUrlOut(url);
                    _priv.content = body;
                    fetchFromPage(_url);
                    selectNextCrawlContent(_url);
                }
                //when through with all the links in the nextCrawlLinks
                if (visitedLoop === 0) {
                    setPrivateProp('nextCrawlLinks', util.sortDataToArray(_priv.initialLinks));
                    finalLoopFn();
                    if (counter < _priv.loop) {
                        CrawlAllUrl();
                    }else{
                        finalFn()
                    }
                }

            })
        }

        function crawlUrl(url) {
            req(url);
        }

    }


    init(config);

    return {
        CrawlAllUrl,
        getPrivateProp,
        pushToPrivateProp,
        setPrivateProp
    }
};
module.exports = Crawler;