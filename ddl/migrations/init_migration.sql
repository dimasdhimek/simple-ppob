-- EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- ENUM
CREATE TYPE transactions_type_enum AS ENUM (
    'TOPUP',
    'PAYMENT'
);

-- TABLE
CREATE TABLE banners (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	banner_name varchar NOT NULL,
	banner_image varchar NOT NULL,
	description text NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz NULL,
	CONSTRAINT banners_pk PRIMARY KEY (id)
);

CREATE TABLE services (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	service_code varchar NOT NULL,
	service_name varchar NOT NULL,
	service_icon varchar NULL,
	service_tariff numeric DEFAULT 0 NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz NULL,
	CONSTRAINT services_pk PRIMARY KEY (id),
	CONSTRAINT services_unique UNIQUE (service_code)
);


CREATE TABLE users (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	email varchar NOT NULL,
	first_name varchar NOT NULL,
	last_name varchar NULL,
	password varchar NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz NULL,
	profile_image varchar NULL,
	CONSTRAINT users_pk PRIMARY KEY (id),
	CONSTRAINT users_unique UNIQUE (email)
);


CREATE TABLE balances (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	user_id uuid NOT NULL,
	amount numeric DEFAULT 0 NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz NULL,
	CONSTRAINT balances_pk PRIMARY KEY (id),
	CONSTRAINT balances_unique UNIQUE (user_id),
	CONSTRAINT balances_users_fk FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE transactions (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	user_id uuid NOT NULL,
	balance_id uuid NOT NULL,
	service_id uuid NULL,
	invoice_number varchar NOT NULL,
	transaction_type transactions_type_enum NOT NULL,
	description text NULL,
	total_amount numeric NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz NULL,
	CONSTRAINT transactions_pk PRIMARY KEY (id),
	CONSTRAINT transactions_unique UNIQUE (invoice_number),
	CONSTRAINT transactions_balances_fk FOREIGN KEY (balance_id) REFERENCES balances(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
	CONSTRAINT transactions_services_fk FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
	CONSTRAINT transactions_users_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE INDEX transactions_transaction_type_idx ON transactions USING btree (transaction_type);
CREATE INDEX transactions_type_user_id_idx ON transactions USING btree (user_id, transaction_type);
