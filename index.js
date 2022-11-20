class Timer {
	constructor() {
		this.startTime = new Date().getTime();
		this.endTime = new Date().getTime();
		this.paused = false;
	}

	getElapsedTime() {
		if (!this.paused) this.endTime = new Date().getTime();

		return this.endTime - this.startTime;
	}

	resetTimer() {
		this.startTime = new Date().getTime();
		this.endTime = new Date().getTime();
		this.paused = false;
	}

	pauseTimer() {
		this.paused = true;

		return true;
	}

	getPrintedTime() {
		return Math.min(999, this.getElapsedTime());
	}
}

class Game {
	constructor(height, width, bombNum) {
		this.createNewBoard(height, width, bombNum);
	}

	createNewBoard(height, width, bombNum) {
		document.getElementById('endgame-message').style.visibility = 'hidden';
		document.getElementById('game-board').textContent = '';
		this.height = height;
		this.width = width;
		this.numSquares = this.height * this.width;
		this.bombNum = bombNum;

		this.board = [];
		this.dugSquares = new Set();
		this.timer = new Timer();
		this.gameHasEnded = false;
		this.flaggedCells = new Set();
		this.board = Array(this.height)
			.fill(0)
			.map(() => Array(this.width).fill(0));

		this.placeBombs();
		this.assignValues();
		this.updateBrowserBoard();
	}

	getRandomCell() {
		const cellRow = Math.floor(Math.random() * this.height);
		const cellCol = Math.floor(Math.random() * this.width);

		return [cellRow, cellCol];
	}

	placeBombs() {
		const bombLocations = new Set();
		while (bombLocations.size < this.bombNum) {
			const [bombRow, bombCol] = this.getRandomCell();
			bombLocations.add(`${bombRow},${bombCol}`);
		}

		for (const location of bombLocations) {
			const [row, column] = location
				.split(',')
				.map((num) => parseInt(num));
			this.board[row][column] = -1;
		}
	}

	assignValues() {
		for (let row = 0; row < this.height; row++) {
			for (let col = 0; col < this.width; col++) {
				if (this.board[row][col] == -1) continue;
				this.board[row][col] = this.neighbouringBombsCount(row, col);
			}
		}
	}

	getCellValue(row, col) {
		if (this.board[row][col] == -1) {
			return 'B';
		} else if (this.board[row][col] == 0) {
			return '';
		} else {
			return this.board[row][col];
		}
	}

	neighbouringBombsCount(row, col) {
		let neighbours = 0;

		for (let r = row - 1; r < row + 2; r++) {
			for (let c = col - 1; c < col + 2; c++) {
				const inBoundsX = r >= 0 && r < this.height;
				const inBoundsY = c >= 0 && c < this.width;
				if (!inBoundsX || !inBoundsY || (r == row && c == col))
					continue;

				neighbours += this.board[r][c] == -1;
			}
		}
		return neighbours;
	}

	dig(row, col) {
		const key = `${row},${col}`;

		if (this.dugSquares.has(key)) {
			return;
		}
		this.dugSquares.add(key);

		const cell = this.board[row][col];
		if (cell == -1) return false;
		else if (cell > 0) return true;

		for (let r = row - 1; r < row + 2; r++) {
			for (let c = col - 1; c < col + 2; c++) {
				const newKey = `${r}-${c}`;
				const inBoundsX = r >= 0 && r < this.height;
				const inBoundsY = c >= 0 && c < this.width;

				if (!inBoundsX || !inBoundsY || this.dugSquares.has(newKey))
					continue;

				this.dig(r, c);
			}
		}
		return true;
	}

	updateBrowserBoard() {
		console.log(this.board);
		const gameBoard = document.getElementById('game-board');
		const browserBoard = [];
		for (let row = 0; row < this.height; row++) {
			for (let col = 0; col < this.width; col++) {
				const el = document.createElement('div');
				const classNames = ['square'];

				if (this.dugSquares.has(`${row},${col}`)) {
					classNames.push('dug', `dug${this.board[row][col]}`);
					el.innerHTML = this.getCellValue(row, col);
				} else {
					classNames.push('undug');
				}
				el.id = `${row}-${col}`;

				if (this.flaggedCells.has(el.id)) classNames.push('flagged');

				el.classList.add(...classNames);
				browserBoard.push(el);
			}
		}

		const styles = {
			gridTemplateColumns: `repeat(${this.width}, 1fr)`,
			gridTemplateRows: `repeat(${this.height}, 1fr)`,
			width: `calc(${this.width * 2.5}rem + ${this.width*2}px)`,
		};
		Object.assign(gameBoard.style, styles);
		gameBoard.textContent = '';

		for (let i = 0; i < browserBoard.length; i++) {
			gameBoard.appendChild(browserBoard[i]);
		}
	}

	toggleFlag(e) {
		if (e.target.matches('.square')) {
			e.preventDefault();
		}

		const isUndugSquare = e.target.matches('.undug.square');
		console.log(isUndugSquare);
		if (!this.gameHasEnded && isUndugSquare) {
			const cellId = e.target.id;
			this.flaggedCells.has(cellId)
				? this.flaggedCells.delete(cellId)
				: this.flaggedCells.add(cellId);
			this.updateBrowserBoard();
		}
	}

	handleEndgame(isWin) {
		const messageContainer = document.getElementById('endgame-message');
		messageContainer.style.visibility = 'visible';
		messageContainer.innerHTML = isWin ? 'DU VANN!!!' : 'DU FÖRLORADE!!!';
		this.gameHasEnded = true;
	}

	moveBombToEmptySpot(fromX, fromY) {
		const fromKey = `${fromY},${fromX}`;
		let [randY, randX] = this.getRandomCell();
		while (
			this.board[randY][randX] == -1 &&
			fromKey === `${randY},${randX}`
		) {
			[randY, randX] = this.getRandomCell();
		}

		this.board[fromY][fromX] = 0;
		this.board[randY][randX] = -1;
	}

	onClick(e) {
		if (this.gameHasEnded) return;

		const isUndugSquare = e.target.matches('.undug');
		if (isUndugSquare) {
			const cellId = e.target.id;
			const [y, x] = cellId.split('-').map((x) => parseInt(x));
			const isFirstClick = this.dugSquares.size == 0;

			console.log(this.flaggedCells);
			if (this.flaggedCells.has(cellId)) return;

			console.log(isFirstClick, y, x);
			if (isFirstClick && this.board[y][x] == -1) {
				this.moveBombToEmptySpot(y, x);
				this.assignValues();
			}

			const isBomb = !this.dig(y, x);
			const foundAllBombs =
				this.numSquares - this.dugSquares.size === this.bombNum;

			this.updateBrowserBoard();

			if (isBomb) this.handleEndgame(false);
			if (foundAllBombs) this.handleEndgame(true);
		}
	}

	onFormSubmit(e) {
		e.preventDefault();
		const newWidth = parseInt(document.getElementById('width').value);
		const newHeight = parseInt(document.getElementById('height').value);
		const newBombs = parseInt(document.getElementById('bombs').value);

		this.createNewBoard(
			newHeight,
			newWidth,
			Math.min(newBombs, newHeight * newWidth - 1)
		);
	}
}

let g = new Game(16, 16, 40);
// g.createNewBoard();

console.log(g.board);

const eventListeners = {
	submit: g.onFormSubmit,
	click: g.onClick,
	contextmenu: g.onContextMenu,
};

for (const [event, listener] of Object.entries(eventListeners)) {
	console.log(event, listener);
	document.addEventListener(event, listener.bind(g));
}
