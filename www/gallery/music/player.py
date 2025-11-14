"""Adapted from Chris Lowis' drum synthesis code in Javascript
https://github.com/chrislo/drum_synthesis
"""

import random
import json

from browser import bind, document, timer, window, ajax

import drum_score

class Config:

    context = None
    gain_node = None
    gain_value = None

def ensure_context():
    if Config.context is None:
        Config.context = window.AudioContext.new()
        Config.gain_node = window.GainNode.new(Config.context)
        Config.gain_node.gain.value = Config.gain_value or 0.5
        Config.gain_node.connect(Config.context.destination)

def setup(callback, seq, nb_bars, score, bar_nums):
    if Config.context is None:
        Config.context = window.AudioContext.new()
        load_instruments(callback, seq, nb_bars, score, bar_nums)
    else:
        callback(seq, nb_bars, score, bar_nums)

def set_gain(value):
    Config.gain_value = value
    if Config.gain_node:
        Config.gain_node.gain.value = value / 100

class Instrument:

    buffer = None
    checked = 'x'

    def setup(self, time):
        self.source = Config.context.createBufferSource()
        self.source.buffer = self.buffer
        self.source.connect(Config.gain_node)
        self.play(time)

    def trigger(self, time=None):
        ensure_context()
        time = time or Config.context.currentTime
        if self.buffer is None:
            load_instruments(self.setup, time)
        else:
            self.setup(time)

    def play(self, time):
        time = Config.context.currentTime if time is None else time
        self.source.start(time)

def make_class(name, sample):
    return type(name, [Instrument], {'sample': sample})

Crash = make_class('Crash', 'samples/Acoustic Crash 01.wav')
HiHat = make_class('HiHat', 'samples/Acoustic Closed Hat 05.wav')
OpenHiHat = make_class('OpenHiHat', 'samples/Acoustic Open Hat 01.wav')
Snare = make_class('Snare', 'samples/Acoustic Snare 01.wav')
TomHigh = make_class('TomHigh', 'samples/Acoustic High Tom 01.wav')
TomMid = make_class('TomMid', 'samples/Acoustic Mid Tom 01.wav')
TomLow = make_class('TomLow', 'samples/Acoustic Low Tom 01.wav')
Kick = make_class('Kick', 'samples/Acoustic Kick 01.wav')

instruments = [Crash, HiHat, OpenHiHat, TomHigh, TomMid, TomLow, Snare, Kick]

loaded = []

def decoded(buffer, instrument, callback, *args):
    loaded.append(instrument.__name__)
    instrument.buffer = buffer
    if len(loaded) == len(instruments):
        callback(*args)

def load_sample(instrument, req, callback, *args):
    Config.context.decodeAudioData(req.response,
        lambda buffer, instrument=instrument: decoded(buffer, instrument, callback, *args))

def load_instruments(callback, *args):
    for instrument in instruments:
        req = ajax.ajax()
        req.open('GET', instrument.sample)
        req.bind("complete", lambda req, instrument=instrument: \
                             load_sample(instrument, req, callback, *args))
        req.responseType = "arraybuffer"
        req.send()

look_ahead = 0.1
schedule_period = 1000 * 0.05 # milliseconds


class Sequencer:

    running = False
    pattern = None

    @classmethod
    def read_sequence(cls, score, bar_nums):
        cls.seq, cls.nb_bars = score.get_seq(bar_nums)


def start_loop(seq, nb_bars, score, bar_nums):
    setup(run_loop, seq, nb_bars, score, bar_nums)

def run_loop(seq, nb_bars, score, bar_nums):
    Sequencer.seq = seq
    Sequencer.nb_bars = nb_bars
    if not Sequencer.seq:
        return
    Sequencer.running = True
    Sequencer.pattern = None
    loop(Config.context.currentTime, None, 0, score, bar_nums)

def end_loop():
    Sequencer.running = False

def loop(t0, num, i, score, bar_nums):
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
            Sequencer.read_sequence(score, bar_nums)
            break

    timer.set_timeout(loop, schedule_period, t0, num, i, score, bar_nums)
