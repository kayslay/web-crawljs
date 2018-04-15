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
            groups:  {"nav":"nav ul.right li"},
            fetchSelector: {a:{_group:"nav",_selector:"a"},href:{_group:"nav",_selector:"a"} },
            fetchSelectBy: {a: 'text',href:["attr","href"]},
            nextSelector: {links: 'a[href^="/"]'},
            nextSelectBy: {links: ['attr', 'href']},
            fetchFn: (err, data, url) => {
            //   console.dir(data,{colors:true,depth:5})
              expect(data).to.be.an("object")
              expect(data.nav).to.be.an("array")
            },
            finalFn: function (err) {
                if (err) throw err
            },
            timeOut: 1000,
            limitNextLinks: 3,
            depth: 2,
            urls: ['http://localhost/dashboard/' ]
        });
     await Crawler.CrawlAllUrl();
    })
})

