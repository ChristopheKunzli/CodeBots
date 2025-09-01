
import { TextureName } from "../spritesheet_atlas";

export type CoreItem = {
    spriteName: TextureName
    currentGathered: number
    goal: number
}

export type CoreStep = {
    stepNumber: number,
    items: CoreItem[]
}

