class Timer {
    constructor() {
        this.startTime = new Date().getTime()
        this.endTime = new Date().getTime()
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
        this.paused = true

        return true;
    }

    getPrintedTime() {
        return Math.min(999, this.getElapsedTime())
    }
}

class Game {
    constructor(height, width, bombNum) {
        this.height = height
        this.width = width
        this.bombNum = bombNum
        this.board = []
        this.dugSquares = new Set()
        this.timer = new Timer()
    }

    createNewBoard() {
        this.dugSquares = new Set()

        let board = [Array(this.height).fill(Array(this.width).fill(0))]
        const bombLocations = new Set();
        while (bombLocations.size < this.bombNum) {
            const bombRow = Math.floor(Math.random() * this.height);
            const bombCol = Math.floor(Math.random() * this.width);
            bombLocations.add(`${bombRow},${bombCol}`);
        }

        for (const location of bombLocations) {
            const [row, column] = location.split(',').map(num => parseInt(num))
            board[row][column] = -1;
        }

        this.board = board;
    }

    neighbouringBombsCount(row, col) {
        let neighbours = 0;

        for (let r = row - 1; r < row+2; r++) {
            for (let c = col-1; c < col+2; c++) {
                const inBoundsX = r >= 0 && r < this.height;
                const inBoundsY = c >= 0 && c < this.width;
                if (!inBoundsX || !inBoundsY || (r == row && c == col)) continue;

                neighbours += this.board[r][c] == -1
            }
        }

    }

    dig(row, col) {
        const key = `${row},${col}`

        this.dugSquares.add(key)

        if (this.board[row][col] == -1) return false;
        else if (this.board[row][col] > 0) return true;

        for (let r = row-1; r < row+2; r++) {
            for (let c = col-1; c < col+2; c++) {
                const inBoundsX = r >= 0 && r < this.height;
                const inBoundsY = c >= 0 && c < this.width;

                if (!inBoundsX || !inBoundsY || this.dugSquares.has(key)) continue;

                this.dig(r, c);
            }
        }
    }
}