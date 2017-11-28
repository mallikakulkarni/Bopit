"use strict";
/* global Howl, $*/
/* jshint -W097 */
/**
 * Constants
 */
var constants = {
    DEFEAT: "Awww!",
    CORRECT: "Correct",
    STARTING: "Starting...",
    FINISHED: "You finished in ",
    MINUTES: "Minutes",
    SECONDS: "Seconds",
    CLOCK_UPDATE_INTERVAL_MS: 1000,
    STARTING_INTERVAL_MS: 4444,
    SPEEDUP_FACTOR: 0.05,
    SOUND_SPEEDUP_FACTOR: 0.02,
    GAMESTATE_EVALUATOR_INTERVAL_MS: 20
};

/**
 * Array of next action choices
 */
var actionChoices = [
    {
        name: "Pull It",
        sound: new Howl({
            src: ["sfx/en/VO_Pull.mp3"]
        })
    },
    {
        name: "Twist It",
        sound: new Howl({
            src: ["sfx/en/VO_Twist.mp3"]
        })
    },
    {
        name: "Bop It",
        sound: new Howl({
            src: ["sfx/en/VO_Bop.mp3"]
        })
    }
];

/**
 * Object that holds the current game state
 */
var gameState = {
    state: "STOPPED",
    currentGameoverTimeoutMS: constants.STARTING_INTERVAL_MS,
    startTime: undefined,
    score: 0,
    incrementScore: function () {
        this.score += 1;
    },
    durationSeconds: function () {
        return Math.round((Date.now() - this.startTime) / 1000);
    },
    reset: function () {
        clearInterval(this.gameDurationTimerInterval);
        clearInterval(this.gameStateEvaluatorInterval);
        this.state = "STOPPED";
        this.score = 0;
    },
    stop: function () {
        this.state = "STOPPED";
    },
    play: function () {
        this.currentGameoverTimeoutMS = constants.STARTING_INTERVAL_MS;
        this.state = "IN_PLAY";
        this.startTime = Date.now();
    },
    isWinningAction: function (actionName) {
        return (this.nextExpectedAction.name === actionName);
    },
    didUserExceedTimeBudget: function () {
        var diff = (Date.now() - this.nextActionStartTime);
        return {
            diff: diff,
            status: (diff > this.currentGameoverTimeoutMS)
        };
    },
    isInPlay: function () {
        return this.state === "IN_PLAY";
    },
    gameDurationTimerInterval: null,
    nextExpectedAction: undefined,
    nextActionStartTime: 0,
    gameStateEvaluatorInterval: null
};

/**
 * Object that holds game sounds
 */
var gameSounds = {
    gameloop: new Howl({
        src: ["sfx/MUSIC_GameLoop_03b.mp3"],
        autoplay: false,
        loop: true,
        volume: 0.75
    }),
    keepTrying: new Howl({
        src: ["sfx/en/VO_Banter_08.mp3"]
    }),
    gameover: new Howl({
        src: ["sfx/en/VO_Die_02.mp3"],
        onend: function () {
            return gameSounds.keepTrying.play();
        }
    })
};


/**
 * Creates green to red gradient
 *
 * @param value must be between 0 and 1
 * @returns {string}
 */
function getColor(value) {
    var hue = ((1 - value) * 120);
    var result = ["hsl(", hue.toString(10), ",100%,50%)"];
    return result.join("");
}

/**
 * Given seconds, formats time in to human readable format
 * @param seconds
 * @returns {string}
 */
function formatTime(seconds) {
    var time = "";
    var min = Math.floor(seconds / 60);
    if (min > 0) {
        time += min + " " + constants.MINUTES;
    }
    time += (seconds % 60) + " " + constants.SECONDS;
    return time;
}

/**
 * Handles game over event
 */
function handleGameOverEvent() {
    if (gameState.isInPlay()) {
        $("#instr").html(constants.FINISHED + formatTime(gameState.durationSeconds()));
        $("#countdown").hide();
        gameState.stop();
        gameSounds.gameloop.stop();
        gameSounds.gameover.play();
        $(".gameActionButton").attr("disabled", "disabled");
    }
}

/**
 * Function that decides the next action that the user must
 * perform successfully. It also recalculates the time interval
 * the user has to perform the action.
 */
