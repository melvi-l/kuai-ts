import type { VNode, VNodeDom, VNodeProps } from "./vnode";

export function isElement(node: any): node is Element {
  return node.nodeType === 1;
}

export function parseSelector(selector: string) {
  const hashIndex = selector.indexOf("#");
  const dotIndex = selector.indexOf(".");

  const hashClamp = hashIndex > 0 ? hashIndex : selector.length;
  const dotClamp = dotIndex > 0 ? dotIndex : selector.length;
  const tag =
    hashIndex !== -1 || dotIndex !== -1
      ? selector.slice(0, Math.min(hashClamp, dotClamp))
      : selector;

  const id =
    hashClamp < dotClamp ? selector.slice(hashClamp + 1, dotClamp) : null;
  const className =
    dotIndex > 0
      ? selector
          .slice(dotClamp + 1)
          .split(".")
          .join(" ")
      : null;
  return { tag, id, className };
}

export function createDom(vnode: VNode): Node {
  console.log("createDom", vnode);

  const { tag, id, className } = parseSelector(vnode.type);

  const dom =
    vnode.type === "__text"
      ? document.createTextNode(vnode.props.nodeValue ?? "")
      : document.createElement(tag);

  if (id != null) {
    (dom as HTMLElement).setAttribute("id", id);
  }
  if (className != null) {
    (dom as HTMLElement).setAttribute("class", className);
  }

  updateDom(dom, {}, vnode.props);

  vnode.children.forEach((child) => dom.appendChild(createDom(child)));

  const ref = vnode.props.ref;
  if (typeof ref === "function" && isElement(dom)) {
    const result = ref(dom);
    if (result instanceof Promise) result.catch(console.error);
  }

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
      .forEach((key) => (((dom as HTMLElement).style as any)[key] = "")); // I hate ts
  }

  if ("class" in prevProps && prevProps.class != null && "classList" in dom) {
    Object.keys(prevProps.class)
      .filter(isGone("class" in props ? props.class : {}))
      .forEach((key) => dom.classList.remove(key));
  }

  Object.keys(prevProps)
    .filter((key) => key !== "ref")
    .filter(isGone(props))
    .forEach((key) => ((dom as any)[key] = ""));

  Object.keys(props)
    .filter((key) => key !== "ref")
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
      .forEach(
        (key) =>
          (((dom as HTMLElement).style as any)[key] = (props.style as any)[
            key
          ]),
      ); // I hate ts
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
