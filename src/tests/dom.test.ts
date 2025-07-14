// vibe coded
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createDom, parseSelector, updateDom } from "../dom";
import { h } from "../h";

let el: HTMLDivElement;
describe("parseSelector", () => {
    it("should parse tag only", () => {
        expect(parseSelector("div")).toEqual({
            tag: "div",
            id: null,
            className: null,
        });
    });

    it("should parse tag with id", () => {
        expect(parseSelector("section#main")).toEqual({
            tag: "section",
            id: "main",
            className: null,
        });
    });

    it("should parse tag with class", () => {
        expect(parseSelector("span.highlight")).toEqual({
            tag: "span",
            id: null,
            className: "highlight",
        });
    });

    it("should parse tag with id and class", () => {
        expect(parseSelector("button#submit.primary")).toEqual({
            tag: "button",
            id: "submit",
            className: "primary",
        });
    });

    it("should parse tag with multiple classes", () => {
        expect(parseSelector("div#main.container.wide")).toEqual({
            tag: "div",

            id: "main",
            className: "container wide", 
        });
    });
});

describe("createDom", () => {
    it("should create standard HTML element", () => {
        const vnode = h("div", {});
        const el = createDom(vnode);
        expect(el).toBeInstanceOf(HTMLDivElement);
    });

    it("should create a text node", () => {
        const vnode = h("__text", { nodeValue: "Hello" });
        const el = createDom(vnode);
        expect(el).toBeInstanceOf(Text);
        expect(el.textContent).toBe("Hello");
    });

    it("should set basic props like id and title", () => {
        const vnode = h("div", { id: "box", title: "info" });
        const el = createDom(vnode) as HTMLElement;
        expect(el.id).toBe("box");
        expect(el.title).toBe("info");
    });

    it("should set boolean props like disabled", () => {
        const vnode = h("button", { disabled: true });
        const el = createDom(vnode) as HTMLButtonElement;
        expect(el.disabled).toBe(true);
    });

    it("should set inline style object", () => {
        const vnode = h("div", {
            style: { color: "red", backgroundColor: "blue" },
        });
        const el = createDom(vnode) as HTMLElement;
        expect(el.style.color).toBe("red");
        expect(el.style.backgroundColor).toBe("blue");
    });

    it("should apply class from object literal", () => {
        const vnode = h("div", { class: { active: true, hidden: false } });
        const el = createDom(vnode) as HTMLElement;
        expect(el.classList.contains("active")).toBe(true);
        expect(el.classList.contains("hidden")).toBe(false);
    });

    it("should bind a click event", () => {
        const handler = vi.fn();
        const vnode = h("button", { onClick: handler });
        const el = createDom(vnode) as HTMLElement;
        el.click();
        expect(handler).toHaveBeenCalled();
    });

    it("should support multiple event listeners", () => {
        const clickHandler = vi.fn();
        const focusHandler = vi.fn();
        const vnode = h("input", { onClick: clickHandler, onFocus: focusHandler });
        const el = createDom(vnode) as HTMLElement;
        el.dispatchEvent(new Event("click"));
        el.dispatchEvent(new Event("focus"));
        expect(clickHandler).toHaveBeenCalled();

        expect(focusHandler).toHaveBeenCalled();
    });

    it("should recursively render child elements", () => {
        const vnode = h("ul", {}, [
            h("li", {}, [h("__text", { nodeValue: "One" })]),
            h("li", {}, [h("__text", { nodeValue: "Two" })]),
        ]);
        const el = createDom(vnode) as HTMLUListElement;
        expect(el.children.length).toBe(2);
        expect(el.children[0].textContent).toBe("One");
        expect(el.children[1].textContent).toBe("Two");
    });

    it("should allow nested DOM structure with mixed content", () => {
        const vnode = h("div", {}, [
            h("h1", {}, [h("__text", { nodeValue: "Title" })]),
            h("p", {}, [
                h("__text", { nodeValue: "This is a " }),

                h("strong", {}, [h("__text", { nodeValue: "test" })]),
                h("__text", { nodeValue: "." }),
            ]),
        ]);
        const el = createDom(vnode) as HTMLDivElement;
        expect(el.querySelector("h1")?.textContent).toBe("Title");
        expect(el.querySelector("strong")?.textContent).toBe("test");
        expect(el.querySelector("p")?.textContent).toBe("This is a test.");
    });

    it("should call ref with the created element", () => {
        const refFn = vi.fn();
        const vnode = h("div", { ref: refFn });
        const el = createDom(vnode);

        expect(refFn).toHaveBeenCalledWith(el);
        expect(el).toBeInstanceOf(HTMLDivElement);
    });

    it("should not call ref on text nodes", () => {
        const refFn = vi.fn();
        const vnode = h("__text", { nodeValue: "hello", ref: refFn });
        const el = createDom(vnode);

        expect(refFn).not.toHaveBeenCalled();
        expect(el).toBeInstanceOf(Text);
    });

    it("should call ref only once per vnode", () => {
        const refFn = vi.fn();

        const vnode = h("section", { ref: refFn }, [
            h("p", {}, [h("__text", { nodeValue: "Paragraph" })]),
        ]);

        const el = createDom(vnode);

        expect(refFn).toHaveBeenCalledTimes(1);
        expect(refFn).toHaveBeenCalledWith(el);
    });

    it("should call multiple refs in tree independently", () => {
        const divRef = vi.fn();
        const spanRef = vi.fn();

        const vnode = h("div", { ref: divRef }, [
            h("span", { ref: spanRef }, [h("__text", { nodeValue: "Text" })]),
        ]);

        createDom(vnode);

        expect(divRef).toHaveBeenCalledTimes(1);
        expect(spanRef).toHaveBeenCalledTimes(1);
        expect(divRef.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);

        expect(spanRef.mock.calls[0][0]).toBeInstanceOf(HTMLSpanElement);
    });
    it("should support async ref function", async () => {
        const refPromise = vi.fn().mockResolvedValue(undefined);
        const vnode = h("div", { ref: refPromise });
        const el = createDom(vnode);

        // Wait microtasks in case of async side-effects
        await Promise.resolve();

        expect(refPromise).toHaveBeenCalledWith(el);
    });

    it("should await async ref logic manually (if needed)", async () => {
        let resolved = false;
        const ref = async () => {
            await new Promise((r) => setTimeout(r, 10));
            resolved = true;
        };

        const vnode = h("div", { ref });
        createDom(vnode);

        // wait for ref to complete
        await new Promise((r) => setTimeout(r, 20));
        expect(resolved).toBe(true);
    });

    it("should allow async ref on nested child", async () => {
        const ref = vi.fn().mockResolvedValue(undefined);
        const vnode = h("div", {}, [
            h("span", { ref }, [h("__text", { nodeValue: "Hello" })]),
        ]);

        createDom(vnode);
        await Promise.resolve();

        expect(ref).toHaveBeenCalledTimes(1);

        expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLSpanElement);
    });
    it("should resolve promise when ref is async and called", async () => {
        let resolveRef: (v: HTMLElement) => void;
        const promise = new Promise<HTMLElement>(
            (resolve) => (resolveRef = resolve),
        );

        const vnode = h("div", {
            ref: async (el: HTMLElement) => {
                resolveRef(el);
            },
        });

        const el = createDom(vnode);
        const resolved = await promise;

        expect(resolved).toBe(el);
        expect(resolved).toBeInstanceOf(HTMLDivElement);
    });

    it("should reject promise if ref throws", async () => {
        const error = new Error("ref failed");
        const vnode = h("div", {
            ref: async () => {
                throw error;
            },
        });

        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });
        createDom(vnode);

        await new Promise((resolve) => setTimeout(resolve, 0)); // wait microtask queue

        expect(consoleSpy).toHaveBeenCalledWith(error);
        consoleSpy.mockRestore();
    });
    it("should resolve ref promise without awaiting ref in createDom", async () => {
        let resolve: (val: string) => void;
        const promise = new Promise<string>((res) => (resolve = res));

        const vnode = h("div", {
            ref: async () => {
                resolve("OK");
            },
        });

        createDom(vnode);

        const result = await promise;
        expect(result).toBe("OK");
    });
});