function selectNextActionAndRecalculateGameOverTimeout() {
    if (gameState.isInPlay()) {
        var next = Math.floor(Math.random() * 3);

        if (gameState.nextExpectedAction !== undefined) {
            gameState.nextExpectedAction.sound.stop();
        }

        gameState.nextExpectedAction = actionChoices[next];
        gameState.currentGameoverTimeoutMS -= (gameState.currentGameoverTimeoutMS * constants.SPEEDUP_FACTOR);

        $("#instr").html(actionChoices[next].name);

        var speedup = Math.min(2, 1 + (gameState.score * constants.SOUND_SPEEDUP_FACTOR));

        actionChoices[next].sound.rate(speedup);
        actionChoices[next].sound.play();

        gameState.nextActionStartTime = Date.now();
    }
}

/**
 * Handles user's click event. Determines whether or not the user has
 * clicked the correct button.
 *
 * @param e
 */
function handleClick(e) {
    var message = e.target.dataset.actionname;
    var soundClip = e.target.dataset.clicksound;
    var sound = new Howl({
        src: ["sfx/" + soundClip]
    });

    sound.play();

    if (message) {
        var btnMsg = "";

        if (gameState.isWinningAction(message)) {
            btnMsg = constants.CORRECT;
            gameState.incrementScore();
            selectNextActionAndRecalculateGameOverTimeout();
        } else {
            btnMsg = constants.DEFEAT;
            handleGameOverEvent();
        }

        $(e.target).html(btnMsg);
        $("#score").html(gameState.score);

        setTimeout(function () {
            $(e.target).html($(e.target)[0].dataset.actionname).blur();
        }, 500);
    }
}

/**
 * Shows start screen
 */
function showStartScreen() {
    $(".play-screen").hide();
    $("#countdown").hide();
    var startScreen = $(".start-screen");
    startScreen.animate({
        left: startScreen.parent().width() / 2 - startScreen.width() / 2
    }, 1000);
    $("#instr").html(constants.STARTING);
    $("#score").html(gameState.score);
}

/**
 * Sets up the timer that tracks the total duration of the game play.
 * It also handles the display.
 */
function setupGameDurationTimer() {
    $("#countdown").show();
    gameState.gameDurationTimerInterval = setInterval(function () {
        $("div#countdown span#minutes").html(Math.floor(gameState.durationSeconds() / 60));
        $("div#countdown span#seconds").html(gameState.durationSeconds() % 60);
    }, constants.CLOCK_UPDATE_INTERVAL_MS);
}

/**
 * Updates the color of the instruction box. It is based on the time
 * a user takes to respond to the next instruction. The instruction box
 * turns from green to red based on the time value passed in.
 *
 * @param timeMS
 */
function updateUserDecisionDurationTime(timeMS) {
    var ratio = timeMS / gameState.currentGameoverTimeoutMS;
    $("#instr")[0].style.backgroundColor = getColor(ratio);
}

/**
 * This function is periodically called to check the game's state.
 * Based on the game's state it triggers the game over event. It also
 * updates the color of the instruction box.
 */
function evaluateGameState() {
    if (gameState.isInPlay()) {
        var decision = gameState.didUserExceedTimeBudget();
        if (decision.status) {
            handleGameOverEvent();
        }
        updateUserDecisionDurationTime(decision.diff);
    }
}

/**
 * Function that setups the game and begins it's execution
 */
function start() {
    gameSounds.gameloop.play();
    $(".gameActionButton").removeAttr("disabled");

    $(".start-screen").animate({top: "-" + $(".start-screen").height()}, 1000, function () {
        $(".start-screen").hide();
        $(".play-screen").css({
            "left": "0",
            "top": "50%",
            "marginTop": "-200px"
        }).show().animate({
            left: $(".play-screen").parent().width() / 2 - $(".play-screen").width() / 2
        }, 1000, function () {
            gameState.reset();
            gameState.play();
            setupGameDurationTimer();
            selectNextActionAndRecalculateGameOverTimeout();
            gameState.gameStateEvaluatorInterval = setInterval(evaluateGameState, constants.GAMESTATE_EVALUATOR_INTERVAL_MS);
        });

    });
}

/**
 * Resets the game
 */
function reset() {
    $(".start-screen").css({
        "left": "0",
        "top": "50%",
        "marginTop": "-75px"
    }).show();

    gameSounds.gameloop.stop();
    gameState.reset();
    showStartScreen();
}
