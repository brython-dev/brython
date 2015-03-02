<h1>addClass</h1>


<h3>Description: Adds the specified class(es) to each of the set of matched elements.</h3>

Taken from the jquery, api documentation:

<h3>addClass(className)</h3>

One or more space-separated classes to be added to the class attribute of each matched element.

It's important to note that this method does not replace a class. It simply adds the class, appending it to any which may already be assigned to the elements.

More than one class may be added at a time, separated by a space, to the set of matched elements, like so:

<pre>
  get('p').addClass('myClass yourClass')
</pre>


This method is often used with .removeClass() to switch elements' classes from one to another, like so:

<pre>
  get('p').removeClass('myclasss noClass').addClass('yourClass')
</pre>


Note: pydom's addClass function does not support function arguments.  This differentiates pydom's addClass from jQuery's addClass.


<script type="text/python">
import helper
helper.populate_example(1, "examples/addClass1.html")
</script>

<h3>Examples:</h3>

<h4>
Example: Add the class 'selected' to the matched elements.
</h4>

<pre id="source1"></pre>

<h3>Demo:</h3>

<iframe src="examples/addClass1.html" width="100%" height="150"></iframe>
