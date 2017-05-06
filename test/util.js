/**
 * Created by kayslay on 5/5/17.
 */
let expect = require('chai').expect;
let util = require('../module/util');

describe('testing util', function () {
    it('should return array', function () {
        let arr = util.sortDataToArray([{links: [1, 2, 3, 4], m: [5]}, {links: [6, 7]}])
        console.log()
        expect(arr).to.deep.equal([1, 2, 3, 4, 5, 6, 7])
    })
})