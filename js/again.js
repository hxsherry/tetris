function random(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
}
WIDTH_NUM = 13;
HEIGH_NUM = 20;

function Category() {

}
Category.GROUND = 0;
Category.SOLID = 1;
Category.MOVE = 2;

function Color() {

}
Color.ALL = ["", "orange", "olive", "cornflowerblue", "cyan", "red"];

function Direction() {

}
Direction.UP = 0;
Direction.RIGHT = 1;
Direction.DOWN = 2;
Direction.LEFT = 3;

function Type() {

}
Type.I = 0;
Type.L1 = 1;
Type.L2 = 2;
Type.Z1 = 3;
Type.Z2 = 4;
Type.O = 5;
Type.T = 6;


Type.ALL = [];

//每个方向的形状和区间范围
Type.ALL[Type.I] = [0x4444, 0x0f00, 0x4444, 0x0f00,
    [-4, WIDTH_NUM - 2, HEIGH_NUM - 4, -1],
    [-5, WIDTH_NUM - 4, HEIGH_NUM - 2, 0],
    [-4, WIDTH_NUM - 2, HEIGH_NUM - 4, -1],
    [-5, WIDTH_NUM - 4, HEIGH_NUM - 2, 0]
];
Type.ALL[Type.L1] = [0x4460, 0x0740, 0x0622, 0x02e0,

    [-4, WIDTH_NUM - 3, HEIGH_NUM - 3, -1],
    [-5, WIDTH_NUM - 4, HEIGH_NUM - 3, -1],
    [-5, WIDTH_NUM - 3, HEIGH_NUM - 4, -1],
    [-5, WIDTH_NUM - 3, HEIGH_NUM - 3, 0]
];
Type.ALL[Type.L2] = [0x2260, 0x0470, 0x0644, 0x0e20,
    [-4, WIDTH_NUM - 3, HEIGH_NUM - 3, -1],
    [-5, WIDTH_NUM - 4, HEIGH_NUM - 3, -1],
    [-5, WIDTH_NUM - 3, HEIGH_NUM - 4, -1],
    [-5, WIDTH_NUM - 3, HEIGH_NUM - 3, 0]
];
Type.ALL[Type.Z1] = [0x0630, 0x0264, 0x0630, 0x0264,
    [-5, WIDTH_NUM - 4, HEIGH_NUM - 3, -1],
    [-5, WIDTH_NUM - 3, HEIGH_NUM - 4, -1],
    [-5, WIDTH_NUM - 4, HEIGH_NUM - 3, -1],
    [-5, WIDTH_NUM - 3, HEIGH_NUM - 4, -1]
];
Type.ALL[Type.Z2] = [0x0360, 0x0462, 0x0360, 0x0462,
    [-5, WIDTH_NUM - 4, HEIGH_NUM - 3, -1],
    [-5, WIDTH_NUM - 3, HEIGH_NUM - 4, -1],
    [-5, WIDTH_NUM - 4, HEIGH_NUM - 3, -1],
    [-5, WIDTH_NUM - 3, HEIGH_NUM - 4, -1]
];
Type.ALL[Type.O] = [0x0660, 0x0660, 0x0660, 0x0660,
    [-5, WIDTH_NUM - 3, HEIGH_NUM - 3, -1],
    [-5, WIDTH_NUM - 3, HEIGH_NUM - 3, -1],
    [-5, WIDTH_NUM - 3, HEIGH_NUM - 3, -1],
    [-5, WIDTH_NUM - 3, HEIGH_NUM - 3, -1]
];
Type.ALL[Type.T] = [0x04e0, 0x4640, 0x0720, 0x0262,
    [-5, WIDTH_NUM - 3, HEIGH_NUM - 3, 0],
    [-4, WIDTH_NUM - 3, HEIGH_NUM - 3, -1],
    [-5, WIDTH_NUM - 4, HEIGH_NUM - 3, -1],
    [-5, WIDTH_NUM - 3, HEIGH_NUM - 4, -1]
];


function Grid() {
    this.x = 0;
    this.y = 0;
    this.unit = 20;
    this.$dom = $('<span></span>');
    this.category = null;
    this.color = 0;
}
Grid.prototype.refresh = function () {
    this.$dom.removeAttr('class');
    //地板色，设置为无色
    var color = Color.ALL[null];
    if (this.category == Category.GROUND) {
        color = Color.ALL[0];
    }
    if (this.category == Category.SOLID) {
        color = Color.ALL[1]
    } else if (this.category == Category.MOVE) {
        color = Color.ALL[this.color]
    }
    this.$dom.addClass(color);
};

