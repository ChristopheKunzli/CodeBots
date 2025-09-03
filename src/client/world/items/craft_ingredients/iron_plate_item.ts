import { Item } from "../item";

export class IronPlateItem extends Item {
    constructor(quantity: number) {
        super("iron_plate", quantity);

    }

    public use(tile: any): boolean {
        return false;
    }
}