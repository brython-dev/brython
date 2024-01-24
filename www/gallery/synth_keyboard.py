import sys

from browser import document, window, html, console, bind, timer, alert

import notes
import synthesizer
import widgets

audioContext = None

controls_row = document['controls_row']

controls = {}

class Unit:
    width = window.innerWidth
    height = window.innerHeight

def get_value(control):
    return float(controls[control].value)

def slider(legend, name, min_value, max_value, step, value):
    control = widgets.Slider(100, 15,
                             min_value=min_value, max_value=max_value,
                             step=step, value=value)
    controls[name] = control
    info = html.TD(value, Class="control-value")

    @bind(control, 'input')
    def change_control(ev):
        info.text = f'{float(ev.target.value):.2f}'

    return html.TR(html.TD(legend) + html.TD(control) + info)

tone_selector = ((tone_down := html.BUTTON('-')) +
                 (tone_value := html.DIV(Class="tone")) +
                 (tone_up := html.BUTTON('+')))

tone_value.text = 'C'
@bind(tone_down, 'click')
def tone_down(ev):
    v = tone_value.text
    rank = tone_list.index(tone_value.text)
    rank -= 1
    tone_value.text = tone_list[rank]
    setup()

@bind(tone_up, 'click')
def tone_up(ev):
    v = tone_value.text
    rank = tone_list.index(tone_value.text)
    rank += 1
    if rank >= len(tone_list):
        rank -= len(tone_list)
    tone_value.text = tone_list[rank]
    setup()

octave_selector = ((octave_down := html.BUTTON('<')) +
                  (octave_value := html.DIV(Class="tone")) +
                  (octave_up := html.BUTTON('>')))
octave_list = '12345'

octave_value.text = '3'
@bind(octave_down, 'click')
def tone_down(ev):
    v = octave_value.text
    rank = octave_list.index(octave_value.text)
    if rank == 0:
        return
    rank -= 1
    octave_value.text = octave_list[rank]
    setup()

@bind(octave_up, 'click')
def octave_up(ev):
    v = octave_value.text
    rank = octave_list.index(octave_value.text)
    rank += 1
    if rank >= len(octave_list):
        return
    octave_value.text = octave_list[rank]
    setup()

controls_row <= html.TD(html.TABLE(
                       html.TR(html.TD('VOLUME') +
                               slider('', 'volume', 0, 1, 0.05, 0.5)) +
                       html.TR(html.TD('TONE') + html.TD(tone_selector)) +
                       html.TR(html.TD('OCTAVE') + html.TD(octave_selector))
                     )
                   )

@bind(controls['volume'], 'input')
def change_volume(ev):
    for volume in instances['volume'].values():
        volume.gain.setTargetAtTime(float(ev.target.value),
                                    audioContext.currentTime,
                                    0.2)

waveforms = dict(SAWT='sawtooth', SINE='sine', SQUA='square', TRIA='triangle')

wave_buttons = [html.BUTTON(waveform, value=value, Class="waveform")
                for waveform, value in waveforms.items()]

controls_row <= html.TD(html.TABLE(
                      html.TR(html.TD('WAVEFORM', colspan=2)) +
                      html.TR(html.TD(wave_buttons, colspan=2)) +
                      slider('WIDTH', 'width', 0, 50, 1, 0)
                    )
                  )

wave_buttons[0].classList.add('selected')

@bind(wave_buttons, 'click')
def set_waveform(ev):
    current = document.select_one('button[class="waveform selected"]')
    current.classList.remove('selected')
    ev.target.classList.add('selected')

controls_row <= html.TD(html.TABLE(
                      html.TR(html.TD('ENVELOP', colspan=2)) +
                      slider('Attack', 'attack', 0, 2, 0.1, 0.2) +
                      slider('Decay', 'decay', 0, 2, 0.1, 0.2) +
                      slider('Sustain', 'sustain', 0, 1, 0.1, 1) +
                      slider('Release', 'release', 0, 2, 0.1, 0.2)
                   )
                 )

