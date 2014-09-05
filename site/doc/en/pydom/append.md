<h1>append</h1>


<h3>
Description: 
Insert content, specified by the parameter, to the end of each element in the set of matched elements.
</h3>

Taken from the jquery, api documentation:

<h3>append(content[,content])</h3>

content is a DOM element, NodeCollection, HTML string, or jQuery object to insert at the end of each element in the set of matched elements.

The .append() method inserts the specified content as the last child of each element in the jQuery collection (To insert it as the first child, use .prepend()).

The .append() and .appendTo() methods perform the same task. The major difference is in the syntax-specifically, in the placement of the content and target. With .append(), the selector expression preceding the method is the container into which the content is inserted. With .appendTo(), on the other hand, the content precedes the method, either as a selector expression or as markup created on the fly, and it is inserted into the target container.

Consider the following HTML:

<pre>
    <h2>Greetings</h2>
    <div class="container">
      <div class="inner">Hello</div>
      <div class="inner">Goodbye</div>
    </div>
</pre>

You can create content and insert it into several elements at once:

<pre>
    get(".inner").append("<p>Test</p>")
</pre>

Each inner &lt;pre&gt; element gets this new content:

<pre>
    <h2>Greetings</h2>
    <div class="container">
      <div class="inner">
        Hello
        <p>Test</p>
      </div>
      <div class="inner">
        Goodbye
        <p>Test</p>
      </div>
    </div>
</pre>

You can also select an element on the page and insert it into another:

<pre>
    #todo check if this works..
    get(".container").append(get('h2'))
</pre>



<script type="text/python">
import helper
helper.populate_example(1, "examples/append1.html")
helper.populate_example(2, "examples/append2.html")
</script>

<h3>Examples:</h3>

<h4>Example: Appends some HTML to all paragraphs.</h4>

<pre id="source1"></pre>

<h3>Demo:</h3>

<iframe src="examples/append1.html" width="100%" height="150"></iframe>


<h4>Example: Appends an element to all paragraphs.</h4>

<pre id="source2"></pre>

<h3>Demo:</h3>

<iframe src="examples/append2.html" width="100%" height="150"></iframe>
