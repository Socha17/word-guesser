// script.js

class WordScrambleGame {
  constructor() {
    this.usernameLabel = document.querySelector('#username');
    this.attemptsLeftLabel = document.querySelector('#attemptsLeft');
    this.roundLabel = document.querySelector('#round');
    this.scrambledWordDisplay = document.querySelector('#scrambledWord');
    this.optionsContainer = document.querySelector('#optionsContainer');
    this.messageDisplay = document.querySelector('#message');
    this.pointsDisplay = document.querySelector('#points');
    this.timerDisplay = document.querySelector('#timer');
    this.nextRoundButton = document.querySelector('#nextRoundButton');
    this.restartButton = document.querySelector('#restartButton');
    this.timerCircle = document.querySelector('.timer-circle');
    this.gameOverOverlay = document.querySelector('#gameOverOverlay');
    this.gameOverMessage = document.querySelector('#gameOverMessage');

    // Bind event listeners
    this.nextRoundButton.addEventListener('click', () => this.startNewRound());
    this.restartButton.addEventListener('click', () => this.restartGame());

    // Listen for messages from Devvit app
    window.addEventListener('message', (ev) => this.onMessage(ev));

    // Game state variables
    this.attemptsLeft = 3;
    this.round = 1;
    this.word = '';
    this.scrambledWord = '';
    this.timer = 20;
    this.timerInterval = null;
    this.correctGuesses = 0;
    this.wrongGuesses = 0;
  }

  onMessage(ev) {
    const { type, data } = ev.data;

    // Reserved type for messages sent via `context.ui.webView.postMessage`
    if (type === 'devvit-message') {
      const message = data.message;

      // Load initial data
      if (message.type === 'initialData') {
        const { username } = message.data;
        this.usernameLabel.innerText = username;
        this.startNewRound();
      }
    }
  }

  startNewRound() {
    this.nextRoundButton.style.display = 'none';
    // this.restartButton.style.display = 'none'; // Hide restart button if it's visible
    this.gameOverOverlay.style.display = 'none'; // Hide overlay if it's visible
    this.optionsContainer.innerHTML = '';
    this.messageDisplay.innerText = '';

    // Expanded list of words (approx. four times the original)
    const WORDS = [
      // Original words
      'banana', 'cherry', 'orange', 'grapes', 'peach', 'mango', 'papaya',
      'avocado', 'lettuce', 'spinach', 'broccoli', 'pumpkin', 'cabbage', 'carrots',
      'tomato', 'coconut', 'cucumber', 'eggplant', 'garlic', 'ginger', 'peppers',
      'radish', 'zucchini', 'potato', 'onions',
      // Additional words
      'strawberry', 'blueberry', 'raspberry', 'blackberry', 'watermelon', 'kiwifruit',
      'pineapple', 'apricot', 'nectarine', 'pomegranate', 'grapefruit', 'lime',
      'lemon', 'tangerine', 'cantaloupe', 'honeydew', 'fig', 'date', 'plum', 'passionfruit',
      'dragonfruit', 'jackfruit', 'lychee', 'guava', 'persimmon', 'quince', 'kumquat',
      'durian', 'rambutan', 'elderberry', 'gooseberry', 'mulberry', 'boysenberry',
      'cranberry', 'currant', 'physalis', 'tamarind', 'pomelo', 'starfruit',
      'longan', 'sapodilla', 'cherimoya', 'feijoa', 'jambul', 'jabuticaba', 'ackee',
      'soursop', 'breadfruit', 'salak', 'bilberry', 'huckleberry', 'marionberry',
      'cloudberry', 'medlar', 'miraclefruit', 'naranjilla', 'pitaya', 'santol',
      'yuzu', 'ziziphus', 'loquat', 'tamarillo', 'cashew', 'jicama', 'sapote',
      'camu camu', 'blackcurrant', 'whitecurrant', 'redcurrant', 'elderflower',
      'figs', 'dates', 'prunes', 'raisins', 'sultanas', 'mulberries', 'cranberries',
      'apples', 'pears', 'plums', 'kiwis', 'lemons', 'limes', 'oranges', 'grapefruits',
      'tangerines', 'clementines', 'mandarins', 'nectarines', 'apricots', 'peaches'
    ];

    // Select a random word
    this.word = WORDS[Math.floor(Math.random() * WORDS.length)];

    // Generate scrambled word
    this.scrambledWord = this.shuffleWord(this.word);

    // Ensure scrambled word is not the same as the original
    let attempts = 0;
    while (this.scrambledWord.toLowerCase() === this.word.toLowerCase() && attempts < 10) {
      this.scrambledWord = this.shuffleWord(this.word);
      attempts++;
    }

    // Update scrambled word display
    this.scrambledWordDisplay.innerText = this.scrambledWord.toUpperCase();

    this.roundLabel.innerText = this.round;
    this.attemptsLeftLabel.innerText = this.attemptsLeft;

    // Start timer
    // Timer decreases by 2 seconds each correct guess, but not less than 3 seconds
    this.timer = Math.max(3, 20 - (this.correctGuesses * 2) - (this.wrongGuesses * 4));
    this.updateTimerDisplay();
    this.startTimer();

    // Generate multiple-choice options
    this.generateOptions(WORDS);
  }

