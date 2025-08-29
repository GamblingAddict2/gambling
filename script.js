// --- Shared Money System ---
if (localStorage.getItem("money") === null) {
  localStorage.setItem("money", "200"); // start with $200
}
if (localStorage.getItem("luck") === null) {
  localStorage.setItem("luck", "1"); // base luck
}

function updateMoneyDisplay() {
  const money = parseInt(localStorage.getItem("money"));
  document.querySelectorAll("#money").forEach(el => el.textContent = "Money: $" + money);
}

// --- SLOT MACHINE LOGIC ---
if (document.title.includes("Slot Machine")) {
  const spinBtn = document.getElementById("spinBtn");
  const result = document.getElementById("result");
  const cooldownEl = document.getElementById("cooldown");
  const upgradeBtn = document.getElementById("luckUpgrade");
  const arrow = document.getElementById("arrow");

  let cooldown = false;

  updateMoneyDisplay();

  function spin() {
    if (cooldown) return;
    let money = parseInt(localStorage.getItem("money"));
    let luck = parseInt(localStorage.getItem("luck"));
    if (money < 10) {
      result.textContent = "Not enough money!";
      return;
    }
    localStorage.setItem("money", money - 10);
    updateMoneyDisplay();

    const symbols = ["🍒","🍋","🍊","🍇","🍉","🍀","7️⃣"];
    const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
    const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
    const slot3 = symbols[Math.floor(Math.random() * symbols.length)];

    document.getElementById("slot1").textContent = slot1;
    document.getElementById("slot2").textContent = slot2;
    document.getElementById("slot3").textContent = slot3;

    let winnings = 0;
    if (slot1 === slot2 && slot2 === slot3) {
      winnings = 500 * luck;
      result.textContent = "🎉 TRIPLE! You won $" + winnings + "!";
    } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      winnings = 100 * luck;
      result.textContent = "✨ Double match! You won $" + winnings + "!";
    } else {
      result.textContent = "No win this time.";
    }

    localStorage.setItem("money", parseInt(localStorage.getItem("money")) + winnings);
    updateMoneyDisplay();

    // Cooldown (3 sec)
    cooldown = true;
    spinBtn.disabled = true;
    let timeLeft = 3;
    cooldownEl.textContent = "Cooldown: " + timeLeft;
    const interval = setInterval(() => {
      timeLeft--;
      cooldownEl.textContent = timeLeft > 0 ? "Cooldown: " + timeLeft : "";
      if (timeLeft <= 0) {
        cooldown = false;
        spinBtn.disabled = false;
        clearInterval(interval);
      }
    }, 1000);

    // Unlock Blackjack
    if (parseInt(localStorage.getItem("money")) >= 2000) {
      arrow.style.display = "block";
    }
  }

  spinBtn.addEventListener("click", spin);

  upgradeBtn.addEventListener("click", () => {
    let money = parseInt(localStorage.getItem("money"));
    if (money >= 500) {
      localStorage.setItem("money", money - 500);
      localStorage.setItem("luck", parseInt(localStorage.getItem("luck")) + 1);
      updateMoneyDisplay();
      result.textContent = "Luck upgraded! 🍀";
    } else {
      result.textContent = "Not enough money!";
    }
  });
}

// --- BLACKJACK LOGIC ---
if (document.title.includes("Blackjack")) {
  const dealBtn = document.getElementById("dealBtn");
  const hitBtn = document.getElementById("hitBtn");
  const standBtn = document.getElementById("standBtn");
  const betInput = document.getElementById("bet");
  const playerHandDiv = document.getElementById("playerHand");
  const dealerHandDiv = document.getElementById("dealerHand");
  const playerScoreP = document.getElementById("playerScore");
  const dealerScoreP = document.getElementById("dealerScore");
  const statusP = document.getElementById("status");

  updateMoneyDisplay();

  let deck = [];
  let playerHand = [];
  let dealerHand = [];

  function createDeck() {
    const suits = ["♠", "♥", "♦", "♣"];
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    deck = [];
    for (let suit of suits) {
      for (let value of values) {
        deck.push({ value, suit });
      }
    }
    deck.sort(() => Math.random() - 0.5);
  }

  function getCardValue(card) {
    if (["J", "Q", "K"].includes(card.value)) return 10;
    if (card.value === "A") return 11;
    return parseInt(card.value);
  }

  function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    for (let card of hand) {
      score += getCardValue(card);
      if (card.value === "A") aces++;
    }
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    return score;
  }

  function renderHands(hideDealer = true) {
    playerHandDiv.textContent = playerHand.map(c => c.value + c.suit).join(" ");
    playerScoreP.textContent = "Score: " + calculateScore(playerHand);

    if (hideDealer) {
      dealerHandDiv.textContent = dealerHand[0].value + dealerHand[0].suit + " [?]";
      dealerScoreP.textContent = "Score: ?";
    } else {
      dealerHandDiv.textContent = dealerHand.map(c => c.value + c.suit).join(" ");
      dealerScoreP.textContent = "Score: " + calculateScore(dealerHand);
    }
  }

  function endRound() {
    const playerScore = calculateScore(playerHand);
    let dealerScore = calculateScore(dealerHand);

    // Dealer hits until 17+
    while (dealerScore < 17) {
      dealerHand.push(deck.pop());
      dealerScore = calculateScore(dealerHand);
    }

    renderHands(false);

    let money = parseInt(localStorage.getItem("money"));
    const bet = parseInt(betInput.value);
    let result = "";

    if (playerScore > 21) {
      result = "You busted! 💥";
      money -= bet;
    } else if (dealerScore > 21 || playerScore > dealerScore) {
      result = "You win! 🎉";
      money += bet;
    } else if (playerScore < dealerScore) {
      result = "You lose! 😢";
      money -= bet;
    } else {
      result = "Push (Tie).";
    }

    localStorage.setItem("money", money);
    updateMoneyDisplay();
    statusP.textContent = result;

    hitBtn.disabled = true;
    standBtn.disabled = true;
    dealBtn.disabled = false;
  }

  dealBtn.addEventListener("click", () => {
    let money = parseInt(localStorage.getItem("money"));
    const bet = parseInt(betInput.value);
    if (bet > money) {
      statusP.textContent = "Not enough money!";
      return;
    }

    createDeck();
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];

    renderHands(true);

    statusP.textContent = "";
    hitBtn.disabled = false;
    standBtn.disabled = false;
    dealBtn.disabled = true;
  });

  hitBtn.addEventListener("click", () => {
    playerHand.push(deck.pop());
    renderHands(true);

    if (calculateScore(playerHand) > 21) {
      endRound();
    }
  });

  standBtn.addEventListener("click", endRound);
}
