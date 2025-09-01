import { Item } from "../world/items/item"
import { ResourceType } from "./resource_type"

export type Recipe = {
    inputs: [{
        resource:ResourceType,
        quantity:number,
    }],
    output: {item:Item, quantity:number}
}