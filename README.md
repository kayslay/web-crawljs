# web-crawlerjs

## About 
web-crawler.js is a package that extracts information from a web page. web-crawljs depends on [request]() and [cheerio]().

## Installation 
Not available for installation yet, still under development.

## Example
An Example on the usage of web-crawljs
```javascript
    const crawler = require('web-crawljs');
    const config = {
        fetchSelector: {title: "title"},
            fetchSelectBy: {title: 'text'},
            nextSelector: {links: 'a[href^="/"]'},
            nextSelectBy: {links: ['attr', 'href']},
            fetchFn: (err, data, url) => {
                if (err) console.error(err.message);
                expect(data).to.be.an('object');
            },
            nextFn: (err,data, url) =>{
                // console.log(Crawler.getPrivateProp('initialLinks'))
            },
            loop: 2,
            urls: ['http://localhost']
    };
    //initiate the crawl object
    const Crawler = crawler(config);
    //crawl all the link
    Crawler.CrawlAllUrl();
```

## Understanding the example
***require('web-crawljs');*** return's a factory function that takes in one argument. The argument is the configuration of the crawler.
        
        const crawler = require('web-crawljs');
        const config = {...}
        const Crawler = crawler(config)

calling *crawler(config)* return's a new Object

## The config argument
the config argument is the only argument passed into the crawler factory function. It configure the way the crawler would behave.
config is an Object literal that contains the following keys:

*fetchSelector* :- Object literal that contains the name for the data as the key and the element selector

#still in development