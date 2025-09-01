import Tile from "../world/tile";
import { InteractableType } from "./interactable_type";

export interface InteractionResult {
    type: "MINED" | "OPENED_UI" | "NONE";
    tile?: Tile;
    interactableType?: InteractableType;
}