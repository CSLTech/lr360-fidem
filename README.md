# lr360-fidem

Implementation of the Fidem Lottery Test for LR360 using a console frontend written using Blessed. Can be used as a library or directly using the frontend.

# Using as a library
```sh
$ npm install https://github.com/CSLTech/lr360-fidem
```

In your code:
```javascript
const FidemLottery = require("lr360-fidem").Lottery;
const fidemLottery = new FidemLottery(configuration);

fidemLottery.sellTicket(owner) //to Sell a ticket

console.log(fidemLottery.draw()); //To draw winners
```

# Using as a globally installed console GUI
```sh
$ npm install -g https://github.com/CSLTech/lr360-fidem

$ lr360-fidem
```

# Using the repo directly as a console GUI
```sh
$ git clone https://github.com/CSLTech/lr360-fidem
$ npm install
$ npm start
```

# GUI instructions
  - Select an option from the main menu.
  - The sell ticket option creates a prompt for the owner's name. Enter submits, escape cancels.
  - The draw option draws the winner and displays them. Escape returns to the main menu. The lottery is automatically reset.
  - Anywhere in the program, q or ctrl+c ends the program.

# GUI Configuration
The configuration can be derived either from an environment variable or a file in this order:
  - Environment variable FIDEM_CONFIG;
  - File from environment variable FIDEM_CONFIGFILE;
  - File bin/baseConfig.json
The configuration is json and has this format:
```json
{
    "baseFunds": 200,
    "ballCount": 50,
    "ticketPrize": 10,
    "totalPrizeRatio": 0.5,
    "winnerRatios": [0.75, 0.15, 0.1]
}
```
