# web-crawlerjs

## About 
web-crawlerjs is a package that extracts information from a web page. web-crawljs depends on [request](https://www.npmjs.com/package/request) and [cheerio](https://www.npmjs.com/package/cheerio).

web-crawlerjs crawl pages using a [Breadth-First Algorithm](https://en.wikipedia.org/wiki/Breadth-first_search).

## Installation 
run this on your terminal or command prompt.

        $ npm install web-crawljs --save

## Example
An example of the usage of web-crawljs
```javascript
    const crawler = require('web-crawljs');
    const config = {
               fetchSelector: {title: "title", body: "div#mw-content-text"},
               fetchSelectBy: {title: 'text', body: "text"},
               nextSelector: {links: 'a[href^="/"]'},
               nextSelectBy: {links: ['attr', 'href']},
               fetchFn: (err, data, url) => {
                   if (err) console.error(err.message);
                   if (url == 'http://localhost/dashboard/') console.log('saving somewhere different', data);
                   console.log(data.title[0],url)
               },          
               nextFn: function (err, data, url) {
                   console.log(data,url)
               },
               dynamicSchemas: {
                   fetchSelector: [{url: /http:\/\/localhost\//, schema: {title: "title"}}],
                   fetchSelectBy: [{url: /http:\/\/localhost\//, schema: {title: "text"}}],
               },
               depthFn: function (data) {
                   console.log(data)
               },
               formatUrl: function (url) {
                   if (url == 'http://localhost/dashboard/faq.html') {
                       return {url:url, method: "GET"}
                   }
                   return url
               },
               depth: 2,
               urls: ['http://localhost/dashboard/']
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

calling *crawler(config)*, in the example above returns a new Object

## The config argument
The config argument is the only argument passed into the crawler factory function. It configure the way the crawler would behave. 
This argument configures the callbacks, the schemas of the selector, depth e.t.c.

### Fetching data and setting next links to visit
This properties are responsible for fetching data and getting the next links to visit next. The fetchSelector and nextSelector are used to assign the elements to scrap.
The fetchSelectBy and nextSelectBy are used to define the way you want to select data from the page. For example, you can select by attribute name, text, value, text e.t.c.

#### fetchSelector
Object literal that contains the names for the data as keys and the element selector as values. The values are the DOM elements you want to scrap from the page.

#### fetchSelectBy
Object literal that contains the names for the data as it's keys and what dom property to select from the ***fetchSelector*** element as it's values. It matches 
the element to select by it's respective key on the ***fetchSelector***.

The value of the object key tells what property of the dom should be extracted. For example the innerHTML, textContent, attributes e.t.c.

**NOTE::** 
- The values used here are [cheerio DOM methods]() used by cheerio for getting attributes, text or values from the element. 
- The keys in ***fetchSelector*** and ***fetchSelectBy*** must match.

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
Does the same job as the fetchSelectBy, but select the urls to visit the from the ***nextSelector's*** element. 
The keys in ***nextSelector*** must match that of ***nextSelectBy***.

## The config callback functions

### fetchFn 
This function is called after each fetch operation on the page. The fetchFn takes 3 arguments:

- **error** : An Error Object if there is one or null if no error.

- **data** : The data gotten from the page after scraping it.

- **url** : The current url from the page.

### nextFn
This function is called after getting the next links to crawl on the page have been scraped. Takes the same arguments as the fetchFn.

### depthFn
The depthFn is called after each crawl. This function makes use depth config option. This function takes only one 
argument:

- **data** : All the data gotten from the finished crawl. 

The number of times the depthFn is called is the number of `depth` set

### formatUrl
Added in v2.0.0. The function format the next url to crawl. It takes a url and returns a new url. this url 
can be a string or an Object that is supported by the request module for making requests. 

### finalFn
This function is called at the end of the entire crawl. 

## Other Properties

### depth
The number of times crawl though the links in nextLinks array.

To understand what the loop property does, I would have to explain part of what goes on inside web-crawljs.

web-crawl crawls through all the links in nextCrawlLinks. While crawling through each link in the nextCrawlLinks, the links to crawl next, gotten from the page, 
are on are pushed to the initialLinks.
When through crawling the nextCrawlLinks, the nextCrawlLinks is emptied, then the initialLinks passed to the nextCrawlLinks for the next crawl. 
It crawls in a Breadth-First manner.

### urls 
An array containing the links to crawl on start. The links can be an Object that is supported by the request module, or the url string.

### dynamicSchemas
Added in v2.0.0. The dynamicSchemas was added to allow the default structure of the nextSelector, nextSelectBy,
 fetchSelector and fetchSelectBy to change when it matches a url pattern.
 
#### structure 
The dynamicSchemas is an Object with nextSelector, nextSelectBy, fetchSelector and fetchSelectBy as keys.
 Each key in the dynamicSchemas is an array containing an Object literal that has url and schema as keys. 
 These keys are defined as follows:
 
 - **url** : A regular expression that contains the pattern to match the url by. If it matches the schema is used.
 
 - **schema** : An Object that contains the structure to use when the url regex matches a url.
 
```javascript
config ={
    // ...config options
        dynamicSchemas : {  
            fetchSelector: [{url: /http:\/\/localhost\//, schema: {title: "title"}}],
            fetchSelectBy: [{url: /http:\/\/localhost\//, schema: {title: "text"}}],
            nextSelector: [{url: /http:\/\/localhost\//, schema: {link: "a"}}],
            nextSelectBy: [{url: /http:\/\/localhost\//, schema: {title: ['attr','href']}}],
        }
    //...rest of the config options
    }
    
  
```
Note : Not all the keys in the dynamicSchema must be defined, but the (fetch|next)Selector and the (fetch|next)SelectBy schema keys must match for.

### timeOut
This property sets the timeout for getting the response of an iteration of a crawl.

### limitNextLinks
This property limits the amount of links that will be returned to be crawled. If `limitNextLinks` is greater than the default nextLinks length, it won't be used.