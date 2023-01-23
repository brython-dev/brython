from browser import window, alert

def make_context():
    return window.AudioContext.new()

def fade_out(audioContext, osc, envelop):
    t = audioContext.currentTime
    envelop.gain.setTargetAtTime(0, t, 0.02)
    osc.stop(t + 0.08)

def playTone(audioContext,
             freq,
             time=0,
             length=None,
             gain_value=1,
             wave=None,
             type="sine"):

    envelop = audioContext.createGain()
    envelop.connect(audioContext.destination)
    #envelop.gain.value = gain_value

    osc = audioContext.createOscillator()
    t = audioContext.currentTime + time

    envelop.gain.setValueAtTime(0, t)
    attackTime = 0.1
    envelop.gain.linearRampToValueAtTime(gain_value, t + attackTime)
    if length is not None:
        releaseTime = length / 10
        envelop.gain.linearRampToValueAtTime(0, t + length - releaseTime)

    osc.connect(envelop)

    if wave is not None:
        osc.setPeriodicWave(wave)
    else:
        osc.type = type

    osc.frequency.value = freq
    if time == 0:
        osc.start()
    else:
        currentTime = audioContext.currentTime
        osc.start(currentTime + time)
        if length is not None:
            osc.stop(currentTime + time + length)

    return osc, envelop