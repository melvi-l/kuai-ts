import type { HTMLTag, VNode } from "./h";

export function createDom(vnode: VNode): Node {
    if (vnode.type === "__text") {
        return document.createTextNode(vnode.props.value);
    }

    const dom = document.createElement(vnode.type as HTMLTag);
    assignProps(dom, vnode.props);

    console.log(dom);

    return dom;
}

function assignProps(dom: HTMLElement, props: Record<string, any>) {
    Object.entries(props).forEach(([key, value]) => {
        if (key === "style" && typeof value === "object" && value !== null) {
            Object.entries(value).forEach(([styleKey, styleValue]) => {
                if (styleValue != null) {
                    (dom.style as any)[styleKey] = styleValue;
                }
            });
            return;
        }
        if (key === "class" && value != null && typeof value === "object") {
            Object.entries(value).forEach(([className, isActive]) => {
                if (!isActive) return;
                dom.classList.add(className);
            });
            return;
        }

        if (key.startsWith("on") && value != null && typeof value === "function") {
            const eventType = key.toLowerCase().substring(2);
            dom.addEventListener(eventType, value);
            return;
        }
        (dom as any)[key] = value;
    });
}
