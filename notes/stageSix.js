/*

We have so many data structures like element,fiber,wipRoot
and here we will understand them and why they are important and how they are
improving the performance of our react code.

*/

/*
first we will see element.
    -> This is virtual representation of JSX — a lightweight JS object.

const element = slreact.createElement("div", null,
  slreact.createElement("h1", null, "Hello"),
  slreact.createElement("h2", null, "World")
);
 Now our element will look like :
 {
  type: "div",
  props: {
    children: [
      {
        type: "h1",
        props: {
          children: [
            {
              type: "TEXT_ELEMENT",
              props: {
                nodeValue: "Hello",
                children: []
              }
            }
          ]
        }
      },
      {
        type: "h2",
        props: {
          children: [
            {
              type: "TEXT_ELEMENT",
              props: {
                nodeValue: "World",
                children: []
              }
            }
          ]
        }
      }
    ]
  }
}

Application and Importance :
-> createElement function creates them
-> Used as input in render() to kickstart rendering.




*/

/*

Now we will see fiber

A fiber is like a task unit — it wraps an element with some metadata to help the
render engine do work.

Looks like this -> 
{
  type: "h1",
  props: {
    children: [...]
  },
  parent: fiberAbove,
  child: firstChildFiber,
  sibling: nextFiberInSameLevel,
  dom: actualDOMNode
}




*/

/*
wipRoot
wipRoot stands for work-in-progress root.

let wipRoot = {
  dom: container, // actual <div id="root"> DOM node
  props: {
    children: [element]
  },
  ...
}

-> The first fiber we process.
-> Acts like a “head pointer” for the fiber tree.
-> Once all fibers are built (via performUnitOfWork), we use wipRoot.child to 
   commit everything to the DOM.



*/

/*

Now we will look at the functions which are doing things using those data structures

==> createElemen()
        -> convert jsx-like syntax into nested element objects

==> render(element,container)
        -> creates wipRoot
        -> Starts the rendering process by wrapping the element as the root fiber

==> performUnitOfWork()
        -> opearates on fiber
        -> Creates the DOM (if not created), links child/sibling fibers, returns
           next fiber

==> workLoop()
        -> Keeps doing work (fibers) as long as there's time before yielding
           using performUnitOfWork

==> commitWork()
        -> operates on fiber tree
        -> After all fibers are created, walks tree to actually append DOM nodes

==> commitRoot()
        -> 	Starts commit phase from root


*/
