import partitura as pt
from partitura.score import Clef

def parse(input_file, output_xml, output_midi, output_png, start_measure, end_measure, notes):
    score = pt.load_musicxml(input_file)
    for idx, part in enumerate(score.parts):
        pt.score.add_measures(part)
        measures = list(part.iter_all(pt.score.Measure))
        if not measures:
            continue
        start_time = measures[start_measure - 1].start.t
        end_time = measures[end_measure - 1].end.t
        for note in list(part.iter_all(pt.score.Note)):
            notes.append({
                "pitch": note.midi_pitch,
                "start": note.start.t,
                "duration": note.duration
            })
            if not (start_time <= note.start.t < end_time):
                part.remove(note)
        for measure in list(part.iter_all(pt.score.Measure)):
            if not (start_time <= measure.start.t < end_time):
                part.remove(measure)
        if idx == len(score.parts) - 1:
            for clef in list(part.iter_all(pt.score.Clef)):
                part.remove(clef)
            bass_clef = Clef(staff=0, sign="F", line=4, octave_change=0)
            part.add(bass_clef)

    pt.save_musicxml(score, output_xml)
    pt.save_score_midi(score, output_midi)
    pt.render(score, out=output_png)
    
    return (output_png, notes)