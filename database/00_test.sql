CREATE TABLE test_conexiune (
    id SERIAL PRIMARY KEY,
    mesaj VARCHAR(100)
);

INSERT INTO test_conexiune (mesaj) VALUES ('Salut! Baza de date merge brici.');