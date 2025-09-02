import { Item } from "../item";

export class WoodPlankItem extends Item {
    constructor(quantity: number) {
        super("wood_plank", quantity);
    }

    public use(tile: any): boolean {
        return false;
    }
}
