controls_row <= html.TD(html.TABLE(
                      html.TR(html.TD('ECHO', colspan=2)) +
                      slider('Delay', 'echo_delay', 0, 2, 0.1, 0) +
                      slider('Feedback', 'echo_feedback', 0, 1, 0.1, 0)
                   )
                 )

controls_row <= html.TD(html.TABLE(
                      html.TR(html.TD('FILTER', colspan=2)) +
                      slider('Freq', 'filter_freq', 0, 10000, 10, 0) +
                      slider('Q', 'filter_q', 0, 60, 0.1, 0)
                   )
                 )

@bind(controls['filter_freq'], 'input')
def change_filter_freq(ev):
    if 'filter' in config:
        config['filter'].frequency.value = float(ev.target.value)

@bind(controls['filter_q'], 'input')
def change_filter_q(ev):
    if 'filter' in config:
        config['filter'].Q.value = float(ev.target.value)

controls_row <= html.TD(html.TABLE(
                      html.TR(html.TD('LFO') +
                              html.TD(lfo_on := html.INPUT(type="checkbox"))
                              ) +
                      slider('Freq', 'lfo_freq', 0, 20, 0.1, 0) +
                      slider('Ampl', 'lfo_ampl', 0, 1, 0.01, 0)
                   )
                 )

@bind(controls['lfo_freq'], 'input')
def change_lfo_freq(ev):
    for lfo in instances['lfo'].values():
        lfo.frequency.value = float(ev.target.value)

@bind(controls['lfo_ampl'], 'input')
def change_lfo_ampl(ev):
    for lfo_gain in instances['lfo_gain'].values():
        lfo_gain.gain.value = float(ev.target.value)


tone_list = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

record_play = html.DIV(Class="controls")
document['container'] <= html.TR(html.TD(record_play))


# https://en.wikipedia.org/wiki/Media_control_symbols
w = Unit.width / 50

class Sequencer:

    recording = False
    playing = False

rec_start_button = widgets.Disk(w, 'red')
rec_stop_button = widgets.Square(w, 'black')
record_play <= rec_start_button
rec_play_button = widgets.Play(w, 'black')
rec_play_button.style.marginLeft = '1em'
record_play <= rec_play_button


record_seq = []
last_hit = {}

@bind(rec_start_button, 'click')
def rec_start(ev):
    record_play.replaceChild(rec_stop_button, rec_start_button)
    Sequencer.recording = True
    record_seq.clear()

@bind(rec_stop_button, 'click')
def rec_stop(ev):
    record_play.replaceChild(rec_start_button, rec_stop_button)
    Sequencer.recording = False

@bind(rec_play_button, 'click')
def rec_play(ev):
    if not record_seq:
        return
    record_seq.sort(key = lambda x: x[0])
    t0 = record_seq[0][0]
    seq = []
    for r in record_seq:
        seq.append([r[0] - t0, note_from_key(r[1]), r[2] - r[0]])
    loop(audioContext.currentTime, seq, 0)

look_ahead = 0.1
schedule_period = 1000 * 0.05 # milliseconds

def loop(t0, seq, i):
    dt = audioContext.currentTime - t0

    if dt > seq[i][0] - look_ahead:
        octave, note = seq[i][1]
        duration = seq[i][2]
        release = get_value('release')
        attack = get_value('attack')
        start = t0 + seq[i][0]
        sound = play(octave, note, start)
        end_oscillators(sound, start + duration)
        i += 1
        if i >= len(seq):
            return
    timer.set_timeout(loop, schedule_period, t0, seq, i)


keys = [f'Key{c}' for c in 'ZXCVBNM' + 'ASDFGHJ' + 'QWERTYU']

keyElements = []

key_mapping = {}

