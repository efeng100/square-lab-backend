DROP DATABASE IF EXISTS square_lab;

CREATE DATABASE square_lab;

DROP TABLE IF EXISTS "Sprint";
DROP TABLE IF EXISTS "Ultra";
DROP TABLE IF EXISTS "User";

CREATE TABLE "User"(
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE "Sprint"(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    size SMALLINT NOT NULL,
    time NUMERIC NOT NULL,
    set_on DATE NOT NULL,
    CONSTRAINT fk_user_id
        FOREIGN KEY(user_id)
            REFERENCES "User"(id)
            ON DELETE CASCADE
);

CREATE TABLE "Ultra"(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    size SMALLINT NOT NULL,
    score INT NOT NULL,
    set_on DATE NOT NULL,
    CONSTRAINT fk_user_id
        FOREIGN KEY(user_id)
            REFERENCES "User"(id)
            ON DELETE CASCADE
);