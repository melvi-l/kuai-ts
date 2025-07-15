[![NPM Version](https://img.shields.io/npm/v/kuai-ts?labelColor=%23f1f1f1&color=%23CC3534)](https://www.npmjs.com/package/kuai-ts)

# Kuai

> _Vibe code then edited README_

Kuai is a lightweight (because I am way to lazy for more), declarative (gave up on support JSX tho) Virtual DOM (Fiber tree look scary) renderer written in TypeScript.  
It provides a minimal core for creating, diffing, and rendering virtual nodes to the DOM.

I wrote this for my [node-editor-wegpu](https://github.com/melvi-l/node-editor-webgpu) because I wanted 0 dependancy, and also because I’ve been wanting for a while to experiment with Virtual DOM diffing and patching stuff.

Oh and also, this project is highly inspired by:

- [Rodrigo Pombo](https://github.com/pomber)'s [ article on React Fiber Tree](https://pomb.us/build-your-own-react/)
- [Snabbdom](https://github.com/snabbdom/snabbdom/tree/master) source code, that I discover through [Lichess frontend source code](https://github.com/lichess-org/lila/blob/2e653ad1e2b9fad31b4a092394019ef8fafdedb8/package.json#L44)

---

## Installation

```bash
npm install kuai-ts
```

## Features

- Declarative `h(tag, props, children)` API
- Lightweight VNode structure
- Recursive DOM patching algorithm
- Prop diffing: styles, classes, attributes
- Synthetic event handling (`onClick`, etc.)

---

## Getting Started

### 1. Create a Virtual Node

```ts
import { h } from "kuai";

const vnode = h("div", { id: "container" }, [
  h("h1", {}, ["Hello World"]),
  h("p", {}, ["This is a Kuai demo"]),
]);
```

### 2. Render to DOM

```ts
import { patch } from "kuai";

const container = document.getElementById("root")!;
patch(container, vnode); // first render
```

### 3. Update with a new VNode

```ts
const updatedVNode = h("div", { id: "container" }, [
  h("h1", {}, ["Updated title"]),
  h("p", {}, ["New content here"]),
]);

patch(vnode, updatedVNode); // diff & patch
```

---

## How It Works

### VNode Creation (`h.ts`)

The `h()` function is a hyperscript utility that creates a Virtual Node object:

```ts
{
  type: "div",
  props: { id: "foo" },
  children: [VNode | string],
  dom: undefined
}
```

It supports:

- Text nodes via `type === "__text"`
- Nested children arrays
- Props: `class`, `style`, `onEvent`, and DOM attributes

---

### DOM Creation (`createDom()` in [`dom.ts`](./src/dom.ts))

- Transforms a VNode tree into real DOM
- Applies props, events, classes, styles
- Recursively renders children

```ts
const el = createDom(vnode);
parent.appendChild(el);
```

---

### DOM Updating (`updateDom()` in [`dom.ts`](./src/dom.ts)

Efficiently updates a DOM node in place by comparing `prevProps` and `nextProps`:

- Removes stale props and listeners
- Updates changed styles or classes
- Attaches new event handlers
- Preserves DOM where possible

---

### Patching Algorithm (`patch.ts`)

The `patch()` function orchestrates the rendering lifecycle:

- Accepts either a real DOM element or a previous VNode
- If DOM is given, it converts it into an empty VNode (`emptyElement()`)
- Compares old/new VNodes and updates the DOM accordingly
- Replaces the DOM node if necessary

```ts
patch(oldVNodeOrElement, newVNode);
```

---

## 🧪 Testing

The project uses [Vitest](https://vitest.dev) for unit testing and coverage.

### Run all tests

```bash
npm run test
```

### With coverage report

```bash
npm run coverage
```

Tests cover:

- `patch()` logic
- `createDom()` structure and behavior
- `updateDom()` diffing logic

---

## Project Structure

```
src/
│
├── h.ts         # VNode creation
├── vnode.ts     # VNode type definitions
├── dom.ts       # DOM creation & update logic
├── patch.ts     # Main render / patch function
├── tests/       # Vitest unit tests
```

---

## Code Coverage

[![Codecov](https://img.shields.io/codecov/c/github/melvi-l/kuai-ts)](https://app.codecov.io/github/melvi-l/kuai-ts/tree/main)

To enable coverage tracking, the project integrates with [Codecov](https://codecov.io).

See [`.github/workflows/ci.yml`](./.github/workflows/test.yml).

---

## Contributing

Please don't, this is a toy repository. You have better to do with your time.

If you want to contribute to a like-minded but aim for release repository, I highly recommand you [Snabbdom](https://github.com/snabbdom/snabbdom/tree/master), a huge inspiration and source of knowledge for this project.

---

## 📜 License

GLWT - Good Luck With That

---

Made with <3
