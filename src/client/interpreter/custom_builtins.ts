import BuiltinObject from "codebotsinterpreter/lib/object/builtin_object";
import IntegerObject from "codebotsinterpreter/lib/object/integer_object";
import ErrorObject from "codebotsinterpreter/lib/object/error_object";
import BooleanObject from "codebotsinterpreter/lib/object/boolean_object";
import StringObject from "codebotsinterpreter/lib/object/string_object";
import HashObject from "codebotsinterpreter/lib/object/hash_object";
import {NULL} from "codebotsinterpreter/lib/evaluator";
import type {Codebot} from "../entity/codebot";
import {ITEM_TYPES, ItemType} from "../types/item";
import { Object } from "codebotsinterpreter/lib/object";
import {Position} from "../types/position";
import { RESOURCE_TYPES, ResourceType } from "../types/resource_type";
import { HashPair } from "codebotsinterpreter/lib/object/hash_key";
import { World } from "../world/world";
import { INVENTORY_STACK_SIZE } from "../constants";

type Resource = (typeof RESOURCE_TYPES)[number];

let printTimeout: NodeJS.Timeout|null = null;

export default class CustomBuiltins {
    private codebot: Codebot;
    private world: World;

    constructor (codebot: Codebot, world: World) {
        this.codebot = codebot;
        this.world = world;
    }

    isValidItemType(itemType: string): itemType is ItemType {
        return ITEM_TYPES.includes(itemType as ItemType);
    }

    isValidResourceType(resourceType: string): resourceType is Resource {
        return RESOURCE_TYPES.includes(resourceType as Resource);
    }

    parsePosition(object: Object): Position|ErrorObject {
        if (!(object instanceof HashObject)) {
            return new ErrorObject(`unsupported argument type: ${object.type()}`);
        }

        const x = object.pairs.get(new StringObject("x").hashKey().toString())?.value;

        if (!(x instanceof IntegerObject)) {
            return new ErrorObject(`invalid x: ${x?.type()}`);
        }

        const y = object.pairs.get(new StringObject("y").hashKey().toString())?.value;

        if (!(y instanceof IntegerObject)) {
            return new ErrorObject(`invalid x: ${y?.type()}`);
        }

        return {x: x.value, y: y.value};
    }

    parseItemType(object: Object): ItemType|ErrorObject {
        if (!(object instanceof StringObject)) {
            return new ErrorObject(`unsupported argument type: ${object?.type()}`);
        }
        if (!this.isValidItemType(object.value)) {
            return new ErrorObject(`invalid item type: ${object.value}`);
        }

        return object.value;
    }

    parseItem(object: Object): {type: ItemType; amount: number}|ErrorObject {
        if (!(object instanceof HashObject)) {
            return new ErrorObject(`unsupported argument type: ${object.type()}`);
        }

        const type = object.pairs.get(new StringObject("type").hashKey().toString())?.value;
        if (!type) {
            return new ErrorObject("type key not found");
        }

        const itemType = this.parseItemType(type);
        if (itemType instanceof ErrorObject) {
            return itemType;
        }

        const amount = object.pairs.get(new StringObject("amount").hashKey().toString())?.value;

        if (amount && !(amount instanceof IntegerObject)) {
            return new ErrorObject(`unsupported argument type: ${amount?.type()}`);
        }

        return {
            type: itemType,
            amount: amount?.value ?? 1,
        };
    }

    parseResource(object: Object): ResourceType|ErrorObject {
        if (!(object instanceof StringObject)) {
            return new ErrorObject(`unsupported argument type: ${object.type()}`);
        }

        if (!this.isValidResourceType(object.value)) {
            return new ErrorObject(`invalid resource type: ${object.value}`);
        }

        return ResourceType[object.value.toUpperCase()];
    }

    getPositionObject({x, y}: Position): HashObject {
        const pairs = new Map<string, HashPair>();

        const keyX = new StringObject("x");
        pairs.set(keyX.hashKey().toString(), {
            key: keyX,
            value: new IntegerObject(x),
        });

        const keyY = new StringObject("y");
        pairs.set(keyY.hashKey().toString(), {
            key: keyY,
            value: new IntegerObject(y),
        });

        return new HashObject(pairs);
    }

