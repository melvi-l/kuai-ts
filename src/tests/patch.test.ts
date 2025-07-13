// vibe coded

import { describe, it, expect, beforeEach } from "vitest";
import { patch } from "../patch";
import { h } from "../h";

const parent = document.body;
let container: HTMLElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.innerHTML = "";
  document.body.appendChild(container);
});

describe("patch (oldVNode: Element | VNode, newVNode: VNode)", () => {
  it("renders vnode into an empty element", () => {
    const vnode = h("div", {}, ["Hello"]);

    patch(container, vnode);
    expect(parent.innerHTML).toBe("<div>Hello</div>");
  });

  it("patches text content", () => {
    const oldVNode = h("p", {}, ["First"]);
    const newVNode = h("p", {}, ["Second"]);
    patch(container, oldVNode);
    patch(oldVNode, newVNode);
    expect(parent.innerHTML).toBe("<p>Second</p>");
  });

  it("replaces node when tag name changes", () => {
    const oldVNode = h("span", {}, ["Old"]);
    const newVNode = h("div", {}, ["New"]);
    patch(container, oldVNode);
    patch(oldVNode, newVNode);
    expect(parent.innerHTML).toBe("<div>New</div>");
  });

  it("applies and updates props", () => {
    const oldVNode = h("input", { value: "A", disabled: false }, []);
    const newVNode = h("input", { value: "B", disabled: true }, []);
    patch(container, oldVNode);
    patch(oldVNode, newVNode);
    const input = parent.querySelector("input")!;
    expect(input.value).toBe("B");
    expect(input.disabled).toBe(true);
  });

  it("removes props if not present in newVNode", () => {
    const oldVNode = h("input", { disabled: true }, []);
    const newVNode = h("input", {}, []);
    patch(container, oldVNode);
    patch(oldVNode, newVNode);
    const input = parent.querySelector("input")!;
    expect(input.disabled).toBe(false);
  });

  it("renders nested children", () => {
    const vnode = h("div", {}, [
      h("span", {}, ["One"]),
      h("span", {}, ["Two"]),
    ]);
    patch(container, vnode);
    const spans = parent.querySelectorAll("span");
    expect(spans.length).toBe(2);
    expect(spans[0].textContent).toBe("One");
    expect(spans[1].textContent).toBe("Two");
  });

  it("replaces text node with element", () => {
    const oldVNode = h("div", {}, ["Text"]);
    const newVNode = h("div", {}, [h("b", {}, ["Bold"])]);
    patch(container, oldVNode);
    patch(oldVNode, newVNode);
    expect(parent.innerHTML).toBe("<div><b>Bold</b></div>");
  });

  it("replaces element node with text", () => {
    const oldVNode = h("div", {}, [h("i", {}, ["Italic"])]);
    const newVNode = h("div", {}, ["Plain"]);
    patch(container, oldVNode);
    patch(oldVNode, newVNode);
    expect(parent.innerHTML).toBe("<div>Plain</div>");
  });

  it("handles additions to children", () => {
    const oldVNode = h("ul", {}, [h("li", {}, ["1"])]);
    const newVNode = h("ul", {}, [h("li", {}, ["1"]), h("li", {}, ["2"])]);
    patch(container, oldVNode);
    patch(oldVNode, newVNode);
    expect(parent.querySelectorAll("li").length).toBe(2);
  });

  it("handles removals from children", () => {
    const oldVNode = h("ul", {}, [h("li", {}, ["1"]), h("li", {}, ["2"])]);
    const newVNode = h("ul", {}, [h("li", {}, ["1"])]);
    patch(container, oldVNode);
    patch(oldVNode, newVNode);
    expect(parent.querySelectorAll("li").length).toBe(1);
    expect(parent.innerHTML).toBe("<ul><li>1</li></ul>");
  });

  it("noop when same vnode instance", () => {
    const vnode = h("div", {}, ["Static"]);
    patch(container, vnode);
    const htmlBefore = parent.innerHTML;
    patch(vnode, vnode);
    expect(parent.innerHTML).toBe(htmlBefore);
  });

  it("replaces node when newVNode differs and tag is different", () => {
    const vnode1 = h("p", {}, ["Old"]);
    const vnode2 = h("section", {}, ["New"]);
    patch(container, vnode1);
    const oldDom = vnode1.dom!;
    patch(vnode1, vnode2);
    expect(parent.contains(oldDom)).toBe(false);
    expect(parent.innerHTML).toBe("<section>New</section>");
  });
});