def createKey(note, octave, freq):
    keyElement = html.DIV(Class="key")
    keyElement.style.width = f'{int(window.innerWidth / 10)}px'
    keyElement.style.height = f'{int(window.innerHeight / 10)}px'
    labelElement = html.DIV()

    keyElement.dataset["octave"] = octave
    keyElement.dataset["note"] = note
    keyElement.dataset["frequency"] = freq

    key_mapping[f'{note}{octave}'] = (octave, note)

    labelElement.html = f'{note}<sub>{octave}</sub>'
    keyElement <= labelElement

    keyElement.bind("mousedown", notePressed)
    keyElement.bind("touchstart", notePressed)
    keyElement.bind("mouseup", noteReleased)
    keyElement.bind("mouseleave", noteReleased)
    keyElement.bind("touchend", noteReleased)

    keyElements.append(keyElement)

    return keyElement

playing = {}

chords = [f'Numpad{i}' for i in '1234567']

def highlight(elt):
    elt.classList.add('key-active')

def unhighlight(elt):
    elt.classList.remove('key-active')

config = {}

value_setters = {
    'echo_delay': 'delayTime',
    'echo_feedback': 'gain',
    'filter_freq': 'frequency',
    'filter_q': 'Q',
    'volume': 'gain'
}

class Sound:

    pass

instances = {'volume': {}, 'lfo': {}, 'lfo_gain': {}}

def play(octave, note, time=None):
    global audioContext

    freq = notes.note_freqs[octave][note]

    if audioContext is None:
        audioContext = synthesizer.make_context()
        echo_delay = instances['echo_delay'] = window.DelayNode.new(audioContext)
        echo_feedback = instances['echo_feedback'] = window.GainNode.new(audioContext)
        echo_delay.connect(echo_feedback)
        echo_feedback.connect(echo_delay)

        filter_node = config['filter'] = window.BiquadFilterNode.new(audioContext)
        filter_node.type = 'lowpass'
        instances['filter_freq'] = filter_node
        instances['filter_q'] = filter_node
    else:
        echo_delay = instances['echo_delay']
        echo_feedback = instances['echo_feedback']
        filter_node = config['filter']

    volume = window.GainNode.new(audioContext)

    lfo = window.OscillatorNode.new(audioContext)
    lfo.type = 'sine'
    lfo.frequency.value = get_value('lfo_freq')
    lfo_gain = window.GainNode.new(audioContext)
    lfo_gain.gain.value = get_value('lfo_ampl')
    lfo.connect(lfo_gain)
    lfo_gain.connect(volume.gain)
    lfo.start()

    width = get_value('width')
    wave_type = document.select_one('button[class="waveform selected"]').value

    osc = window.OscillatorNode.new(audioContext)
    osc.type = wave_type
    osc.frequency.value = freq
    osc_list = [osc]

    if width:
        for detune in [-width, width]:
           osc = window.OscillatorNode.new(audioContext)
           osc.type = wave_type
           osc.frequency.value = freq
           osc.detune.value = detune
           osc_list.append(osc)

    for osc in osc_list:
        osc.connect(volume)

    if get_value('filter_freq') or get_value('filter_q'):
        next_node = filter_node
        filter_node.frequency.value = get_value('filter_freq')
        filter_node.Q.value = get_value('filter_q')
        next_node.connect(audioContext.destination)
    else:
        next_node = audioContext.destination

    if get_value('echo_delay') or get_value('echo_feedback'):
        volume.connect(instances['echo_delay'])
        echo_delay.connect(next_node)
        echo_delay.delayTime.value = get_value('echo_delay')
        echo_feedback.gain.value = get_value('echo_feedback')

    volume.connect(next_node)

    volume.gain.value = v = get_value('volume')
    t0 = audioContext.currentTime if time is None else time
    volume.gain.setValueAtTime(0, t0)
    volume.gain.setTargetAtTime(v, t0, get_value('attack'))
    sustain = get_value('volume') * get_value('sustain')
    volume.gain.setTargetAtTime(sustain,
                                t0 + get_value('attack'),
                                get_value('decay'))

    for osc in osc_list:
        osc.start(t0)

    sound = Sound()
    sound.osc_list = osc_list
    sound.volume = volume
    sound.lfo = lfo
    sound.lfo_gain = lfo_gain
    return sound

def chord_notes(chord_num):
    ranks = [chord_num - 1, (chord_num + 1) % 7, (chord_num + 3) % 7]
    return ranks

