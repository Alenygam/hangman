const maxFailures = 8;
let attemptsLeft = maxFailures;
let failedChars = [];
let exposedChars;

main()

async function main() {
  const details = await getLanguage(localStorage.getItem("hangman_language"));
  const words = details.words;

  const randomNumber = getRandomNumberFromRange(0, words.length - 1);
  const randomWordAsArray = words[randomNumber].split('');
  console.log(randomWordAsArray);

  exposedChars = initializePlayingField(randomWordAsArray);
  handleButtons(randomWordAsArray);
  handleLanguages();
}

async function handleLanguages() {
  const languageList = await getLanguages();
  var isopen = false;
  const languagesContainer = document.querySelector('#languages-box');

  languageList.forEach((element) => {
    const button = document.createElement('button');
    button.innerText = element;
    button.onclick = () => setLanguage(element);
    languagesContainer.appendChild(button);
  })

  const languagesButton = document.querySelector("#languages-button");
  languagesButton.addEventListener("click", () => {
    isopen = !isopen;
    openLanguagePopup(isopen);
  })
  document.querySelector("#languages-button-close").addEventListener("click", () => {
    isopen = false;
    openLanguagePopup(isopen);
  })
}

function openLanguagePopup(toopen) {
  if (toopen) {
    document.querySelector("#languages-container").classList.remove('hide');
  } else {
    document.querySelector("#languages-container").classList.add('hide');
  }
}

function handleButtons(word) {
  const lettersOfTheAlphabet = [
    "a", "b", "c", "d", "e", "f",
    "g", "h", "i", "j", "k", "l",
    "m", "n", "o", "p", "q", "r",
    "s", "t", "u", "v", "w", "x",
    "y", "z"
  ]

  lettersOfTheAlphabet.forEach((e) => {
    const key = document.querySelector(`.key.${e}`);
    if (exposedChars.includes(e)) {
      key.classList.add('success');
    }
    key.addEventListener("click", () => {
      if (exposedChars.includes(e) || failedChars.includes(e)) return;
      if (!word.includes(e)) {
        key.classList.add('failed');
        failedChars.push(e);
        attemptsLeft--;
        updateHangman(word);
        return;
      }

      key.classList.add('success');
      exposedChars.push(e);
      updateWord(e, word)
      return;
    })
  })
}

function updateWord(char, word) {
  const indexes = getAllIndexes(word, char);
  indexes.forEach(e => {
    const element = document.querySelector(`.char.index${e}`)
    element.innerText = char;
  })
  
  if (includesAll(word, exposedChars)) {
    const winning = document.querySelector("#winning")
    winning.classList.remove('hide');
    const winningText = document.querySelector("#winning > .innerpopup");
    winningText.innerHTML = `You won!<br><br>`;
    const button = document.createElement('button');
    button.innerText = "Play again";
    button.onclick = () => location.reload();
    winningText.appendChild(button);
  }
}

/**
  * Updates the hangman's level of death
  *
  * @returns nothing
  */
function updateHangman(word) {
  document.querySelector('#failures').innerText = attemptsLeft;
  if (attemptsLeft === 0) {
    const losing = document.querySelector("#losing")
    losing.classList.remove('hide');
    const losingText = document.querySelector("#losing > .innerpopup");
    losingText.innerHTML = `You lost, the word was <b>${word.join('')}</b><br><br>`;
    const button = document.createElement('button');
    button.innerText = "Try again";
    button.onclick = () => location.reload();
    losingText.appendChild(button);
    return;
  }
  const thingsToChange = {
    7: "pole",
    6: "head",
    5: "body",
    4: "leg1",
    3: "leg2",
    2: "arm1",
    1: "arm2",
  }

  const elements = document.querySelectorAll(`.${thingsToChange[attemptsLeft]}`);
  console.log(elements);

  elements.forEach((e) => e.classList.remove('hide'));
}

/**
  * Initializes word with underscores instead of character for game
  *
  * @param word {Array} Word split in Array.
  *
  * @return array of chars that have been exposed
  */
function initializePlayingField(word) {
  document.querySelector('#failures').innerText = attemptsLeft;
  const exposed = charsToExpose(word);

  word.forEach((element, index) => {
    const span = document.createElement('span');
    if (exposed.includes(element)) {
      span.innerText = element;
    } else {
      span.innerText = "_";
    }
    span.className = `char index${index}`;
    document.querySelector('#text').appendChild(span);
  })

  return Array.from(new Set(exposed));
}

/**
  * Gets words to expose at initialization
  *
  * @param word {Array} Word split in Array.
  *
  * @return array of chars to expose
  */
function charsToExpose(word) {
  const exposed = [];
  const nToExpose = Math.floor(word.length / 2);
  for (let i = 0; i < nToExpose; i++) {
    if (!generateRandomBoolean()) continue;
    const randomIndexInWord = getRandomNumberFromRange(0, word.length - 1);
    exposed.push(word[randomIndexInWord]);
  }

  return exposed;
}

/**
  * Gets all elements of indexes in array.
  *
  * @param arr {Array} array to search in
  * @param val {} value to search for in the array
  *
  * @return array of indexes of val
  */
function getAllIndexes(arr, val) {
  var indexes = [], i = -1;
  while ((i = arr.indexOf(val, i + 1)) != -1) {
    indexes.push(i);
  }
  return indexes;
}

/**
  * Checks if all elements of arr1 are included in arr2
  *
  * @param arr1 {Array}
  * @param arr2 {Array}
  *
  * @return true if all elements included, false if not.
  */
function includesAll(arr1, arr2) {
  for (element of arr1) {
    if (!arr2.includes(element)) return false;
  }
  return true;
}

/**
  * Gets random boolean
  *
  * @return random boolean
  */
function generateRandomBoolean() {
  return Math.random() >= 0.5;
}

/**
  * Returns random number in range inclusive of min and max.
  *
  * @param min {Number} minimum number in range
  * @param max {Number} maximum number in range
  *
  * @returns random Number between range
  */
function getRandomNumberFromRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
  * Function that fetches language
  *
  * @param language {String} language to get fetched, if undefined it's set to english by default.
  *
  * @return json of language
  */
async function getLanguage(language = "english") {
  localStorage.setItem("hangman_language", language)
  return await fetch(`/languages/${language}.json`).then(res => res.json())
}

async function getLanguages() {
  return await fetch(`/languages/languages.json`).then(res => res.json());
}

function setLanguage(language) {
  localStorage.setItem("hangman_language", language);
  location.reload();
}
