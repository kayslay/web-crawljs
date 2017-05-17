# web-crawlerjs

## About 
web-crawlerjs is a package that extracts information from a web page. web-crawljs depends on [request](https://www.npmjs.com/package/request) and [cheerio](https://www.npmjs.com/package/cheerio).

web-crawlerjs crawl pages using a [Breadth-First Algorithm](https://en.wikipedia.org/wiki/Breadth-first_search).

## Installation 
run this on the command line 

        $ npm install web-crawljs --save

## Example
An example of the usage of web-crawljs
```javascript
    const crawler = require('web-crawljs');
    const config = {
        fetchSelector: {title: "title"},
        fetchSelectBy: {title: 'text'},
        nextSelector: {links: 'a[href^="/"]'},
        nextSelectBy: {links: ['attr', 'href']},
        fetchFn: (err, data, url) => {
            if (err) console.error(err.message);
            console.log(data);
        },
        nextFn: (err,data, url) =>{
            console.log(Crawler.getPrivateProp('initialLinks'))
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
***require('web-crawljs');*** returns a factory function that takes in one argument. This argument is used to configure the behavior of web-crawljs.
        
        const crawler = require('web-crawljs');
        const config = {...}
        const Crawler = crawler(config)

calling *crawler(config)* returns a new Object

## The config argument
The config argument is the only argument passed into the crawler factory function. It configure the way the crawler would behave.

### Fetching data and setting next links to visit
This properties are responsible for fetching data and getting the next links to scrap next. The fetchSelector and nextSelector are used to assign the elements to scrap.
The fetchSelectBy and nextSelectBy are used to define the way you want to select data from the page. For example, you can select by attribute name, text, value, text e.t.c.

#### fetchSelector
Object literal that contains the name for the data as the key and the element selector as value. These are the DOM elements you want to scrap from the page.

#### fetchSelectBy
Object literal that contains the name for the data it relates to in the ***fetchSelector*** as the key, and what to select from the element as the value.

**NOTE::** The values used here are [cheerio DOM methods]() used by cheerio for getting attributes, text or values for the element. The keys in ***fetchSelector*** and 
***fetchSelectBy*** must match.

The value of the ***fetchSelectBy*** depends on the method type. If the method does not need an argument, use a string named after the method:

            //we are using the cheerio dom methods here
            //using the text method in the 
            {title: "text"}
            //this runs element.text() and gets the text of the selector passed in the title key in fetchSelector.
           
If an array of strings is used the first argument is the method name and the remaining arguments are the method arguments

        //we are using cherio DOM methods herr
        //using the attr method would look like
        {link: ["attr","href"]}
        //this runs element.attr('href') and get the href of a link.
        
#### nextSelector
Does the same job as the ***fetchSelector***, but the elements here, are the element used to get the next page to scrap.
 
#### nextSelectBy
Does the same job as the fetchSelectBy, but select the urls to the from the ***nextSelector's*** element. 
The keys in ***nextSelector*** must match that of ***nextSelectBy***.

## The callback functions

### fetchFn 
This function is called after each fetch operation on the page. The fetchFn takes 3 arguments:

- **error** : An Error Object if there is one or null if no error.

- **data** : The data gotten from the page after scraping.

- **url** : The current url from the page.

### nextFn
This function is called after getting the next links to crawl on the page have been scraped. Takes the same arguments as the fetchFn.

### finalLoopFn
This is called at the end of the each iteration of the link

### finalFn
This function is called at the end of the entire crawl. 

NOTE:: There is an issue with this function. If there all the links have been visited and there no new link to crawl on the last loop, this function won't be called.

## Other Properties

### loop
The number of times crawl though the links in nextCrawlLinks.

To understand what the loop property does, I would have to explain part of what goes on inside web-crawljs.

web-crawl crawls through all the links in nextCrawlLinks. While crawling through each link in the nextCrawlLinks, the links to crawl next, gotten from the page, 
are on are pushed to the initialLinks.
When through crawling the nextCrawlLinks, the nextCrawlLinks is emptied, then the initialLinks passed to the nextCrawlLinks for the next crawl. 
It crawls in a Breadth-First manner.

### url 
An array containing the links to crawl on start.

# Still in development

# Issues
**finalFn** :: Unable to call the finalFn in the last crawl loop if the all the links available have been visited.
