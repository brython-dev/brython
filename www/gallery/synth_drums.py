"""Adapted from Chris Lowis' drum synthesis code in Javascript
https://github.com/chrislo/drum_synthesis
"""

import random

from browser import bind, console, document, html, timer, window

class Config:

    context = None


def setup():
    if Config.context is None:
        Config.context = window.AudioContext.new()

kick_freq = document['kick_freq']

class Kick:

    def __init__(self):
        setup()

    def setup(self):
      self.osc = Config.context.createOscillator()
      self.gain = Config.context.createGain()
      self.osc.connect(self.gain)
      self.gain.connect(Config.context.destination)

    def trigger(self, time):
      self.setup()

      self.osc.frequency.setValueAtTime(int(kick_freq.value), time)
      self.gain.gain.setValueAtTime(1, time)

      self.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5)
      self.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5)

      self.osc.start(time)

      self.osc.stop(time + 0.5)


class Snare:

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

    def trigger(self, time):

      self.osc = Config.context.createOscillator()
      self.osc.type = 'triangle'

      self.oscEnvelope = Config.context.createGain()
      self.osc.connect(self.oscEnvelope)
      self.oscEnvelope.connect(Config.context.destination)

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

    def setup(self, time):
        self.source = Config.context.createBufferSource()
        self.source.buffer = self.buffer
        self.source.connect(Config.context.destination)
        self.play(time)

    def trigger(self, time=None):
        if self.buffer is None:
            Config.context = window.AudioContext.new()
            sampleLoader('samples/hihat.wav', HiHat, lambda: self.setup(time))
        else:
            self.setup(time)

    def play(self, time):
        time = Config.context.currentTime if time is None else time
        self.source.start(time)

score = html.TABLE()
rows = {}
instruments = [HiHat, Snare, Kick]

for instrument in instruments:
    score <= (row := html.TR(html.TD(instrument.__name__)))
    for i in range(8):
        row <= html.TD(html.INPUT(type="checkbox"))
    rows[instrument] = row

document <= score

kick_inputs = rows[Kick].select('INPUT')
for t in [0, 1, 4]:
    kick_inputs[t].checked = True

snare_inputs = rows[Snare].select('INPUT')
for t in [2, 3, 6]:
    snare_inputs[t].checked = True


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


@bind('#play_kick', 'click')
def play_kick(ev):
    kick = Kick()
    kick.trigger(Config.context.currentTime)

@bind('#play_snare', 'click')
def play_snare(ev):
    snare = Snare()
    snare.trigger(Config.context.currentTime)

@bind('#play_hihat', 'click')
def play_hihat(ev):
    hihat = HiHat()
    hihat.trigger()

window.playing = False
#sampleLoader('samples/hihat.wav', context, HiHat)

look_ahead = 0.1
schedule_period = 1000 * 0.05 # milliseconds

bpm_control = document['bpm']

def get_bpm():
    return int(bpm_control.value)

seq = [[Kick, 1], [Kick, 1.5], [Snare, 2], [Snare, 2.5], [Kick, 3], [Snare, 4]]

class Sequencer:

    running = False

def get_seq():
    seq = []
    for instrument in instruments:
        cells = rows[instrument].select('INPUT')
        for i, cell in enumerate(cells):
            if cell.checked:
                seq.append([instrument, (i + 2) / 2])
    seq.sort(key=lambda x: x[1])
    return seq

@bind('#start_loop', 'click')
def start_loop(ev):
    setup()
    if Sequencer.running:
        return
    Sequencer.running = True
    bpm = get_bpm()
    seq = get_seq()
    seq1 = [[instrument, t * 60 / bpm] for (instrument, t) in seq]
    loop(Config.context.currentTime, seq, seq1, 0)

@bind('#end_loop', 'click')
def end_loop(ev):
    Sequencer.running = False

def loop(t0, seq, seq1, i):
    dt = Config.context.currentTime - t0

    if not Sequencer.running:
        return

    if dt > seq1[i][1] - look_ahead:
        instrument = seq1[i][0]()
        t = seq1[i][1]
        start = t0 + t
        instrument.trigger(start + 0.1)
        i += 1
        if i >= len(seq):
            i = 0
            bpm = get_bpm()
            t0 = t0 + 4 * 60 / bpm
            seq = get_seq()
            seq1 = [[instrument, t * 60 / bpm] for (instrument, t) in seq]

    timer.set_timeout(loop, schedule_period, t0, seq, seq1, i)
