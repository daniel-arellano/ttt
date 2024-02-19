const contestant = {
  "player": { teamSymbol: "" },
  "bot": { teamSymbol: "" }
}

const claimedSquares = {
  "a1": 1, "b1": 1, "c1": 1,
  "a2": 1, "b2": 1, "c2": 1,
  "a3": 1, "b3": 1, "c3": 1
}

const laneTotals = {
  "top": 1, "mid": 1, "bom": 1,
  "lef": 1, "cen": 1, "rit": 1,
  "dag": 1, "nol": 1
};

const laneCodes = {
  "top": "c0", "mid": "c0", "bom": "c0",
  "lef": "c0", "cen": "c0", "rit": "c0",
  "dag": "c0", "nol": "c0"
}

const laneDetails = {
  "top": ["a1", "b1", "c1"],
  "mid": ["a2", "b2", "c2"],
  "bom": ["a3", "b3", "c3"],
  "lef": ["a1", "a2", "a3"],
  "cen": ["b1", "b2", "b3"],
  "rit": ["c1", "c2", "c3"],
  "dag": ["a1", "b2", "c3"],
  "nol": ["a3", "b2", "c1"],
  "cor": ["a1", "c1", "a3", "c3"],
  "sid": ["b1", "a2", "c2", "b3"]
};

const laneTotalToCode = {
  1: "c0",
  3: "p1",
  5: "b1",
  9: "p2",
  15: "c1",
  25: "b2",
  27: "p3",
  45: "s2",
  75: "s1",
  125: "b3"
};

let isBoardActive = false;
let isPlayerTurn = false;
//const coinFlip = () => Math.floor(Math.random() * 2);

const gameTextElement = document.querySelector(".text");
const squareElement = document.querySelectorAll(".square");
const buttonElement = document.querySelectorAll(".choice");

setupNewGame();

function setupNewGame() {
  updateSquareStates("forNewGame");
  teamSymbolSelect();
}

function teamSymbolSelect() {
  gameTextElement.innerText = "Pick your team!";
  updateButtons("teamSelect", "show", false);
  updateButtons("reloadSelect", "hide", true);
  document.getElementById("buttonTeamX").addEventListener("click", () => setTeamSymbol("X", "O"));
  document.getElementById("buttonTeamO").addEventListener("click", () => setTeamSymbol("O", "X"));
}

function setTeamSymbol(playerTeam, botTeam) {
  contestant.player.teamSymbol = playerTeam;
  contestant.bot.teamSymbol = botTeam;
  updateButtons("teamSelect", "hide", true);
  startFirstTurn();
}

function startFirstTurn() {
  gameTextElement.innerText = "Good Luck!";
  updateSquareStates("forFirstTurn");
  updateButtons("swatchSelect", "hide", true);
  isBoardActive = true;
  isPlayerTurn = true;
  !isPlayerTurn ? botTurn() : null;
}

document.addEventListener("click", function(event) {
  if (isBoardActive && isPlayerTurn) {
    const square = event.target.closest(".square");
    if (square) {
      const forWho = isPlayerTurn ? "player" : "bot";
      claimedSquares[square.id] = isPlayerTurn ? 3 : 5;
      updateSquareStates("forClaimedSquare", forWho, square);
      updateLaneTotals();
      isPlayerTurn = !isPlayerTurn;
      setTimeout(botTurn, 500);
    }
  }
});

