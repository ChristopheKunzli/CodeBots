import { InteractableType } from "../../types/interactable_type";
import Tile from "../tile";
import { Interactable } from "./interactable";

export class CodebotInteractable extends Interactable {
    constructor(tile:Tile) {
        super(InteractableType.CODEBOT, tile);
    }
}
