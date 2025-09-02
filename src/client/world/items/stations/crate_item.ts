import { Item } from "../item";

export class CrateItem extends Item {
    constructor(quantity: number,) {
        super("crate", quantity);
    }

    public use(tile: any): boolean {
        return false;
    }
}