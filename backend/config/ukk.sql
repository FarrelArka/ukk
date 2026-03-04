-- =========================
-- USERS
-- =========================
CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'user'
);

-- =========================
-- UNIT
-- =========================
CREATE TABLE unit (
    unit_id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    status_unit VARCHAR(50) NOT NULL,
    description TEXT NOT NULL
);

-- =========================
-- UNIT DETAIL
-- =========================
CREATE TABLE unit_detail (
    detail_id SERIAL PRIMARY KEY,
    unit_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    alamat TEXT NOT NULL,
    jumlah_kamar INTEGER NOT NULL,

    CONSTRAINT fk_unit_detail_unit
    FOREIGN KEY (unit_id)
    REFERENCES unit(unit_id)
    ON DELETE CASCADE
);

-- =========================
-- FASILITAS
-- =========================
CREATE TABLE fasilitas (
    fasilitas_id SERIAL PRIMARY KEY,
    detail_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,

    CONSTRAINT fk_fasilitas_detail
    FOREIGN KEY (detail_id)
    REFERENCES unit_detail(detail_id)
    ON DELETE CASCADE
);

-- =========================
-- GALLERY
-- =========================
CREATE TABLE gallery (
    gallery_id SERIAL PRIMARY KEY,
    detail_id INTEGER NOT NULL,
    images TEXT NOT NULL,

    CONSTRAINT fk_gallery_detail
    FOREIGN KEY (detail_id)
    REFERENCES unit_detail(detail_id)
    ON DELETE CASCADE
);

-- =========================
-- BOOKING (DITAMBAH total_price)
-- =========================
CREATE TABLE booking (
    id_booking SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    detail_id INTEGER NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    jumlah_orang INTEGER NOT NULL,
    status_booking VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_price NUMERIC(14,2) NOT NULL,

    CONSTRAINT fk_booking_user
    FOREIGN KEY (user_id)
    REFERENCES users(id_user)
    ON DELETE CASCADE,

    CONSTRAINT fk_booking_detail
    FOREIGN KEY (detail_id)
    REFERENCES unit_detail(detail_id)
    ON DELETE CASCADE
);

-- =========================
-- PAYMENT
-- =========================
CREATE TABLE payment (
    payment_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    status_payment VARCHAR(50) NOT NULL DEFAULT 'unpaid',

    CONSTRAINT fk_payment_booking
    FOREIGN KEY (booking_id)
    REFERENCES booking(id_booking)
    ON DELETE CASCADE
);

-- =========================
-- TESTIMONIAL
-- =========================
CREATE TABLE testimonial (
    id_testimoni SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,

    CONSTRAINT fk_testimonial_booking
    FOREIGN KEY (booking_id)
    REFERENCES booking(id_booking)
    ON DELETE CASCADE
);