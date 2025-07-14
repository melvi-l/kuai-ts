import { createDom, isElement, updateDom } from "./dom";
import { h } from "./h";
import type { VNode } from "./vnode";

export function patch(oldVNode: VNode | Element, newVNode: VNode) {
  if (isElement(oldVNode)) {
    oldVNode = emptyElement(oldVNode);
  }
  if (oldVNode.type === newVNode.type) {
    patchVNode(oldVNode, newVNode);
    return;
  } else {
    const dom = oldVNode.dom!;
    const parentDom = dom.parentNode;
    if (parentDom == null) throw new Error("Parent not found (Papaoutai)");

    createDom(newVNode);

    parentDom.insertBefore(newVNode.dom!, dom.nextSibling);
    parentDom.removeChild(dom);
  }
}
function patchVNode(oldVNode: VNode, newVNode: VNode) {
  newVNode.dom = updateDom(oldVNode.dom!, oldVNode.props, newVNode.props);

  if (newVNode.type === "__text") {
    return;
  }
  updateChildren(newVNode.dom as Element, oldVNode.children, newVNode.children);
}

export function emptyElement(element: Element) {
  const tagName = element.tagName.toLowerCase();

  const idSel = element.id ? `#${element.id}` : "";

  const className = element.getAttribute("class");
  const classSel = className ? "." + className.split(" ").join(".") : "";

  return h(tagName + idSel + classSel, {}, [], element);
}

function updateChildren(
  dom: Element,
  oldChildren: VNode[],
  newChildren: VNode[],
) {
  let oldI = 0;
  let newI = 0;
  while (oldI < oldChildren.length && newI < newChildren.length) {
    const oldVNode = oldChildren[oldI];
    const newVNode = newChildren[oldI];
    if (oldVNode.type === newVNode.type) {
      // if same reference, same VNode but maybe with changed props => UPDATE
      patchVNode(oldVNode, newVNode);
      oldI++;
      newI++;
      continue;
    }
    if (newVNode.dom) {
      // if different but then new node have been created => DELETION
      dom.removeChild(oldVNode.dom!);
      oldI++;
      continue;
    }
    // if different witout new node already created => ADDITION
    createDom(newVNode);
    dom.insertBefore(newVNode.dom!, oldVNode.dom!);
    newI++;
  }
  while (oldI < oldChildren.length) {
    dom.removeChild(oldChildren[oldI].dom!);
    oldI++;
  }
  while (newI < newChildren.length) {
    const newVNode = newChildren[newI];
    createDom(newVNode);
    dom.appendChild(newVNode.dom!);
    newI++;
  }
}
