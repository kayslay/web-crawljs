/**
 * Created by kayslay on 4/29/17.
 */
let cheerio = require('cheerio');
let util = require('./util');

module.exports = function (content) {
    //errors


    /**
     * @description returns back the Dom content from the page's body
     * @param selector
     * @param selectBy
     * @param callback
     * @param url
     * @return {*}
     */
    function getDomContents(selector, selectBy, callback, url, groupSelector) {
        let $ = cheerio.load(content);
        //if the keys don't match

        //sets the contentData based on the way the data s organized;
        let contentData = sortIndividuallyByName(selector, selectBy, $);

        if (arguments.callee.caller.name == "fetchFromPage" && !util.empty(groupSelector.groups)) {
            Object.assign(contentData, sortInGroup(groupSelector, selectBy, $))
            // content = null;
        }

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


    function sortInGroup(selector, selectBy, $) {
        const {
            groups,
            _groupSet
        } = selector
        const keyVal = Object.entries(_groupSet)
        let contentData = {}
        //loop through the groups
        for (let key in groups) {
            if (!contentData[key]) {
                contentData[key] = []
            }

            $(groups[key]).map(function () {
                //load the html content of the group to cheerio
                try {
                    const $$ = cheerio.load($(this).html())
                    // group the selectors in this object
                    let obj = {}

                    for (let data in _groupSet[key]) {
                        obj[data] = $$(_groupSet[key][data]).map(function () {
                            if (Array.isArray(selectBy[data])) {
                                return $$(this)[selectBy[data][0]](...selectBy[data].slice(1)) || "null"
                            } else if (typeof $$[selectBy[data]] == 'function') {
                                return $$(this)[selectBy[data]]() || "null";
                            } else if (typeof $$[selectBy[data]] !== 'undefined') {
                                return $$(this)[selectBy[data]] || "null";
                            }

                        }).get()
                    }
                    contentData[key].push(obj)
                } catch (err) {
                    console.log("group selector not found on the page")
                }
            }).get()
            return contentData
        }
    }

    /**
     * @description extracts the data by the name given to the selector Object keys.
     * @param selector
     * @param selectBy
     * @param $
     * @return {{}}
     */
    function sortIndividuallyByName(selector, selectBy, $) {
        let contentData = {};
        for (let data in selector) {
            //dont sort name that belong to a group
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

module.exports.groupObj = {}