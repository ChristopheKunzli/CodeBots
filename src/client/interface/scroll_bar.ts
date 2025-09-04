import { Container, Graphics, Application } from "pixi.js";

/**
 * ScrollBar
 *
 * A custom vertical scrollbar for scrolling any content inside a container.
 * - Displays a track and a draggable thumb.
 * - Supports clicking on the track to jump the thumb.
 * - Handles mouse wheel scrolling.
 * - Notifies when scroll position changes.
 */
export class ScrollBar {
    private content: any;
    private parent: Container;
    private app: Application;

    private track: Graphics;
    private thumb: Graphics;

    private x: number;
    private y: number;
    private w: number;
    private h: number;

    private contentHeight = 0;
    private viewportHeight = 0;

    private dragging = false;
    private dragStartY = 0;
    private thumbStartY = 0;

    private onScrollCb?: (scrollTop: number) => void;

    private minThumbSize = 20;
    private contentBaseY: number;

    constructor(content: any, contentHeight: number, viewportHeight: number, parent: Container, x: number, y: number, w: number, h: number, app: Application) {
        this.content = content;
        this.parent = parent;
        this.app = app;

        this.contentHeight = contentHeight;
        this.viewportHeight = viewportHeight;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.contentBaseY = (content as any).y ?? 0;

        this.track = new Graphics();
        this.track.beginFill(0x222222, 0.5);
        this.track.drawRect(0, 0, this.w, this.h);
        this.track.endFill();
        this.track.x = this.x;
        this.track.y = this.y;
        this.parent.addChild(this.track);

        const initialThumbH = Math.max(this.minThumbSize, this.h * Math.min(1, this.viewportHeight / Math.max(1, this.contentHeight)));
        this.thumb = new Graphics();
        this.thumb.beginFill(0x999999, 1);
        this.thumb.drawRect(0, 0, this.w, initialThumbH);
        this.thumb.endFill();
        this.thumb.x = this.x;
        this.thumb.y = this.y;
        this.parent.addChild(this.thumb);

        this.thumb.interactive = true;
        this.thumb.on("pointerdown", (e: any) => this.onThumbDown(e));
        window.addEventListener("pointerup", this.onThumbUp);
        window.addEventListener("pointermove", this.onPointerMove);

        this.track.interactive = true;
        this.track.on("pointerdown", (e: any) => {
            const p = e.data.global;
            const localY = p.y - this.track.y;
            const targetThumbY = this.track.y + Math.max(0, Math.min(this.h - this.thumb.height, localY - this.thumb.height / 2));
            this.setThumbY(targetThumbY);
            this.applyScrollFromThumb();
        });

        const canvas = this.app.view;
        canvas.addEventListener("wheel", (ev) => {
            ev.preventDefault();
            const delta = ev.deltaY;
            const maxScroll = Math.max(0, this.contentHeight - this.viewportHeight);
            if (maxScroll <= 0) return;
            const currentScrollTop = this.thumbToScrollTop(this.thumb.y);
            const next = Math.max(0, Math.min(maxScroll, currentScrollTop + delta));
            this.scrollTo(next);
        }, { passive: false });
    }

    public update(contentHeight: number, viewportHeight: number) {
        this.contentHeight = contentHeight;
        this.viewportHeight = viewportHeight;

        const ratio = Math.min(1, this.viewportHeight / Math.max(1, this.contentHeight));
        const thumbH = Math.max(this.minThumbSize, this.h * ratio);

        this.thumb.clear();
        this.thumb.beginFill(0x999999, 1);
        this.thumb.drawRect(0, 0, this.w, thumbH);
        this.thumb.endFill();

        const maxThumbY = this.y + (this.h - this.thumb.height);
        if (this.thumb.y > maxThumbY) this.thumb.y = maxThumbY;
        if (this.thumb.y < this.y) this.thumb.y = this.y;

        this.applyScrollFromThumb();
    }

    public setOnScroll(cb: (scrollTop: number) => void) {
        this.onScrollCb = cb;
    }

    private onThumbDown(e: any) {
        this.dragging = true;
        this.dragStartY = e.data.global.y;
        this.thumbStartY = this.thumb.y;
    }

    private onThumbUp = () => {
        this.dragging = false;
    }

    private onPointerMove = (ev: PointerEvent) => {
        if (!this.dragging) return;
        const y = ev.clientY;
        const dy = y - this.dragStartY;
        let nextY = this.thumbStartY + dy;
        const minY = this.y;
        const maxY = this.y + (this.h - this.thumb.height);
        nextY = Math.max(minY, Math.min(maxY, nextY));
        this.setThumbY(nextY);
        this.applyScrollFromThumb();
    }

    private setThumbY(globalY: number) {
        this.thumb.y = globalY;
    }

    private applyScrollFromThumb() {
        const scrollTop = this.thumbToScrollTop(this.thumb.y);
        if (typeof (this.content as any).scrollTo === "function") {
            (this.content as any).scrollTo(scrollTop);
        } else {
            (this.content as any).y = this.contentBaseY - scrollTop;
        }
        if (this.onScrollCb) this.onScrollCb(scrollTop);
    }

    private thumbToScrollTop(thumbY: number) {
        const minY = this.y;
        const maxY = this.y + (this.h - this.thumb.height);
        const denom = (maxY - minY) || 1;
        const t = (thumbY - minY) / denom;
        const maxScroll = Math.max(0, this.contentHeight - this.viewportHeight);
        return t * maxScroll;
    }

    public scrollTo(scrollTop: number) {
        const maxScroll = Math.max(0, this.contentHeight - this.viewportHeight);
        const minY = this.y;
        const maxY = this.y + (this.h - this.thumb.height);
        const st = Math.max(0, Math.min(maxScroll, scrollTop));
        const denom = (maxScroll === 0) ? 1 : maxScroll;
        const thumbY = minY + (st / denom) * Math.max(0, maxY - minY);
        this.thumb.y = thumbY;
        this.applyScrollFromThumb();
    }

    public destroy() {
        window.removeEventListener("pointerup", this.onThumbUp);
        window.removeEventListener("pointermove", this.onPointerMove);
        this.track.destroy();
        this.thumb.destroy();
    }
}
