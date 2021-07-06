/**
 * @property {Object} element Element on which the game mounts
 * @property {Array} blocks All cells of the game
 * @property {Number} width Width of the view
 * @property {Number} height Height of the view
 * @property {Function} interval Ongoing simulation interval object
 */
class Game {
    constructor() {
        this.element = document.getElementById('#game');
        this.blocks = [];

        const height = (window.innerHeight / 12).toFixed() - 10
        const width = (window.innerWidth / 12).toFixed()

        this.createView(width, height)
    }

    /**
     * @method createView Creates the board/view for the game, takes two arguments width and height
     * @param {Number} width Width of the view
     * @param {Number} height Height of the view
     * @returns {void}
     */
    createView(width = 100, height = 100) {
        this.width = width;
        this.height = height;


        for (let i = 0; i < height; i++) {
            const row = document.createElement('div');
            row.classList.add('row');

            const el = document.createElement('div');
            el.dataset.y = i;
            el.dataset.x = 0;
            el.dataset.state = 'dead';
            el.classList.add('cell')
            el.classList.add('dead')

            row.append(el)
            this.blocks[i] = el;
            this.blocks[i][0] = el;

            for (let w = 1; w < width; w++) {
                const el = document.createElement('div');
                el.dataset.y = w;
                el.dataset.x = i;
                el.dataset.state = 'dead';
                el.classList.add('cell');
                el.classList.add('dead');
                row.append(el)
                this.blocks[i][w] = el;
            }

            this.element.append(row)
        }

        const wrapper = document.createElement('div')
        wrapper.classList.add('btn-wrapper')

        const randomBtn = document.createElement('button')
        randomBtn.innerHTML = 'Generate Random Cells'
        randomBtn.classList.add('fancy-btn')

        randomBtn.addEventListener('click', () => this.randomCells());

        const startBtn = document.createElement('button')
        startBtn.innerHTML = 'Start';
        startBtn.classList.add('fancy-btn');
        startBtn.classList.add('success')

        startBtn.addEventListener('click', () => this.start(80))

        const stopBtn = document.createElement('button')
        stopBtn.innerHTML = 'Stop'
        stopBtn.classList.add('fancy-btn')
        stopBtn.classList.add('danger')

        stopBtn.addEventListener('click', () => this.stop())

        wrapper.append(randomBtn);
        wrapper.append(stopBtn);
        wrapper.append(startBtn);

        this.element.append(wrapper);
    }

    /**
     * @method randomCells Generates random relative cells 
     * @returns {void}
     */
    randomCells() {
        for (let i = 0; i < 200; i++) {
            const y = Math.floor(Math.random() * this.height);
            const x = Math.floor(Math.random() * this.width);
            const neighbors = this.getNeighbors(y, x)

            const shuffle = this.shuffleArray(neighbors).slice(0, 3);
            for (const item in shuffle) {
                const y = shuffle[item][0]
                const x = shuffle[item][1]

                if (this.blocks[y] && this.blocks[y][x]) {
                    this.reviveCell(y, x)
                }
            }
        }
    }

    /**
     * @method getNeighbors Returns specific cell's neighboring cells as an array
     * @param {Number} y Y axis of the cell
     * @param {Number} x X axis of the cell
     * @returns {Array}
     */
    getNeighbors(y, x) {
        const neighbors = [];

        y = parseInt(y);
        x = parseInt(x);

        neighbors.push([y - 1, x - 1])
        neighbors.push([y - 1, x])
        neighbors.push([y - 1, x + 1])
        neighbors.push([y, x - 1])
        neighbors.push([y, x + 1])
        neighbors.push([y + 1, x - 1])
        neighbors.push([y + 1, x])
        neighbors.push([y + 1, x + 1])

        return neighbors;
    }

    /**
     * @method shuffleArray Shuffles contents of an array
     * @param {Array} array array that needs to be shuffled
     * @returns {Array}
     */
    shuffleArray(array) {
        let currentIndex = array.length
        let randomIndex;

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    /**
     * @method start Starts the simulation
     * @param {Number} frequency Frequency of how often the generations should be created in millisecond
     * @returns {Void}
     */
    start(frequency = 100) {
        if (this.interval) return;
        this.interval = setInterval(() => {
            this.nextGen();
        }, frequency)
    }

    /**
     * @method stop Stops the simulation
     * @returns {Void}
     */
    stop() {
        clearInterval(this.interval)
        this.interval = null
    }

    /**
     * @method nextGen Creates the next generation
     * @returns {Void}
     */
    nextGen() {
        const toDie = [];
        const toLive = [];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {

                const blockX = this.blocks[y][x].dataset.x;
                const blockY = this.blocks[y][x].dataset.y;

                const neighbors = this.getNeighbors(blockX, blockY);

                let aliveNeighbors = 0;

                for (const neighbor of neighbors) {
                    const y = neighbor[0];
                    const x = neighbor[1];
                    if (this.blocks[y] && this.blocks[y][x]) {
                        if (this.blocks[y][x].dataset.state === 'alive') {
                            aliveNeighbors += 1;
                        }
                    }
                }


                if (this.blocks[y][x].dataset.state === 'alive') {
                    if (aliveNeighbors < 2 || aliveNeighbors > 3) {
                        toDie.push({ y, x });
                    }
                }

                if (this.blocks[y][x].dataset.state === 'dead') {
                    if (aliveNeighbors === 3) {
                        toLive.push({ y, x })
                    }
                }

            }
        }

        for (const item of toLive) {
            this.reviveCell(item.y, item.x)
        }
        for (const item of toDie) {
            this.killCell(item.y, item.x)
        }

    }

    /**
     * @method killCell Kills a specific cell
     * @param {Number} y Y axis of a cell
     * @param {Number} x X axis of a cell
     * @returns {Void}
     */
    killCell(y, x) {
        this.blocks[y][x].classList.add('dead');
        this.blocks[y][x].classList.remove('alive');
        this.blocks[y][x].dataset.state = 'dead'
    }

    /**
     * @method reviveCell Revives specific cell
     * @param {Number} y Y axis of a cell
     * @param {Number} x X axis of a cell
     * @returns {Void}
     */
    reviveCell(y, x) {
        this.blocks[y][x].classList.add('alive');
        this.blocks[y][x].classList.remove('dead');
        this.blocks[y][x].dataset.state = 'alive'
    }
}