function Shape(game) {
    this.game = game;
    this.x = 0;
    this.y = 0;
    this.color = 0;
    this.type = Type.I;
    this.direction = Direction.UP;
}
//获取每个类型的每个grid,组成一个shape
Shape.prototype.getGrids = function (previewGrids) {
//如果没有预览的参数传进,则服务于stage
    if (!previewGrids) {
        previewGrids = this.game.grids;
    }
    var hex = Type.ALL[this.type][this.direction];
    var binary = hex.toString(2);
    var whiteLen = 16 - binary.length;
    for (var i = 0; i < whiteLen; i++) {
        binary = '0' + binary;
    }
    //四个grids
    var grids = [];
    for (var y0 = 0; y0 < 4; y0++) {
        for (var x0 = 0; x0 < 4; x0++) {
            var index = 4 * y0 + x0;
            var bit = binary.charAt(index);
            //在舞台上每个grid的坐标
            var x = this.x + x0;
            var y = this.y + y0;
            //二进制,'1'代表有一个grid
            if (bit == '1' && y >= 0) {
                grids.push(previewGrids[x][y])
            }
        }
    }

    return grids;

};


Shape.prototype.setCategory = function (state) {
    var grids = this.getGrids();
    for (var i = 0; i < grids.length; i++) {
        var grid = grids[i];
        grid.category = state;
        grid.color = this.color;

    }

};
Shape.prototype.isValid = function () {
    //边界是否合法,edge代表边界的数组
    var edge = Type.ALL[this.type][4 + this.direction];

    if (this.x > edge[1]) {
        return false;
    }
    else if (this.y > edge[2]) {
        return false;
    }
    else if (this.x < edge[3]) {
        return false;
    }
//状态是否合法,如果掉下来与之前的重合则不合法了
    var grids = this.getGrids();
    for (var i = 0; i < grids.length; i++) {
        var grid = grids[i];
        if (grid.category == Category.SOLID) {
            return false;
        }
    }
    return true;
};
Shape.prototype.newShape = function (x, y, direction) {
    var newShape = new Shape(this.game);
    newShape.x = x;
    newShape.y = y;
    newShape.direction = direction;
    newShape.type = this.type;
    return newShape;

};


Shape.prototype.changeDirection = function () {
    var newDirection = this.direction;
    newDirection++;
    if (newDirection > 3) {
        newDirection = Direction.UP;
    }
    var nextShape = this.newShape(this.x, this.y, newDirection);
    if (nextShape.isValid()) {
        this.setCategory(Category.GROUND);
        this.direction = newDirection;
        this.setCategory(Category.MOVE);
        this.game.refreshStage();
    }
};
Shape.prototype.moveRightOneStep = function () {
    var nextShape = this.newShape(this.x + 1, this.y, this.direction);
    if (nextShape.isValid()) {
        this.setCategory(Category.GROUND);
        this.x++;
        this.setCategory(Category.MOVE);
        this.game.refreshStage();
    }
};
Shape.prototype.moveLeftOneStep = function () {
    var nextShape = this.newShape(this.x - 1, this.y, this.direction);
    if (nextShape.isValid()) {
        this.setCategory(Category.GROUND);
        this.x--;
        this.setCategory(Category.MOVE);
        this.game.refreshStage();
    }
};
Shape.prototype.dropOneStep = function () {
    var nextShape = this.newShape(this.x, this.y + 1, this.direction);
    if (nextShape.isValid()) {
        this.setCategory(Category.GROUND);
        this.y++;
        this.setCategory(Category.MOVE);
        this.game.refreshStage();
        return true;
    } else {
        this.setCategory(Category.SOLID);
        this.game.refreshStage();
        return false;
    }
};


