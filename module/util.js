/**
 * Created by kayslay on 4/23/17.
 */
let _ = require('lodash');
let path = require('path');
let urlModule = require('url');

/**
 * @description returns the item if its truthy or move the next and check again
 * @param  tests {String[]} the list of values
 */
function trueOrNext(...tests) {
    return tests.forEach((item, index) => {
        "use strict";
        if (item) return item;
    })
}

/**
 * @description returns true if the keys of two objects match and false if otherwise
 * @param obj1 first object
 * @param obj2 second object
 * @return {boolean}
 */
function keyMatch(obj1, obj2) {
    let key1 = Object.keys(obj1).sort();
    let key2 = Object.keys(obj2).sort();
    return _.isEqual(key1, key2);
}

/**
 * @description converts a relative url to an absolute url
 * @param url the current url
 * @param urlPath the url path to resolve
 * @return {string}
 */
function toAbsoluteUrl(url, urlPath) {
    let parsedUrl = urlModule.parse(url);
    return `${parsedUrl.protocol}//${parsedUrl.host}${path.resolve(url, urlPath)}${parsedUrl.search || ''}`
        .replace(/(\w|\d)\/\//g, "$1\/")
        .replace(/\/?#.+$/, '');
}

/**
 * @description returns the url string
 * if the url param is an object get the return the url property
 * @param url {String|Object}
 * @return {string}
 */
function getUrlOut(url) {
    if (typeof url === 'string') {
        return url;
    } else if (typeof url == 'object') {
        return url.url;
    }
}

/**
 * @description coverts an object to an array
 * @param data
 * @return {*}
 */
function sortDataToArray(data) {
    return data.reduce((acc, item) => {
        "use strict";
        let packedItem = [];
        for (let i in item) {
            packedItem = packedItem.concat(item[i]);
        }
        return acc.concat(packedItem)
    }, [])
}

let util = {
    trueOrNext,
    keyMatch,
    getUrlOut,
    sortDataToArray,
    toAbsoluteUrl
};
exports = module.exports = util;