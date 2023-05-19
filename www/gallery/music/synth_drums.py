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

kick_freq = document['kick_freq']

class Kick:

    checked = 'o'

    def __init__(self):
        setup()

    def setup(self):
        self.osc = Config.context.createOscillator()
        self.gain = Config.context.createGain()
        self.osc.connect(self.gain)
        self.gain.connect(Config.context.destination)

    def trigger(self, time=None):
        time = time or Config.context.currentTime
        self.setup()

        self.osc.frequency.setValueAtTime(int(kick_freq.value), time)
        self.gain.gain.setValueAtTime(1, time)

        self.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5)
        self.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5)

        self.osc.start(time)

        self.osc.stop(time + 0.5)


class Snare:

    checked = 'o'

    def __init__(self):
        setup()
        self.setup()

    def setup(self):
        self.noise = Config.context.createBufferSource()
        self.noise.buffer = self.noiseBuffer()

        noiseFilter = Config.context.createBiquadFilter()
        noiseFilter.type = 'highpass'
        noiseFilter.frequency.value = 1000
        self.noise.connect(noiseFilter)

        self.noiseEnvelope = Config.context.createGain()
        noiseFilter.connect(self.noiseEnvelope)

        self.noiseEnvelope.connect(Config.context.destination)

    def noiseBuffer(self):
        bufferSize = Config.context.sampleRate
        buffer = Config.context.createBuffer(1, bufferSize,
                                             Config.context.sampleRate)
        output = buffer.getChannelData(0)

        for i in range(bufferSize):
          output[i] = random.random() * 2 - 1

        return buffer

    def trigger(self, time=None):

        time = time or Config.context.currentTime
        self.osc = Config.context.createOscillator()
        self.osc.type = 'triangle'

        self.oscEnvelope = Config.context.createGain()
        self.osc.connect(self.oscEnvelope)
        self.oscEnvelope.connect(Config.context.destination)

        self.noiseEnvelope.gain.cancelScheduledValues(time)

        self.noiseEnvelope.gain.setValueAtTime(1, time)
        self.noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2)
        self.noise.start(time)

        self.osc.frequency.setValueAtTime(100, time)
        self.oscEnvelope.gain.setValueAtTime(0.7, time)
        self.oscEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.1)
        self.osc.start(time)

        self.osc.stop(time + 0.2)
        self.noise.stop(time + 0.2)

class HiHat:

    buffer = None
    checked = 'x'

    def setup(self, time):
        self.source = Config.context.createBufferSource()
        self.source.buffer = self.buffer
        self.source.connect(Config.context.destination)
        self.play(time)

    def trigger(self, time=None):
        if self.buffer is None:
            Config.context = window.AudioContext.new()
            time = time or Config.context.currentTime
            sampleLoader('samples/hihat.wav', HiHat, lambda: self.setup(time))
        else:
            time = time or Config.context.currentTime
            self.setup(time)

    def play(self, time):
        time = Config.context.currentTime if time is None else time
        self.source.start(time)

instruments = [HiHat, Snare, Kick]

score = drum_score.Score(instruments)
document['score'] <= score
score.new_tab()


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
        score = drum_score.Score(instruments)
        document['score'].clear()
        document['score'] <= score
        score.patterns.value = data['patterns']
        for i, notes in enumerate(data['bars']):
            score.new_tab(notes=notes)
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

      data = json.dumps({'patterns': score.patterns.value, 'bars': bars})

      content = window.encodeURIComponent(data)
      # set attribute "href" of save link
      save_button.attrs["download"] = 'drum_score.json'
      save_button.attrs["href"] = "data:text/json," + content


look_ahead = 0.1
schedule_period = 1000 * 0.05 # milliseconds

bpm_control = document['bpm']

@bind('#bpm', 'input')
def change_bpm(ev):
    Sequencer.read_sequence()

def get_bpm():
    return int(bpm_control.value)

class Sequencer:

    running = False
    pattern = None

    @classmethod
    def read_sequence(cls):
        cls.seq, cls.nb_bars = score.get_seq(get_bpm())


@bind('#start_loop', 'click')
def start_loop(ev):
    setup()
    if Sequencer.running:
        return
    Sequencer.read_sequence()
    if not Sequencer.seq:
        return
    Sequencer.running = True
    Sequencer.pattern = None
    loop(Config.context.currentTime, 0)

@bind('#end_loop', 'click')
def end_loop(ev):
    Sequencer.running = False

def loop(t0, i):
    dt = Config.context.currentTime - t0

    if not Sequencer.running:
        return

    while dt > Sequencer.seq[i][1] - look_ahead:
        line_num, t, pattern, cell = Sequencer.seq[i]
        instrument = score.instruments[line_num]()
        if pattern != Sequencer.pattern:
            score.show_pattern(pattern)
            Sequencer.pattern = pattern
        score.flash(cell)
        start = t0 + t
        instrument.trigger(start + 0.1)
        i += 1
        if i >= len(Sequencer.seq):
            i = 0
            bpm = get_bpm()
            t0 = t0 + Sequencer.nb_bars * 240 / bpm # bar duration (4 quarter notes)
            Sequencer.read_sequence()
            break

    timer.set_timeout(loop, schedule_period, t0, i)
