let expect = require('chai').expect;
let Crawler = require('../index')({
    fetchSelector: {title: "title", body: "div#mw-content-text"},
    fetchSelectBy: {title: 'text', body: "text"},
    nextSelector: {links: 'a[href^="/"]'},
    nextSelectBy: {links: ['attr', 'href']},
    fetchFn: (err, data, url) => {
        if (err) console.error(err.message);
        if (url == 'http://localhost/dashboard/') console.log('saving somewhere', data);
        // console.log(data.title[0],url)
        // require('fs').writeFile('./data.txt',data.body[0],(err,data)=>console.log('data written to data.txt'))
    },

    nextFn: function (err, data, url) {
        // console.log(data)
    },
    dynamicSchemas: {
        fetchSelector: [{url: 'http://localhost/dashboard/', schema: {title: "title"}}],
        fetchSelectBy: [{url: 'http://localhost/dashboard/', schema: {title: "text"}}],
    },
    depthFn: function (data) {
        console.log(data)
    },
    depth: 2,
    urls: ['http://localhost/dashboard/']
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
