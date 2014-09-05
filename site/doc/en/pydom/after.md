<h1>after</h1>


<h3>
Description: Insert content, specified by the parameter, after each element in the set of matched elements.
</h3>

Taken from the jquery, api documentation:

<h3>after(content[,content])</h3>

content is an HTML string, DOM element, array of elements, or jQuery object to insert after each element in the set of matched elements.

The .after() and .insertAfter() methods perform the same task. The major difference is in the syntax—specifically, in the placement of the content and target. With .after(), the selector expression preceding the method is the container after which the content is inserted. With .insertAfter(), on the other hand, the content precedes the method, either as a selector expression or as markup created on the fly, and it is inserted after the target container.

Using the following HTML:

<pre>
    <div class="container">
       <h2>Greetings</h2>
       <div class="inner">Hello</div>
       <div class="inner">Goodbye</div>
    </div>
</pre>

Content can be created and then inserted after several elements at once:

<pre>
    get(".inner").after("<p>Test</p>")
</pre>

Each inner &lt;div&gt; element gets this new content:

<pre>
    <div class="container">
       <h2>Greetings</h2>
       <div class="inner">Hello</div>
       <p>Test</p>
       <div class="inner">Goodbye</div>
       <p>Test</p>
    </div>
</pre>

An element in the DOM can also be selected and inserted after another element:

<pre>
    get('.container').after('h2')
</pre>


<script type="text/python">
import helper
helper.populate_example(1, "examples/after1.html")
helper.populate_example(2, "examples/after2.html")
</script>

<h3>Examples:</h3>

<h4>Example: Inserts some HTML after all paragraphs.</h4>

<pre id="source1"></pre>

<h3>Demo:</h3>

<iframe src="examples/after1.html" width="100%" height="150"></iframe>


<h4>
Example: Inserts a pydom object (similar to an Array of DOM Elements) after all paragraphs.
</h4>

<pre id="source2"></pre>

<h3>Demo:</h3>

<iframe src="examples/after2.html" width="100%" height="150"></iframe>
