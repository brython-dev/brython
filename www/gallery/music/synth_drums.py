"""Adapted from Chris Lowis' drum synthesis code in Javascript
https://github.com/chrislo/drum_synthesis
"""

import random
import json

from browser import bind, console, document, html, timer, window

import drum_score

class Config:

    context = None


def setup():
    if Config.context is None:
        Config.context = window.AudioContext.new()


class Instrument:

    buffer = None
    checked = 'x'

    def setup(self, time):
        self.source = Config.context.createBufferSource()
        volume = int(self.volume_control.value) / 50
        gain = window.GainNode.new(Config.context)
        gain.gain.value = volume
        self.source.buffer = self.buffer
        self.source.connect(gain)
        gain.connect(Config.context.destination)
        self.play(time)

    def trigger(self, time=None):
        if self.buffer is None:
            Config.context = window.AudioContext.new()
            time = time or Config.context.currentTime
            sampleLoader(self.sample, self.__class__, lambda: self.setup(time))
        else:
            time = time or Config.context.currentTime
            self.setup(time)

    def play(self, time):
        time = Config.context.currentTime if time is None else time
        self.source.start(time)

def make_class(name, sample):
    return type(name, [Instrument], {'sample': sample})

Crash = make_class('Crash', 'samples/Acoustic Crash 01.wav')
HiHat = make_class('HiHat', 'samples/Acoustic Closed Hat 05.wav')
Snare = make_class('Snare', 'samples/Acoustic Snare 01.wav')
TomHigh = make_class('TomHigh', 'samples/Acoustic High Tom 01.wav')
TomMid = make_class('TomMid', 'samples/Acoustic Mid Tom 01.wav')
TomLow = make_class('TomLow', 'samples/Acoustic Low Tom 01.wav')
Kick = make_class('Kick', 'samples/Acoustic Kick 01.wav')

instruments = [Crash, HiHat, TomHigh, TomMid, TomLow, Snare, Kick]

score = drum_score.Score(instruments)

document['score'] <= html.DIV('Patterns')

document['score'] <= score
score.new_tab()

def change_instr_volume(ev):
    print(ev.target)

for i, control in enumerate(document.select('INPUT[type="range"]')):
    control.bind('input', change_instr_volume)

def sampleLoader(url, cls, callback):
    request = window.XMLHttpRequest.new()
    request.open("GET", url, True)
    request.responseType = "arraybuffer"

    def f(buffer):
        cls.buffer = buffer
        callback()

    @bind(request, 'load')
    def load(ev):
        Config.context.decodeAudioData(request.response, f)

    request.send()

load_button = document['load_score']

@bind(load_button, "input")
def file_read(ev):

    def onload(event):
        """Triggered when file is read. The FileReader instance is
        event.target.
        The file content, as text, is the FileReader instance's "result"
        attribute."""
        global score
        data = json.loads(event.target.result)
        document['score'].clear()
        document['score'] <= score
        score.patterns.value = data['patterns']
        for i, notes in enumerate(data['bars']):
            score.new_tab(notes=notes)
        bpm_control.value = bpm_value.text = data['bpm']
        # set attribute "download" to file name
        save_button.attrs["download"] = file.name

    # Get the selected file as a DOM File object
    file = load_button.files[0]
    # Create a new DOM FileReader instance
    reader = window.FileReader.new()
    # Read the file content as text
    reader.readAsText(file)
    reader.bind("load", onload)

save_button = document['save_score']

@bind(save_button, "mousedown")
def mousedown(evt):
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
                         'bpm': score.bpm
                         })

      content = window.encodeURIComponent(data)
      # set attribute "href" of save link
      save_button.attrs["download"] = 'drum_score.json'
      save_button.attrs["href"] = "data:text/json," + content


look_ahead = 0.1
schedule_period = 1000 * 0.05 # milliseconds

bpm_control = document['bpm']
bpm_value = document['bpm_value']

score.bpm = int(bpm_control.value)

@bind('#bpm', 'input')
def change_bpm(ev):
    bpm_value.text = ev.target.value
    score.bpm = int(ev.target.value)
    Sequencer.read_sequence()


class Sequencer:

    running = False
    pattern = None

    @classmethod
    def read_sequence(cls, num=None):
        cls.seq, cls.nb_bars = score.get_seq(num)


@bind('.start_loop', 'click')
def start_loop(ev):
    print('click on start loop', ev.target)
    if getattr(ev.target, 'id', None) != 'play_score':
        num = score.selected_tab.num - 1
    else:
        num = None
    setup()
    if Sequencer.running:
        ev.target.html = '&#x23f5;'
        Sequencer.running = False
        return
    Sequencer.read_sequence(num)
    if not Sequencer.seq:
        return
    ev.target.html = '&#x23f9;'
    Sequencer.running = True
    Sequencer.pattern = None
    loop(Config.context.currentTime, num, 0)

score.play_pattern = start_loop

@bind('#end_loop', 'click')
def end_loop(ev):
    document['start_loop'].html = '&#x23f5'
    Sequencer.running = False

def loop(t0, num, i):
    dt = Config.context.currentTime - t0

    if not Sequencer.running:
        return

    while dt > Sequencer.seq[i][1] - look_ahead:
        line_num, t, pattern, cell = Sequencer.seq[i]
        instrument = score.instruments[line_num]()
        if pattern != Sequencer.pattern:
            score.show_pattern(pattern);
            Sequencer.pattern = pattern
        score.flash(cell)
        start = t0 + t
        instrument.trigger(start + 0.1)
        i += 1
        if i >= len(Sequencer.seq):
            i = 0
            t0 = t0 + Sequencer.nb_bars * 240 / score.bpm # bar duration (4 quarter notes)
            Sequencer.read_sequence(num)
            break

    timer.set_timeout(loop, schedule_period, t0, num, i)
