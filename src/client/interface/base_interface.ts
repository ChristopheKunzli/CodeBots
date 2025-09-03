import {Application, Container, ContainerChild, NineSliceSprite, Sprite, Spritesheet, Text} from 'pixi.js';
import {findTexture, TextureName} from "../spritesheet_atlas";
import { Item } from '../world/items/item';

export abstract class BaseInterface extends Container {
    protected app: Application;
    protected spritesheets: Spritesheet[];
    protected guiScale: number;
    protected hudLayer:Container;
    private onCloseCallBack: ()=>void = () =>{};
    protected constructor(app: Application, spritesheets: Spritesheet[], scale: number, onCloseCallBack:()=>void = ()=>{}) {
        super();
        this.app = app;
        this.spritesheets = spritesheets;
        this.guiScale = scale;
        this.hide();
        this.onCloseCallBack = onCloseCallBack;
    }

    protected abstract draw(): void;

    public hide(): void {
        this.onCloseCallBack();
        this.visible = false;
    }

    public show(): void {
        this.visible = true;
    }

    /**
     * Creates a close button and positions it at the top-right corner of the given container.
     * @param container
     */
    protected createCloseButton = (container: Container): Sprite => {
        const closeButton = new Sprite(findTexture(this.spritesheets, "close"));
        const bounds = container.getLocalBounds();
        closeButton.width = bounds.width * 0.05;
        closeButton.height = bounds.width * 0.05;
        closeButton.x = bounds.width - closeButton.width - 5;
        closeButton.y = 5;
        closeButton.interactive = true;
        closeButton.on('pointerdown', () => {
            this.hide();
        });
        closeButton.on('mouseover', () => {
            closeButton.tint = 0xff0000;
        })
        closeButton.on('mouseout', () => {
            closeButton.tint = 0xffffff;
        })
        return closeButton;
    }

    /**
     * Creates a centered container with a frame and a close button.
     * @param width
     * @param height
     * @param textureName
     * @param borderDimension
     */
    protected createCenteredContainer = (width: number, height: number, textureName: TextureName, borderDimension: number): Container => {
        const container = new Container();
        container.width = width;
        container.height = height;
        container.x = this.app.screen.width / 2 - (width / 2);
        container.y = this.app.screen.height / 2 - (height / 2);
        container.addChild(this.createFrame(width, height, textureName, borderDimension));
        container.addChild(this.createCloseButton(container));
        this.addChild(container);
        if (!this.hudLayer.children.includes(this)) {
            this.hudLayer.addChild(this);
        }
        return container;
    }

    /**
     * Creates a resizable frame using a nine-slice sprite.
     * @param width
     * @param height
     * @param textureName
     * @param borderDimension
     */
    protected createFrame = (width: number, height: number, textureName: TextureName, borderDimension: number): NineSliceSprite => {
        const texture = findTexture(this.spritesheets, textureName);
        if (!texture) throw new Error(`could not find texture ${textureName}`)

        return new NineSliceSprite({
            texture,
            leftWidth: borderDimension,
            topHeight: borderDimension,
            rightWidth: borderDimension,
            bottomHeight: borderDimension,
            width: width,
            height: height
        });
    }

    /**
     * Draws an item inside a given square container.
     * @param item the item to draw
     * @param container the square container to draw the item in
     * @param drawQty whether to show the item quantity at the bottom-right of the slot
     * @param drawNameOnHover whether to show the item name below the slot when hovering over the item
     * (note : this requires the container to leave enough space below the slotto show the text)
     */
    protected drawItem = (item: Item|null, container: ContainerChild, drawQty: boolean = true, drawNameOnHover: boolean = true) => {
        if (!item) return;

        const itemTexture = findTexture(this.spritesheets, item.spriteName);
        const itemSprite = new Sprite(itemTexture);

        const bounds = container.getLocalBounds();

        const length = bounds.height * 0.8;
        itemSprite.width = length;
        itemSprite.height = length;

        itemSprite.x = (bounds.width - itemSprite.width) / 2;
        itemSprite.y = (bounds.height - itemSprite.height) / 2;

        container.addChild(itemSprite);

        if (drawQty) {
            const quantityText = new Text({
                text: item.quantity > 1 ? item.quantity.toString() : '',
                style: {
                    fontFamily: `"Jersey 10", sans-serif`,
                    fontWeight: "400",
                    fontStyle: "normal",
                    fontSize: 8,
                    fill: '#000000',
                },
                resolution: 4,
            });

            quantityText.x = itemSprite.x + itemSprite.width - (quantityText.width * 1.1);
            quantityText.y = itemSprite.y + itemSprite.height - (quantityText.height * 1.1);
            container.addChild(quantityText);
        }

        if (drawNameOnHover) {
            const nameText = new Text({
                text: item.spriteName.replace(/_/g, ' ').toUpperCase() + (item.quantity > 1 ? ` x${item.quantity}` : ''),
                style: {
                    fill: '#ffffff',
                    fontSize: 8,
                    fontFamily: 'Jersey',
                    stroke: '#000000',
                },
                resolution: 4,
            });

            nameText.x = 0
            nameText.y = bounds.height;
            nameText.visible = false;
            container.addChild(nameText);

            container.interactive = true;
            container.on('mouseover', () => {
                nameText.visible = true;
            });

            container.on('mouseout', () => {
                nameText.visible = false;
            });
        }
    }
}
