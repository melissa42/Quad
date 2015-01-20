/**
 * A module which defines controls for the game
 * @module app/controls
 */
define(["app/config", "app/generator", "Phaser", "app/grid"],
function(config, generator, Phaser, grid){
    "use strict"

    var controls = {
        rotating : false,
        shifting : false,
        postMove : function() {},
        update : function(game) {
            // TODO: maybe move this to postMove for performance (causes issues)
            generator.highlightPath();

            if (!controls.rotating &&
                game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                controls.rotating = true;
                generator.rotateCCW();
                setTimeout(function(){
                    controls.rotating = false;
                }, 100);
                controls.postMove();
            }
            else if (!controls.rotating &&
                     game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                controls.rotating = true;
                generator.rotateCW();
                setTimeout(function(){
                    controls.rotating = false;
                }, 100);
                controls.postMove();
            }
            else if (!controls.shifting &&
                     game.input.keyboard.isDown(Phaser.Keyboard.W) &&
                     generator.fallingQuads.length == 0) {
                controls.shifting = true;
                grid.slideUp();
                setTimeout(function(){
                    controls.shifting = false;
                }, 100);
                controls.postMove();
            }
            else if (!controls.shifting &&
                     game.input.keyboard.isDown(Phaser.Keyboard.S) &&
                     generator.fallingQuads.length == 0) {
                controls.shifting = true;
                grid.slideDown();
                setTimeout(function(){
                    controls.shifting = false;
                }, 100);
                controls.postMove();
            }
            else if (!controls.shifting &&
                     game.input.keyboard.isDown(Phaser.Keyboard.A) &&
                     generator.fallingQuads.length == 0) {
                controls.shifting = true;
                grid.slideLeft();
                setTimeout(function(){
                    controls.shifting = false;
                }, 100);
                controls.postMove();
            }
            else if (!controls.shifting &&
                     game.input.keyboard.isDown(Phaser.Keyboard.D) &&
                     generator.fallingQuads.length == 0) {
                controls.shifting = true;
                grid.slideRight();
                setTimeout(function(){
                    controls.shifting = false;
                }, 100);
                controls.postMove();
            }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                generator.drop();
                controls.postMove();
            }
        }
    };

    return controls;
});
