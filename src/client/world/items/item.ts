import Tile from "../tile";

export abstract class Item{
    public abstract use(tile:Tile):boolean;
}
