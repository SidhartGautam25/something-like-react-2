function createElement(type, props, ...children) {
  console.log("i get called createElement");
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
  console.log("i get called createTextElement");
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createDom(fiber) {
  console.log("under createDOM function");
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);
function updateDom(dom, prevProps, nextProps) {
  //Remove old or changed event listeners
  console.log("under updateDom function");
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = "";
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

function commitRoot() {
  console.log("under commitRoot function");
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  console.log("under commitWork");
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  console.log("under commitDeletion function");
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  console.log("under render function");
  console.log("wipRoot looks like this for the given elemnet and container");
  console.dir(wipRoot, { depth: null });
  deletions = [];
  console.log("wipRoot is now equal to nextUnitOfWork");
  nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let deletions = null;

function workLoop(deadline) {
  console.log("workLoop function called ");
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    console.log("under the loop of workLoop function");
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    console.log("after calling performUnitOfWork in loop of workLoop");
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    console.log("commitRoot function called inside workLoop function");
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  console.log("under performUnitOfWork");
  console.log("fiber provided looks like this ");
  console.dir(fiber, { depth: null });
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    console.log("calling updateFunctionComponent from performUnitOfWork");
    updateFunctionComponent(fiber);
  } else {
    console.log("calling updateHostComponent from performUnitOfWork");
    updateHostComponent(fiber);
  }
  if (fiber.child) {
    console.log("fiber.child condition");
    console.log("returning fiber looks like");
    console.dir(fiber.child, { depth: null });
    return fiber.child;
  }
  console.log("creating new fiber in performUnitOfWork");
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

let wipFiber = null;
let hookIndex = null;

function updateFunctionComponent(fiber) {
  console.log("under updateFunctionComponent");
  console.log("making wipFiber equal our current fiber");
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  console.log("making children");
  const children = [fiber.type(fiber.props)];
  console.log("children looks like this ");
  console.dir(children, { depth: null });
  console.log(
    "calling reconcileChildren function from updateFunctionComponent"
  );
  console.log(
    "fiber looks like this before calling reconcileChildren inside  updateFunctionComponent"
  );
  console.dir(fiber, { depth: null });

  reconcileChildren(fiber, children);
  console.log("fiber after reconcileChildren is ");
  console.dir(fiber, { depth: null });
}

function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

  const setState = (action) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  console.log("under reconcileChildren function");
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  console.log("old fiber looks like this ");
  console.dir(oldFiber, { depth: null });
  console.log("elements length is ", elements.length);
  console.dir(oldFiber, { depth: null });
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    console.log("under the loop of reconcileChildren");
    const element = elements[index];
    let newFiber = null;

    const sameType = oldFiber && element && element.type == oldFiber.type;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

const slreact = {
  createElement,
  render,
  useState,
};
/** @jsx slreact.createElement */

function Counter() {
  const [state, setState] = slreact.useState(1);
  return <h1 onClick={() => setState((c) => c + 1)}>Count: {state}</h1>;
}
console.log("1");
const element = <Counter />;
console.log("2");
const container = document.getElementById("root");
slreact.render(element, container);
