var config = {
    backgrounds: [
        '#bbbbbb',
        '#cccccc',
    ],
    speed: 1,
    radius: 100,
    appearingPadding: 30,
};

var animations = {
    appear: {
        attributeName: 'r',
        from: '0',
        to: '100',
        dur: '0.6s',
        begin: 'indefinite',
        values: '0; 40; 95; 165; 180; 155; 165',
        keyTimes: '0; 0.16; 0.33; 0.5; 0.67; 0.83; 1',
        repeatCount: '1',
        fill: 'freeze',
        id: 'animate-appear'
    },
};

function getNewColor(currentColor) {
    var currentIndex = config.backgrounds.indexOf(currentColor);
    var newIndex = currentIndex;
    while (newIndex === currentIndex) {
        newIndex = Math.floor(Math.random() * (config.backgrounds.length));
    }

    return config.backgrounds[newIndex];
}

function InitFlyingObject(rootSelector, circleSelector) {

    //fields
    this.speed = config.speed;
    this.radius = config.radius;
    this.element = $(rootSelector);
    this.elementCircle = $(circleSelector);
    this.elementBg = this.element.find('.graph-bg');
    this.bg = getNewColor(config.backgrounds[0]);

    this.widthRange = this.elementBg.innerWidth() - 2*this.radius;
    this.heightRange = this.elementBg.innerHeight() - 2*this.radius;

    console.log(this.elementBg.innerWidth());
    console.log(this.elementBg.innerHeight());
    console.log(this.widthRange);
    console.log(this.heightRange);
    this.startRangeX = [
        0 + config.appearingPadding + this.radius,
        this.widthRange - config.appearingPadding - this.radius
    ];
    this.startRangeY = [
        0 + config.appearingPadding + this.radius,
        this.heightRange - config.appearingPadding - this.radius
    ];
    this.scalesTable = {
        x: [
            [1,1],
            [0.95,1.05],
            [1.0375,0.9625],
            [0.975,1.025],
            [1.0125,0.9875],
            [1,1]
        ],
            y: [
            [1, 1],
            [1.05, 0.95],
            [0.9625, 1.0375],
            [1.025, 0.975],
            [0.9875, 1.0125],
            [1, 1]
        ],
        keyTimes: "0; 0.2; 0.4; 0.6; 0.8; 1",
        tableToString: function (table) {
            if (table) {
                return table.reduce(function (p1, p2) {
                    return p1 + "; " + p2.reduce(function (pp1, pp2) {
                            return pp1 + ", " + pp2;
                        });
                })
            } else {
                return '';
            }
        },
    };

    this.sleep = true;

    var that = this;

    //funcs
    this.init = function () {

        that.elementCircle
            .css("fill", that.bg);

        that.elementCircle.attr('r', this.radius);
        that.startPos = [
            Math.random() * (that.startRangeX[1] - that.startRangeX[0]) + that.startRangeX[0],
            Math.random() * (that.startRangeY[1] - that.startRangeY[0]) + that.startRangeY[0]
        ];

        that.vector = [Math.random()*2 - 1, Math.random()*2 - 1];

        that.setPosition(that.startPos);
        that.sleep = false;

        var currentAppearAnimation = $('#' + animations.appear.id);
        var appearingAnimation;
        if (currentAppearAnimation.length) {
            appearingAnimation = currentAppearAnimation[0];
        } else {
            appearingAnimation = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            for (var key in animations.appear) {
                appearingAnimation.setAttributeNS(null, key, animations.appear[key]);
            }
            that.elementCircle[0].appendChild(appearingAnimation);
        }

        appearingAnimation.beginElement();
        console.log("Ball ready");
    };

    this.calculateTranslateSequence = {
        left: function () {
            var centerX = that.elementCircle.attr("cx");
            var centerY = that.elementCircle.attr("cy");

            return that.scalesTable.x.reduce(function (p1, p2) {
                return p1 + "; " + p2.reduce(function (pp1, pp2) {
                        return (Number(centerX) - Number(that.radius)) * (1 - pp1) + ", " + (centerY) * (1 - pp2);
                    });
            })
        },
        right: function () {
            var centerX = that.elementCircle.attr("cx");
            var centerY = that.elementCircle.attr("cy");

            return that.scalesTable.x.reduce(function (p1, p2) {
                return p1 + "; " + p2.reduce(function (pp1, pp2) {
                        return (Number(centerX) + Number(that.radius)) * (1 - pp1) + ", " + (centerY) * (1 - pp2);
                    });
            })
        },
        top: function () {
            var centerX = that.elementCircle.attr("cx");
            var centerY = that.elementCircle.attr("cy");

            return that.scalesTable.x.reduce(function (p1, p2) {
                return p1 + "; " + p2.reduce(function (pp1, pp2) {
                        return (Number(centerX)) * (pp1 - 1) + ", " + 0;
                    });
            })
        },
        bottom: function () {
            var centerX = that.elementCircle.attr("cx");
            var centerY = that.elementCircle.attr("cy");

            return that.scalesTable.x.reduce(function (p1, p2) {
                return p1 + "; " + p2.reduce(function (pp1, pp2) {
                        return (Number(centerX)) * (pp1 - 1) + ", " + (Number(centerY) + Number(that.radius)) * (pp2 - 1);
                    });
            })
        },
    };

    this.setPosition = function (positionArray) {

        that.elementCircle.attr('cx', positionArray[0]);
        that.elementCircle.attr('cy', positionArray[1]);

    };

    this.move = function () {
        if (!that.sleep) {
            that.setPosition(that.checkCollision());
        }

    };

    //check collision and return max possible offset
    this.checkCollision = function() {
        var currentOffset = {
            left: that.elementCircle.attr('cx'),
            top: that.elementCircle.attr('cy'),
        };

        var newOffset = [
            +currentOffset.left + that.speed * that.vector[0],
            +currentOffset.top + that.speed * that.vector[1],
        ];

        if (newOffset[0] > that.widthRange) {
            newOffset[0] = that.widthRange;

            that.collisionMadeRight();
            that.vector[0] = -1 * that.vector[0];
        } else if (newOffset[0] < that.radius) {
            newOffset[0] = that.radius;

            that.collisionMadeLeft();
            that.vector[0] = -1 * that.vector[0];
        }

        if (newOffset[1] > that.heightRange) {
            newOffset[1] = that.heightRange;

            that.collisionMadeBottom();
            that.vector[1] = -1 * that.vector[1];
        } else if (newOffset[1] < that.radius) {
            newOffset[1] = that.radius;

            that.collisionMadeTop();
            that.vector[1] = -1 * that.vector[1];
        }

        return newOffset;
    };

    this.collisionMadeLeft = function() {

        var animationScaleObject = $("#animate-touch-scale"),
            animationTranslateObject = $("#animate-touch-translate");

        animationScaleObject.attr('keytimes', that.scalesTable.keyTimes);
        animationTranslateObject.attr('keytimes', that.scalesTable.keyTimes);

        animationScaleObject.attr('values', that.scalesTable.tableToString(that.scalesTable.x));
        animationTranslateObject.attr('values', that.calculateTranslateSequence.left());

        animationScaleObject[0].beginElement();
        animationTranslateObject[0].beginElement();

    };

    this.collisionMadeRight = function() {

        var animationScaleObject = $("#animate-touch-scale"),
            animationTranslateObject = $("#animate-touch-translate");

        animationScaleObject.attr('keytimes', that.scalesTable.keyTimes);
        animationTranslateObject.attr('keytimes', that.scalesTable.keyTimes);

        animationScaleObject.attr('values', that.scalesTable.tableToString(that.scalesTable.x));
        animationTranslateObject.attr('values', that.calculateTranslateSequence.right());

        animationScaleObject[0].beginElement();
        animationTranslateObject[0].beginElement();

    };

    this.collisionMadeBottom = function() {

        var animationScaleObject = $("#animate-touch-scale"),
            animationTranslateObject = $("#animate-touch-translate");

        animationScaleObject.attr('keytimes', that.scalesTable.keyTimes);
        animationTranslateObject.attr('keytimes', that.scalesTable.keyTimes);

        animationScaleObject.attr('values', that.scalesTable.tableToString(that.scalesTable.y));
        animationTranslateObject.attr('values', that.calculateTranslateSequence.bottom());

        animationScaleObject[0].beginElement();
        animationTranslateObject[0].beginElement();

    };

    this.collisionMadeTop = function() {

        var animationScaleObject = $("#animate-touch-scale"),
            animationTranslateObject = $("#animate-touch-translate");

        animationScaleObject.attr('keytimes', that.scalesTable.keyTimes);
        animationTranslateObject.attr('keytimes', that.scalesTable.keyTimes);

        animationScaleObject.attr('values', that.scalesTable.tableToString(that.scalesTable.y));
        animationTranslateObject.attr('values', that.calculateTranslateSequence.top());

        animationScaleObject[0].beginElement();
        animationTranslateObject[0].beginElement();

    };

    return this;
}

// Run!
$(window).on("load", function () {

    var flyingBall = InitFlyingObject(".graph-root", "#circle-object");
    var game = {};

    setTimeout(function () {
        flyingBall.init();
        game = setInterval(function() {flyingBall.move();}, 25);

    }, Math.random() * (3000 - 1000) + 1000);

});
