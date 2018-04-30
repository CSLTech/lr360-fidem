const chai = require('chai');
const expect = chai.expect;
process.env.NODE_ENV = 'test';

describe("Lib index", function() {
    const Lib = require("../../lib");

    it("Should export Lottery", function() {
        expect(Lib.Lottery).to.equal(require("../../lib/lottery"));
    });

    it("Should export Errors", function() {
        expect(Lib.Errors).to.equal(require("../../lib/errors"));
    });
});
