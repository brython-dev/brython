"""Adapted from Chris Lowis' drum synthesis code in Javascript
https://github.com/chrislo/drum_synthesis
"""

import random
import json

from browser import bind, console, document, html, timer, window

import drum_score
import player


instruments = player.instruments



load_button = document['load_score']

@bind(load_button, "input")
def file_read(ev):

    def onload(event):
        """Triggered when file is read. The FileReader instance is
        event.target.
        The file content, as text, is the FileReader instance's "result"
        attribute."""
        data = json.loads(event.target.result)
        print('data', data)
        document['score'].clear()
        score = create_score(data.get('notes_per_bar', 16))
        document['score'] <= score
        while score.tabs:
            score.remove_tab(score.tabs[-1])
        score.patterns.value = data['patterns']
        for i, notes in enumerate(data['bars']):
            score.new_tab(notes=notes)
        document["bpm_control"].value = document["bpm_value"].text = data['bpm']
        # set attribute "download" to file name
        ev.target.attrs["download"] = file.name

    # Get the selected file as a DOM File object
    file = load_button.files[0]
    # Create a new DOM FileReader instance
    reader = window.FileReader.new()
    # Read the file content as text
    reader.readAsText(file)
    reader.bind("load", onload)

#save_button = document['save_score']

#@bind(save_button, "mousedown")
def save_score(ev, score):
      """Create a "data URI" to set the downloaded file content
      Cf. https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
      """
      patterns = score.patterns.value
      bars = []
      for bar in score.bars:
          sbar = {}
          for instrument in bar.notes:
              sbar[instrument.__name__] = bar.notes[instrument]
          bars.append(sbar)

      data = json.dumps({'patterns': score.patterns.value,
                         'bars': bars,
                         'bpm': score.bpm,
                         'notes_per_bar': score.notes_per_bar
                         })

      content = window.encodeURIComponent(data)
      # set attribute "href" of save link
      save_button = ev.target
      save_button.attrs["download"] = 'drum_score.json'
      save_button.attrs["href"] = "data:text/json," + content

def create_score(notes_per_bar):

    document["notes_per_bar"].clear()
    
    score = drum_score.Score(instruments, notes_per_bar)

    document['score'] <= html.DIV('Patterns')

    document['score'] <= score
    score.new_tab()

    bpm = document["bpm"]

    play_control = html.BUTTON("&#x23f5",
                             id="play_score", Class="pure-button start_loop")
    play_control.bind('click', lambda ev: play_score(ev, score))
    bpm <= play_control

    bpm_control = html.INPUT(id="bpm_control",
                             type="range", min=30, max=300, step=1, value=120)
    bpm <= bpm_control
    bpm_control.bind('input', lambda ev: change_bpm(ev, score))
    bpm_value = html.SPAN(id="bpm_value")
    bpm <= bpm_value

    score.bpm = bpm_control.value

    save_control = html.A("SAVE", href="#", id="save_score",
                          download=True, Class="pure-button")
    save_control.bind('click', lambda ev: save_score(ev, score))
    document["score"] <= save_control

    return score

@bind("#notes_per_bar button", "click")
def create_12_16(ev):
    create_score(int(ev.target.text))


def change_bpm(ev, score):
    document["bpm_value"].text = ev.target.value
    score.bpm = int(ev.target.value)

def play_score(ev, score):
    if player.Sequencer.running:
        ev.target.html = '&#x23f5;'
        player.Sequencer.running = False
        return
    player.Sequencer.running = True
    ev.target.html = '&#x23f9;'
    score.bpm = int(document['bpm_control'].value)
    seq, nb_bars = score.get_seq()
    player.start_loop(seq, nb_bars, score, None)
