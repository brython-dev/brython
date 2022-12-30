scale = []

notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']

note_freqs = {}

def create_note_table():
    i_range = 4
    i_note = 0

    note_freqs[i_range] = {notes[i_note]: 440}

    a = 1.059463094359

    f0 = note_freqs[i_range][notes[i_note]]
    mult = a
    i = -1
    while True:
        i_note -=1
        if i_note < 0:
            i_note = len(notes) - 1
        if notes[i_note] == 'B':
            i_range -= 1
            if i_range < 0:
                break
            note_freqs[i_range] = {}
        note_freqs[i_range][notes[i_note]] = f0 / mult

        mult *= a

        i -= 1

    mult = a
    i = 1
    i_range = 4
    i_note = 0

    while True:
        i_note +=1
        if i_note == len(notes):
            i_note = 0
        if notes[i_note] == 'C':
            i_range += 1
            if i_range > 7:
                break
            note_freqs[i_range] = {}
        note_freqs[i_range][notes[i_note]] = f0 * mult

        mult *= a

        i += 1

create_note_table()

def create_major_scale(base, octave=3):
    """Create the sequence of notes that make the major scale starting at
    note "base" in octave.
    """
    i_note = notes.index(base)
    scale.clear()
    scale.append((octave, base))
    intervals = [2, 2, 1, 2, 2, 2, 1]
    octave0 = octave
    for octave in range(octave0, octave0 + 3):
        change_at_C = base < 'C'
        change_octave = False
        for interval in intervals:
            i_note += interval
            if i_note >= len(notes):
                i_note -= len(notes)
                change_at_C = True
            note = notes[i_note]
            if change_at_C and note > 'B' and not change_octave:
                octave += 1
                change_octave = True
            scale.append((octave, notes[i_note]))
    return scale
    
def make_chord_notes(octave, note):
    chord_notes = [(octave, note)]
    i_note = scale.index((octave, note))
    for _ in range(2):
        i_note += 2
        if i_note > 7:
            i_note -= 7
        chord_notes.append(scale[i_note])
    return chord_notes

