/**
 * Created by kayslay on 4/29/17.
 */
let cheerio = require('cheerio');
let util = require('./util');
module.exports = function (content) {

    //errors
    const KEY_ERROR = "the keys don't match. Make sure keys in arg1 matches keys in arg2";

    /**
     * @description returns back the Dom content from the page's body
     * @param selector
     * @param selectBy
     * @param callback
     * @param url
     * @return {*}
     */
    function getDomContents(selector, selectBy, callback, url) {

        let $ = cheerio.load(content);
        //if the keys don't match
        if (!util.keyMatch(selector, selectBy) && callback) return callback(Error(`An Error Occurred : \n ${KEY_ERROR}`));
        //this doe nothing for now, since the there is always a callback passed to the getDomContents function
        else if (!util.keyMatch(selector, selectBy)) throw  new Error(`An Error Occurred: \n ${KEY_ERROR}`);
        //sets the contentData based on the way the data s organized;
        let contentData = sortIndividuallyByName(selector, selectBy, $);

        if (arguments.callee.caller.name == "selectNextCrawlContent") {
            util.relativeToAbsoluteUrl(contentData, url);
            // content = null;
        }
        callback && callback(null, contentData, url);
        // de-referencing the callback function
        callback = null;

        //return the data  if needed
        return contentData;
    }

    /**
     * @description extracts the data by the name given to the seector Object keys.
     * @param selector
     * @param selectBy
     * @param $
     * @return {{}}
     */
    function sortIndividuallyByName(selector, selectBy, $) {
        let contentData = {};
        for (let data in selector) {
            contentData[data] = $(selector[data]).map(function (index, element) {
                if (Array.isArray(selectBy[data])) {
                    return $(this)[selectBy[data][0]](...selectBy[data].slice(1)) || 'null'
                } else if (typeof $[selectBy[data]] == 'function') {
                    return $(this)[selectBy[data]]() || 'null';
                } else if (typeof $[selectBy[data]] !== 'undefined') {
                    return $(this)[selectBy[data]] || 'null';
                }
            }).get();
        }
        return contentData;
    }


    return {
        getDomContents
    }
};

