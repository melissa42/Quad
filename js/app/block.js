/**
 * A module which exposes the Block type
 * @module app/block
 */
define(["app/config", "app/grid"], function(config, grid){
    "use strict"

    /**
     * A object which will occupy a single cell in the game grid.
     * @constructor
     * @alias module:app/block
     *
     * @param {Phaser.Game} game - A reference to the current game
     * @param {string} direction - One of "left", "right", "top", or "bottom"
     * @param {number} position - Column or row of the block
     * @param {number} offset - How far off the grid to initially position the block
     * @param {number} [color=0xFFFFFF] - Color of the block
     */
    var Block = function(game, direction, position, offset, color) {
        /** Reference to the current game
            @type {Phaser.Game} */
        this.game = game;

        this.direction = direction;
        this.position = position;
        this.offset = offset+3;
        this.color = color || config.color.unbreakable;
        this.visible = false;
        this.manualPosition = false;
        var point = grid.directionToPoint(this.direction, this.position, this.offset);
        this.graphics = this.game.add.graphics(point.x, point.y);

        /**
         * Callbacks to be executed when the block lands
         *
         * @type {function[]}
         */
        this.onDropComplete = [this.clear.bind(this)];
    }

    /**
     * Show the block outside the grid.
     *
     * @param {Phaser.Point} [position] - Optional position on canvas to display at
     */
    Block.prototype.display = function(position) {
        var position = position ||
            grid.directionToPoint(this.direction, this.position, this.offset);
        if (!this.manualPosition) {
            this.graphics.x = position.x;
            this.graphics.y = position.y;
        }
        this.graphics.lineStyle(0);
        this.graphics.beginFill(this.color, 1);
        this.graphics.drawRect(0, 0, grid.cellSize, grid.cellSize);
        this.graphics.endFill();
        this.visible = true;
        this.falling = false;
        return this;
    }

    /**
     * 'drop' the block onto the grid. The block must have been previously
     * displayed.
     *
     * @param {object} [coord] - Optional x, y coordinate to drop to
     * @param {bool} [noAnimate=false] - Do not animate the drop
     */
    Block.prototype.drop = function(coord, noAnimate) {
        var noAnimate = noAnimate || false;
        var coord = coord || grid.getFirstAvailable(this.direction, this.position);

        //TODO: Do this when the animation is finished?
        grid.contents[coord.y][coord.x] = this;

        if (!noAnimate && this.visible) {
            this.falling = true;
            var tween = this.game.add.tween(this.graphics);
            tween.onComplete.add(function(){
                this.falling = false;
                this.onDropComplete.map(function(callback){
                    callback();
                })
            }.bind(this));
            tween.to(grid.coordToPoint(coord), 200);
            tween.start();
        } else {
            var point = grid.coordToPoint(coord);
            this.graphics.position.x = point.x;
            this.graphics.position.y = point.y;
        }
        this.coord = coord;
        return this;
    }

    /**
     * Position the block at a specific coordinate (without animation)
     *
     * @param {object} coord - x, y coordinate to place the block
     */
    Block.prototype.positionAt = function(coord) {
        this.manualPosition = true;
        this.drop(coord, true);
        if (this.visible) {
            this.display();
        }
        return this;
    }

    /**
     * Clear surrounding blocks in the following way. If the block does not form
     * a square of blocks of the same color, do nothing. Otherwise, clear all
     * adjacent blocks (not counting diagonals) recursively.
     */
    Block.prototype.clear = function() {
        var matchingColor = function(block){
            return block && (block.color == this.color);
        }.bind(this);

        // Is there a square of blocks of the same color with 'coord' at the
        // bottom left?
        var checkForClear = function(coord){
            return matchingColor(grid.contents[coord.y][coord.x]) &&
                matchingColor(grid.contents[coord.y+1][coord.x]) &&
                matchingColor(grid.contents[coord.y][coord.x+1]) &&
                matchingColor(grid.contents[coord.y+1][coord.x+1])
        }

        // Check whether this block has formed a square of blocks of the same
        // color
        var doClear = checkForClear({x:this.coord.x, y:this.coord.y}) ||
            checkForClear({x:this.coord.x-1, y:this.coord.y})         ||
            checkForClear({x:this.coord.x, y:this.coord.y-1})         ||
            checkForClear({x:this.coord.x-1, y:this.coord.y-1});

        // Recursively remove all connected blocks of the same color
        var destroyed = [];
        var eraseBlocks = function(block) {
            if (destroyed.indexOf(block) != -1)
                return;
            destroyed.push(block.destroy());

            // below
            if (matchingColor(grid.contents[block.coord.y+1][block.coord.x]))
                eraseBlocks(grid.contents[block.coord.y+1][block.coord.x]);

            // above
            if (matchingColor(grid.contents[block.coord.y-1][block.coord.x]))
                eraseBlocks(grid.contents[block.coord.y-1][block.coord.x]);

            // right
            if (matchingColor(grid.contents[block.coord.y][block.coord.x+1]))
                eraseBlocks(grid.contents[block.coord.y][block.coord.x+1]);

            // left
            if (matchingColor(grid.contents[block.coord.y][block.coord.x-1]))
                eraseBlocks(grid.contents[block.coord.y][block.coord.x-1]);
        }.bind(this);

        if (doClear)
            eraseBlocks(this);

        return this;
    }

    Block.prototype.destroy = function(){
        var tween = this.game.add.tween(this.graphics.scale);
        tween.to({ x: 0, y: 0}, 50);
        tween.start();
        tween.onComplete.add(function(){
            this.graphics.destroy();
        }.bind(this));
        grid.contents[this.coord.y][this.coord.x] = undefined;
        return this;
    }

    /**
     * Slide the block in 'direction' on the game grid
     *
     * @param {string} direction - One of "top", "bottom", "left", or "right"
     */
    Block.prototype.slide = function(direction) {
        switch(direction.toLowerCase()) {
        case "top":
            this.coord.y -= 1;
            this.graphics.y -= grid.cellSize;
            break;
        case "bottom":
            this.coord.y += 1;
            this.graphics.y += grid.cellSize;
            break;
        case "left":
            this.coord.x -= 1;
            this.graphics.x -= grid.cellSize;
            break;
        case "right":
            this.coord.x += 1;
            this.graphics.x += grid.cellSize;
            break;
        default:
            throw("Invalid argument to Block.slide: " + direction)
        }
        return this;
    }

    /**
     * Make the current quad unbreakable
     */
    Block.prototype.unbreakable = function() {
        this.color = config.color.unbreakable;

        // If the block has already been drawn, force a redraw
        if (this.visible) {
            this.display();
        }
        return this;
    }

    return Block;
})
