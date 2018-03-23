/**
 * Created by kayslay on 5/28/17.
 */
const _ = require("lodash")
const {
    initCrawl
} = require('./crawlUrls');

function createCrawler(config = {}) {
    let nextLinks = [];
    let gen;

    let urls, finalFn, depthFn, depth, limitNextLinks, nextCrawlWait;

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
            finalFn = defaultFinalFn,
            depthFn = defaultLoopFn,
            depth = 1,
            limitNextLinks,
            nextCrawlWait = 0, //rate limit in what
        } = config);
        nextLinks = nextLinks.concat(urls);
    })(config);

    /**
     * @description
     */
    function crawl() {

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


    function* crawlGen(resolve,reject) {
        for (let i = 0; i < depth; i++) {
            nextLinks = yield crawl();
            if (nextLinks.err) {
                reject(nextLinks.err);
                break;
            }
            if (nextLinks.length == 0) {
                console.log('nextLinks array empty');
                break
            }
            //wait
            if (nextCrawlWait) {
                yield new Promise((r, x) => setTimeout(args => {
                    gen.next()
                }, nextCrawlWait))
            }
            //limit the links return
            if (limitNextLinks) { //limit the amount of links returned
                nextLinks = nextLinks.slice(0, Math.min(limitNextLinks, nextLinks.length))
            }
        }
        nextLinks = null
        resolve()
    }

    function CrawlAllUrl() {
       return new Promise((resolve,reject)=>{
             gen = crawlGen(resolve,reject);
        gen.next();
        return gen
       }).then(()=>finalFn())
       .catch(err=>finalFn(err))
    }

    return {
        CrawlAllUrl
    }

}
module.exports = createCrawler;