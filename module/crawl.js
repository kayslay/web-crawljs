/**
 * Created by kayslay on 5/28/17.
 */
const crawlUrls = require('./crawlUrls');
function createCrawler(config = {}) {
    let nextLinks = [];
    let gen;

    let urls, finalFn, loopFn, loop;

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
            loopFn= defaultLoopFn,
            loop=1
        } = config);
        nextLinks = nextLinks.concat(urls);
    })(config);

    function crawl() {
        crawlUrls(nextLinks, config)
            .then(scrapedData => {
                loopFn(scrapedData.fetchedData);
                gen.next(scrapedData.nextLinks);
            })
    }


    function* crawlGen() {
        for (let i = 0; i < loop; i++) {
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