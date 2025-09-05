import partitura as pt
score = pt.load_score("server/src/noct.mscz")
pt.save_musicxml(score, "server/src/noct.musicxml")
arr = pt.musicxml_to_notearray("server/src/noct.musicxml")
print(arr)

 