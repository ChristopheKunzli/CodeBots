import Tile from "../tile";
import { Item } from "./item";

export class WoodItem extends Item{
    
    public use(tile: Tile): boolean {
        return false;
    }
}