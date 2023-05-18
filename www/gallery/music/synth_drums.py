"""Adapted from Chris Lowis' drum synthesis code in Javascript
https://github.com/chrislo/drum_synthesis
"""

import random

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

document['score'] <= (score := drum_score.Score(instruments))


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


look_ahead = 0.1
schedule_period = 1000 * 0.05 # milliseconds

bpm_control = document['bpm']

@bind('#bpm', 'input')
def change_bpm(ev):
    global seq
    seq = score.get_seq(int(ev.target.value))

def get_bpm():
    return int(bpm_control.value)

class Sequencer:

    running = False

def get_seq():
    global seq
    seq = score.get_seq(get_bpm())

@bind('#start_loop', 'click')
def start_loop(ev):
    global seq
    setup()
    if Sequencer.running:
        return
    seq = score.get_seq(get_bpm())
    if not seq:
        return
    Sequencer.running = True
    loop(Config.context.currentTime, 0)

@bind('#end_loop', 'click')
def end_loop(ev):
    Sequencer.running = False

def loop(t0, i):
    global seq
    dt = Config.context.currentTime - t0

    if not Sequencer.running:
        return

    if dt > seq[i][1] - look_ahead:
        instrument = seq[i][0]()
        t = seq[i][1]
        start = t0 + t
        instrument.trigger(start + 0.1)
        i += 1
        if i >= len(seq):
            i = 0
            bpm = get_bpm()
            t0 = t0 + 16 * 30 / bpm
            seq = score.get_seq(bpm)

    timer.set_timeout(loop, schedule_period, t0, i)
