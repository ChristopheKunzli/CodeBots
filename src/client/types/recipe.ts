import { Item } from "../world/items/item"
import { ItemType } from "./item"
import { ResourceType } from "./resource_type"

export type Recipe = {
    inputs: Item[],
    output: Item
}