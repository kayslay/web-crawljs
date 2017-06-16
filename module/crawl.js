/**
 * Created by kayslay on 5/28/17.
 */
const {crawlUrls} = require('./crawlUrls');
function createCrawler(config = {}) {
    let nextLinks = [];
    let gen;

    let urls, finalFn, depthFn, depth;

    //
    function defaultLoopFn(data) {
        console.log("---depth---")
    }

    function defaultFinalFn() {
        console.log('---final---')
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

    /**
     * @description
     */
    function crawl() {

            crawlUrls(nextLinks, config)
                .then(scrapedData => {
                    depthFn(scrapedData.fetchedData);
                    gen.next(scrapedData.nextLinks);
                })
                .catch(err => {
                    gen.next({err})
                });

    }


    function* crawlGen() {
        for (let i = 0; i < depth; i++) {
            nextLinks = yield crawl();
            if(nextLinks.err){
                console.error(nextLinks.err);
                break;
            }
            if(nextLinks.length == 0){
                console.log('nextLinks array empty');
                break
            }
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