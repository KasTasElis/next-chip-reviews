alter table reviews
add constraint reviews_user_chip_unique
unique (user_id_fk, chips_id_fk);