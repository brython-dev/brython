Problem
-------

Create an HTML table


Solution
--------

In this example and the following, we will only show the Python script ; the surrounding HTML code will remain the same as in the previous examples

To create a table, we use the HTML tags : `TABLE` (the table),`TR` (a table row),`TH` (a header cell) and `TD` (a cell)

The table is made of rows, each row is made of cells ; the first row is generally made of "header cells" describing the value in the matching column

Here is a simple example :

<table width="100%">
<tr>
<td style="width:50%;">

    from browser import document as doc
    from browser.html import TABLE,TR,TH,TD
    table = TABLE()
    row = TR() # create a row
    # add header cells
    row <= TH("Country")
    row <= TH("Capital city")
    table <= row # add the row to the table
    
    # add a row
    row = TR()
    row <= TD("United States")+TD("Washington")
    table <= row
    
    # erase initial content
    doc['zone'].text = ''
    
    # insert table in the element
    doc['zone'] <= table


<button id="fill_zone">Test it</button>
</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">Initial content<p>
</td>
</tr>
</table>

<script type="text/python3">
def fill_zone(ev):
    src = doc.get(selector="pre.marked")[0].text
    exec(src)

doc['fill_zone'].bind('click', fill_zone)
</script>

Note how the initial cell content was erased : simply by setting its attribute `text` to the empty string

We can build a table from a list of lists :

<table width="100%">
<tr>
<td style="width:50%;">

    lines = [ ['Morrissey','vocals'],
        ['Johnny Marr','guitar'],
        ['Mike Joyce','the drums'],
        ['Andy Rourke','the bass guitar']
        ]
    t = TABLE()
    for line in lines:
        t <= TR(TD(line[0])+TD(line[1]))
    doc['zone1'].text = ''
    doc['zone1']<= t

<button id="build_table">Test it</button>
</td>
<td id="zone1" style="background-color:#FF7400;text-align:center;">Initial content<p>
</td>
</tr>
</table>

<script type="text/python3">
def build_table(ev):
    src = doc.get(selector="pre.marked")[1].text
    exec(src)
doc['build_table'].bind('click', build_table)

</script>

