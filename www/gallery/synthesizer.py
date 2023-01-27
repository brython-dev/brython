from browser import window, alert

def make_context():
    return window.AudioContext.new()

def fade_out(audioContext, osc, envelop):
    t = audioContext.currentTime
    envelop.gain.setTargetAtTime(0, t, 0.02)
    osc.stop(t + 0.08)

def create_oscillator(context, freq, detune=None):
    osc = window.OscillatorNode.new(context)
    osc.frequency.value = freq
    if detune is not None:
        osc.detune.value = detune
    return osc

def playTone(audioContext,
             freq,
             time=0,
             length=None,
             gain_value=1,
             width=0,
             wave=None,
             _filter=None,
             destination=None,
             type="sine"):

    envelop = audioContext.createGain()

    if isinstance(destination, (list, tuple)):
        for dest in destination:
            envelop.connect(dest)
    elif destination is None:
        envelop.connect(audioContext.destination)
    else:
        envelop.connect(destination)

    t = audioContext.currentTime + time

    envelop.gain.setValueAtTime(0, t)
    attackTime = 0.1
    envelop.gain.linearRampToValueAtTime(gain_value, t + attackTime)
    if length is not None:
        releaseTime = length / 10
        envelop.gain.linearRampToValueAtTime(0, t + length - releaseTime)

    osc_list = []
    osc_list.append(create_oscillator(audioContext, freq))
    if width:
        for detune in [-width, width]:
            osc_list.append(create_oscillator(audioContext, freq, detune))

    for osc in osc_list:
        osc.connect(envelop)
        if wave is not None:
            osc.setPeriodicWave(wave)
        else:
            osc.type = type

        if time == 0:
            osc.start()
        else:
            currentTime = audioContext.currentTime
            osc.start(currentTime + time)
            if length is not None:
                osc.stop(currentTime + time + length)

    return osc_list, envelop