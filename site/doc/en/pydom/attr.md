<h1>attr</h1>

<h3>
Description: Get the value of an attribute for the first element in the set of matched elements or set one or more attributes for every matched element.
</h3>

Taken from the jquery, api documentation:

<h3>attr(attributeName)</h3>

Get the value of an attribute for the first element in the set of matched elements.

<h3>attr(attributeName,value)</h3>

Set one or more attributes for the set of matched elements.

<h3>attr(attributes)</h3>

An dictionary of attributes to set.

<script type="text/python">
import helper
helper.populate_example(1, "examples/attr1.html")
helper.populate_example(2, "examples/append2.html")
</script>

<h3>Examples:</h3>

<h4>Example: Display the checked attribute and property of a checkbox as it changes.</h4>

<pre id="source1"></pre>

<h3>Demo:</h3>

<iframe src="examples/attr1.html" width="100%" height="150"></iframe>


<h4>Example: Appends an element to all paragraphs.</h4>

<pre id="source2"></pre>

<h3>Demo:</h3>

<iframe src="examples/append2.html" width="100%" height="150"></iframe>
