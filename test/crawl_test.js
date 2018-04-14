let expect = require('chai').expect;

describe("Test Crawler",()=>{
    it("Data should match expect values :non-group",async()=>{
        let Crawler = require('../index')({
            fetchSelector: {title: "title"},
            fetchSelectBy: {title: 'text'},
            nextSelector: {links: 'a[href^="/"]'},
            nextSelectBy: {links: ['attr', 'href']},
            fetchFn: (err, data, url) => {
              expect(data).to.be.an("object")
              expect(data.title).to.be.an("array")
            },
            formatUrl: function (url) {
                if (url == 'http://localhost/dashboard/faq.html') {
                    return {url}
                }
                return url
            },
        
            nextFn: function (err, data, url) {
                // console.log(data,url)
            },
            timeOut: 1000,
            limitNextLinks: 5,
            dynamicSchemas: {
                //when the url matches https://en.wikipedia.org it uses this schema to format it
                fetchSelector: [{url: /https:\/\/en.wikipedia.org/, schema: {title: "title", body: "div#mw-content-text"}}],
                fetchSelectBy: [{url: /https:\/\/en.wikipedia.org/, schema: {title: "text",body: "text"}}],
                nextSelector: [{url: /https:\/\/en.wikipedia/, schema: {link: ""}}],
                nextSelectBy: [{url: /https:\/\/en.wikipedia/, schema: {link: ""}}],
            },
            depthFn: function (data) {
                // console.log(data)
            },
            depth: 3,
            urls: ['http://localhost/dashboard/' /*'https://en.wikipedia.org/wiki/Web_crawler'*/]
        });
     await Crawler.CrawlAllUrl();
    })
    it("Data Should match expected type :group",async function(){
        const Crawler = require('../index')({
            group:  {"group":"nav ul.right"},
            fetchSelector: {a:{_group:"group",_selector:"a"} },
            fetchSelectBy: {a: 'text'},
            nextSelector: {links: 'a[href^="/"]'},
            nextSelectBy: {links: ['attr', 'href']},
            fetchFn: (err, data, url) => {
              expect(data).to.be.an("object")
              expect(data.group).to.be.an("object")
              console.log(data)
            },
            formatUrl: function (url) {
                if (url == 'http://localhost/dashboard/faq.html') {
                    return {url}
                }
                return url
            },
        
            nextFn: function (err, data, url) {
                // console.log(data,url)
            },
            timeOut: 1000,
            limitNextLinks: 5,
            dynamicSchemas: {
                //when the url matches https://en.wikipedia.org it uses this schema to format it
                fetchSelector: [{url: /https:\/\/en.wikipedia.org/, schema: {title: "title", body: "div#mw-content-text"}}],
                fetchSelectBy: [{url: /https:\/\/en.wikipedia.org/, schema: {title: "text",body: "text"}}],
                nextSelector: [{url: /https:\/\/en.wikipedia/, schema: {link: ""}}],
                nextSelectBy: [{url: /https:\/\/en.wikipedia/, schema: {link: ""}}],
            },
            depthFn: function (data) {
                // console.log(data)
            },
            depth: 3,
            urls: ['http://localhost/dashboard/' /*'https://en.wikipedia.org/wiki/Web_crawler'*/]
        });
     await Crawler.CrawlAllUrl();
    })
})

