let player = 0;
let playersCount = 2;

let dice1 = 0;
let dice2 = 0;

let cards = [];

document.querySelector("#start").addEventListener("click", startGame);
document.querySelector("#go").addEventListener("click", handleGo);


function startGame() {
    playersCount = parseInt(document.querySelector("#playerCount").value, 10);

    cards = [];
    for (let i = 0; i < playersCount; i++) {
        cards.push([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    }

    player = playersCount - 1;

    document.querySelector("#go").disabled = false;
    document.querySelector("#message").innerHTML = "";
    document.querySelector("#Dice").innerHTML = "Click Draw to start";

    showCards();
}

function handleGo() {

    player = (player + 1) % playersCount;

    dice1 = randNumbFromTo(1, 6);
    dice2 = randNumbFromTo(1, 6);

    showDice();
}

function randNumbFromTo(n, N) {
    return Math.floor(n + Math.random() * (N - n + 1));
}

function showDice() {
    let str = `Player ${player + 1}'s turn:
            <span>
              ${dice1} ⚄ ${dice2}
            </span>
            <div class="choice-buttons">
              <input type="button"
                value="${dice1} & ${dice2}"
                onclick="removeCards(${dice1},${dice2})" />

              <input type="button"
                value="Sum ${dice1 + dice2}"
                onclick="removeCards(${dice1 + dice2})" />
            </div>`;

    document.querySelector("#Dice").innerHTML = str;
    document.querySelector("#message").innerHTML = "";
}

function removeCards(num1, num2) {
    if (num2 === undefined) {
        removeCard(num1, num1);
    } else {
        removeCard(num1, num2);
    }
}

function removeCard(n1, n2) {
    let currentCards = cards[player];
    let message = "";

    // if (!currentCards) return;

    if (currentCards.includes(n1) && currentCards.includes(n2) && n1 !== n2) {
        cards[player] = currentCards.filter((el) => el !== n1 && el !== n2);

        message = `Player ${player + 1} removed ${n1} and ${n2}!`;


        document.querySelector("#Dice").innerHTML = "Click Draw for next turn";
    } else if (n1 === n2 && currentCards.includes(n1)) {
        cards[player] = currentCards.filter((el) => el !== n1);

        message = `Player ${player + 1} removed ${n1}!`;


        document.querySelector("#Dice").innerHTML = "Click Draw for next turn";
    } else {
        message = "You cannot remove these numbers!";

    }

    document.querySelector("#message").innerHTML = message;

    showCards();
    checkWinner();
}

function showCards() {
    let htmlField = "";

    // if (cards.length === 0) {
    //   document.querySelector("#GameField").innerHTML = htmlField;
    //   return;
    // }

    for (let i = 0; i < cards.length; i++) {
        htmlField += `<h3 style="color:#ab9f8c">Player ${i + 1}</h3>`;
        htmlField += '<div class="card-container">';

        cards[i].forEach((num) => {
            htmlField += `<div class="card player-card p${i + 1}">${num}</div>`;
        });

        htmlField += "</div>";
    }

    document.querySelector("#GameField").innerHTML = htmlField;
}

function checkWinner() {
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].length === 0) {
            document.querySelector("#message").innerHTML = `PLAYER ${i + 1} WINS!`;
            document.querySelector("#go").disabled = true;
            document.querySelector("#Dice").innerHTML = "Game Over";
            document.querySelector("#GameField").innerHTML = "";
            return;
        }
    }
}