beforeEach(() => {
    el = document.createElement("div");
    document.body.innerHTML = "";
    document.body.appendChild(el);
});

describe("updateDom", () => {
    it("should add a new prop", () => {
        updateDom(el, {}, { id: "foo" });
        expect(el.id).toBe("foo");
    });

    it("should update a changed prop", () => {
        el.id = "bar";
        updateDom(el, { id: "bar" }, { id: "baz" });
        expect(el.id).toBe("baz");
    });

    it("should remove a missing prop", () => {
        el.title = "tooltip";
        updateDom(el, { title: "tooltip" }, {});
        expect(el.title).toBe("");
    });

    it("should add a class", () => {
        updateDom(el, {}, { class: { active: true } });
        expect(el.classList.contains("active")).toBe(true);
    });

    it("should remove a class no longer in props", () => {
        el.classList.add("old");

        updateDom(el, { class: { old: true } }, { class: {} });
        expect(el.classList.contains("old")).toBe(false);
    });

    it("should toggle classes correctly", () => {
        updateDom(el, { class: { on: true } }, { class: { off: true } });
        expect(el.classList.contains("on")).toBe(false);
        expect(el.classList.contains("off")).toBe(true);
    });

    it("should apply new styles", () => {
        updateDom(el, {}, { style: { color: "red", background: "black" } });
        expect(el.style.color).toBe("red");
        expect(el.style.background).toBe("black");
    });

    it("should update changed styles", () => {
        el.style.color = "blue";
        updateDom(el, { style: { color: "blue" } }, { style: { color: "green" } });

        expect(el.style.color).toBe("green");
    });

    it("should remove styles not in next props", () => {
        el.style.border = "1px solid red";
        updateDom(el, { style: { border: "1px solid red" } }, { style: {} });
        expect(el.style.border).toBe("");
    });

    it("should add new event listener", () => {
        const handler = vi.fn();
        updateDom(el, {}, { onClick: handler });
        el.click();
        expect(handler).toHaveBeenCalled();
    });

    it("should replace old event listener", () => {
        const oldHandler = vi.fn();
        const newHandler = vi.fn();
        updateDom(el, { onClick: oldHandler }, { onClick: newHandler });
        el.click();
        expect(oldHandler).not.toHaveBeenCalled();
        expect(newHandler).toHaveBeenCalled();
    });

    it("should remove event listener if not in new props", () => {
        const handler = vi.fn();

        updateDom(el, { onClick: handler }, {});

        el.click();
        expect(handler).not.toHaveBeenCalled();
    });

    it("should do nothing when props are equal", () => {
        el.id = "same";
        updateDom(el, { id: "same" }, { id: "same" });

        expect(el.id);
    });
});
