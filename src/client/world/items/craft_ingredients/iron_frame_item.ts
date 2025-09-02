import { Item } from "../item";

export class IronFrameItem extends Item {
    constructor(quantity: number) {
        super("iron_frame", quantity);

    }

    public use(tile: any): boolean {
        return false;
    }
}