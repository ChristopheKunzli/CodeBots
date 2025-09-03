import { Item } from "../item";

export class CementItem extends Item {
    constructor(quantity: number) {
        super("cement", quantity);

    }

    public use(tile: any): boolean {
        return false;
    }
}