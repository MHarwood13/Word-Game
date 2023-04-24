
document.addEventListener("DOMContentLoaded", function() {
    document.body.classList.add("loaded");
  });


const xIcon = document.getElementById("button");
const popup = document.querySelector(".popup-overlay");
const letters = document.querySelectorAll(".tile");
const answerLength = 5;
const rounds = 6;


xIcon.addEventListener("click", function() {
    popup.style.visibility = "hidden";
})

async function init() {
    let currentGuess = '';
    let currentRow = 0;

    const response = await fetch("https://words.dev-apis.com/word-of-the-day");
    const responseObject = await response.json();
    const word = responseObject.word.toUpperCase();
    const wordLetters = word.split("");
    let done = false;



    function addLetter (letter) {
        if (currentGuess.length < answerLength) {
            // add letter to the end
            currentGuess += letter;
        } else {
            // replace the last letter
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }
        letters[answerLength * currentRow + currentGuess.length - 1].innerText = letter;
    }

    async function commit() {
        if (currentGuess.length !== answerLength) {
            // do nothing
            return;
        }


        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({word: currentGuess})
        });

       const resObj = await res.json();
       const validWord = resObj.validWord;


       if (!validWord) {
        markInvalidWord();
        return;
       }


       const guessLetters = currentGuess.split((""));
       const map = makeMap(wordLetters);


       for (let i = 0; i < answerLength; i++) {
        // mark as correct
        if (guessLetters[i] === wordLetters[i]) {
            letters[currentRow * answerLength + i].classList.add("correct");
            map[guessLetters[i]]--;
        }
       }

       for (let i = 0; i < answerLength; i++) {
        if (guessLetters[i] === wordLetters[i]) {
            // do nothing we already did it
        } else if (wordLetters.includes(guessLetters[i]) && map[guessLetters[i]] > 0) {
            letters[currentRow * answerLength + i].classList.add("close");
            map[guessLetters[i]]--;
        } else {
            letters[currentRow * answerLength + i].classList.add("wrong");
        }
       }

       currentRow++;

       if (currentGuess == word) {
           // win
           alert('You Win!!');
           done = true;
           return;
        }

        else if (currentRow === rounds) {
            alert(`You Lose. The word was ${word}`);
            done = true;
        }

        currentGuess = '';
    }

    function backspace() {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[answerLength * currentRow + currentGuess.length].innerText = '';
    }

    document.addEventListener('keydown', function handleKeyPress (event) {

        if (done) {
        // do nothing
        return;
        }

        const action = event.key;

        if (action === "Enter") {
            commit();
        } else if (action === "Backspace") {
            backspace();
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase())
        } else {
            // do nothing
        }
    });
}

function markInvalidWord () {
    alert("Not a valid word");
}

function isLetter (letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function makeMap (array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
        const letter = array[i];
        if (obj[letter]) {
            obj[letter]++
        } else {
            obj[letter] = 1;
        }
    }
    return obj;
}

init();
