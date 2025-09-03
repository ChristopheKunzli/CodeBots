import { InteractableType } from "../../types/interactable_type";
import Tile from "../tile";
import { Interactable } from "./interactable";

export class CraftingTable extends Interactable {
    constructor(tile: Tile) {
        super(InteractableType.CRAFTING_TABLE, tile);
    }
}
