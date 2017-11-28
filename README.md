# Bopit
Bop It Documentation

The Bop It Game is implemented on the following stack:
1. Vanilla HTML/CSS
2. Vanilla JavaScript
3. Bootstrap CSS components (https://getbootstrap.com/)
4. JQuery Animations (https://jquery.com/)
5. Protractor for spec tests (http://www.protractortest.org/)
6. Howler.js for audio (https://howlerjs.com/
7. grunt and several miscellaneous plugins for running selenium server and protractor tests.

Once you unzip the project, please run:
 1. **npm install** to download dependencies
 2. **npm start** to start the web server, play the game on http://localhost:9000
 3. **npm test** to run protractor tests.
 
Please turn on sound for the complete interactive experience. Its best if you use Google Chrome or Firefox Quantum. Howler.js works best in Safari 11+.

JSHint has been used to check sanity of JavaScript in bopit.js.


About the code:
The central data structure is the gameState object. This object stores the state of the game and is modified by the handleClick event. The game loop is a periodic timer that fires every 20ms determining if the game is in the end state or not. It also updates UI elements.

Upon a correct click by the user, the game state generates the next instruction that the user needs to follow. There is audio feedback for the user regardless of the click. The game state object encapsulates the data and functions that are required to mutate and determine the successful outcome of the game, thereby limiting code that needs to be written across multiple JavaScript callbacks.
