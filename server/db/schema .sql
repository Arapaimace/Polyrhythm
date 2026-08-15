CREATE TABLE images(
    pid INTEGER PRIMARY KEY,
    note_array JSONB NOT NULL,
    image_path TEXT NOT NULL
);