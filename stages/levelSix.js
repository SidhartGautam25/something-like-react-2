function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
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

function createDOM(fiber) {
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

function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}

function perforUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDOM(fiber);
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

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
  createElement,
  render,
};

// stage six code start here

// we are in a problem
// We have another problem here.
// We are adding a new node to the DOM each time we work on an element. And, remember,
// the browser could interrupt our work before we finish rendering the whole tree.
// In that case, the user will see an incomplete UI. And we don’t want that.

// So we need to remove the part that mutates the DOM from here.

// Instead, we’ll keep track of the root of the fiber tree. We call it the work in
// progress root or wipRoot.
// So we will update our render and other function according to this
function _render(element, container) {
  // wipRoot will become our nextUnitOfWork
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };
  nextUnitOfWork = wipRoot;
}

function commitRoot() {
  // Starts committing the DOM nodes by calling commitWork from the root’s
  //  child (not the root itself because it's just the container)
  // Once committed, sets wipRoot = null to signal "we're done"
  commitWork(wipRoot.child);
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  // This function walks the fiber tree and:
  // Appends each DOM node (fiber.dom) to its parent's real DOM node
  // Recursively does this for children and siblings
  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function _workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    // This is the update in workLoop function
    //   If nextUnitOfWork is null (all units are done) AND we have a wipRoot…
    // That means the entire fiber tree has been built
    // So we call commitRoot() to actually add everything to the real DOM.
    // This separation means you:
    // Build everything first (in memory)
    // Then render it all at once
    // Just like React does with its virtual DOM.
    commitRoot();
  }

  requestIdleCallback(_workLoop);
}

// wipRoot stands for "work in progress root"
// It is the top of the fiber tree we're currently building
// It holds:
//     dom: the container (like <div id="root">)
//     props.children: the root element passed to render
// Think of it like the root node in a tree of tasks you’re about to do
let wipRoot = null;

/*

To understand what we are doing at sixth stage,first we need to understand
what we are doing till now:
  -> till now,our code is building fiber
  -> and then attaching them directly to the DOM during performUnitOfWork

But now what we are trying to do is:
        splitting rendering into 2 phases:
            Render Phase: Build the fiber tree in memory (performUnitOfWork)
            Commit Phase: Actually attach to the DOM (commitRoot and commitWork)

This split helps React batch changes, skip unnecessary DOM work, and stay fast.




*/
