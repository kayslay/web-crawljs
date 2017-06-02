/**
 * Created by kayslay on 5/28/17.
 */
const {crawlUrls} = require('./crawlUrls');
function createCrawler(config = {}) {
    let nextLinks = [];
    let gen;

    let urls, finalFn, depthFn, depth;

    function defaultLoopFn(data) {
        console.log("end of each loop")
    }

    function defaultFinalFn() {
        console.log('end...')
    }


    //immediately configure the crawl
    (function (config = {}) {
        ({
            urls = [],
            finalFn= defaultFinalFn,
            depthFn= defaultLoopFn,
            depth=1
        } = config);
        nextLinks = nextLinks.concat(urls);
    })(config);

    function crawl() {
        crawlUrls(nextLinks, config)
            .then(scrapedData => {
                depthFn(scrapedData.fetchedData);
                gen.next(scrapedData.nextLinks);
            })
            .catch(err => {
                throw new Error(err.message)
            })
    }


    function* crawlGen() {
        for (let i = 0; i < depth; i++) {
            nextLinks = yield crawl();
            // console.log(nextLinks)
        }
        finalFn()
    }

    function CrawlAllUrl() {
        gen = crawlGen();
        gen.next();
    }

    return {
        CrawlAllUrl
    }

}
module.exports = createCrawler;