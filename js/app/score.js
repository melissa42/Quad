/**
 * @module app/score
 */
define(['app/config', 'app/music', 'app/background'],
function(config, music, background){
    "use strict"

    /**
     * Score constructor
     */
    var Score = function() {
        this.board = 0;
        this.current = 0;
        this.level = 0;
    }

    /**
     * Initialize score
     */
    Score.prototype.init = function(game, grid, generator) {
        var text = "Level: 1\nScore: 0";
        var style = {
            font: "20px Arial",
            fill: "#fff",
            align: "left",
            shadowColor: "#000000",
            shadowOffsetX: 1,
            shadowOffsetY: 1
        };
        this.board = game.add.text(game.world.centerX + 150, 27, text, style);
        this.grid = grid;
        this.generator = generator;
    }

    /**
     * Update the scoreboard and level.
     */
    Score.prototype.update = function(clearCount) {
        var points = Math.pow(clearCount, config.points[this.level]);
        var levelDisplay = this.level + 1;
        this.current += Math.floor(points);
        this.board.text = "Level: " + levelDisplay + "\nScore: " + this.current;

        var newLevel = this.calcLevel();
        if (this.level < newLevel) {
            this.level = newLevel;
            this.newLevel();
        }
    }

    /**
     * Transition to a new level
     */
    Score.prototype.newLevel = function(){
        this.generator.setLevel(this.level);
        music.play("background" + (this.level+1));
        background.newColor(config.color.available[this.level][0]);

        this.generator.centerQuad.breakable();
        this.grid.clearAll();
        this.grid.resetMiddle();
        this.generator.centerQuad.redraw().toCenter().unbreakable();
    }

    /**
     * Calculate what level we are on now.
     */
    Score.prototype.calcLevel = function() {
        for (var i = config.checkpoints.length - 1; i >= 0; i--) {
            if (this.current >= config.checkpoints[i]) {
                return i+1;
            }
        }
        return this.level;
    }

    return new Score();

});