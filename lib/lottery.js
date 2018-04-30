const Errors = require("./errors");
const randomGenerator = require("random-number-csprng"); //This is a lottery afterall; v8s broken Math.Random isn't good enough.
                                                         //Using a CSPRNG with known good distribution algorithms.
const Bluebird = require("bluebird");

/** Fidem Lottery implementation supporting multiple configurations */
class FidemLottery { //Class based implementation to support multiple lotteries with different configurations.

    /** Get random number between min and max (including if min and max are the same)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @return {Promise<number>} Random number
     */
    static _getRandomNumber(min, max) { //Relax the rule from random-number-csprng to allow min and max to match (The last ball can be drawn).
        return min === max ? Promise.resolve(min) : randomGenerator(min, max);
    }

    /** Create a Fidem Lottery instance according to a specific configuration
     * @param {Object} configuration object
     */
    constructor(configuration) {
        this._config = configuration; //We assume a valid configuration given from the caller to keep overhead small.
        this._initLottery();
    }

    /** (Re)Initialize the lottery */
    _initLottery() {
        this._currentFunds = this._config.baseFunds;
        this._soldTicketOwners = [];
    }

    /** Sell a lottery ticket
     * @param {string} owner - Owner of the lottery ticket
     * @return {number} Number of the lottery ticket sold
     */
    sellTicket(owner) {
        if (this._soldTicketOwners.length >= this._config.ballCount) {
            throw new Errors.SoldOut();
        }
        this._soldTicketOwners.push(owner);
        this._currentFunds += this._config.ticketPrize;
        return this._soldTicketOwners.length;
    }

    /** Draw winner balls from the ball machine
     * @return {Promise<number[]>} Array of winner balls in order of winners
     */
    _drawBalls() {
        const balls = Array.from(Array(this._config.ballCount).keys()); //Cheat to build array with all integers from 0
        return Bluebird.mapSeries(Array(this._config.winnerRatios.length), () =>
            FidemLottery._getRandomNumber(0, balls.length - 1)
            .then(ballIndex => {
                const winnerBall = balls[ballIndex];
                balls.splice(ballIndex, 1); //Remove the ball
                return winnerBall;
            })
        );
    }

    /**
     * @typedef DrawResult
     * @type {object}
     * @property {string} owner - Owner of the winner ball
     * @property {number} ballNumber - Number of the winning ball
     * @property {number} prize - Amount of the prize won
     */

    /** Draw winners
     * @return {Promise<DrawResult[]>} The results of the draw in order of winners
     */
    draw() {
        const totalPrize = this._currentFunds * this._config.totalPrizeRatio;

        return this._drawBalls()
        .then(winnerBalls => {
            const winners = winnerBalls.map((ballNumber, winnerIndex) => ({
                owner: this._soldTicketOwners[ballNumber] || null,
                ballNumber: ballNumber + 1,
                prize: totalPrize * this._config.winnerRatios[winnerIndex]
            }));

            this._initLottery(); //Re-init the lottery

            return winners;
        });
    }
}

module.exports = FidemLottery
