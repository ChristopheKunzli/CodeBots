import { Item } from "../item";

export class ConcreteItem extends Item {
    constructor(quantity: number) {
        super("concrete", quantity);

    }

    public use(tile: any): boolean {
        return false;
    }
}