function Game() {
    this.$stage = $('.stage');
    this.grids = [];

    this.$box = $('.box');
    this.boxGrids = [];

    this.shape = null;
    this.previewShape = null;

    this.interval = 200;
    this.score = 0;
    this.highScore = 0;
    this.intervalHandler = null;
    this.bgSound = null;
    this.eliSound = null;

}
Game.prototype.fillGrids = function () {
    for (var x = 0; x < WIDTH_NUM; x++) {
        var xArr = [];
        for (var y = 0; y < HEIGH_NUM; y++) {
            var grid = new Grid();
            xArr.push(grid);
            grid.x = x;
            grid.y = y;
            grid.$dom.css(
                {
                    left: x * grid.unit + "px",
                    top: y * grid.unit + 'px'
                });

            this.$stage.append(grid.$dom);
        }
        this.grids.push(xArr);
    }
    for (var x1 = 0; x1 < 4; x1++) {
        var xArr1 = [];
        for (var y1 = 0; y1 < 4; y1++) {
            var grid1 = new Grid();
            xArr1.push(grid1);
            grid1.x = x1;
            grid1.y = y1;

            grid1.$dom.css(
                {
                    left: x1 * grid1.unit + "px",
                    top: y1 * grid1.unit + 'px'
                });

            this.$box.append(grid1.$dom);
        }
        this.boxGrids.push(xArr1);

    }

};
Game.prototype.listenEvent = function () {
    var that = this;
    $('body').keydown(function (e) {
        if (e.keyCode == 38) {
            that.shape.changeDirection();

        } else if (e.keyCode == 39) {

            that.shape.moveRightOneStep();
        } else if (e.keyCode == 40) {
            that.interval = 0;
        } else if (e.keyCode == 37) {
            that.shape.moveLeftOneStep();

        }

    });
    $('.reStart').click(function () {
        that.start();
    });
    $('.up').click(function () {
        that.shape.changeDirection();
    });
    $('.right').click(function () {
        that.shape.moveRightOneStep();
    });
    $('.down').click(function () {
        that.interval = 0;
    });
    $('.left').click(function () {
        that.shape.moveLeftOneStep();
    })


};
Game.prototype.refreshStage = function () {
    for (var x = 0; x < WIDTH_NUM; x++) {
        for (var y = 0; y < HEIGH_NUM; y++) {
            var grid = new Grid();
            grid = this.grids[x][y];
            grid.refresh();

        }
    }


};
Game.prototype.eliminateOneLine = function (y) {
    for (var x1 = 0; x1 < WIDTH_NUM; x1++) {
        var grid = this.grids[x1][y];
        if (grid.category != Category.SOLID) {
            return false;
        }
    }
    //删行的本质就是让上一行落到下一行,其他静态的为地板
    for (var y2 = y; y2 >= 0; y2--) {
        for (var x2 = 0; x2 < WIDTH_NUM; x2++) {
            if (y2 == 0) {
                this.grids[x2][y2].category = Category.GROUND;

            } else {

                this.grids [x2][y2].category = this.grids[x2][y2 - 1].category;
                this.eliSound.play();
            }
        }

    }
    return true;
};
Game.prototype.eliminateLines = function () {
    var lines = 0;
    for (var y = HEIGH_NUM - 1; y >= 0; y--) {
        while (this.eliminateOneLine(y)) {
            lines++;
        }
    }
    if (lines == 1) {
        this.score += 100;
    } else if (lines == 2) {
        this.score += 300;
    } else if (lines == 3) {
        this.score += 500;
    } else if (lines == 4) {
        this.score += 1000;
    }

    if (this.score > this.highScore) {
        this.highScore = this.score;
    }

    this.updateScore();
};
Game.prototype.updateScore = function () {
    $('.score').html(this.score);
    $('.highScore').html(this.highScore)
};
Game.prototype.isGameOver = function () {
    var grids = this.shape.getGrids();
    return grids.length < 4;

};
Game.prototype.initBgMusic = function () {
    this.bgSound = new Howl({
        src: ['sound/tetris.mp3'],
        autoplay: false,
        loop: true,
        volume: 0.3
    });
    this.bgSound.once('load', function () {
        this.play();
    });


};
Game.prototype.initEliminSound = function () {
    this.eliSound = new Howl({
        src: ['sound/elimin.mp3'],
        autoplay: false,
        loop: false,
        volume: 0.3
    });


};

Game.prototype.refreshBox = function () {
    if (!this.previewShape) {
        this.previewShape = new Shape(this);
    }
    this.previewShape.direction = random(0, 3);
    this.previewShape.type = random(0, 6);
//先把其置为地板
    for (var x = 0; x < 4; x++) {
        for (var y = 0; y < 4; y++) {
            var grid = this.boxGrids[x][y];
            grid.category = Category.GROUND;
            grid.refresh();
        }
    }
    var grids = this.previewShape.getGrids(this.boxGrids);
    for (var i = 0; i < grids.length; i++) {
        grids[i].category = Category.SOLID;
        grids[i].refresh();
    }

};

Game.prototype.refreshShape = function () {
    if (!this.shape) {
        this.shape = new Shape(this);
    }
    this.shape.x = 5;
    this.shape.y = -4;
    this.shape.direction = this.previewShape.direction;
    this.shape.type = this.previewShape.type;
    this.shape.color = random(1, 5);

};

Game.prototype.broomStage = function () {
    for (var x = 0; x < WIDTH_NUM; x++) {
        for (var y = 0; y < HEIGH_NUM; y++) {
            var grid = this.grids[x][y];
            grid.category = Category.GROUND;
            grid.refresh();
        }
    }

};

Game.prototype.start = function () {
    var that = this;
    if (that.intervalHandler) {
        clearInterval(that.intervalHandler);
    }
    this.bgSound.stop();
    this.bgSound.play();

    this.refreshBox();
    this.refreshShape();
    this.score = 0;
    this.updateScore();
    this.broomStage();

    var temp = 0;

    function intervalFunc() {
        if (temp > that.interval) {
            temp = 0;
            var canDrop = that.shape.dropOneStep();
            if (!canDrop) {
                if (that.isGameOver()) {
                    that.bgSound.stop();
                    alert('game is over!');
                    clearInterval(that.intervalHandler);


                } else {
                    that.eliminateLines();
                    that.interval = 200;
                    that.refreshShape();
                    that.refreshBox();
                }
            }

        } else {
            temp += 10;
        }
    }

    this.intervalHandler = setInterval(intervalFunc, 10);
};


Game.prototype.init = function () {
    this.fillGrids();
    this.initBgMusic();
    this.initEliminSound();
    this.listenEvent();
    this.start();
};

$(document).ready(function () {
    var game = new Game();
    game.init();
});


