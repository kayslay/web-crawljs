let expect = require('chai').expect;
let Crawler = require('../index')({
    fetchSelector: {title: "title"},
    fetchSelectBy: {title: 'text'},
    nextSelector: {links: 'a[href^="/"]'},
    nextSelectBy: {links: ['attr', 'href']},
    fetchFn: (err, data, url) => {
        if (err) console.error(err.message);
        if (/https:\/\/en.wiki/.test(url)) {
            let json = JSON.stringify(data);
            require('fs').writeFile('./data.json', json, (err, data) => console.log('data written to data.txt'))
        } else {
            return console.log(data);
        }

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


// describe('testing the Crawler', function () {
//     describe('testing the fetchFn methods data', function () {
//         it('should return an object with the data { title: [ "Example Domain" ] }, from example.com\'s', function () {

Crawler.CrawlAllUrl();

//         });
//     });
//
// });
//
