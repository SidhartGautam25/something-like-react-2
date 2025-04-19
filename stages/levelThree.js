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

// stage three code begin here
// Now we will implement our own ReactDOM.render function

// Step 1
// element -> a virtual DOM node created by _createElement
// container ->  the actual DOM element (like document.getElementById("root")) where you
//               want to append the rendered content.

function _render(element, container) {
  // If it's a TEXT_ELEMENT (like "Hello"), create a text node.
  // otherwise create an HTML element (div, h1, span, etc).
  const dom =
    element.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  const isProperty = (key) => key !== "children";

  /*
    if element for example looks like this
    {
        type: "h1",
        props: {
            id: "main-heading",
            onClick: () => alert("clicked!"),
            children: [...]  // always exists
        }
    }
    Then Object.keys(element.props) gives:
    ["id", "onClick", "children"]

    ["id", "onClick", "children"].filter(isProperty)
    This returns ["id", "onClick"]
    
    and let say dom before below code looks like <h1></h1>
    then after the below operation,it looks like
    <h1 id="main-heading">Hello</h1>

    (“Hello” is added by recursive _render(child))
    
    
    */
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  // children things handled here
  element.props.children.forEach((child) => _render(child, dom));

  container.appendChild(dom);
}

const slreact = {
  _createElement,
  _render,
};
