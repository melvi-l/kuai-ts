import { expect, it } from "vitest";
import { h } from "../h";
import { createDom } from "../dom";

it("should create a <div> element", () => {
    const vnode = h("div", {});
    const el = createDom(vnode);
    expect(el).toBeInstanceOf(HTMLDivElement);
});

it("should create a text node", () => {
    const vnode = h("__text", { value: "Hello" });
    const el = createDom(vnode);
    expect(el).toBeInstanceOf(Text);
    expect(el.textContent).toBe("Hello");
});

it("should set props like id and disabled", () => {
    const vnode = h("button", { id: "btn", disabled: true });
    const el = createDom(vnode) as HTMLButtonElement;
    expect(el.id).toBe("btn");
    expect(el.disabled).toBe(true);
});

it("should set partial style", () => {
    const vnode = h("div", { style: { background: "#F1F1F1" } });
    const el = createDom(vnode) as HTMLDivElement;

    expect(getComputedStyle(el).backgroundColor).toBe("rgb(241, 241, 241)");
});

it("should apply classes", () => {
    const vnode = h("div", {
        class: { active: true, hidden: false },
    });
    const el = createDom(vnode) as HTMLElement;

    expect(el.classList.contains("active")).toBe(true);
    expect(el.classList.contains("hidden")).toBe(false);
});

it("should bind click event", () => {
    let clicked = false;
    const vnode = h("button", {
        onClick: () => (clicked = true),
    });
    const el = createDom(vnode);
    el.dispatchEvent(new MouseEvent("click"));
    expect(clicked).toBe(true);
});

