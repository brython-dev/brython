引用自 [W3C Document Object Model specification](http://www.w3.org/DOM/) :

> _What is the Document Object Model?_

> _The Document Object Model is a platform- and __language__-neutral interface_
> _that will allow programs and scripts to dynamically access and update the_
> _content, structure and style of documents._

Brython 的目標是使用Python代替Javascript來作為Web瀏覽器的腳本語言。

舉一個簡單的範例：

<table>
<tr>
<td>
```xml
<html>
<head>
<script src="/brython.js"></script>
</head>
<body onload="brython()">
<script type="text/python">
from browser import document, alert

# bind event 'click' on button to function echo

def echo(ev):
    alert(document["zone"].value)

document["mybutton"].bind("click", echo)
</script>
<input id="zone">
<button id="mybutton">點擊！</button>
</body>
</html>
```

</td>
<td style="padding-left:20px">

嘗試一下！

<script type="text/python">
from browser import document, alert

def echo(ev):
    alert(document["zone"].value)

document["mybutton"].bind("click", echo)
</script>

<input id="zone">
<button id="mybutton">點擊！</button>

</td>
</tr>
</table>

為了處理Python腳本，必須包含 __brython.js__ 並在網頁加載時運行`brython()`函數（使用`<BODY>`標記的 _onload_ 屬性）。在開發階段，可以將參數傳遞給`brython()`函數：
1. 將錯誤訊息顯示到Web瀏覽器控制台，
2. 還可以獲得與錯誤一起顯示的Javascript代碼。

如果Python程序很大，另一種選擇是將其寫入一個單獨的文件中，並使用 _script_ 標記的 _src_ 屬性進行載入：

```xml
<html>

<head>
<script src="/brython.js"></script>
</head>

<body onload="brython()">
<script type="text/python" src="test.py"></script>
<input id="zone" autocomplete="off">
<button id="mybutton">點擊！</button>
</body>

</html>
```
請注意，在這種情況下，Python腳本將通過AJAX調用來載入：它必須與HTML頁面位於同一個網域中。

腳本副檔名通常是 __`.py`__。在某些情況下，伺服器會將對此副檔名的AJAX調用解釋為在伺服器中執行腳本的請求。在這種情況下，您必須更改副檔名，例如以下範例將其替換為 __`.bry`__：

```xml
<script type="text/python" src="test.bry"></script>
```
在上面的兩個代碼範例中，當我們點擊按鈕時，調用`onclick`事件並運行在Python中定義的`echo()`函式。此函式通過INPUT元素的ID（_zone_）獲取該元素的值。這是通過語法`document ["zone"]`來達成的：模組** browser **中定義的`document`是一個物件，表示當前顯示在瀏覽器中的文檔。它的行為就像字典，其鍵值是DOM元素的ID。因此，在我們的範例中，`document ["zone"]`是一個映射到INPUT元素的物件；有趣的是，_value_ 屬性保存該物件的值。

在Brython中，可以通過多種方式達成輸出，包括使用“`alert()`”函式（也定義在 **browser** 中），該函式顯示一個伴隨著文本作為參數傳遞的彈出視窗。
