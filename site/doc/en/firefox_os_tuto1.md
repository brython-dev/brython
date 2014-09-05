Building your own webapp : design
=================================

To get started, the easiest is to copy the Memos application in another directory

We will take the example of a calculator, whose logic will be held in a Python script called *calculator.py*. The application screen will show a line for the entered value and the result, and buttons for digits and operators, something like

    ---------------------
    |                   |
    ---------------------
    | 7 | 8 | 9 | / | C |
    ---------------------
    | 4 | 5 | 6 | x | < |
    ---------------------
    | 1 | 2 | 3 | - |√¯ |
    ---------------------
    | . | 2 | = | + |1/x|
    ---------------------
    
First thing is to start the built-in server and point the browser to `http://localhost:8003` : it shows you the Memos application

Edit *manifest.webapp* to change the application name and description. Create an icon for the application to replace the one provided for the Memos application (*/icons/brython-memo.png*), and put the path to this new icon in the section _icons_ of *manifest.webapp*

Edit *index.html* to remove the line

>    <script type="text/python" src="memos.py"></script>

To develop the application, you will need to get familiar with Firefox OS user interface. To get started, download the latest version of Firefox OS [Building Blocks](https://github.com/buildingfirefoxos/Building-Blocks) and open the file *app.html* in your browser. This will show you the HTML code used to generate common elements of the user interface : header, lists, fields, toolbar, etc. The source code of *app.html* is very useful to understand the tags used to build a page and the attributes you must set for each tag

Among all the elements presented in *app.html*, the one that looks the most like our calculator is the "Filters" page. In the source code of *app.html*, copy the code in section for Filter, id the part included in

    <section id="filters" data-position="right">

and paste it in the body of *index.html*. Pointing the browser to `localhost:8003` will now show you the same page as "Filters" in *app.html*

Edit the code in *index.html* to get the design of your calculator to get the lines with the numbers : you will have something like

      <section id="filters" data-position="right">
         <section role="region">
    
            <!-- keypad -->
            <ul role="tablist" data-type="filter">
              <li role="tab"><a href="#">7</a></li>
              <li role="tab"><a href="#">8</a></li>
              <li role="tab"><a href="#">9</a></li>
              <li role="tab"><a href="#">/</a></li>
              <li role="tab"><a href="#">C</a></li>
            </ul>
            <ul role="tablist" data-type="filter">
              <li role="tab"><a href="#">4</a></li>
              <li role="tab"><a href="#">5</a></li>
              <li role="tab"><a href="#">6</a></li>
              <li role="tab"><a href="#">*</a></li>
              <li role="tab"><a href="#"><</a></li>
            </ul>
            <ul role="tablist" data-type="filter">
              <li role="tab"><a href="#">1</a></li>
              <li role="tab"><a href="#">2</a></li>
              <li role="tab"><a href="#">3</a></li>
              <li role="tab"><a href="#">-</a></li>
              <li role="tab"><a href="#">√¯</a></li>
            </ul>
            <ul role="tablist" data-type="filter">
              <li role="tab"><a href="#">.</a></li>
              <li role="tab"><a href="#">0</a></li>
              <li role="tab"><a href="#">=</a></li>
              <li role="tab"><a href="#">+</a></li>
              <li role="tab"><a href="#">1/x</a></li>
            </ul>
        </section>
      </section>

For the zone at the top of the screen, the one where you see what you have typed and where the result of an operation will be displayed when you press "=", you need something more like in the section "Input areas" in *app.html*. Again, copy and paste the interesting part of the section "Input areas" in the source code of *app.html* and adapt it in *index.html*. You will now get the basic layout of your application :

    <section id="filters" data-position="right">
     <section role="region">

        <!-- entry field for feedback and result -->
        <form class="paddings">
          <p>
            <input type="text" placeholder="" value="" id="entry" required >
            <button type="reset">Clear</button>
          </p>
        </form>

        <!-- keypad -->
        (... same as above ...)

     </section>
    </section>

With this content in *index.html*, the application home page now looks like the calculator we had designed. But when you click on the buttons, nothing happens. For that, you must now write a program to handle the events on the page