  shuffleWord(word) {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join('');
  }

  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    const totalTime = this.timer;
    const circumference = 2 * Math.PI * 36; // r = 36

    // Reset stroke-dasharray and stroke-dashoffset
    this.timerCircle.style.strokeDasharray = circumference;
    this.timerCircle.style.strokeDashoffset = 0; // Start fully green
    this.timerCircle.style.transition = 'none';

    // Force reflow to apply the styles immediately
    this.timerCircle.getBoundingClientRect();

    // Set the transition duration to match the total time
    this.timerCircle.style.transition = `stroke-dashoffset ${totalTime}s linear`;

    // Start the animation by setting stroke-dashoffset to circumference
    this.timerCircle.style.strokeDashoffset = circumference;

    // Update the timer display
    this.updateTimerDisplay();

    // Start the timer interval to update the numeric display
    this.timerInterval = setInterval(() => {
      this.timer--;
      this.updateTimerDisplay();

      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.onTimeUp();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    this.timerDisplay.innerText = this.timer;
  }

  generateOptions(WORDS) {
    const options = [this.word];

    // Generate decoy words until we have 8 options
    while (options.length < 8) {
      const decoy = WORDS[Math.floor(Math.random() * WORDS.length)];
      if (!options.includes(decoy)) {
        options.push(decoy);
      }
    }

    // Shuffle the options
    options.sort(() => Math.random() - 0.5);

    // Display the options
    options.forEach((option) => {
      const btn = document.createElement('button');
      btn.innerText = option;
      btn.className = 'option-button';
      btn.addEventListener('click', () => this.onOptionSelected(option));
      this.optionsContainer.appendChild(btn);
    });
  }

  onOptionSelected(selectedWord) {
    if (selectedWord.toLowerCase() === this.word.toLowerCase()) {
      this.messageDisplay.innerText = '🎉 Correct! Click "Next Round" to continue.';
      this.round++;
      this.correctGuesses++;
      this.pointsDisplay.innerText = this.correctGuesses;

      // Check for win condition
      if (this.correctGuesses >= 50) {
        this.winGame();
        return;
      }
    } else {
      this.attemptsLeft--;
      this.attemptsLeftLabel.innerText = this.attemptsLeft;
      this.messageDisplay.innerText = 'Incorrect. Click "Next Round" to continue.';
      this.wrongGuesses++;
    }

    clearInterval(this.timerInterval);
    this.disableOptions();

    if (this.attemptsLeft <= 0) {
      this.gameOver();
    } else {
      this.nextRoundButton.style.display = 'inline-block';
    }
  }

  onTimeUp() {
    this.attemptsLeft--;
    this.wrongGuesses++;
    this.attemptsLeftLabel.innerText = this.attemptsLeft;
    this.messageDisplay.innerText = `⏰ Time's up! The word was "${this.word}". Click "Next Round" to continue.`;
    this.disableOptions();

    clearInterval(this.timerInterval);

    if (this.attemptsLeft <= 0) {
      this.gameOver();
    } else {
      this.nextRoundButton.style.display = 'inline-block';
    }
  }

  disableOptions() {
    this.optionsContainer.querySelectorAll('button').forEach((btn) => {
      btn.disabled = true;
    });
  }

  winGame() {
    this.messageDisplay.innerText = ''; // Clear any existing messages
    this.disableOptions();
    this.nextRoundButton.style.display = 'none';
    clearInterval(this.timerInterval);

    // Update game over message
    this.gameOverMessage.innerText = '🏆 Congratulations! You have won the game!';

    // Show overlay
    this.gameOverOverlay.style.display = 'flex';
    
  }

  gameOver() {
    this.messageDisplay.innerText = ''; // Clear any existing messages
    this.disableOptions();
    this.nextRoundButton.style.display = 'none';
    clearInterval(this.timerInterval);
  
    // Update game over message with score
    this.gameOverMessage.innerText = `Game Over! The word was "${this.word}". You scored ${this.correctGuesses} points.`;
  
    // Show overlay
    this.gameOverOverlay.style.display = 'flex';

  }
  

  restartGame() {
    // Reset game state variables
    this.attemptsLeft = 3;
    this.round = 1;
    this.correctGuesses = 0;
    this.wrongGuesses = 0;
    this.gameOverOverlay.style.display = 'none'; // Hide overlay
    this.startNewRound();
  }
}

new WordScrambleGame();
