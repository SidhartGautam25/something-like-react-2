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

function _createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

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

let nextUnitOfWork = null;

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = perforUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

// level five code start here
// before writing code we need to understand one very important term --> fiber
// We’ll have one fiber for each element and each fiber will be a unit of work.
// and the whole structure will be called fiber tree
/*
Ex:
   Suppose we want to render an element tree like this one:
   slreact._render(
    <div>
     <h1>
      <p />
      <a />
     </h1>
     <h2 />
    </div>,
  container
)

In the render we’ll create the root fiber and set it as the nextUnitOfWork.
The rest of the work will happen on the performUnitOfWork function, there we will
do three things for each fiber:

1. add the element to the DOM
2. create the fibers for the element’s children
3. select the next unit of work

One of the goals of this data structure is to make it easy to find the next unit
of work. 
      That’s why each fiber has a link to its first child, its next sibling and its
      parent.


When we finish performing work on a fiber, if it has a child that fiber will be the
next unit of work.
      From our example, when we finish working on the div fiber the next unit of 
      work will be the h1 fiber.

If the fiber doesn’t have a child, we use the sibling as the next unit of work.
       For example, the p fiber doesn’t have a child so we move to the a fiber after
       finishing it.

And if the fiber doesn’t have a child nor a sibling we go to the “uncle”: the sibling
of the parent.

Also, if the parent doesn’t have a sibling, we keep going up through the parents until
we find one with a sibling or until we reach the root. If we have reached the root,
it means we have finished performing all the work for this render.



*/
// step 1
function _createDOM(fiber) {
  // basically we have taken out the piece of code from render function
  // where are creating our dom to render
  // so now we have a separate function to create dom which will
  // create dom for the given fiber
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);
  const isProperty = (key) => key !== "children";
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });
  return dom;
}

// step 2
// updated render function
// and render does one simple thing:
// it will create a unitOfWork or more specifically nextUnitOfWork and
// so will get handled by workLoop function
function __render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}

// step 3
// Think of a fiber as a little object that represents a React element plus extra info:
// who its parent is, what its children are, and how to get to the next one.

// This is called by the `workLoop`. It takes **one fiber** (representing one React
// element) and handles it.

function perforUnitOfWork(fiber) {
  // Each fiber should eventually have a real DOM node.
  if (!fiber.dom) {
    fiber.dom = _createDOM(fiber);
  }
  // Once we’ve created the DOM node for this fiber, we insert it into the DOM tree —
  // specifically as a child of its parent fiber’s DOM node.
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  // We’re now preparing to create fiber nodes for the children of this current
  // element.
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }

  // now we will work on returning nextUnitOfWork

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

const slreact = {
  _createElement,
  _render,
};
