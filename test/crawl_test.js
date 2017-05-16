let expect = require('chai').expect;
let Crawler = require('../index')({
    fetchSelector: {title: "title"},
    fetchSelectBy: {title: 'text'},
    nextSelector: {links: 'a'},
    nextSelectBy: {links: ['attr', 'href']},
    fetchFn: (err, data, url) => {
        if (err) console.error(err.message);
        expect(data).to.be.deep({ title: [ 'Example Domain' ] });
    console.log(data,url)
    },

    nextFn: function (err,data, url) {
        // console.log(Crawler.getPrivateProp('initialLinks'))
        // console.log(data)
    },
    loop: 1,
    urls: ['http://example.com']
});


describe('testing the Crawler', function () {
    describe('testing the fetchFn methods data', function () {
        it('should return an object with the data { title: [ "Example Domain" ] }, from example.com\'s', function () {
            Crawler.CrawlAllUrl();
        });
    });

});

