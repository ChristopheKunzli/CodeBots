import { Item } from "./item";

export class CodeBotItem extends Item{
    constructor(quantity: number) {
        super("codebot_item", quantity);
    }

    public use(tile: any): boolean {
        return false;
        //TODO place code bot
        /*
        if(tile.getContent != null)
            return false;
        tile.setContent = new CodeBot(tile);
        return true;
        */
    }
}