const chai = require("chai");
chai.use(require("sinon-chai"));
chai.use(require("chai-as-promised"));
const expect = chai.expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire");
process.env.NODE_ENV = "test";

describe("GUI", function() {
    describe("_applyWindowStyle", function() {
        const Gui = require("../../bin/gui");

        it("Should apply style to data", function() {
            expect(Gui._applyWindowStyle({
                test: "Test"
            })).to.deep.equal({
                top: "center",
                left: "center",
                test: "Test",
                border: {
                    type: "line"
                },
                style: {
                    fg: "white",
                    bg: "blue"
                }
            });
        });

        it("Should allow override of top", function() {
            expect(Gui._applyWindowStyle({
                top: "Test"
            })).to.deep.equal({
                top: "Test",
                left: "center",
                border: {
                    type: "line"
                },
                style: {
                    fg: "white",
                    bg: "blue"
                }
            });
        });

        it("Should allow override of left", function() {
            expect(Gui._applyWindowStyle({
                left: "Test"
            })).to.deep.equal({
                top: "center",
                left: "Test",
                border: {
                    type: "line"
                },
                style: {
                    fg: "white",
                    bg: "blue"
                }
            });
        });

        it("Should merge border", function() {
            expect(Gui._applyWindowStyle({
                border: {
                    test: "Test"
                }
            })).to.deep.equal({
                top: "center",
                left: "center",
                border: {
                    test: "Test",
                    type: "line"
                },
                style: {
                    fg: "white",
                    bg: "blue"
                }
            });
        });

        it("Should allow override of border.type", function() {
            expect(Gui._applyWindowStyle({
                border: {
                    type: "Test"
                }
            })).to.deep.equal({
                top: "center",
                left: "center",
                border: {
                    type: "Test"
                },
                style: {
                    fg: "white",
                    bg: "blue"
                }
            });
        });

        it("Should merge style", function() {
            expect(Gui._applyWindowStyle({
                style: {
                    test: "Test"
                }
            })).to.deep.equal({
                top: "center",
                left: "center",
                border: {
                    type: "line"
                },
                style: {
                    test: "Test",
                    fg: "white",
                    bg: "blue"
                }
            });
        });

        it("Should allow override of style.fg", function() {
            expect(Gui._applyWindowStyle({
                style: {
                    fg: "Test"
                }
            })).to.deep.equal({
                top: "center",
                left: "center",
                border: {
                    type: "line"
                },
                style: {
                    fg: "Test",
                    bg: "blue"
                }
            });
        });

        it("Should allow override of style.bg", function() {
            expect(Gui._applyWindowStyle({
                style: {
                    bg: "Test"
                }
            })).to.deep.equal({
                top: "center",
                left: "center",
                border: {
                    type: "line"
                },
                style: {
                    fg: "white",
                    bg: "Test"
                }
            });
        });
    });

    describe("GUI functions", function() {
        const sandbox = sinon.sandbox.create();

        const Blessed = {};

        const ordinal = sinon.stub();

        const Gui = proxyquire("../../bin/gui", {
            "blessed": Blessed,
            "ordinal": ordinal
        });

        Gui._screen = {
            append: sinon.stub(),
            render: sinon.stub()
        };

        Gui._fidemLottery = {
            draw: sinon.stub(),
            sellTicket: sinon.stub()
        };

        beforeEach(function() {
            sandbox.stub(Gui, "_applyWindowStyle").callsFake(function(style) {
                return `Applied Style: ${JSON.stringify(style)}`;
            });
        });

        afterEach(function() {
            sandbox.reset();
            sandbox.restore();
            Gui._screen.append.reset();
            Gui._screen.render.reset();
        });

        describe("_displayError", function() {
            const style = {
                style: {
                    bg: "red"
                }
            };

            Blessed.message = sinon.stub();

            beforeEach(function() {
                Blessed.message.callsFake(function(style) {
                    return {
                        style: style,
                        detach: sinon.stub(),
                        display: sinon.stub()
                    };
                });
            });

            afterEach(function() {
                Blessed.message.reset();
            });

            it("Should call _applyWindowStyle with bg red style", function() {
                Gui._displayError("Error");

                expect(Gui._applyWindowStyle).to.have.been.calledWith(style);
            });

            it("Should create a new message with the applied style", function() {
                Gui._displayError("Error");

                expect(Blessed.message).to.have.been.calledWith(`Applied Style: ${JSON.stringify(style)}`);
            });

            it("Should append the message", function() {
                Gui._displayError("Error");

                expect(Gui._screen.append.getCall(0).args[0].style).to.equal(`Applied Style: ${JSON.stringify(style)}`);
            });

            it("Should call message.display with the message", function() {
                Gui._displayError("Error");

                expect(Gui._screen.append.getCall(0).args[0].display).to.have.been.calledWith("Error", null);
            });

            describe("Message callback", function() {
                let messageCallback;

                const returnToMenuCallback = sinon.stub();

                beforeEach(function() {
                    Gui._displayError("Error", returnToMenuCallback);

                    messageCallback = Gui._screen.append.getCall(0).args[0].display.getCall(0).args[2];
                });

                afterEach(function() {
                    returnToMenuCallback.reset();
                });

                it("Should call message.detach", function() {
                    messageCallback();

                    expect(Gui._screen.append.getCall(0).args[0].detach).to.have.been.called;
                });

                it("Should call the callback passed as parameter", function() {
                    messageCallback();

                    expect(returnToMenuCallback).to.have.been.called;
                });
            });
        });

        describe("_displayMessage", function() {
            const style = {};

            Blessed.message = sinon.stub();

            beforeEach(function() {
                Blessed.message.callsFake(function(style) {
                    return {
                        style: style,
                        detach: sinon.stub(),
                        display: sinon.stub()
                    };
                });
            });

            afterEach(function() {
                Blessed.message.reset();
            });

            it("Should call _applyWindowStyle with empty style", function() {
                Gui._displayMessage("Message");

                expect(Gui._applyWindowStyle).to.have.been.calledWith(style);
            });

            it("Should create a new message with the applied style", function() {
                Gui._displayMessage("Message");

                expect(Blessed.message).to.have.been.calledWith(`Applied Style: ${JSON.stringify(style)}`);
            });

            it("Should append the message", function() {
                Gui._displayMessage("Message");

                expect(Gui._screen.append.getCall(0).args[0].style).to.equal(`Applied Style: ${JSON.stringify(style)}`);
            });

            it("Should call message.display with the message", function() {
                Gui._displayMessage("Message");

                expect(Gui._screen.append.getCall(0).args[0].display).to.have.been.calledWith("Message", 1);
            });

            describe("Message callback", function() {
                let messageCallback;

                const returnToMenuCallback = sinon.stub();

                beforeEach(function() {
                    Gui._displayMessage("Message", returnToMenuCallback);

                    messageCallback = Gui._screen.append.getCall(0).args[0].display.getCall(0).args[2];
                });

                afterEach(function() {
                    returnToMenuCallback.reset();
                });

                it("Should call message.detach", function() {
                    messageCallback();

                    expect(Gui._screen.append.getCall(0).args[0].detach).to.have.been.called;
                });

                it("Should call the callback passed as parameter", function() {
                    messageCallback();

                    expect(returnToMenuCallback).to.have.been.called;
                });
            });
        });

        describe("_sellTicket", function() {
            const style = {};

            Blessed.prompt = sinon.stub();

            beforeEach(function() {
                Blessed.prompt.callsFake(function(style) {
                    return {
                        style: style,
                        detach: sinon.stub(),
                        readInput: sinon.stub()
                    };
                });
            });

            afterEach(function() {
                Blessed.prompt.reset();
            });

            it("Should call _applyWindowStyle with empty style", function() {
                Gui._sellTicket();

                expect(Gui._applyWindowStyle).to.have.been.calledWith(style);
            });

            it("Should create a new prompt with the applied style", function() {
                Gui._sellTicket();

                expect(Blessed.prompt).to.have.been.calledWith(`Applied Style: ${JSON.stringify(style)}`);
            });

            it("Should append the prompt", function() {
                Gui._sellTicket();

                expect(Gui._screen.append.getCall(0).args[0].style).to.equal(`Applied Style: ${JSON.stringify(style)}`);
            });

            it("Should call _screen.render after appending the prompt", function() {
                Gui._sellTicket();

                expect(Gui._screen.render).to.have.been.calledAfter(Gui._screen.append);
            });

            it("Should call readInput with appropriate values", function() {
                Gui._sellTicket();

                expect(Gui._screen.append.getCall(0).args[0].readInput).to.have.been.calledWith("Owner's name", "");
            });

            it("Should call readInput after screen.render", function() {
                Gui._sellTicket();

                expect(Gui._screen.append.getCall(0).args[0].readInput).to.have.been.calledAfter(Gui._screen.render);
            });

            describe("Prompt callback", function() {
                let promptCallback;

                let prompt;

                const returnToMenuCallback = sinon.stub();

                beforeEach(function() {
                    Gui._sellTicket(returnToMenuCallback);

                    prompt = Gui._screen.append.getCall(0).args[0];
                    promptCallback = prompt.readInput.getCall(0).args[2];
                });

                afterEach(function() {
                    returnToMenuCallback.reset();
                });

                describe("On error", function() {
                    beforeEach(function() {
                        sandbox.stub(Gui, "_displayError");
                        promptCallback("Error");
                    });

                    it("Should call _displayError with the error", function() {
                        expect(Gui._displayError).to.have.been.calledWith("Error");
                    });

                    describe("_displayError callback", function() {
                        let errorCallback;

                        beforeEach(function() {
                            errorCallback = Gui._displayError.getCall(0).args[1];
                        });

                        it("Should call prompt.detach", function() {
                            errorCallback();

                            expect(prompt.detach).to.have.been.called;
                        });

                        it("Should call callback passed as parameter", function() {
                            errorCallback();

                            expect(returnToMenuCallback).to.have.been.called;
                        });
                    });
                });

                describe("On null input", function() {
                    it("Should call prompt.detach", function() {
                        promptCallback(null, null);

                        expect(prompt.detach).to.have.been.called;
                    });

                    it("Should call callback passed as parameter", function() {
                        promptCallback(null, null);

                        expect(returnToMenuCallback).to.have.been.called;
                    });
                });

                describe("On valid input", function() {
                    beforeEach(function() {
                        sandbox.stub(Gui, "_displayMessage");
                    });

                    afterEach(function() {
                        Gui._fidemLottery.sellTicket.reset();
                    });

                    it("Should call _fidemLottery.sellTicket with the input name", function() {
                        promptCallback(null, "Name");

                        expect(Gui._fidemLottery.sellTicket).to.have.been.calledWith("Name");
                    });

                    it("Should call _displayMessage with the ticket sold message", function() {
                        Gui._fidemLottery.sellTicket.returns(1);

                        promptCallback(null, "Name");

                        expect(Gui._displayMessage).to.have.been.calledWith("Ticket sold: 1");
                    });

                    describe("_displayMessage callback", function() {
                        let messageCallback;

                        beforeEach(function() {
                            promptCallback(null, "Name");

                            messageCallback = Gui._displayMessage.getCall(0).args[1];
                        });

                        it("Should call prompt.detach", function() {
                            messageCallback();

                            expect(prompt.detach).to.have.been.called;
                        });

                        it("Should call callback passed as parameter", function() {
                            messageCallback();

                            expect(returnToMenuCallback).to.have.been.called;
                        });
                    });

                    describe("Sold out", function() {
                        const Errors = require("../../lib/errors");

                        beforeEach(function() {
                            Gui._fidemLottery.sellTicket.throws(new Errors.SoldOut());
                            sandbox.stub(Gui, "_displayError");

                            promptCallback(null, "Name");
                        });

                        it("Should call _displayError with the sold out message", function() {
                            expect(Gui._displayError).to.have.been.calledWith("Lottery is sold-out, sorry!");
                        });

                        describe("_displayError callback", function() {
                            let errorCallback;

                            beforeEach(function() {
                                errorCallback = Gui._displayError.getCall(0).args[1];
                            });

                            it("Should call prompt.detach", function() {
                                errorCallback();

                                expect(prompt.detach).to.have.been.called;
                            });

                            it("Should call callback passed as parameter", function() {
                                errorCallback();

                                expect(returnToMenuCallback).to.have.been.called;
                            });
                        });
                    });

                    describe("Other errors", function() {
                        beforeEach(function() {
                            Gui._fidemLottery.sellTicket.throws(new Error("Other Error"));
                        });

                        it("Should re-throw the error", function() {
                            const test = function() {
                                promptCallback(null, "Name");
                            };

                            expect(test).to.throw("Other Error");
                        })
                    });
                });
            });
        });

        describe("_draw", function() {
            Blessed.listtable = sinon.stub();

            beforeEach(function() {
                ordinal.callsFake(function(number) {
                    return `ordinal:${number}`;
                });

                Gui._fidemLottery.draw.resolves([]);

                Blessed.listtable.callsFake(function(style) {
                    return {
                        style: style,
                        detach: sinon.stub(),
                        focus: sinon.stub(),
                        on: sinon.stub()
                    };
                });
            });

            afterEach(function() {
                Blessed.listtable.reset();
                ordinal.reset();
                Gui._fidemLottery.draw.reset();
            });

            const style = {
                data: [[],[],[]],
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
            };

            it("Should call _fidemLottery.draw", function() {
                return Gui._draw().then(() => {
                    expect(Gui._fidemLottery.draw).to.have.been.called;
                });
            });

            it("Should call _applyWindowStyle with the right style (excluding data)", function() {
                return Gui._draw().then(() => {
                    expect(Gui._applyWindowStyle).to.deep.have.been.calledWith(style);
                });
            });

            it("Should create a new listTable with the applied style", function() {
                return Gui._draw().then(() => {
                    expect(Blessed.listtable).to.have.been.calledWith(`Applied Style: ${JSON.stringify(style)}`);
                });
            });

            it("Should append the listTable", function() {
                return Gui._draw().then(() => {
                    expect(Gui._screen.append.getCall(0).args[0].style).to.equal(`Applied Style: ${JSON.stringify(style)}`);
                });
            });

            it("Should focus the listTable after appending it", function() {
                return Gui._draw().then(() => {
                    expect(Gui._screen.append.getCall(0).args[0].focus).to.have.been.calledAfter(Gui._screen.append);
                });
            });

            it("Should call _screen.render after focusing the listTable", function() {
                return Gui._draw().then(() => {
                    expect(Gui._screen.render).to.have.been.calledAfter(Gui._screen.append);
                });
            });

            it("Should set headers to ordinal of the winner array index", function() {
                Gui._fidemLottery.draw.resolves([{},{},{}]);

                return Gui._draw().then(() => {
                    const style = Gui._applyWindowStyle.getCall(0).args[0];
                    expect(style.data[0]).to.have.deep.equal(["ordinal:1", "ordinal:2", "ordinal:3"]);
                });
            });

            it("Should set first line to ball number", function() {
                Gui._fidemLottery.draw.resolves([
                    {
                        ballNumber: 10
                    },
                    {
                        ballNumber: 20
                    },
                    {
                        ballNumber: 30
                    }
                ]);

                return Gui._draw().then(() => {
                    const style = Gui._applyWindowStyle.getCall(0).args[0];
                    expect(style.data[1]).to.have.deep.equal(["Ball: 10", "Ball: 20", "Ball: 30"]);
                });
            });

            it("Should set second line to name of winners with prize amount", function() {
                Gui._fidemLottery.draw.resolves([
                    {
                        owner: "owner1",
                        prize: 10
                    },
                    {
                        owner: "owner2",
                        prize: 20
                    },
                    {
                        owner: "owner3",
                        prize: 30
                    }
                ]);

                return Gui._draw().then(() => {
                    const style = Gui._applyWindowStyle.getCall(0).args[0];
                    expect(style.data[2]).to.have.deep.equal(["owner1 10", "owner2 20", "owner3 30"]);
                });
            });

            it("Should set second line name to ***NOBODY** if owner is null", function() {
                Gui._fidemLottery.draw.resolves([
                    {
                        owner: null,
                        prize: 10
                    },
                    {
                        owner: "owner2",
                        prize: 20
                    },
                    {
                        owner: "owner3",
                        prize: 30
                    }
                ]);

                return Gui._draw().then(() => {
                    const style = Gui._applyWindowStyle.getCall(0).args[0];
                    expect(style.data[2]).to.have.deep.equal(["**NOBODY** 10", "owner2 20", "owner3 30"]);
                });
            });

            describe("cancel callback", function() {
                const returnToMenuCallback = sinon.stub();

                afterEach(function() {
                    returnToMenuCallback.reset();
                });

                it("Should call listTable.detach", function() {
                    return Gui._draw(returnToMenuCallback).then(() => {
                        const cancelCallback = Gui._screen.append.getCall(0).args[0].on.getCall(0).args[1];
                        cancelCallback();

                        expect(Gui._screen.append.getCall(0).args[0].detach).to.have.been.called;
                    });
                });

                it("Should call callback passed as parameter", function() {
                    return Gui._draw(returnToMenuCallback).then(() => {
                        const cancelCallback = Gui._screen.append.getCall(0).args[0].on.getCall(0).args[1];
                        cancelCallback();

                        expect(returnToMenuCallback).to.have.been.called;
                    });
                });
            });
        });

        describe("_mainMenu", function() {
            Blessed.list = sinon.stub();

            beforeEach(function() {
                Blessed.list.callsFake(function(style) {
                    return {
                        style: style,
                        detach: sinon.stub(),
                        focus: sinon.stub(),
                        on: sinon.stub(),
                        hide: sinon.stub(),
                        show: sinon.stub()
                    };
                });
            });

            afterEach(function() {
                Blessed.list.reset();
            });

            const style = {
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
            };

            it("Should call _applyWindowStyle with the right style (excluding data)", function() {
                Gui._mainMenu();

                expect(Gui._applyWindowStyle).to.deep.have.been.calledWith(style);
            });

            it("Should create a new list with the applied style", function() {
                Gui._mainMenu();

                expect(Blessed.list).to.have.been.calledWith(`Applied Style: ${JSON.stringify(style)}`);
            });

            it("Should append the list", function() {
                Gui._mainMenu();

                expect(Gui._screen.append.getCall(0).args[0].style).to.equal(`Applied Style: ${JSON.stringify(style)}`);
            });

            it("Should focus the list after appending it", function() {
                Gui._mainMenu();

                expect(Gui._screen.append.getCall(0).args[0].focus).to.have.been.calledAfter(Gui._screen.append);
            });

            it("Should call _screen.render after focusing the listTable", function() {
                Gui._mainMenu();

                expect(Gui._screen.render).to.have.been.calledAfter(Gui._screen.append);
            });

            describe("Menu action callback", function() {
                let menu;
                let onActionCallback;

                beforeEach(function() {
                    sandbox.stub(Gui, "_sellTicket");
                    sandbox.stub(Gui, "_draw");
                    sandbox.stub(Gui, "_displayError");

                    Gui._mainMenu();
                    menu = Gui._screen.append.getCall(0).args[0];
                    onActionCallback = menu.on.getCalls().find(({args}) => args[0] === "action").args[1];
                });

                it("Should call menu.hide", function() {
                    onActionCallback();

                    expect(menu.hide).to.have.been.called;
                });

                describe("Sell ticket option", function() {
                    it("Should call _sellTicket", function() {
                        onActionCallback(null, 0);

                        expect(Gui._sellTicket).to.have.been.called;
                    });

                    describe("actionCallback", function() {
                        let actionCallback;

                        beforeEach(function() {
                            onActionCallback(null, 0);

                            actionCallback = Gui._sellTicket.getCall(0).args[0];
                        });

                        it("Should call menu.focus", function() {
                            actionCallback();

                            expect(menu.focus).to.have.been.called;
                        });

                        it("Should call menu.show", function() {
                            actionCallback();

                            expect(menu.show).to.have.been.called;
                        });

                        it("Should call _screen.render", function() {
                            actionCallback();

                            expect(Gui._screen.render).to.have.been.called;
                        });
                    });
                });

                describe("Draw option", function() {
                    it("Should call _draw", function() {
                        onActionCallback(null, 1);

                        expect(Gui._draw).to.have.been.called;
                    });

                    describe("actionCallback", function() {
                        let actionCallback;

                        beforeEach(function() {
                            onActionCallback(null, 1);

                            actionCallback = Gui._draw.getCall(0).args[0];
                        });

                        it("Should call menu.focus", function() {
                            actionCallback();

                            expect(menu.focus).to.have.been.called;
                        });

                        it("Should call menu.show", function() {
                            actionCallback();

                            expect(menu.show).to.have.been.called;
                        });

                        it("Should call _screen.render", function() {
                            actionCallback();

                            expect(Gui._screen.render).to.have.been.called;
                        });
                    });
                });

                describe("Invalid option", function() {
                    it("Should call _displayError", function() {
                        onActionCallback(null, "bad");

                        expect(Gui._displayError).to.have.been.calledWith;
                    });

                    describe("actionCallback", function() {
                        let actionCallback;

                        beforeEach(function() {
                            onActionCallback(null, "bad");

                            actionCallback = Gui._displayError.getCall(0).args[1];
                        });

                        it("Should call menu.focus", function() {
                            actionCallback();

                            expect(menu.focus).to.have.been.called;
                        });

                        it("Should call menu.show", function() {
                            actionCallback();

                            expect(menu.show).to.have.been.called;
                        });

                        it("Should call _screen.render", function() {
                            actionCallback();

                            expect(Gui._screen.render).to.have.been.called;
                        });
                    });
                });
            });
        });
    });

    describe("_initLottery", function() {
        const Lottery = sinon.stub();

        beforeEach(function() {
            process.env.FIDEM_CONFIG = "";
            process.env.FIDEM_CONFIGFILE = "";
        });

        afterEach(function() {
            Lottery.reset();
        })

        it("Should initialize a new lottery", function() {
            const Gui = proxyquire("../../bin/gui", {
                "../lib": {
                    Lottery: Lottery
                }
            });

            Gui._initLottery();

            expect(Lottery).to.have.been.calledWithNew;
        });

        it("Should store the lottery in _fidemLottery", function() {
            const Gui = proxyquire("../../bin/gui", {
                "../lib": {
                    Lottery: Lottery
                }
            });

            Gui._initLottery();

            expect(Gui._fidemLottery).to.be.an.instanceOf(Lottery);
        });

        it("Should load config from FIDEM_CONFIG if set", function() {
            const config = {FIDEM_CONFIG_ENV: true};
            process.env.FIDEM_CONFIG = JSON.stringify(config);

            const Gui = proxyquire("../../bin/gui", {
                "../lib": {
                    Lottery: Lottery
                }
            });

            Gui._initLottery();

            expect(Lottery).to.have.been.calledWith(config);
        });

        it("Should load config from FIDEM_CONFIGFILE if set", function() {
            const config = {
                FIDEM_CONFIGFILE_ENV: true,
                "@noCallThru": true
            };
            process.env.FIDEM_CONFIGFILE = "CONFIGFILE_ENV";

            const Gui = proxyquire("../../bin/gui", {
                "../lib": {
                    Lottery: Lottery
                },
                CONFIGFILE_ENV: config
            });

            Gui._initLottery();

            expect(Lottery).to.have.been.calledWith(config);
        });

        it("Should load config from ./baseConfig.json otherwise", function() {
            const Gui = proxyquire("../../bin/gui", {
                "../lib": {
                    Lottery: Lottery
                }
            });

            Gui._initLottery();

            expect(Lottery).to.have.been.calledWith(require("../../bin/baseConfig.json"));
        });
    });

    describe("_initScreen", function() {
        const Blessed = {
            screen: sinon.stub()
        };

        const Gui = proxyquire("../../bin/gui", {
            blessed: Blessed
        });

        const screenStub = {
            key: sinon.stub()
        };

        beforeEach(function() {
            Blessed.screen.returns(screenStub);
        });

        afterEach(function() {
            screenStub.key.reset();
            Blessed.screen.reset();
        });

        it("Should call Blessed.screen with smartCSR set to true", function() {
            Gui._initScreen();

            expect(Blessed.screen).to.have.been.calledWith({smartCSR: true});
        });

        it("Should store screen in _screen", function() {
            Gui._initScreen();

            expect(Gui._screen).to.equal(screenStub);
        });

        it("Should map q and Ctrl-C to process.exit", function() {
            const sandbox = sinon.sandbox.create();

            Gui._initScreen();

            const keyCallback = screenStub.key.getCalls().find(({args}) => args[0][0] === 'q' && args[0][1] === 'C-c').args[1];

            sandbox.stub(process, "exit");

            keyCallback();

            expect(process.exit).to.have.been.calledWith(0);

            sandbox.restore();
        });
    });

    describe("start", function() {
        const sandbox = sinon.sandbox.create();

        const Gui = require("../../bin/gui");

        beforeEach(function() {
            sandbox.stub(Gui, "_initScreen");
            sandbox.stub(Gui, "_initLottery");
            sandbox.stub(Gui, "_mainMenu");
        });

        afterEach(function() {
            sandbox.reset();
            sandbox.restore();
        });

        it("Should call _initScreen", function() {
            Gui.start();

            expect(Gui._initScreen).to.have.been.called;
        });

        it("Should call _initLottery after _initScreen", function() {
            Gui.start();

            expect(Gui._initLottery).to.have.been.calledAfter(Gui._initScreen);
        });

        it("Should call _mainMenu after _initLottery", function() {
            Gui.start();

            expect(Gui._mainMenu).to.have.been.calledAfter(Gui._initLottery);
        });
    });
});