function botTurn() {
  if (isBoardActive && !isPlayerTurn) {
    /* CHECKS FOR BOT WIN OPPORTUNITY */
    if (Object.values(laneCodes).includes("b2")) {
      const chosenLane = Object.keys(laneCodes).filter(key => laneCodes[key] === "b2");
      chosenLane.find(lane => { //was forEach trying .find instead
        const chosenSquare = laneDetails[lane].find(key => claimedSquares[key] === 1);
        updateSquareStates("forClaimedSquare", "bot", document.getElementById(chosenSquare));
        afterBotTurn(chosenSquare);
      });
      /* CHECKS FOR BOT BLOCK OPPORTUNITY */
    } else if (Object.values(laneCodes).includes("p2")) {
      const chosenLaneKeys = Object.keys(laneCodes).filter(key => laneCodes[key] === "p2");
      for (const lane of chosenLaneKeys) {
        const chosenSquare = laneDetails[lane].find(key => claimedSquares[key] === 1);
        if (chosenSquare) {
          updateSquareStates("forClaimedSquare", "bot", document.getElementById(chosenSquare));
          afterBotTurn(chosenSquare);
          break;
        }
      }
      /* CHECKS FOR MIDDLE SQUARE AVAILABILITY */
    } else if (claimedSquares.b2 === 1) { // middle square
      const chosenSquare = "b2";
      updateSquareStates("forClaimedSquare", "bot", document.getElementById(chosenSquare));
      afterBotTurn(chosenSquare);
    } /* LOOKS FOR AN OPEN CORNER SQUARE */
      else if (Object.values(laneCodes).includes("b1")) {
        const cornArr = Object.values(laneDetails.cor).filter(value => claimedSquares[value] === 1);
        const chosenSquare = cornArr[Math.floor(Math.random() * cornArr.length)];
        if (chosenSquare) {
          updateSquareStates("forClaimedSquare", "bot", document.getElementById(chosenSquare));
          afterBotTurn(chosenSquare);
          return;
        }
      /* ELSE CHOSES RANDOMLY */
    } else {
      const randArr = Object.keys(claimedSquares).filter(key => claimedSquares[key] === 1);
      if (randArr.length === 0) return;
      const chosenSquare = randArr[Math.floor(Math.random() * randArr.length)];
      updateSquareStates("forClaimedSquare", "bot", document.getElementById(chosenSquare));
      afterBotTurn(chosenSquare);
    }
  }
}

function afterBotTurn(square) {
  claimedSquares[square] = 5;
  updateLaneTotals();
  isPlayerTurn = !isPlayerTurn;
}

function updateLaneTotals() {
  const laneDetailArray = Object.entries(laneDetails);
  laneDetailArray.forEach(([laneName, squareIds]) => {
    const productOfLane = squareIds.reduce((acc, squareId) => acc * claimedSquares[squareId], 1);
    laneTotals[laneName] = productOfLane;
    laneCodes[laneName] = laneTotalToCode[productOfLane];
    checkEndConditions();
  });
}

function checkEndConditions() {
  Object.values(laneCodes).includes("p3")
    ? postGameCleanup("player")
    : Object.values(laneCodes).includes("b3")
    ?  postGameCleanup("bot")
    : !Object.values(claimedSquares).includes(1)
    ?  postGameCleanup("tie")
    : null;
}

function postGameCleanup(result) {
  isBoardActive = false;
  gameTextElement.innerText = result === "player"
    ? "You Win!" 
    : result === "bot"
    ? "Bot wins."
    : result === "tie"
    ? "Tie Game."
    : null;
  updateButtons("reloadSelect", "show", false);
  updateSquareStates("forEndOfGame");
  document.getElementById("buttonReset").addEventListener("click", () => resetValues());
}

function resetValues() {
  Object.keys(claimedSquares).forEach(key => claimedSquares[key] = 1);
  Object.keys(laneTotals).forEach(key => laneTotals[key] = 1);
  Object.keys(laneCodes).forEach(key => laneCodes[key] = "c0");
  Object.keys(contestant).forEach(key => contestant[key].teamSymbol = "");
  isPlayerTurn = false;
  setupNewGame();
}

function updateButtons(forButtonGroup, visibility, isInactive) {
  buttonElement.forEach(button => {
    if (button.classList.contains(forButtonGroup)) {
      button.classList.toggle("hide", visibility === "hide");
      button.disabled = isInactive;
    }
  });
}

function updateSquareStates(forState, forWho, square) {
  if (forState === "forClaimedSquare") {
    square.classList.replace("active", "claimed");
    square.classList.add(forWho);
    square.innerText = contestant[forWho].teamSymbol;
    square.disabled = true;
  }

  squareElement.forEach(square => {
    switch (forState) {
      case "forNewGame":
        square.classList.replace("claimed", "new");
        square.classList.remove("bot", "player");
        square.innerText = "";
        break;
      case "forFirstTurn":
        square.classList.replace("new", "active");
        square.disabled = false;
        break;
      case "forEndOfGame":
        square.classList.replace("active", "new");
        square.disabled = true;
        break;
    }
  });
}