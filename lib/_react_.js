// Step 2
function _createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : _createTextElement(child)
      ),
    },
  };
}

// Step 1
// to use it in createElement
function _createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

const slreact = {
  _createElement,
};
