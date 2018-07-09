export module Tilegame {
	export const SQUARE_WIDTH_PX: number = 36; // 30 for square plus 6 for border on either side

	/* A class through which to grab mines, mostly for better-abstracted indexing */
	export class Board {
		height: number;
		width: number;
		board: Array<Square>;

		constructor(height: number, width: number) {
			this.height = height;
			this.width = width;
			// leave board building up to the extended class
			// this.board = this.buildBoard();
		}

		/* Constructs and returns an array of Square() objects */
		buildBoard() {
			let board: Array<Square> = new Array(this.height * this.width);
			let i: number, j: number;

			for (i = 0; i < this.height; i++) {
				for (j = 0; j < this.width; j++) {
					board[this.boardIndex(i, j)] = new Square(i, j);
				}
			}

			return board;
		}

		/* Given board index of a square, return an array of neighbors of that square. */
		getNeighbors(row: number, col: number) {
			let neighbors: Array<Square> = new Array(9);
			let i: number, j: number;

			for (i = -1; i <= 1; i++) {
				for (j = -1; j <= 1; j++) {
					if (!(i == 0 && j == 0)) {
						let neighborRow: number = row + i;
						let neighborCol: number = col + j;

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
		boardIndex(row: number, col: number) {
			return row * this.width + col;
		}

		/* Returns the Square() object at the board index [row, col] */
		get(row: number, col: number) {
			return this.board[this.boardIndex(row, col)];
		}

		getById(id: string) {
			let row: number = parseInt(id); // always returns first number
			let col: number = parseInt(id[id.indexOf(",") + 1]);
			return this.get(row, col);
		}

		length() {
			return this.board.length;
		}

		toString() {
			let res: string = "[";
			let i: number;

			for (i = 0; i < this.board.length - 1; i++) {
				res = res + this.board[i].surroundings + ", ";
			}

			res = res + this.board[this.board.length - 1].surroundings + "]";
			return res;
		}
	}

	/* Represents all the information contained in a single square on the board */
	export class Square {
		row: number;
		col: number;
		id: string;
		surroundings: number;
		isOpen: boolean;

		constructor(row: number, col: number) {
			this.row = row;
			this.col = col;
			this.id = row + "," + col;
			this.isOpen = false;
			this.surroundings = 0;
		}

		/* Toggles open conditional by default */
		open() {
			this.isOpen = !this.isOpen;
		}
	}
}