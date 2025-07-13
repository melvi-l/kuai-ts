import type { VNode, VNodeDom, VNodeProps, VNodeType } from "./vnode";

export function h(
  type: VNodeType,
  props?: VNodeProps,
  children?: Array<VNode | string>,
  dom?: VNodeDom,
): VNode {
  return {
    type,
    props: props ?? {},
    children:
      children?.map((child) =>
        typeof child === "string" ? h("__text", { nodeValue: child }) : child,
      ) ?? [],
    dom,
  };
}