    get builtins(): Record<string, BuiltinObject> {
        return {
            "goto": new BuiltinObject(async (...args) => {
                if (args.length !== 1) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 1`);
                }

                const position = this.parsePosition(args[0]);

                if (position instanceof ErrorObject) {
                    return position;
                }

                await this.codebot.moveTo(position);

                return NULL;
            }),
            "canCarry": new BuiltinObject(async (...args) => {
                if (args.length !== 1) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 1`);
                }

                const itemType = this.parseItemType(args[0]);
                if (itemType instanceof ErrorObject) {
                    return itemType;
                }

                return new BooleanObject(this.codebot.inventory.items.some((i) => i === null || (i.isStackable && i.spriteName === itemType && i.quantity < INVENTORY_STACK_SIZE)));
            }),
            "isEmpty": new BuiltinObject(async (...args) => {
                if (args.length !== 0) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 0`);
                }

                return new BooleanObject(this.codebot.inventory.isEmpty());
            }),
            "wait": new BuiltinObject(async (...args) => {
                if (args.length !== 1) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 1`);
                }

                const [arg] = args;

                if (!(arg instanceof IntegerObject)) {
                    return new ErrorObject(`unsupported argument type: ${arg.type()}`);
                }

                await new Promise((resolve) => setTimeout(resolve, arg.value));

                return NULL;
            }),
            "has": new BuiltinObject(async (...args) => {
                // (item) => boolean
                if (args.length !== 1) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 1`);
                }

                const item = this.parseItem(args[0]);
                if (item instanceof ErrorObject) {
                    return item;
                }

                return new BooleanObject(this.codebot.inventory.items.some((i) => i?.spriteName === item.type && i.quantity >= item.amount));
            }),
            "hold": new BuiltinObject(async (...args) => {
                if (args.length !== 1) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 1`);
                }

                const itemType = this.parseItemType(args[0]);
                if (itemType instanceof ErrorObject) {
                    return itemType;
                }

                const itemIndex = this.codebot.inventory.items.findIndex((i) => i?.spriteName === itemType);
                if (itemIndex === -1) {
                    return new ErrorObject(`item not in inventory: ${itemType}`);
                }

                const itemInHand = this.codebot.inventory.itemInHand;
                this.codebot.inventory[this.codebot.inventory.getItemInHandIndex()] = this.codebot.inventory[itemIndex];
                this.codebot.inventory[itemIndex] = itemInHand;

                return NULL;
            }),
            "find": new BuiltinObject(async (...args) => {
                if (args.length !== 1) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 1`);
                }

                const resource = this.parseResource(args[0]);
                if (resource instanceof ErrorObject) {
                    return resource;
                }

                const codebotPosition = {x: this.codebot.posX, y: this.codebot.posY};
                const position = this.world.getNearestResourceFromPosition(codebotPosition, resource);
                if (!position) {
                    return new ErrorObject(`could not find resource ${args[0].inspect()}`);
                }

                return this.getPositionObject(position);
            }),
            "gather": new BuiltinObject(async (...args) => {
                const posX = Math.round(this.codebot.posX);
                const posY = Math.round(this.codebot.posY);
                const tile = this.world.getTileAt(posX, posY);
                if (!tile) {
                    return new ErrorObject("tile not loaded");
                }

                let result = this.codebot.interactWithTile(tile);
                await new Promise<void>(async (resolve) => {
                    while (result.type === "MINING") {
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                        result = this.codebot.interactWithTile(tile);
                    }
                    resolve();
                });

                return NULL;
            }),
            "print": new BuiltinObject(async (...args) => {
                const message = args.map((arg) => arg.inspect()).join("\n");

                this.codebot.setMessage(message);

                if (printTimeout) {
                    clearTimeout(printTimeout);
                }
                printTimeout = setTimeout(() => this.codebot.setMessage(null), 2000);

                return NULL;
            }),
            "craft": new BuiltinObject(async (...args) => {
                if (args.length !== 1) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 1`);
                }

                const item = this.parseItem(args[0]);
                if (item instanceof ErrorObject) {
                    return item;
                }

                const posX = Math.round(this.codebot.posX);
                const posY = Math.round(this.codebot.posY);
                const tile = this.world.getTileAt(posX, posY);
                if (!tile) {
                    return new ErrorObject("tile not loaded");
                }

                for (let i = 0; i < item.amount; ++i) {
                    this.codebot.interactWithTile(tile, item.type);
                }

                return NULL;
            }),
            "deposit": new BuiltinObject(async (...args) => {
                // (item) => void
                if (args.length !== 1) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 1`);
                }

                const item = this.parseItem(args[0]);
                if (item instanceof ErrorObject) {
                    return item;
                }

                // TODO
                throw new Error("not implemented");
            }),
            "take": new BuiltinObject(async (...args) => {
                // (item) => void : dans un coffre
                if (args.length !== 1) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 1`);
                }

                const item = this.parseItem(args[0]);
                if (item instanceof ErrorObject) {
                    return item;
                }

                // TODO
                throw new Error("not implemented");
            }),
            "smelt": new BuiltinObject(async (...args) => {
                // (item) => void : parametrer la workbench

                throw new Error("not implemented");
            }),
        };
    }
}
