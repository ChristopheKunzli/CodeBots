import Tile from "../tile";

export abstract class Item{
    constructor(){

    }

    public abstract use(tile:Tile):boolean;
}
