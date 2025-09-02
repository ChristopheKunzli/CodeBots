import { Item } from "../item";

export class ReinforcedIronPlateItem extends Item {
    constructor(quantity: number) {
        super("reinforced_iron_plate", quantity);

    }

    public use(tile: any): boolean {
        return false;
    }
}