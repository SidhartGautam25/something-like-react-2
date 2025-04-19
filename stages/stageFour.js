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

// stage four begin here
// there is a problem in render function and that is this line
// element.props.children.forEach((child) => _render(child, dom));
// it is so because once we start rendering, we won’t stop until we have rendered the
// complete element tree. If the element tree is big, it may block the main thread
// for too long. And if the browser needs to do high priority stuff like handling user
// input or keeping an animation smooth, it will have to wait until the render
// finishes.

// So we are going to break the work into small units, and after we finish each unit
// we’ll let the browser interrupt the rendering if there’s anything else that needs
// to be done.

// We use requestIdleCallback to make a loop. You can think of requestIdleCallback as a
// setTimeout, but instead of us telling it when to run, the browser will run the
// callback when the main thread is idle.

// React doesn’t use requestIdleCallback anymore. Now it uses the scheduler package.
// But for this use case it’s conceptually the same.

// requestIdleCallback also gives us a deadline parameter. We can use it to check how
// much time we have until the browser needs to take control again.

// step 1
// This variable holds the next thing we want to render
let nextUnitOfWork = null;

// step 2
// this function is our main sheduler
// exactly like a loop that keeps rendering until :
//       there’s no work left (nextUnitOfWork === null)
//       or the browser needs to do something more urgent (shouldYield === true)
function workLoop(deadline) {
  let shouldYield = false;

  // As long as we have work left (nextUnitOfWork !== null) and the browser is not
  // begging us to stop, keep rendering.
  while (nextUnitOfWork && !shouldYield) {
    // we will understand this at next stage
    nextUnitOfWork = perforUnitOfWork(nextUnitOfWork);

    // This checks:
    // “Do I have less than 1ms of time left before the browser needs the thread back?”
    // If so, set shouldYield = true, and pause the rendering. You’ll resume in the next
    // requestIdleCallback.
    shouldYield = deadline.timeRemaining() < 1;
  }

  // Once this run finishes, this line re-registers workLoop to run again when
  // the browser has time.
  requestIdleCallback(workLoop);
}

// requestIdleCallback calls workLoop() when the browser is idle and passes a deadline
// object to it.
requestIdleCallback(workLoop);

function perforUnitOfWork(nextUnitOfWork) {
  // will work on this at next stage
}

const slreact = {
  _createElement,
  _render,
};
