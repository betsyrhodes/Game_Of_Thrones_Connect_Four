$(document).ready(function() {
    var game = new Game();
    bindListeners(game);

    var music = new Howl({
        urls: ['game_of_thrones.mp3'],
        loop: true,
        volume: 0.2,
        }).play();
});

function bindListeners(game) {
    $('.start-button').on('click', game.startGame.bind(game));
}

///////// Board Object //////////

function Board() {
    this.board = [0, 0, 0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0, 0, 0];

    this.colLength = 6;
    this.rewLength = 7;
}

Board.prototype = {
    reset: function(board) {
        for (var i = 0; i < this.board.length; i++) {
            this.board[i] = 0;
        }
    },

    updateBoard: function(index, turn) {
        this.board[index] = turn;
    },

}


////////// View Object ///////////

function View() {}
View.prototype = {
    resetBoard: function() {
        $('.cell').html('')
    },

    findAvailableCell: function(selectedCol, colLength) {
        for (var i = colLength; i > 0; i--) {
            var availableCell = selectedCol.querySelector('div:nth-child(' + i + ')');
            if (availableCell.innerHTML === "") return availableCell;
        }
        return null;
    },

    updateBoard: function(availableCell, turn) {
        switch (turn) {
            case 1:
                availableCell.innerHTML = "<img src='http://i.imgur.com/S2pwIGS.png' alt='Stark'>";
                break;
            case 2:
                availableCell.innerHTML = "<img src='http://i.imgur.com/F4PE9bt.png' alt='Lannister'>";
                break;
        }
        return availableCell.id
    }
}


//////// Timer Objects ///////////

function PlayerTimer(game) {
    this.game = game;
    this.timeInSeconds = 10;
    this.playerTimer;
}

PlayerTimer.prototype = {
    start: function() {
        this.playerTimer = window.setInterval(this.countDown.bind(this), 1000)
    },

    countDown: function() {
        $('.setPlayerInterval').text(this.timeInSeconds);
        this.timeInSeconds--;

        if (this.timeInSeconds === -1) {
            this.reset();
            this.game.endOfTurn();
        }
    },

    reset: function() {
        clearInterval(this.playerTimer);
        this.playerTimer = undefined;
        this.timeInSeconds = 10;
    },

}

function GameTimer(game) {
    this.game = game;
    this.timeInSeconds = 120;
    this.gameTimer;
}

GameTimer.prototype = {
    start: function() {
        this.gameTimer = window.setInterval(this.countDown.bind(this), 1000)
    },

    countDown: function() {
        $('.setGameInterval').text(this.timeInSeconds);
        this.timeInSeconds--;

        if (this.timeInSeconds === -1) {
            var win = false;
            this.reset();
            this.game.endOfGame(win);
        }
    },

    reset: function() {
        clearInterval(this.gameTimer);
        this.gameTimer = undefined;
        this.timeInSeconds = 120;
    },

}


//////////Game Play////////////

function Game() {
    this.board = new Board();
    this.view = new View();
    this.gameTimer = new GameTimer(this);
    this.playerTimer = new PlayerTimer(this);
    this.turn = 1;
}

Game.prototype = {
    startGame: function() {
        this.resetBoard();
        this.resetTimers();
        this.startTimers();
        $('.board').off('click');
        $('.board').on('click', '.col', this.placePiece.bind(this) );
    },

    resetBoard: function() {
        this.board.reset();
        this.view.resetBoard();
    },

    startTimers: function() {
        this.gameTimer.start();
        this.playerTimer.start();
    },

    resetTimers: function() {
        this.gameTimer.reset();
        this.playerTimer.reset();
    },

    placePiece: function(e) {
        e.preventDefault();
        var selectedCol = e.currentTarget;
        var availableCell = this.view.findAvailableCell(selectedCol, this.board.colLength);
        if (availableCell === null) return;
        var cellIndex = this.updateBoard(availableCell);
        var win = this.checkWin(cellIndex);
        if (win) {
            this.endOfGame(win);
        } else {
            this.endOfTurn();
        }
    },

    endOfTurn: function() {
        this.updateTurn();
        this.playerTimer.reset();
        this.playerTimer.start();
        var turnSound = new Howl({ urls: ['Shwing.mp3'] }).play();
    },

    endOfGame: function(win) {
        this.resetBoard();
        this.resetTimers();
        $('.board').off('click');
        debugger
        (win) ? alert("You Win") : alert("Times Up. Game Over");
    },

    updateBoard: function(availableCell) {
        var index = this.view.updateBoard(availableCell, this.turn);
        this.board.updateBoard(index, this.turn)
        return index;
    },

    updateTurn: function() {
        (this.turn === 1) ? this.turn = 2 : this.turn = 1;
    },

    checkWin: function(cellIndex) {
        var win = false
        if ( this.checkColumn(cellIndex) ) win = true;
        if ( this.checkRow(cellIndex) ) win = true;
        if ( this.checkDiagonal1(cellIndex) ) win = true;
        if (this.checkDiagonal2(cellIndex) ) win = true;
        return win;
    },

    checkColumn: function(cellIndex) {
        var indexOffset = -7;
        if (this.fourInARow(cellIndex, indexOffset)) return true;
        indexOffset = 7;
        return this.fourInARow(cellIndex, indexOffset);
    },

    checkRow: function(cellIndex) {
        var indexOffset = -1;
        if (this.fourInARow(cellIndex, indexOffset)) return true;
        var indexOffset = 1;
        return this.fourInARow(cellIndex, indexOffset);
    },

    checkDiagonal1: function(cellIndex) {
        var indexOffset = -6;
        if (this.fourInARow(cellIndex, indexOffset)) return true;
        var indexOffset = 6;
        return this.fourInARow(cellIndex, indexOffset);
    },

    checkDiagonal2: function(cellIndex) {
        var indexOffset = -8;
        if (this.fourInARow(cellIndex, indexOffset)) return true;
        var indexOffset = 8;
        return this.fourInARow(cellIndex, indexOffset);
    },

    fourInARow: function(cellIndex, indexOffset) {
        cellIndex = parseInt(cellIndex);
        var winningCombo = [cellIndex]; //creates array of matches, starting with newly added piece
        var matchValue = this.board.board[cellIndex]; //gets value to match (1 or 2 depending on player)
        cellIndex += indexOffset; //adjusts index to start search

        var direction1Checked = false;
        var direction2Checked = false;

        while (winningCombo.length < 4 && !direction1Checked && !direction2Checked) {
            var match = this.checkNeighbor(cellIndex, matchValue);
            if (match) {
                winningCombo.push(cellIndex);
                cellIndex += indexOffset;
            } else {
                if (!direction1Checked) {
                    indexOffset = -indexOffset;
                    cellIndex = winningCombo[0] + indexOffset;
                    direction1Checked = true;
                } else {
                    direction2Checked = true;
                }
            }
        }
        return (winningCombo.length >= 4) ? true : false
    },

    checkNeighbor: function(cellIndex, matchValue) {
        if (cellIndex < 0 || cellIndex > 41) return false;
        return (this.board.board[cellIndex] === matchValue) ?  true : false;
    },

}