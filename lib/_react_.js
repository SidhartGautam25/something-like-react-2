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

// step 3
function _render(element, container) {
  const dom =
    element.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  const isProperty = (key) => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  element.props.children.forEach((child) => _render(child, dom));

  container.appendChild(dom);
}

// step 4
let nextUnitOfWork = null;

// step 5
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = perforUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}

// step 6
requestIdleCallback(workLoop);

function perforUnitOfWork(nextUnitOfWork) {
  // will work on this at next stage
}

const slreact = {
  _createElement,
  _render,
};
