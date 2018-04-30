const chai = require('chai');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');
process.env.NODE_ENV = 'test';

describe("Fidem Lottery", function() {
    describe("_getRandomNumber", function() {
        const fakedPRNG = sinon.stub();

        const Lottery = proxyquire("../../lib/lottery", {
            "random-number-csprng": fakedPRNG
        });

        beforeEach(function() {
            fakedPRNG.callsFake(function(min, max) {
                return `fakedPRNG: ${min} ${max}`;
            });
        });

        afterEach(function() {
            fakedPRNG.reset();
        });

        it("Should resolve to min if min and max are the same", function() {
            return expect(Lottery._getRandomNumber(123, 123)).to.eventually.equal(123);
        });

        it("Should return PRNG result for min and max", function() {
            expect(Lottery._getRandomNumber(0, 2)).to.equal("fakedPRNG: 0 2");
        });
    });

   describe("constructor", function() {
        const sandbox = sinon.sandbox.create();

        const Lottery = require("../../lib/lottery");

        beforeEach(function() {
            sandbox.stub(Lottery.prototype, "_initLottery");
        });

        afterEach(function() {
            sandbox.reset();
            sandbox.restore();
        });

        it("Should store configuration in this._config", function() {
            const config = {};

            const lottery = new Lottery(config);

            expect(lottery._config).to.equal(config);
        });

        it("Should call this._initLottery", function() {
            const lottery = new Lottery();

            expect(lottery._initLottery).to.have.been.called;
        });
   });

    describe("_initLottery", function() {
        const Lottery = require("../../lib/lottery");
        const config = {
            baseFunds: 444
        };

        let lotteryInstance;

        beforeEach(function() {
            lotteryInstance = new Lottery(config);
        });

        it("Should initialize this._currentFunds to config.baseFunds", function() {
            lotteryInstance._currentFunds = 111;

            lotteryInstance._initLottery();

            expect(lotteryInstance._currentFunds).to.equal(config.baseFunds);
        });

        it("Should initialize this._soldTicketOwners to an empty array", function() {
            lotteryInstance._soldTicketOwners = ["Bad owner"];

            lotteryInstance._initLottery();

            expect(lotteryInstance._soldTicketOwners).to.deep.equal([]);
        });
    });

    describe("sellTicket", function() {
        const Lottery = require("../../lib/lottery");
        const Errors = require("../../lib/errors");

        const config = {
            ballCount: 3,
            ticketPrize: 10
        };

        let lotteryInstance;

        beforeEach(function() {
            lotteryInstance = new Lottery(config);
        });

        it("Should throw SoldOut error if _soldTicketOwners.length = config.ballCount", function() {
            lotteryInstance._soldTicketOwners = Array(config.ballCount);

            const test = function() {
                lotteryInstance.sellTicket("test");
            };

            expect(test).to.throw(Errors.SoldOut);
        });

        it("Should push owner to this._soldTicketOwners", function() {
            lotteryInstance._soldTicketOwners = ["before"];

            lotteryInstance.sellTicket("test");

            expect(lotteryInstance._soldTicketOwners).to.deep.equal(["before", "test"]);
        });

        it("Should augment this._currentFunds by config.ticketPrize", function() {
            lotteryInstance._currentFunds = 111;

            lotteryInstance.sellTicket("test");

            expect(lotteryInstance._currentFunds).to.equal(121);
        });

        it("Should return length of this._soldTicketOwners (ticket number)", function() {
            lotteryInstance._soldTicketOwners = Array(2);

            expect(lotteryInstance.sellTicket("test")).to.equal(3);
        });
    });

    describe("_drawBalls", function() {
        //We draw all balls from the ball machine to make sure tests are valid

        const sandbox = sinon.sandbox.create();

        const Lottery = require("../../lib/lottery");

        const config = {
            ballCount: 3,
            winnerRatios: [,,,]
        };

        const lotteryInstance = new Lottery(config);

        beforeEach(function() {
            sandbox.stub(Lottery, "_getRandomNumber").resolves(0);
        });

        afterEach(function() {
            sandbox.reset();
            sandbox.restore();
        });

        it("Should call Lottery._getRandomNumber for every ball", function() {
            return lotteryInstance._drawBalls()
            .then(() => {
                expect(Lottery._getRandomNumber.getCall(0).args).deep.equal([0, 2]);
                expect(Lottery._getRandomNumber.getCall(1).args).deep.equal([0, 1]);
                expect(Lottery._getRandomNumber.getCall(2).args).deep.equal([0, 0]);
            });
        });

        it("Should return every ball in order", function() {
            return expect(lotteryInstance._drawBalls()).to.eventually.deep.equal([0, 1, 2]);
        });
    });

    describe("draw", function() {
        const Lottery = require("../../lib/lottery");

        const config = {
            totalPrizeRatio: 0.5,
            winnerRatios: [0.5, 0.25, 0.1]
        };

        const lotteryInstance = new Lottery(config);

        const sandbox = sinon.sandbox.create();

        beforeEach(function() {
            sandbox.stub(lotteryInstance, "_drawBalls").resolves([0, 1, 2]);
            sandbox.stub(lotteryInstance, "_initLottery");
            lotteryInstance._currentFunds = 200;
        });

        afterEach(function() {
            sandbox.reset();
            sandbox.restore();
        });

        it("Should return resolved winners", function() {
            lotteryInstance._soldTicketOwners = ["test1", "test2", "test3"];

            return expect(lotteryInstance.draw()).to.eventually.deep.equal([
                {
                    owner: "test1",
                    ballNumber: 1,
                    prize: 50
                },
                {
                    owner: "test2",
                    ballNumber: 2,
                    prize: 25
                },
                {
                    owner: "test3",
                    ballNumber: 3,
                    prize: 10
                }
            ]);
        });

        it("Should resolve unsold tickets to null owner", function() {
            lotteryInstance._soldTicketOwners = ["test1", "test2"];

            return expect(lotteryInstance.draw()).to.eventually.deep.equal([
                {
                    owner: "test1",
                    ballNumber: 1,
                    prize: 50
                },
                {
                    owner: "test2",
                    ballNumber: 2,
                    prize: 25
                },
                {
                    owner: null,
                    ballNumber: 3,
                    prize: 10
                }
            ]);
        });

        it("Should call this._initLottery", function() {
            return lotteryInstance.draw()
            .then(() => {
                expect(lotteryInstance._initLottery).to.have.been.called;
            });
        });
    });
});
