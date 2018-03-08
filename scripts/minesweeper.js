/* Lucas Schaack
 * thanks to https: https://www.martinstoeckli.ch/fontmap/fontmap.html for the easy
 * 	character set lookup. */

(function() {
	"use strict";

	const SQUARE_WIDTH_PX = 36; // 30 for square plus 6 for border on either side
	const MINE_CHAR = '✹'; // alternative: ✸
	const FLAG_CHAR = '⚐';
	const FLAG_CHAR_SOLID = '⚑';
	const DEFAULT_MESSAGE = 'You win!';
	var isPlaying = false;	// Says whether to update time
	var game; 				// Holds the Minesweeper class
	var counter; 			// DOM element storage for quick access (flag counter)
	var timer; 				// DOM element storage for quick access (timer, obviously)
	var startTime;			// Holds the time of the first board click

	/* ###################################################################### */
	/* ############################### Classes ############################## */
	/* ###################################################################### */

	/* The manager for Board and Square, works with the DOM */
	class Minesweeper {
		constructor(body, height, width, numMines) {
			// conditionals which affect functionality
			this.flagMode = false;
			// elements stored for quick access
			this.body, this.mineCounter;
			// meta game info
			this.width, this.height, this.numMines, this.minesFlagged, this.board;

			this.reset(body, height, width, numMines);
		}

		/* Resets the game */
		reset(body, height, width, numMines) {
			hideMessage();
			// begin conditionals which affect game functionality
			// reset timer if set
			isPlaying = false;
			document.getElementById('time-counter').innerHTML = '000';

			// resets flagmode it if starting from reset button click
			if (this.flagMode) {
				document.getElementById('flag-mode').click();
			}
			// end conditionals

			// begin elements stored for quick access
			this.body = body; // maybe not necessary, could just pass to populate()
			this.mineCounter = document.getElementById('mine-counter');
			// end elements stored for quick access

			// begin meta game info
			this.width = width;
			this.height = height;
			this.numMines = numMines;
			this.numFlags = 0;
			this.minesFlagged = 0;
			// end meta game info

			// remove nodes if there are any
			while(this.body.firstChild) {
				this.body.removeChild(this.body.firstChild);
			}

			// do setup
			updateMineCounter(this.numMines);
			this.populate(); // set up html representation
			this.board = new Board(this.height, this.width); // set up abstract representation
			this.layMines();

			// all ready
			this.body.style.pointerEvents = "auto"; // enable clicking if disabled
		}

		/* Lays mines and increments the surroundings property of each surrounding
		 * square for every mine layed */
		layMines() {
			var area = this.height * this.width;
			console.assert(this.numMines <= area,
				"Number of mines greater than board area. Please take it easy on the mines.");

			var minesToLay = Math.min(this.numMines, area);
			var i;
			
			for (i = 0; i < minesToLay; i++) { 
				var layed = false;

				while (!layed) { // keep trying until layed in empty spot, inefficient...
					var row = Math.floor(Math.random() * this.height);
					var col = Math.floor(Math.random() * this.width);
					var thisSquare = this.board.get(row, col);

					if (!thisSquare.isMine) {
						thisSquare.isMine = true;
						// increment square.surroundings for every surrounding square
						var neighbors = this.board.getNeighbors(row, col);

						neighbors.forEach(function(neighbor) {
							neighbor.surroundings++;
						});

						layed = true;
					}
				}
			}
		}

		/* Creates the board dynamically on the DOM */
		populate() {
			var i, j;

			for (i = 0; i < this.height; i++) {
				var row = document.createElement('div');
				row.className = 'row';

				for (j = 0; j < this.width; j++) {
					var square = document.createElement('div');

					square.onmousedown = function() { setFace('o:') }; // buttonPress;
					square.onmouseup = function() { setFace('|:') }; // buttonPress;
					square.onclick = reveal;
					square.oncontextmenu = flag; 
					square.id = i + ',' + j;
					square.className = 'square';
					row.appendChild(square);
				}

				this.body.appendChild(row);
			}

			// this doesn't really fit nicely anywhere, so it goes here
			document.getElementById('flag-mode').onclick = function() {
				game.flagMode = !game.flagMode; // toggle

				if (game.flagMode) {
					this.firstChild.innerHTML = FLAG_CHAR_SOLID;
				} else {
					this.firstChild.innerHTML = FLAG_CHAR;
				}
			}

			// set style for everything to fit together nicely
			var nPix = this.width * SQUARE_WIDTH_PX;
			document.getElementById('game-area').style.width = nPix + "px";
			message = document.getElementById('message').firstChild;
			// Start pretty big, get bigger but not by that much much
			message.style.fontSize = 1 + 0.005 * nPix + 'em';
			setFace('|:');
		}

		/* just yields a string representing a color, given the number of mines
		 *	surrounding a square. */
		getColor(nearbyMines) {
			switch(nearbyMines) {
				case 1:
					return '#0000dd';
				case 2:
					return 'green';
				case 3:
					return 'red';
				case 4:
					return 'purple';
				case 5: // 4 and 5 are almost identical on my screen...
					return 'maroon';
				case 6:
					return 'turquoise';
				case 7:
					return 'black';
				case 8:
					return 'gray';
				default:
					return 'yellow'; // what.
			}
		}

		/* Makes board unclickable, sets appropriate flags, and shows the player
		 * false negative squares as black mines and false positive squares as
		 * red solid flags */
		explode() {
			// make everything unclickable
			this.body.style.pointerEvents = "none";
			isPlaying = false;

			var i, j;

			// length method instead of property to ensure correct behavior
			for (i = 0; i < this.height; i++) {
				for (j = 0; j < this.width; j++) {
					var square = this.board.get(i, j);

					if (square.isMine && !square.isFlagged) { // false negative
						var id = this.idFromBoard(i, j);
						document.getElementById(id).innerHTML = MINE_CHAR;
					} else if (!square.isMine && square.isFlagged) { // false positive
						var id = this.idFromBoard(i, j);
						var element = document.getElementById(id);
						element.innerHTML = FLAG_CHAR_SOLID;
						// set flag color to slightly darker than standard red
						element.style.color = '#d00';
					}
				}
			}

			setFace('D:');
			showMessage("~*boom*~");
			console.log("~boom~");
		}

		/* Checks the win condition, returning whether or not the conditions are
		 * met and also setting the game to the win state if they are */
		checkWin() {
			if (this.minesFlagged == this.numMines && this.minesFlagged == this.numFlags) {
				var i, j;
				// loop through and check every square is either flagged or opened
				for (i = 0; i < this.height; i++) {
					for (j = 0; j < this.width; j++) {
						var square = this.board.get(i, j);

						if (!square.isOpen && !square.isFlagged) {
							return false;
						}
					}
				}

				this.win(DEFAULT_MESSAGE);
				return true;
			}
		}

		/* Makes board unclickable, sets appropriate flags, and prints the
		 * given message underneath the game header */
		win(message) {
			// make everything unclickable
			this.body.style.pointerEvents = "none";
			isPlaying = false;

			setFace('C:');
			showMessage(message);
			console.log("~hooray~");
		}

		/* given a board index, returns the number of flagged squares in the
		 * immediate surroundings. */
		getFlags(row, col) {
			var neighbors = this.board.getNeighbors(row, col);
			var nFlags = 0;

			neighbors.forEach(function(neighbor) {
				if (neighbor.isFlagged) {
					nFlags++;
				}
			});

			return nFlags;
		}

		/* Performs BFS to open all contiguous blanks surrounding an initial
		 * mine given by row and column index on the board, stopping whenever
		 * it encounters a numbered edge. */
		openBlanks(row, col) {
			var toVisit = [this.board.get(row, col)]; // push() and shift() for FIFO behavior
			var visited = new Set();

			while (toVisit.length > 0) {
				var thisSquare = toVisit.shift();
				var id = this.idFromBoard(thisSquare.row, thisSquare.col);
				var squareElement = document.getElementById(id);
				// bind reveal w/doOpenBlanks set to false to avoid endless recursion
				var boundReveal = reveal.bind(squareElement, false, false);
				boundReveal(); // reveal single square

				var neighbors = this.board.getNeighbors(thisSquare.row, thisSquare.col);

				/* add all neighbors to visit, assuming curr is blank (stop at
				 * numbered "edges") */
				neighbors.forEach(function(neighbor) {
					if (!visited.has(neighbor) && // if not visited...
						thisSquare.surroundings == 0) { // if curr also blank

						toVisit.push(neighbor);
						visited.add(neighbor);
					}
				});
			}
		}

		/* Clicks on all squares surrounding the square at [row, col] */
		openNumbered(row, col) {
			var square = this.board.get(row, col);

			// make sure that the number of nearby flags matches the number on the square
			if (this.getFlags(row, col) == square.surroundings) {
				var neighbors = this.board.getNeighbors(row, col);

				neighbors.forEach(function(neighbor) {
					// check if neighbor is unflagged and unopened
					if (!neighbor.isOpen && !neighbor.isFlagged) {
						var id = neighbor.row + ',' + neighbor.col;
						var neighborElement = document.getElementById(id);
						var boundReveal = reveal.bind(neighborElement, true, false);
						boundReveal();
					}
				});
			}
		}

		/* Returns a string containing the id of the square at [row, col] */
		idFromBoard(row, col) {
			return row + ',' + col;
		}
	}

	/* A class through which to grab mines, mostly for better-abstracted indexing */
	class Board {
		constructor(height, width) {
			this.height = height;
			this.width = width;
			this.board = this.buildBoard();
		}

		/* Constructs and returns an array of Square() objects */
		buildBoard() {
			var board = new Array(this.height * this.width);
			var i, j;

			for (i = 0; i < this.height; i++) {
				for (j = 0; j < this.width; j++) {
					board[this.boardIndex(i, j)] = new Square(i, j);
				}
			}

			return board;
		}

		/* Given board index of a square, return an array of neighbors of that square. */
		getNeighbors(row, col) {
			var neighbors = new Array(9);
			var i, j;

			for (i = -1; i <= 1; i++) {
				for (j = -1; j <= 1; j++) {
					if (!(i == 0 && j == 0)) {
						var neighborRow = row + i;
						var neighborCol = col + j;

						// check for out-of-bounds indices
						if (neighborRow >= 0 && neighborCol >= 0 &&
							neighborRow < this.height && neighborCol < this.width) {
							neighbors.push(this.board[this.boardIndex(neighborRow, neighborCol)]);
						}
					}
				}
			}

			return neighbors;
		}

		/* given an abstract index (row, col), returns an index for this.board */
		boardIndex(row, col) {
			return row * this.width + col;
		}

		/* Returns the Square() object at the board index [row, col] */
		get(row, col) {
			return this.board[this.boardIndex(row, col)];
		}

		length() {
			return this.board.length;
		}

		toString() {
			var res = "[";
			var i;

			for (i = 0; i < this.board.length - 1; i++) {
				res = res + this.board[i].surroundings + ", ";
			}

			res = res + this.board[this.board.length - 1].surroundings + "]";
			return res;
		}
	}

	/* Represents all the information contained in a single square on the board */
	class Square {
		constructor(row, col) {
			this.row = row;
			this.col = col;
			this.isOpen = false;
			this.isMine = false;
			this.isFlagged = false;
			this.isQuestioned = false;
			this.surroundings = 0;
		}

		/* Named purely for abstraction purposes */
		layMine() {
			this.isMine = true;
		}

		/* Named purely for abstraction purposes */
		flag() {
			this.isFlag = true;
		}

		/* Returns a string representing which operation to perform based on the
		 * actual contents of the square */
		open() {
			if (!this.isFlagged && !this.isQuestioned) {
				if (this.isMine) {
					return 'explode';
				} else if (!this.surroundings) {
					if (!this.isOpen) {
						// clicking on an open blank square shouldn't do anything
						return 'blank';
					}
				} else if (this.surroundings) {
					return 'numbered';
				}
			}
		}

		/* Returns a string representing which operation to perform based on the
		 * actual contents of the square */
		flag() {
			if (this.isMine) {
				if (!this.isFlagged && !this.isQuestioned) {
					return 'increment'; // increment mineCounter if correct
				} else if (this.isFlagged) {
					return 'decrement'; // decrement if correct but de-flagged
				}
			} else { // I don't really do anything with this right now
				return 'nop';
			}
		}
	}

	/* ###################################################################### */
	/* ########################### Global Methods ########################### */
	/* ###################################################################### */

	/* Several behaviors dependent on case:
		1. If square is flagged, ignore outright 
		2. If square is a bomb, explode
		3. If square is numbered, just open
		4. If square is blank, open all surrounding blank squares */
	function reveal(doOpenBlanks = true, doOpenNumbered = true) {
		var stringIndex = this.id.split(',');
		var row = parseInt(stringIndex[0]);
		var col = parseInt(stringIndex[1]);
		var id = game.idFromBoard(row, col);

		var square = game.board.get(row, col);
		var element = document.getElementById(id);

		if (!isPlaying) {
			isPlaying = true
			updateTime(true);
		}

		/* sort of a weird conditional...if I just checked for flag mode and whether
		 * the square is open, then doOpenBlanks and doOpenNumbered would click
		 * surrounding squares as usual, which would flag them. this is a slightly
		 * hack-y but I think pretty nice workaround which implicitly checks whether
		 * the call is coming from one of those methods. */
		if (game.flagMode && !square.isOpen && doOpenBlanks && doOpenNumbered) {
			var boundFlag = flag.bind(this);
			boundFlag();
		} else {
			var result = square.open();

			// set appropriate html classes etc.
			switch(result) {
				case 'blank':
					square.isOpen = true;
					element.className = 'square revealed';
					// BFS
					if (doOpenBlanks) {
						game.openBlanks(row, col);
					}
					break;
				case 'numbered':
					if (!square.isOpen) {
						square.isOpen = true;
						element.className = 'square revealed';
						element.innerHTML = square.surroundings;
						element.style.color = game.getColor(square.surroundings);
					} else {
						if (doOpenNumbered) {
							game.openNumbered(row, col);
						}
					}
					break;
				case 'explode':
					element.className = 'square exploded';
					element.innerHTML = MINE_CHAR;
					game.explode();
					break;
			}	
		}

		game.checkWin();
	}

	/* Rotates square between default, flagged, and questioned, setting html and
	 * counters appropriately */
	function flag() {
		var stringIndex = this.id.split(',');
		var row = parseInt(stringIndex[0]);
		var col = parseInt(stringIndex[1]);
		var id = game.idFromBoard(row, col);

		var squareOnBoard = game.board.get(row, col);
		var squareElement = document.getElementById(id);
		var result = squareOnBoard.flag();

		if (!isPlaying) {
			isPlaying = true
			updateTime(start = true);
		}

		/* Update game.minesFlagged first--separate b/c minesFlagged counts the
		 * number of mines correctly flagged for easy win checking, vs. the HTML
		 * counter which just decrements based on the number of flags on the board */
		switch(result) {
			case 'increment':
				game.minesFlagged++;
				break;
			case 'decrement':
				game.minesFlagged--;
				break;
		}

		// Rotate between FLAG_CHAR, ?, and blank, and toggle corresponding bools
		if (!squareOnBoard.isOpen) {
			if (squareOnBoard.isFlagged) { 				// if flag, become question
				game.numFlags--;
				squareOnBoard.isFlagged = false;
				squareOnBoard.isQuestioned = true;

				squareElement.innerHTML = '?';
				updateMineCounter(game.numMines - game.numFlags);
			} else if (squareOnBoard.isQuestioned) { 	// if question, become default
				squareOnBoard.isQuestioned = false;
				squareOnBoard.isFlagged = false;

				squareElement.innerHTML = ''; 
			} else { 									// if default, become flag
				game.numFlags++;
				squareOnBoard.isFlagged = true;

				squareElement.innerHTML = FLAG_CHAR;
				updateMineCounter(game.numMines - game.numFlags);
			}
		}

		if (game.minesFlagged == game.numMines) {
			game.checkWin();
		}

		return false; // to suppress context menu
	}

	/* Resets the game... */
	function reset() {
		var gameBody = document.getElementById('game-body');
		var boxWidth = document.getElementById('width').value;
		var boxHeight = document.getElementById('height').value;
		var numMines = document.getElementById('mines').value;
		game.reset(gameBody, boxHeight, boxWidth, numMines);
	}

	/* Deprecated by simpler and more functional css square:active */
	function buttonPress() {
		if (this.classList.contains('default')) {
			this.classList.remove('default')
			this.classList.add('pressed');
		} else if (this.classList.contains('pressed')) {
			this.classList.remove('pressed')
			this.classList.add('default');
		}
	}

	/* Transforms and updates number on mineCounter */
	function updateMineCounter(update) {
		var update = update.toString();
		counter.innerHTML = '0'.repeat(3 - update.length) + update;
	}

	/* Called every 1 second, prints the time since the first reveal or flag to
	 * the timer until the game is won or lost */
	function updateTime(start = false) {
		switch(start) { // switch for stepping through from start
			case true: // initialize
				startTime = Date.now();
			default:
				if (isPlaying) { // actually start
					// time in seconds to string
					var secsPassed = ((Date.now() - startTime) / 1000).toString();
					var update = secsPassed.substring(0, secsPassed.indexOf('.'));
					if (update.length < 4) {
						timer.innerHTML = '0'.repeat(3 - update.length) + update;
					}
				}
				break;
		}
	}

	/* Sets the reset button face */
	function setFace(face) {
		document.getElementById('face').innerHTML = face;
	}

	/* Shows given message directly underneath game header */
	function showMessage(message) {
		var messageElement = document.getElementById('message');
		messageElement.firstChild.innerHTML = message;
		messageElement.style.display = 'block';
	}

	/* Hides the win or lose message */
	function hideMessage() {
		var messageElement = document.getElementById('message');
		messageElement.style.display = 'none';
	}

	window.onload = function() {
		counter = document.getElementById('mine-counter');
		timer = document.getElementById('time-counter');
		setInterval(updateTime, 1000); // doesn't need a variable, cause it always runs

		var resetButton = document.getElementById('minesweeper-face');
		resetButton.onclick = reset;
		// These prevent onclick unless clicked outside the face for some reason...
		resetButton.onmousedown = function() { setFace('D8') };
		resetButton.onmouseup = function() { setFace('|:') };

		var gameBody = document.getElementById('game-body');
		var boxWidth = document.getElementById('width').value;
		var boxHeight = document.getElementById('height').value;
		var numMines = document.getElementById('mines').value;
		game = new Minesweeper(gameBody, boxHeight, boxWidth, numMines);
	};
})();