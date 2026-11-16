
import partitura as pt

from partitura.score import Clef



def _measure_times(part, start_measure, end_measure):
    """
    Return the start and end ticks for the requested
    measure range.

    Measure numbers are 1-indexed.

    Returns:
        (start_tick, end_tick)

    Returns:
        (None, None) if the requested range is invalid.
    """

    measures = list(
        part.iter_all(pt.score.Measure)
    )

    if not measures:
        return None, None

    start_idx = start_measure - 1
    end_idx = end_measure - 1

    if (
        start_idx < 0
        or end_idx < start_idx
        or start_idx >= len(measures)
        or end_idx >= len(measures)
    ):
        return None, None

    start_time = measures[start_idx].start.t
    end_time = measures[end_idx].end.t

    return start_time, end_time

def _group_onsets_by_voice(
    part,
    start_time,
    end_time,
):
    """
    Group note onsets within the requested measure
    range by staff and voice.

    Each group represents a potential rhythmic layer.
    """

    groups = {}

    for note in part.iter_all(pt.score.Note):

        if not (
            start_time <= note.start.t < end_time
        ):
            continue

        key = (
            getattr(note, "staff", None),
            getattr(note, "voice", None),
        )

        groups.setdefault(key, []).append(
            note.start.t
        )

    return groups


def _layer_from_onsets(
    onset_ticks,
    start_time,
    end_time,
):
    """
    Convert raw onset ticks into normalized positions
    between 0 and 1.

    Example:
        [0, 1/3, 2/3]

    Returns:
        {
            "count": 3,
            "onsets": [0.0, 0.333, 0.666]
        }
    """

    span = end_time - start_time

    unique_ticks = sorted(
        set(onset_ticks)
    )

    if not unique_ticks:
        return {
            "count": 0,
            "onsets": [],
        }

    onsets = [
        (tick - start_time) / span
        if span
        else 0.0
        for tick in unique_ticks
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
    end_measure,
):
    """
    Load a musical score, isolate the requested
    measure range, and extract two rhythmic layers.

    Returns:
        output_png,
        all_notes,
        left_layer,
        right_layer

    Each layer contains:
        {
            "count": int,
            "onsets": [0.0, 0.5, ...]
        }
    """

    if start_measure < 1:
        raise ValueError(
            "Start measure must be at least 1."
        )

    if end_measure < start_measure:
        raise ValueError(
            "End measure must be greater than or equal to start measure."
        )

    score = pt.load_score(input_file)

    if not score.parts:
        raise ValueError(
            "The uploaded score contains no musical parts."
        )

    all_notes = []

    layer_candidates = []


    for idx, part in enumerate(score.parts):

        start_time, end_time = _measure_times(
            part,
            start_measure,
            end_measure,
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
            end_time,
        )

        for onset_ticks in groups.values():

            unique_count = len(
                set(onset_ticks)
            )

            if unique_count > 0:

                layer_candidates.append((
                    unique_count,
                    onset_ticks,
                    start_time,
                    end_time,
                ))


        for note in list(
            part.iter_all(pt.score.Note)
        ):

            if not (
                start_time <= note.start.t < end_time
            ):
                part.remove(note)

        for measure in list(
            part.iter_all(pt.score.Measure)
        ):

            if not (
                start_time <= measure.start.t < end_time
            ):
                part.remove(measure)

        if idx == len(score.parts) - 1:

            for clef in list(
                part.iter_all(pt.score.Clef)
            ):
                part.remove(clef)

            bass_clef = Clef(
                staff=0,
                sign="F",
                line=4,
                octave_change=0,
            )

            part.add(bass_clef)

    if not layer_candidates:
        raise ValueError(
            "No notes were found in the requested measure range."
        )

    layer_candidates.sort(
        key=lambda candidate: candidate[0],
        reverse=True,
    )

    layer_candidates = [
        candidate
        for candidate in layer_candidates
        if candidate[0] > 0
    ][:2]

    if len(layer_candidates) == 1:

        _, onset_ticks, st, et = layer_candidates[0]

        left = _layer_from_onsets(
            onset_ticks,
            st,
            et,
        )

        right = left.copy()

    elif len(layer_candidates) >= 2:

        (
            _,
            onset_ticks0,
            st0,
            et0,
        ) = layer_candidates[0]

        (
            _,
            onset_ticks1,
            st1,
            et1,
        ) = layer_candidates[1]

        left = _layer_from_onsets(
            onset_ticks0,
            st0,
            et0,
        )

        right = _layer_from_onsets(
            onset_ticks1,
            st1,
            et1,
        )

    else:
        raise ValueError(
            "Could not identify rhythmic layers."
        )

    pt.save_musicxml(
        score,
        output_xml,
    )

    pt.save_score_midi(
        score,
        output_midi,
    )

    pt.render(
        score,
        out=output_png,
    )

    return (
        output_png,
        all_notes,
        left,
        right,
    )
