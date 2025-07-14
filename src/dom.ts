import type { VNode, VNodeDom, VNodeProps } from "./vnode";

export function isElement(node: any): node is Element {
  return node.nodeType === 1;
}

export function createDom(vnode: VNode): Node {
  const dom =
    vnode.type === "__text"
      ? document.createTextNode(vnode.props.nodeValue ?? "")
      : document.createElement(vnode.type);

  updateDom(dom, {}, vnode.props);

  vnode.children.forEach((child) => dom.appendChild(createDom(child)));

  vnode.dom = dom;
  return dom;
}

function isNew(prev: any, next: any) {
  return (key: string) => prev[key] !== next[key];
}
function isGone(next: any) {
  return (key: string) => !(key in next);
}
function isEventHandler(key: string) {
  return key.startsWith("on");
}
export function updateDom(
  dom: VNodeDom,
  prevProps: VNodeProps,
  props: VNodeProps,
) {
  Object.keys(prevProps)
    .filter(isEventHandler)
    .filter((key) => isGone(props)(key) || isNew(prevProps, props)(key))
    .forEach((key) =>
      dom.removeEventListener(
        key.toLowerCase().substring(2) as keyof HTMLElementEventMap,
        prevProps[key] as EventListenerOrEventListenerObject,
      ),
    );

  if ("style" in prevProps && prevProps.style != null && "style" in dom) {
    Object.keys(prevProps.style)
      .filter(isGone("style" in props ? props.style : {}))
      .forEach((key) => (dom as HTMLElement).style.setProperty(key, ""));
  }

  if ("class" in prevProps && prevProps.class != null && "classList" in dom) {
    Object.keys(prevProps.class)
      .filter(isGone("class" in props ? props.class : {}))
      .forEach((key) => dom.classList.remove(key));
  }

  Object.keys(prevProps)
    .filter(isGone(props))
    .forEach((key) => ((dom as any)[key] = ""));

  Object.keys(props)
    .filter(isNew(prevProps, props))
    .forEach((key) => ((dom as any)[key] = props[key]));

  if ("class" in props && props.class != null && "classList" in dom) {
    const classObj = props.class;
    Object.keys(props.class)
      .filter(isNew("class" in prevProps ? prevProps.class : {}, props.class))
      .forEach((key) =>
        classObj[key] ? dom.classList.add(key) : dom.classList.remove(key),
      );
  }
  if (
    "style" in props &&
    props.style != null &&
    typeof props.style === "object" &&
    "style" in dom
  ) {
    Object.keys(props.style)
      .filter(isNew("style" in prevProps ? prevProps.style : {}, props.style))
      .forEach((key) =>
        (dom as HTMLElement).style.setProperty(
          key,
          (props.style as Record<string, string>)[key] ?? "",
        ),
      );
  }
  Object.keys(props)
    .filter(isEventHandler)
    .filter(isNew(prevProps, props))
    .forEach((key) =>
      dom.addEventListener(
        key.toLowerCase().substring(2) as keyof HTMLElementEventMap,
        props[key] as EventListenerOrEventListenerObject,
      ),
    );

  return dom;
}
