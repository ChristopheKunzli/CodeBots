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
import { Item } from "../world/items/item";

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

    parseItem(object: Object): Item|ErrorObject {
        if (!(object instanceof HashObject)) {
            return new ErrorObject(`unsupported argument type: ${object.type()}`);
        }

        const type = object.pairs.get(new StringObject("type").hashKey().toString())?.value;

        if (!(type instanceof StringObject)) {
            return new ErrorObject(`unsupported argument type: ${type?.type()}`);
        }
        if (!this.isValidItemType(type.value)) {
            return new ErrorObject(`invalid item type: ${type.value}`);
        }

        const amount = object.pairs.get(new StringObject("amount").hashKey().toString())?.value;

        if (amount && !(amount instanceof IntegerObject)) {
            return new ErrorObject(`unsupported argument type: ${amount?.type()}`);
        }

        // TODO
        throw new Error("not implemented");
        // return {
        //     type: type.value,
        //     amount: amount?.value ?? 1,
        // };
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
            "canTake": new BuiltinObject(async (...args) => {
                if (args.length !== 1) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 1`);
                }

                const item = this.parseItem(args[0]);
                if (item instanceof ErrorObject) {
                    return item;
                }

                return new BooleanObject(this.codebot.inventory.canAddItem(item));
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

                return new BooleanObject(this.codebot.inventory.canRemoveItem(item));
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

                if (!this.codebot.inventory.canRemoveItem(item)) {
                    return new ErrorObject("unable to deposit such amount");
                }

                this.codebot.inventory.removeItem(item);

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

                if (!this.codebot.inventory.canAddItem(item)) {
                    return new ErrorObject("unable to take such amount");
                }

                this.codebot.inventory.addItem(item);

                // TODO
                throw new Error("not implemented");
            }),
            "hold": new BuiltinObject(async (...args) => {
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
            "find": new BuiltinObject(async (...args) => {
                // (ressource) => coordinate
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
                // () => void
                // TODO: get item type

                throw new Error("not implemented");
            }),
            "place": new BuiltinObject(async (...args) => {
                // (item) => void

                // TODO
                throw new Error("not implemented");
            }),
            "craft": new BuiltinObject(async (...args) => {
                // (item) => void : parametrer la workbench

                throw new Error("not implemented");
            }),
            "smelt": new BuiltinObject(async (...args) => {
                // (item) => void : parametrer la workbench

                throw new Error("not implemented");
            }),
            "print": new BuiltinObject(async (...args) => {
                const message = args.map((arg) => arg.inspect()).join("\n");

                this.codebot.setMessage(message);

                if (printTimeout) {
                    clearTimeout(printTimeout);
                }
                printTimeout = setTimeout(() => this.codebot.setMessage(null), 2000);

                return NULL;
            })
        };
    }
}
