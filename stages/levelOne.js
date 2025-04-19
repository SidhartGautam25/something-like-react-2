// Step 1
// first we will create our own createElement Function
// Element as we know my friend are just object with type and props property

// So what our function do is creating this object with type and props
// property

// We use the spread operator for the props and the rest parameter syntax for the
// children, this way the children prop will always be an array.
function _createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children,
    },
  };
}
/*

Example:

==> createElement("div") returns:
{
  "type": "div",
  "props": { "children": [] }
}


==> createElement("div", null, a) returns:
{
  "type": "div",
  "props": { "children": [a] }
}


and createElement("div", null, a, b) returns:

{
  "type": "div",
  "props": { "children": [a, b] }
}
  */

// Step 2
// But children array could also have primitive values like strings and
// numbers
// So we will wrap everything that isn't an object inside its own
// element and create a special type for them : TEXT_ELEMENT

// Note :
// React doesn’t wrap primitive values or create empty arrays when there aren’t children,
// but we do it because it will simplify our code

// But before updating our createElement function we will make
// createTextElement to use it in createElement function
function _createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// Step 3
// and now we will create our createFunction which will use createTextElement
function __createElement(type, props, ...children) {
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

// Step 4
// now we will name our library
// and i think slreact(something like react will be fine,atleast for now)
const slreact = {
  __createElement,
};

// step 5
// and now we can use it like this
const element = slreact.__createElement(
  "div",
  { id: "foo" },
  slreact.__createElement("a", null, "bar"),
  slreact.__createElement("b")
);
const container = document.getElementById("root");
ReactDOM.render(element, container);
// and as you can see we have successfully replaced createElement function
// which we have used in levelZero

// step 6
// But there is a problem
// whenever in our code there is raw jsx,then in our condition now
// we want to use our own createElement function
// and this is done using this comment

/** @jsx slreact.__createElement */
const element_ = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);
// now now we dont have to use our createElement everytime
// we can write our jsx and babel will convert that into element
// using our createElement function
