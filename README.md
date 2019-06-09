# web-crawlerjs

## About 
web-crawlerjs is a package that extracts information from a web page. This package depends on [request](https://www.npmjs.com/package/request) and [cheerio](https://www.npmjs.com/package/cheerio).

web-crawlerjs crawl pages using a [Breadth-First Algorithm](https://en.wikipedia.org/wiki/Breadth-first_search).

## Installation 
run this on your terminal or command prompt.

        $ npm install web-crawljs --save

## Example

An example of the usage of web-crawljs. This example extracts data from [https://example.com](https://example.com)

<!-- TODO: fit example for example.com -->
```javascript
    const crawler = require('web-crawljs');
    const config = {
            fetchSelector: {title: "title"},
            fetchSelectBy: {title: 'text'},
            nextSelector: {links: 'a[href^="/"]'},
            nextSelectBy: {links: ['attr', 'href']},
               fetchFn: (err, data, url) => {
                   if (err) {
                      return console.error(err.message);
                   }
                   console.log(data.title[0],url)
               }, 
               nextFn: function (err, data, url) {
                   console.log(data,url)
               },
               dynamicSchemas: {
                    fetchSelector: [{
                    url: /https:\/\/en.wikipedia.org/,
                    schema: {
                        title: "title",
                        body: "div#mw-content-text"
                    }
                }],
                fetchSelectBy: [{
                    url: /https:\/\/en.wikipedia.org/,
                    schema: {
                        title: "text",
                        body: "text"
                    }
                }],
               },
               depthFn: function (data) {
                   console.log(data)
               },
               formatUrl: function (url) {
                   if (url == 'https://en.wikipedia.org/wiki') {
                       return {url:url, method: "HEAD"}
                   }
                   return url
               },
               depth: 2,
               urls:  ['https://en.wikipedia.org/wiki/Web_crawler']
           };
    //initiate the crawl object
    const Crawler = crawler(config);
    //crawl all the link
    Crawler.CrawlAllUrl();
```

## Understanding the example

***require('web-crawljs');*** returns a factory function that takes in one argument. This argument is the configuration object. The configuration Object is used to configure the behaviour of crawler.

        const crawler = require('web-crawljs');
        const config = {...}
        const Crawler = crawler(config)

calling *crawler(config)*, in the example above returns a new Object, this object has a single method, `CrawlAllUrl`. `CrawlAllUrl` starts the crawl and returns a Promise when its done.
The Promise success value or failure error depends on the `finalFn` function. More will be explained in the `finalFn` section.

## The config object

The config object is the only argument passed into the crawler factory function. It configures the way the crawler would behave. 
This object configures the callbacks, the schemas of the selector, depth, the urls to visit e.t.c.


### Fetching data and setting next links to visit

These properties are responsible for fetching data and getting the next links to visit next. The `fetchSelector` and `nextSelector` are used to assign the elements to scrap.
The `fetchSelectBy` and `nextSelectBy` define the what will be extracted from the selector. For example, you can select by attribute name, text, value, text, html value e.t.c.

#### fetchSelector

fetchSelector is an object that contains the name of the element as the property name and the value of the property as the element selector.

The value of the key can be a string or an object. When the value is a string all elements matching the selector is selected.
The only time an object is used as the value is when the element belongs to a group.

This object must contain the `_selector` and `_group` property. The `_selector` property is the selector of the element in the context of the group's selector
, while the `_group` is the group the element belongs to.

        //default fetchSelector
        fetchSelector: {"link":"div a.hashtags"} // selects all 'a' tags that are in a div that contains hashtags in its class attribute
        //
        //using groups
        fetchSelector : {"links":{_group:"user_post",_selector:"div a.hashtags"}} //select all the 'a' tags that are in a div that contains hashtags 
        //in its class attribute in the user_post selector's context

#### groups

An object that contains the groups and their selector. The name of the group is its property name and the element selector is it's value.

The elements that belongs to a group are selected from the context of the group.

        //groups example
        groups: {"user_post":"div.user_post"}

#### fetchSelectBy

An Object that contains the names for the data as it's keys and what DOM property to select from the ***fetchSelector*** element as it's values. It matches
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

If an array of strings is used the first argument is the method name and the remaining elements are the method arguments

        //we are using cherio DOM methods here
        //using the attr method would look like
        {link: ["attr","href"]}
        //this runs element.attr('href') and get the href of a link.

#### nextSelector

Does the same job as the ***fetchSelector***, but the elements here, are the element used to get the next page to scrap. This property does not support grouping.

#### nextSelectBy

Does the same job as the fetchSelectBy, but select the urls to visit the from the ***nextSelector's*** element. 
The keys in ***nextSelector*** must match that of ***nextSelectBy***.

## The config callback functions

### fetchFn

This function is called after each fetch operation on the page. The fetchFn takes 3 arguments:

- **error** : An Error Object if there is one or null if no error.

- **data** : The data gotten from the page after scraping it.

- **url** : The current url.

### nextFn

This function is called after getting the next links to crawl on the page have been scraped. Takes the same arguments as the fetchFn.

### depthFn

The depthFn is called after each crawl. This function makes use depth config option. This function takes only one 
argument:

- **data** : All the data gotten from the finished crawl.

The number of times the depthFn is called is the number of `depth`

### formatUrl

Added in v2.0.0. The function format the next url to crawl. It takes a url and returns a new url. this url
can be a string or an Object that is supported by the request module for making requests.

### finalFn

This function is called at the end of the entire crawl. It takes an error as its only argument.

The value of the promise depends on the value returned from the finalFn.

**NOTE::** If the finalFn is set, ensure it handles the error. If the error is not handled by the finalFn the error must be thrown to be handled by a catch when the `CrawlAllUrl` is done unless the error will not be handled.

## Other Properties

### depth

The number of times crawl though the links in nextLinks array.

To understand what the depth property does, I would have to explain part of what goes on inside web-crawljs.

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

- **schema** : An Object that contains the structure to use when the url regex matches a url.

- **url** : A regular expression that contains the pattern to match the url by. If it matches the schema is used.

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

### rateLimit

This is the wait time in milliseconds before making the next request in the nextCrawlLink. If there is no rateLimit or its set to zero then there will be no wait time between request.

### nextCrawlWait

This is the wait time before the next iteration (step) will start crawl. It wait `nextCrawlWait` milliseconds before the next step of the crawl starts.

### timeOut

This property sets the time limit for getting the data from all the links in an iteration of a crawl (a single step).

### limitNextLinks

This property limits the amount of links that will be returned to be crawled. If `limitNextLinks` is greater than the default nextLinks length, it won't be used.

### skipDuplicates

This properties tells the crawler to skip a link it has visited before if true. the default value is `true`.