import partitura as pt
score = pt.load_score("server/src/noct.mscz")
pt.save_musicxml(score, "server/src/noct.musicxml")
arr = pt.musicxml_to_notearray("server/src/noct.musicxml")
print(arr)

 # eventually given a specified measure range, extract the lh/rh polyrhythms, to be sent through api to frontend against the metronome