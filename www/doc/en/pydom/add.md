<h1>add</h1>

<h2>add(selector)</h2>

<h3>Description: Add elements to the set of matched elements.</h3>

Taken from the jquery, api documentation:

Given a NodeCollection object that represents a set of DOM elements, the .add() method constructs a new NodeCollection object from the union of those elements and the ones passed into the method. The argument to .add() can be pretty much anything that the function 'get' accepts, including a jQuery selector expression, references to DOM elements, or an HTML snippet.

Do not assume that this method appends the elements to the existing collection in the order they are passed to the .add() method. When all elements are members of the same document, the resulting collection from .add() will be sorted in document order; that is, in order of each element's appearance in the document. If the collection consists of elements from different documents or ones not in any document, the sort order is undefined. 

<script type="text/python">
import helper
helper.populate_example(1, "examples/add1.html")
helper.populate_example(2, "examples/add2.html")
</script>

<h3>Examples:</h3>

<h4>
Example: Finds all divs and makes a border. Then adds all paragraphs to the jQuery object to set their backgrounds yellow.
</h4>

<pre id="source1"></pre>

<h3>Demo:</h3>

<iframe src="examples/add1.html" width="100%" height="150"></iframe>


<h4>
Example: Adds more elements, matched by the given expression, to the set of matched elements.
</h4>

<pre id="source2"></pre>

<h3>Demo:</h3>

<iframe src="examples/add2.html" width="100%" height="150"></iframe>
