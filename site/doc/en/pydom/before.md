<h1>before</h1>


<h3>
Description: Insert content, specified by the parameter, before each element in the set of matched elements.
</h3>

Taken from the jquery, api documentation:

<h3>before(content[,content])</h3>

content is an HTML string, DOM element, array of elements, or pydom Select object to insert after each element in the set of matched elements.


The .before() and .insertBefore() methods perform the same task. The major difference is in the syntax-specifically, in the placement of the content and target. With .before(), the selector expression preceding the method is the container before which the content is inserted. With .insertBefore(), on the other hand, the content precedes the method, either as a selector expression or as markup created on the fly, and it is inserted before the target container.

Consider the following HTML:

<pre>
    <div class="container">
       <h2>Greetings</h2>
       <div class="inner">Hello</div>
       <div class="inner">Goodbye</div>
    </div>
</pre>

Content can be created and then inserted before several elements at once:

<pre>
    get(".inner").before("<p>Test</p>")
</pre>

Each inner &lt;div&gt; element gets this new content:

<pre>
    <div class="container">
       <h2>Greetings</h2>
       <p>Test</p>
       <div class="inner">Hello</div>
       <p>Test</p>
       <div class="inner">Goodbye</div>
    </div>
</pre>

You can also select an element on the page and insert it before another:

<pre>
    get('.container').before('h2')
</pre>


<script type="text/python">
import helper
helper.populate_example(1, "examples/before1.html")
helper.populate_example(2, "examples/before2.html")
</script>

<h3>Examples:</h3>

<h4>Example: Inserts some HTML before all paragraphs.</h4>

<pre id="source1"></pre>

<h3>Demo:</h3>

<iframe src="examples/before1.html" width="100%" height="150"></iframe>


<h4>
Example: Inserts a pydom object (similar to an Array of DOM Elements) before all paragraphs.
</h4>

<pre id="source2"></pre>

<h3>Demo:</h3>

<iframe src="examples/before2.html" width="100%" height="150"></iframe>
