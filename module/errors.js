class AllLinksVisitErr extends Error {
    constructor(option) {
        super(option)
        this.type = "AllLinksVisitErr"
        this.name = "AllLinksVisitErr"
        this.message = "All the links have been visited"
    }
}

class TimeoutErr extends Error {
    constructor(timeout, option) {
        super(option)
        this.type = "TimeoutErr"
        this.name = "TimeoutErr"
        this.message = `timed out after ${timeout}ms`
    }
}

class KeyMatchErr extends Error{
    constructor(key1,key2,option){
        super(option)
        this.type = "KeyMatchErr"
        this.name = "KeyMatchErr"
        this.message = `the keys don't match. Make sure keys in '${key1}' contains all keys in '${key2}'`
    }
}

module.exports = {
    AllLinksVisitErr,
    TimeoutErr,
    KeyMatchErr
}