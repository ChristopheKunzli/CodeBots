import Tile from "../tile";

export abstract class Item{
    protected maxStackSize:number;

    constructor(maxStackSize:number = 64){
        this.maxStackSize = maxStackSize;
    }

    public abstract use(tile:Tile):boolean;
}
