module.exports = function SoldOut () {
    var err = Error.call(this, "Lottery is sold out.");

    this.message = err.message;
    this.stack = err.stack;
};

module.exports.prototype = Object.create(Error.prototype);
module.exports.prototype.constructor = module.exports;
