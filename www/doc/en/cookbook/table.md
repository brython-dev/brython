Problem
-------

Create an HTML table


Solution
--------

In this example and the following, we will only show the Python script ; the 
surrounding HTML code will remain the same as in the previous examples

To create a table, we use the HTML tags : `TABLE` (the table),`TR` (a table 
row), `TH` (a header cell) and `TD` (a cell)

The table is made of rows, each row is made of cells ; the first row is 
generally made of "header cells" describing the value in the matching column

Here is a simple example :

<table width="100%">
<tr>
<td style="width:50%;">

```exec
from browser import document
from browser.html import TABLE, TR, TH, TD
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
document['zone'].clear()

# insert table in the element
document['zone'] <= table
```

</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">Initial 
content<p>
</td>
</tr>
</table>

We can build a table from a list of lists :

<table width="100%">
<tr>
<td style="width:50%;">

```exec
from browser import document
from browser.html import TABLE, TR, TH, TD

lines = [ ['Morrissey','vocals'],
    ['Johnny Marr','guitar'],
    ['Mike Joyce','the drums'],
    ['Andy Rourke','the bass guitar']
    ]
t = TABLE()
for line in lines:
    t <= TR(TD(line[0])+TD(line[1]))
document['zone1'].text = ''
document['zone1']<= t
```

</td>
<td id="zone1" style="background-color:#FF7400;text-align:center;">Initial 
content<p>
</td>
</tr>
</table>

