Drag events
===========

<script type="text/python">
from browser import document as doc
from browser import alert
</script>

Drag events are

<table cellpadding=3 border=1>
<tr>
<td>*drag*</td>
<td>an element or text selection is being dragged
</td>
</tr>

<tr>
<td>*dragend*</td><td>a drag operation is being ended (by releasing a mouse button or hitting the escape key)</td>
</tr>

<tr>
<td>*dragenter*</td><td>a dragged element or text selection enters a valid drop target</td>
</tr>

<tr>
<td>*dragleave*</td><td>a dragged element or text selection leaves a valid drop target</td>
</tr>

<tr>
<td>*dragover*</td><td>an element or text selection is being dragged over a valid drop target</td>
</tr>

<tr>
<td>*dragstart*</td><td>the user starts dragging an element or text selection</td>
</tr>

<tr>
<td>*drop*</td><td>an element is dropped on a valid drop target</td>
</tr>

</table>

`DOMEvent` object attribute
---------------------------

`dataTransfer`
> a "data store" used to carry information during the drag and drop process

Data store attributes and methods
---------------------------------

The "data store" has the following attributes and methods :

`dropEffect`

> A string representing the actual effect that will be used, and should always be one of the possible values of `effectAllowed`.

> For the *dragenter* and *dragover* events, the `dropEffect` will be initialized based on what action the user is requesting. How this is determined is platform specific, but typically the user can press modifier keys to adjust which action is desired. Within an event handler for the *dragenter* and *dragover* events, the `dropEffect` should be modified if the action the user is requesting is not the one that is desired.

> For *dragstart*, *drag*, and *dragleave* events, the `dropEffect` is initialized to "none". Any value assigned to the `dropEffect` will be set, but the value isn't used for anything.

> For the *drop* and *dragend* events, the `dropEffect` will be initialized to the action that was desired, which will be the value that the `dropEffect` had after the last *dragenter* or *dragover* event.

> Possible values:

> -    "copy" : A copy of the source item is made at the new location.
> -    "move" : An item is moved to a new location.
> -    "link" : A link is established to the source at the new location.
> -    "none" : The item may not be dropped.

> Assigning any other value has no effect and retains the old value.


`effectAllowed`

> A string that specifies the effects that are allowed for this drag. You may set this in the *dragstart* event to set the desired effects for the source, and within the *dragenter* and *dragover* events to set the desired effects for the target. The value is not used for other events.

> Possible values:

> - "copy" : A copy of the source item may be made at the new location.
> - "move" : An item may be moved to a new location.
> - "link" : A link may be established to the source at the new location.
> - "copyLink" : A copy or link operation is permitted.
> - "copyMove" : A copy or move operation is permitted.
> - "linkMove" : A link or move operation is permitted.
> - "all" : All operations are permitted.
> - "none" : the item may not be dropped.
> - "uninitialized" : the default value when the effect has not been set, equivalent to all.

> Assigning any other value has no effect and retains the old value.

`files`

> Contains a list of all the local files available on the data transfer. If the drag operation doesn't involve dragging files, this property is an empty list. An invalid index access on the file list specified by this property will return `None`.

<code>getData(_type_)</code>

> Retrieves the data for a given type, or an empty string if data for that type does not exist or the data transfer contains no data

<code>setData(_type_, _value_)</code>

> Set the data for a given type. If data for the type does not exist, it is added at the end, such that the last item in the types list will be the new format. If data for the type already exists, the existing data is replaced in the same position. That is, the order of the types list is not changed when replacing data of the same type.


`types`

> Holds a list of the format types of the data that is stored for the first item, in the same order the data was added. An empty list will be returned if no data was added.


#### Example

See the recipe about drag and drop in the Cookbook menu
