CREATE TABLE app_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- Optional index (username already unique, but explicit clarity)
CREATE UNIQUE INDEX idx_app_user_username ON app_user(username);
