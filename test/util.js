/**
 * Created by kayslay on 5/5/17.
 */
let expect = require('chai').expect;
let util = require('../module/util');

describe('Testing util methods', function () {
    it('Should return array of all the values from objects', function () {
        let arr = util.sortDataToArray([{
            links: [1, 2, 3, 4],
            m: [5]
        }, {
            links: [6, 7]
        }])
        console.log();
        expect(arr).to.deep.equal([1, 2, 3, 4, 5, 6, 7])
    })
    it("Generated visited strings should match expected string", () => {
        expect(util.genUniqueVisitedString({
            url: "http://localhost",
            method: "get"
        })).to.be.equal("[GET] http://localhost/")
        expect(util.genUniqueVisitedString({
            url: "http://localhost",
            method: "GET"
        })).to.be.equal("[GET] http://localhost/")
        expect(util.genUniqueVisitedString({
            url: "http://localhost",
            method: "POST"
        })).to.be.equal("[POST] http://localhost/")
        expect(util.genUniqueVisitedString({
            url: "http://localhost/dashboard.html",
            method: "post"
        })).to.be.equal("[POST] http://localhost/dashboard.html")
        expect(util.genUniqueVisitedString({
            url: "http://localhost?h=cool",
            method: "HEAD"
        })).to.be.equal("[HEAD] http://localhost/?h=cool")
    })
    it("Should convert relative url to absolute", () => {
        expect(util.toAbsoluteUrl("http://localhost/", "/dashboard/phpinfo.php")).to.equal("http://localhost/dashboard/phpinfo.php")
        expect(util.toAbsoluteUrl("http://localhost/file/near/me", "/dashboard/phpinfo.php")).to.equal("http://localhost/file/near/me/dashboard/phpinfo.php")
        expect(util.toAbsoluteUrl("http://localhost/hello_world?h=boy", "/dashboard/phpinfo.php")).to.equal("http://localhost/hello_world/dashboard/phpinfo.php?h=boy")
        expect(util.toAbsoluteUrl("http://localhost/hello_world?h=boy&g=girl", "/dashboard/phpinfo.php")).to.equal("http://localhost/hello_world/dashboard/phpinfo.php?h=boy&g=girl")
        expect(util.toAbsoluteUrl("http://localhost:3000/hello_world?h=boy&g=girl", "/dashboard/phpinfo.php")).to.equal("http://localhost:3000/hello_world/dashboard/phpinfo.php?h=boy&g=girl")
    })
    // it("",()=>{})
    // it("",()=>{})
})