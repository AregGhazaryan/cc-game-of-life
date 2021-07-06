class Game {
    constructor() {
        this.element = document.getElementById('#game');
        this.blocks = [];
        this.generation = 0;
    }

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

        const randomBtn = document.createElement('button')
        randomBtn.innerHTML = 'Generate Random Cells'
        randomBtn.classList.add('fancy-btn')

        randomBtn.addEventListener('click', () => this.randomCells());

        const startBtn = document.createElement('button')
        startBtn.innerHTML = 'Start';
        startBtn.classList.add('fancy-btn');

        startBtn.addEventListener('click', () => this.start())

        this.element.append(randomBtn);
        this.element.append(startBtn);
    }

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

    start(frequency = 50) {
        setInterval(() => {
            this.nextGen();
        }, frequency)
    }

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

    killCell(y, x) {
        this.blocks[y][x].classList.add('dead');
        this.blocks[y][x].classList.remove('alive');
        this.blocks[y][x].dataset.state = 'dead'
    }

    reviveCell(y, x) {
        this.blocks[y][x].classList.add('alive');
        this.blocks[y][x].classList.remove('dead');
        this.blocks[y][x].dataset.state = 'alive'
    }
}