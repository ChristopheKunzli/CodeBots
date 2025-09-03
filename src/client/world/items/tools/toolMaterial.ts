export type MaterialType = "wood" | "stone" | "copper" | "iron";

export abstract class ToolMaterial {
    private readonly _materialType: MaterialType;
    private readonly _coefficient: number;

    public get coefficient(): number {
        return this._coefficient;
    }

    public get materialType(): MaterialType {
        return this._materialType;
    }

    protected constructor(materialType: MaterialType, coefficient: number) {
        this._materialType = materialType;
        this._coefficient = coefficient;
    }
}

