import { Player } from "../entity/player";
import { CAMERA_ZOOM, TILE_SIZE } from "../constants";

/**
 * Represents the camera that controls the visible part of the game world
 * The camera follows the player and applies zoom to the view
 */
export class Camera {
    public x = 0;
    public y = 0;

    /**
     * Makes the camera follow the player, centering them on the screen
     * @param player The player to follow
     * @param screenWidth The width of the screen in pixels
     * @param screenHeight The height of the screen in pixels
     */
    public follow(player: Player, screenWidth: number, screenHeight: number): void {
        this.x =  screenWidth / 2 - player.posX * TILE_SIZE * this.zoom - TILE_SIZE;
        this.y = screenHeight / 2 - player.posY * TILE_SIZE * this.zoom - TILE_SIZE;
    }

    /**
     * The current zoom level of the camera (the scaling to apply to the main container)
     */
    get zoom() {
        return CAMERA_ZOOM;
    }
}
