export type MaterialType = "wood" | "stone" | "copper" | "iron";

/**
 * Represents the material a tool is made of
 * The material affects the tool's efficiency
 */
export abstract class ToolMaterial {
    private readonly _materialType: MaterialType;
    private readonly _coefficient: number;

    public get coefficient(): number {
        return this._coefficient;
    }

    public get materialType(): MaterialType {
        return this._materialType;
    }

    /**
     * Creates a new ToolMaterial
     * @param materialType The type of material
     * @param coefficient The efficiency multiplier of this material
     */
    protected constructor(materialType: MaterialType, coefficient: number) {
        this._materialType = materialType;
        this._coefficient = coefficient;
    }
}

