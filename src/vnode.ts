export type VNodeType = string; // Function for function component

type VNodeClassProps = { class: Record<string, boolean> };
type VNodeTextProps = { nodeValue: string };
type VNodeEventHandlerProps = {
  [K in keyof HTMLElementEventMap as `on${Capitalize<string & K>}`]?: (
    event: HTMLElementEventMap[K],
  ) => void;
};
type VNodeStyleProps = { style: Partial<CSSStyleDeclaration> };
type VNodeRefProps = { ref: (dom: HTMLElement) => void | Promise<void> };
export type VNodeProps = Partial<
  VNodeTextProps &
    VNodeClassProps &
    VNodeStyleProps &
    VNodeEventHandlerProps &
    VNodeRefProps &
    Record<string, any>
>;

export type VNodeDom = Text | Element;

export type VNode = {
  type: VNodeType;
  props: VNodeProps;
  children: Array<VNode>;
  dom?: VNodeDom;
  key?: PropertyKey;
};
