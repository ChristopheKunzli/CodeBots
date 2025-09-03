import { Item } from "../item";

export class NailItem extends Item {
    constructor(quantity: number) {
        super("nail", quantity);

    }

    public use(tile: any): boolean {
        return false;
    }
}