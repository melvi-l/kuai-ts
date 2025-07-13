export type HTMLTag = keyof HTMLElementTagNameMap;
type VNodeType = HTMLTag | string;
type VNodeProps = {} & Record<string, any>;
type VNodeText = {
    type: "__text";
    props: {
        value: string;
    };
    children: [];
};
type VNodeElement = {
    type: VNodeType;
    props: VNodeProps;
    children: Array<VNode>;
};
export type VNode = VNodeText | VNodeElement;

export function h(
    type: VNodeType,
    props?: VNodeProps,
    children?: Array<VNode | string>,
): VNode {
    return {
        type,
        props: props ?? {},
        children:
            children?.map((child) =>
                typeof child === "string" ? h("__text", { value: child }) : child,
            ) ?? [],
    };
}
