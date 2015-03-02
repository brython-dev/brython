Creando tu propia webapp : diseño
=================================

Para empezar, lo más sencillo sería copiar la aplicación en otro directorio.

Tomemos el ejemplo de una calculadora, cuya lógica será incluida en el script Python llamado *calculator.py*. La pantalla de la aplicación mostrará una línea para el valor introducido y el resultado y botones para los dígitos y operadores, algo como:

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
    
Lo primero sería arrancar el servidor integrado y escribir la dirección `http://localhost:8003`: mostrará la aplicación Memos

Edita *manifest.webapp* para cambiar el nombre de la aplicación y su descripción. Crea un icono para la plaicación para reemplazar el que proporciona la aplicación Memos (*/icons/brython-memo.png*) y pon la ruta a este nuevo icono en la sección _icons_ de *manifest.webapp*.

Edita *index.html* para eliminar la línea

>    <script type="text/python" src="memos.py"></script>

Para desarrollar una aplicación necesitarás familiarizarte con la interfaz de usuario de Firefox OS. Para empezar, descarga la última versión de Firefox OS [Building Blocks](https://github.com/buildingfirefoxos/Building-Blocks) y abre el fichero *app.html* en tu navegador. Se mostrará el código html usado para generar elementos comunes de la interfaz de usuario: cabecero, listas, campos, barra de herramientas, etc. El código fuente de *app.html* es muy útil para entender las etiquetas usadas para crear una página y los atributos que debes establecer para cada etiqueta.

Entre todos los elementos presentes en *app.html*, el que se asemeja más a nuestra calculadora es la página "Filters". En el código fuente de *app.html*, copia el código de section para Filter, i.e. la parte incluida en

    <section id="filters" data-position="right">

y pégalo en el cuerpo de *index.html*. Si apuntas el navegador a `localhost:8003` mostrará la misma página que "Filters" en *app.html*.

Edita el código en *index.html* para obtener el diseño de tu calculadora, para obtener las líneas con los números: obtendrás algo como esto:

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

Para la zona superior de la pantalla, aquella en la que verás lo que has escrito y el resultado de una operación después de pulsar "=", necesitarás algo más parecido a la sección "Input areas" en *app.html*. De nuevo, copia y pega la parte interesante de la sección "Input areas" en el código fuente de *app.html* y adáptalo en *index.html*. Ya tienes la implantación básica de tu aplicación:

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

Con este contenido en *index.html*, la página de inicio de la aplicación ahora parecerá una calculadora. Pero cuando pulsas en los botones no sucede nada. Por ello, deberás escribir un programa que maneje los eventos de la página.
