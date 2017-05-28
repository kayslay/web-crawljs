let expect = require('chai').expect;
let Crawler = require('../index')({
    fetchSelector: {title: "title"},
    fetchSelectBy: {title: 'text'},
    nextSelector: {links: 'a[href^="/"]'},
    nextSelectBy: {links: ['attr', 'href']},
    fetchFn: (err, data, url) => {
        if (err) console.error(err.message);
    console.log(data)
    },

    nextFn: function (err,data, url) {
       // console.log(data)
    },
    loop: 3,
    urls: ['http://localhost']
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
