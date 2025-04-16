/*

Lets understand reconcileChildren function

This function compares:
        The new children (from the updated JSX).
        The old fibers (from the previous render).

It builds a new fiber tree and adds metadata (effectTag) about what
needs to be done:

    "UPDATE" → same type, different props → update the DOM node.
    "PLACEMENT" → new element → insert new DOM node.
    "DELETION" → old element not in new list → remove the DOM node.



*/

/*

Let say we have this jssx to render ->
       
       function App() {
            return (
                <div>
                    <h1>Hello</h1>
                    <p>World</p>
                </div>
                );
        }
        
So for this our fiber tree simply look like this ->
        root (div)
            ├── h1 (Hello)
            └── p (World)

Now comes the second render -> 
        
        function App() {
            return (
                <div>
                    <h1>Hi</h1>       // Updated text
                    <a>Click</a>       // New element replaces <p>
                </div>
            );
        }
        
Now we call reconcileChildren(wipFiber, newChildren) where:
        wipFiber.alternate.child refers to the old <h1> fiber.
        newChildren = [<h1>Hi</h1>, <a>Click</a>]









*/
