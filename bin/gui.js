const Blessed = require("blessed");
const FidemLottery = require("../lib").Lottery;
const Errors = require("../lib").Errors;
const ordinal = require("ordinal");

const Gui = {};  //Empty object for behavior similar to a static class

/**
 * Callback once a window has finished (return to previous)
 *
 * @callback windowCallback
 */


/**
 * Applies our global style for blessed box (Everything is overridable)
 * @param {Object} data - The data for the blessed box to manipulate
 * @return {Object} A new copy of the blessed box data with the style applied
 */
Gui._applyWindowStyle = function _applyWindowStyle(data) {
    return Object.assign({ //If this gets any more complex, consider deepmerge
        top: "center",
        left: "center"
    }, data, {
        border: Object.assign({
            type: "line"
        }, data.border),
        style: Object.assign({
            fg: "white",
            bg: "blue"
        }, data.style)
    });
};

/**
 * Displays an error message (Usese blessed.message)
 * @param {string} errorString - Error string (or supporting .toString)
 * @param {windowCallback} callback - Callback after the message
 */
Gui._displayError = function _displayError(errorString, callback) {
    const message = Blessed.message(Gui._applyWindowStyle({style: {bg: "red"}}));
    Gui._screen.append(message);

    const returnFromMessage = function returnFromMessage() {
        message.detach();
        callback();
    };

    message.display(errorString, null, returnFromMessage);
};

/**
 * Displays a message (Usese blessed.message)
 * @param {string} messageString - Message string (or supporting .toString)
 * @param {windowCallback} callback - Callback after the message
 */
Gui._displayMessage = function _displayMessage(messageString, callback) {
    const message = Blessed.message(Gui._applyWindowStyle({}));
    Gui._screen.append(message);

    const returnFromMessage = function returnFromMessage() {
        message.detach();
        callback();
    };

    message.display(messageString, 1, returnFromMessage);
};

/**
 * Displays a prompt for selling a ticket and sells the ticket
 * @param {windowCallback} callback - Callback after the operation is completed
 */
Gui._sellTicket = function sellTicket(callback) {
    const prompt = Blessed.prompt(Gui._applyWindowStyle({}));
    Gui._screen.append(prompt);
    Gui._screen.render();

    const returnToMenu = function returnToMenu() {
        prompt.detach();
        callback();
    };

    prompt.readInput("Owner's name", "",  (error, input) => {
        if (error) {
            return Gui._displayError(error, returnToMenu);
        }
        if (!input) {
            returnToMenu();
            return;
        }

        try {
            const soldTicket = Gui._fidemLottery.sellTicket(input);
            Gui._displayMessage(`Ticket sold: ${soldTicket}`, returnToMenu);
            return;
        }
        catch(err) {
            if (err instanceof Errors.SoldOut) {
                Gui._displayError("Lottery is sold-out, sorry!", returnToMenu);
                return;
            }
            throw err; //Crash for now, do we want to recover?
        }
    });

    Gui._screen.render();
};

/** Draws the winners and diplays them in a table
 * @param {windowCallback} callback - Callback after the operation is completed
 */
Gui._draw = function _draw(callback) {
    return Gui._fidemLottery.draw()
    .then(drawResult => {
        const headers = drawResult.map((winner, winnerNumber) => ordinal(winnerNumber + 1));
        const winnerNames = drawResult.map(winner => `${winner.owner || "**NOBODY**"} ${winner.prize}`);
        const winnerBallNumbers = drawResult.map(winner => `Ball: ${winner.ballNumber}`);

        const resultList = Blessed.listtable(Gui._applyWindowStyle({
            data: [
                headers,
                winnerBallNumbers,
                winnerNames
            ],
            height: 5,
            width: "100%",
            interactive: false,
            keys: true,
            style: {
                cell: {
                    bg: "yellow"
                },
                header: {
                    bg: "blue"
                }
            }
        }));

        const returnToMenu = function returnToMenu() {
            resultList.detach();
            callback();
        };

        Gui._screen.append(resultList);
        resultList.focus();
        Gui._screen.render();

        resultList.on("cancel", returnToMenu);
    });
}

/** Displays the main menu */
Gui._mainMenu = function _mainMenu() {
    const menu = Blessed.list(Gui._applyWindowStyle({
        label: "Fidem Lottery",
        keys: true,
        tags: true,
        items: [
            "Sell Ticket",
            "Draw"
        ],
        style: {
            selected: {
                bg: "yellow",
                fg: "black"
            }
        }
    }));

    const actionComplete = function actionComplete() {
        menu.focus();
        menu.show();
        Gui._screen.render();
    };

    const invalidMenuEntry = function invalidMenuEntry(callback) {
        Gui._displayError("This option is not implemented yet", callback);
    }

    menu.on("action", (event, selected) => {
        menu.hide();
        switch(selected) {
            case 0:
                Gui._sellTicket(actionComplete);
                break;
            case 1:
                Gui._draw(actionComplete);
                break;
            default:
                invalidMenuEntry(actionComplete);
        }
    });

    Gui._screen.append(menu);
    menu.focus();
    Gui._screen.render();
};

/** Initalizes the lottery instance */
Gui._initLottery = function _initLottery() {
    const configFile = (process.env.FIDEM_CONFIGFILE && process.env.FIDEM_CONFIGFILE !== "") ?
        process.env.FIDEM_CONFIGFILE :
        "./baseConfig.json"

    const config = (process.env.FIDEM_CONFIG && process.env.FIDEM_CONFIG !== "") ?
        JSON.parse(process.env.FIDEM_CONFIG) :
        require(configFile);
    Gui._fidemLottery = new FidemLottery(config);
}

/** Initializes the blessed screen */
Gui._initScreen = function _initScreen() {
    Gui._screen = Blessed.screen({smartCSR: true});
    Gui._screen.title = "Fidem Lottery";

    Gui._screen.key(['q', 'C-c'], () => {
      return process.exit(0);
    });
}

/** Start the gui */
Gui.start = function start() {
    Gui._initScreen();
    Gui._initLottery();
    Gui._mainMenu();
}

module.exports = Gui;
