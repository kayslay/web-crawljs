/**
 * Created by kayslay on 5/28/17.
 */
const _ = require("lodash")
const util = require('./util');
const crawlUrls = require('./crawlUrls')
const {
    delay
} = util;

/**
 * @description creates a new instance of a crawler from the config passed parameter passed
 * @param {Object} config the configuration objects
 */
function createCrawler(config = {}) {
    const {
        initCrawl
    } = crawlUrls()
    let gen;

    let {
        urls = [],
            finalFn = defaultFinalFn,
            depthFn = defaultDepthFn,
            depth = 1,
            limitNextLinks,
            nextCrawlWait = 0, //rate limit in what
    } = config
    nextLinks = urls;

    /**
     * @description crawls a complete step for a  list of links. it crawls a single depth
     * it yield control to the depthCrawl when it's done. calls depthFn if the step was successful
     */
    function singleDepthCrawl() {

        initCrawl(nextLinks, config)
            .then(scrapedData => {
                depthFn(_.cloneDeep(scrapedData.fetchedData));
                gen.next(_.cloneDeep(scrapedData.nextLinks));
            })
            .catch(err => {
                gen.next({
                    err
                })
            });
    }

    /**
     * @description function crawls till the depth is reached, an error occurs or there is no
     *  more link to crawl.
     * @param {function(Object)} resolve called when the complete successfully
     * @param {function(Object)} reject called when an error occurs 
     */
    function* depthCrawl(resolve, reject) {
        for (let i = 0; i < depth; i++) {
            nextLinks = yield singleDepthCrawl();
            if (nextLinks.err) {
                reject(nextLinks.err);
                break;
            }
            if (nextLinks.length == 0) {
                // console.log('nextLinks array empty; crawl ending');
                break
            }
            //wait
            if (nextCrawlWait) {
                yield delay(nextCrawlWait, function () {
                    gen.next()
                })
            }
            //limit the links return
            if (limitNextLinks) { //limit the amount of links returned
                nextLinks = nextLinks.slice(0, Math.min(limitNextLinks, nextLinks.length))
            }
        }
        nextLinks = null
        resolve()
    }

    /**
     * @description start crawling all the links
     */
    function CrawlAllUrl() {
        return new Promise((resolve, reject) => {
                gen = depthCrawl(resolve, reject);
                gen.next();
                return gen
            }).then(() => finalFn())
            .catch(err => finalFn(err))
    }

    return {
        CrawlAllUrl
    }

}
module.exports = createCrawler;

//
function defaultDepthFn(data) {
    //    console.log("---depthFn called---")
}

function defaultFinalFn(err) {
    if (err) throw err
    return
}