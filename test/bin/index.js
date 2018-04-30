const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');
process.env.NODE_ENV = 'test';

describe("GUI bootstrap", function() {
    it("Should start gui", function() {
        const fakedGui = {
            start: sinon.stub()
        };

        proxyquire("../../bin", {
            "./gui": fakedGui
        });

        expect(fakedGui.start).to.have.been.called;
    });
});
