# V 2.0.0

- ## added dynamicSchemas config option
    web-crawljs now has dynamicSchemas that allow you change the structure of nextSelector, nextSelectBy,
     fetchSelector and fetchSelectBy if the url matches a url yu specify.
    
- ## changed loop and loopFn to depth and depthFn
     The loop and loopFn have been renamed to depth and depthFn.      
      
- ## fixed issue with finalFn
    The issue with finalFn in the formal version is now fixed.
      
- ## added formatUrl config option
    The function format the next url to crawl. It takes a url and returns a new url. this url 
    can be a string or an Object that is supported by the request module for making requests.
    