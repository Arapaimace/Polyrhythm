import partitura as pt
from partitura.score import Clef


def _measure_times(part, start_measure, end_measure):
    """Return the (start_tick, end_tick) spanned by [start_measure, end_measure],
    or (None, None) if the part has no measures / the range is out of bounds."""
    measures = list(part.iter_all(pt.score.Measure))
    if not measures:
        return None, None

    start_idx = max(0, start_measure - 1)
    end_idx = min(len(measures), end_measure) - 1

    if start_idx >= len(measures) or end_idx < 0 or end_idx < start_idx:
        return None, None

    return measures[start_idx].start.t, measures[end_idx].end.t


def _group_onsets_by_voice(part, start_time, end_time):
    """Group note onsets within [start_time, end_time) by (staff, voice).
    Each group is one candidate rhythmic layer (e.g. right hand vs left hand,
    or one drum part vs another)."""
    groups = {}

    for note in part.iter_all(pt.score.Note):
        if not (start_time <= note.start.t < end_time):
            continue

        key = (getattr(note, "staff", None), getattr(note, "voice", None))
        groups.setdefault(key, []).append(note.start.t)

    return groups


def _layer_from_onsets(onset_ticks, start_time, end_time):
    """Convert a list of raw onset ticks into a polyrhythm 'layer': a note
    count plus onset positions normalized to fractions (0-1) of the range."""
    span = end_time - start_time
    unique_ticks = sorted(set(onset_ticks))

    onsets = [
        (t - start_time) / span if span else 0.0
        for t in unique_ticks
    ]

    return {
        "count": len(onsets),
        "onsets": onsets,
    }


def extract_polyrhythm(
    input_file,
    output_xml,
    output_midi,
    output_png,
    start_measure,
    end_measure
):
    """Parse a score, isolate a measure range, and pull out up to two
    independent rhythmic layers (a polyrhythm) from that range, alongside
    a rendered/exported excerpt limited to those measures.

    Returns:
        (output_png, all_notes, left_layer, right_layer)

    where each layer is:
        {"count": int, "onsets": [0..1, ...]}
    """
    score = pt.load_score(input_file)

    all_notes = []

    # Each candidate is:
    # (onset_count, onset_ticks, start_time, end_time)
    layer_candidates = []

    for idx, part in enumerate(score.parts):
        start_time, end_time = _measure_times(
            part,
            start_measure,
            end_measure
        )

        if start_time is None:
            continue

        for note in part.iter_all(pt.score.Note):
            all_notes.append({
                "pitch": note.midi_pitch,
                "start": note.start.t,
                "duration": note.duration,
            })

        groups = _group_onsets_by_voice(
            part,
            start_time,
            end_time
        )

        for onset_ticks in groups.values():
            unique_count = len(set(onset_ticks))

            if unique_count > 0:
                layer_candidates.append(
                    (
                        unique_count,
                        onset_ticks,
                        start_time,
                        end_time,
                    )
                )

        # Trim this part down to the requested measure range
        # for the excerpt render.
        for note in list(part.iter_all(pt.score.Note)):
            if not (start_time <= note.start.t < end_time):
                part.remove(note)

        for measure in list(part.iter_all(pt.score.Measure)):
            if not (start_time <= measure.start.t < end_time):
                part.remove(measure)

        if idx == len(score.parts) - 1:
            for clef in list(part.iter_all(pt.score.Clef)):
                part.remove(clef)

            bass_clef = Clef(
                staff=0,
                sign="F",
                line=4,
                octave_change=0
            )

            part.add(bass_clef)

    # The two busiest independent voices become the
    # two polyrhythm layers.
    layer_candidates.sort(
        key=lambda c: c[0],
        reverse=True
    )

    layer_candidates = [
        c for c in layer_candidates
        if c[0] > 0
    ][:2]

    if len(layer_candidates) == 0:
        left = {
            "count": 4,
            "onsets": [i / 4 for i in range(4)]
        }
        right = left

    elif len(layer_candidates) == 1:
        count, onset_ticks, st, et = layer_candidates[0]

        left = _layer_from_onsets(
            onset_ticks,
            st,
            et
        )

        right = left

    else:
        _, onset_ticks0, st0, et0 = layer_candidates[0]
        _, onset_ticks1, st1, et1 = layer_candidates[1]

        left = _layer_from_onsets(
            onset_ticks0,
            st0,
            et0
        )

        right = _layer_from_onsets(
            onset_ticks1,
            st1,
            et1
        )

    pt.save_musicxml(score, output_xml)
    pt.save_score_midi(score, output_midi)
    pt.render(score, out=output_png)

    return output_png, all_notes, left, right