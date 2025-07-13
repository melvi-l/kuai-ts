export type VNodeType = string; // Function for function component

type VNodeClassProps = { class: Record<string, boolean> };
type VNodeTextProps = { nodeValue: string };
type VNodeEventHandlerProps = {
  [K in keyof HTMLElementEventMap as `on${Capitalize<string & K>}`]?: (
    event: HTMLElementEventMap[K],
  ) => void;
};
type VNodeStyleProps = { style: Partial<CSSStyleDeclaration> };

export type VNodeProps = Partial<
  VNodeTextProps &
    VNodeClassProps &
    VNodeStyleProps &
    VNodeEventHandlerProps &
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