def note_from_key(key):
    """index = keys.index(key)
    keyElement = keyElements[index]
    octave = int(keyElement.dataset['octave'])
    note = keyElement.dataset['note']"""
    return key_mapping[key] #octave, note

def notePressed(event):

    if hasattr(event, "key"):
        kcode = event.code
        if kcode in playing:
            return
        if kcode in keys:
            key_list = [kcode]
            keyElement = keyElements[keys.index(kcode)]
            highlight(keyElement)
            octave, note = note_from_key(kcode)
        elif kcode in chords:
            playing[kcode] = []
            ranks = chord_notes(int(kcode[-1]))
            key_list = [keys[i] for i in ranks]
            for i in ranks:
                highlight(keyElements[i])
                octave, note = note_from_key(keys[i])
        else:
            print('unknown code', kcode)
            return
    else:
        # mousedown or touchstart
        dataset = event.target.dataset

        if not hasattr(dataset, "pressed") or dataset.pressed == "no":
            octave = int(dataset.octave)
            note = dataset.note
            kcode = f'{note}{octave}'
            key_list = [kcode]
            dataset.pressed = "yes"
        else:
            return

    playing[kcode] = []
    for k in key_list:
        sound = play(octave, note)
        playing[kcode].append(sound)
    instances['volume'][kcode] = sound.volume
    instances['lfo'][kcode] = sound.lfo
    instances['lfo_gain'][kcode] = sound.lfo_gain

    if Sequencer.recording:
        last_hit[kcode] = len(record_seq)
        record_seq.append([audioContext.currentTime, kcode])


def end_oscillators(sound, time=None):
    release = get_value('release')
    release = max(release, 0.05) # avoids a click if release = 0
    t0 = audioContext.currentTime if time is None else time
    sound.volume.gain.cancelScheduledValues(t0)
    sound.volume.gain.setTargetAtTime(0, t0, release)
    if sound.lfo_gain is not None:
        sound.lfo_gain.gain.setTargetAtTime(0, t0, release)

    for osc in sound.osc_list:
        osc.stop(t0 + release + 5)

    if sound.lfo is not None:
        sound.lfo.stop(t0 + release + 0.5)

def noteReleased(event):
    if hasattr(event, "key"):
        if event.code in playing:
            kcode = event.code
            if kcode in keys:
                keyElement = keyElements[keys.index(kcode)]
                unhighlight(keyElement)
            elif kcode in chords:
                ranks = chord_notes(int(kcode[-1]))
                for rank in ranks:
                    unhighlight(keyElements[rank])
            else:
                return
        else:
            return
    else:
        dataset = event.target.dataset

        if dataset and hasattr(dataset, "pressed") and dataset.pressed == "yes":
            octave = int(dataset.octave)
            note = dataset.note
            kcode = f'{note}{octave}'
            dataset.pressed = "no"
        else:
            return

    for p in playing[kcode]:
        end_oscillators(p)

    if Sequencer.recording:
        record_seq[last_hit[kcode]].append(audioContext.currentTime)
    del playing[kcode]
    del instances['volume'][kcode]

def setup():
    base = tone_value.text
    octave = int(octave_value.text)
    scale = notes.create_major_scale(base, octave)[:3 * 7]

    keyboard = document.select_one(".keyboard")

    # draw keyboard
    keyboard.clear()
    keyElements.clear()

    line_num = -1

    for i, (octave, note) in enumerate(scale):
        if i // 7 > line_num:
            keyboard.insertBefore(line := html.DIV(), keyboard.firstChild)
            line_num += 1
        octaveElem = html.DIV(Class="octave")
        octaveElem <= createKey(note, octave, notes.note_freqs[octave][note])
        line <= octaveElem
        key_mapping[keys[i]] = octave, note

setup()

document["manual"].style.display = "block"

document.bind('keydown', notePressed)
document.bind('keyup', noteReleased)


class Output:

  def write(self, *args):
      document['output'].value += ' '.join(str(arg) for arg in args)



