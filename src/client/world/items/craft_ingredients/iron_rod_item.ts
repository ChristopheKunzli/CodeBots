import { Item } from "../item";

export class IronRodItem extends Item {
    constructor(quantity: number) {
        super("iron_rod", quantity);

    }

    public use(tile: any): boolean {
        return false;
    }
}