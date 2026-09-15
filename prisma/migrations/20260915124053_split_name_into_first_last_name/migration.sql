/*
  Warnings:

  - You are about to drop the column `name` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - Added the required column `first_name` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- Add the new columns as nullable first
ALTER TABLE "admins"
ADD COLUMN "first_name" VARCHAR(100),
ADD COLUMN "last_name" VARCHAR(100);

ALTER TABLE "users"
ADD COLUMN "first_name" VARCHAR(100),
ADD COLUMN "last_name" VARCHAR(100);


-- Move existing name data into the new columns
UPDATE "admins"
SET
    "first_name" = split_part("name", ' ', 1),
    "last_name" = CASE
        WHEN position(' ' IN "name") > 0
        THEN substring("name" FROM position(' ' IN "name") + 1)
        ELSE ''
    END;

UPDATE "users"
SET
    "first_name" = split_part("name", ' ', 1),
    "last_name" = CASE
        WHEN position(' ' IN "name") > 0
        THEN substring("name" FROM position(' ' IN "name") + 1)
        ELSE ''
    END;


-- Make the new columns required
ALTER TABLE "admins"
ALTER COLUMN "first_name" SET NOT NULL,
ALTER COLUMN "last_name" SET NOT NULL;

ALTER TABLE "users"
ALTER COLUMN "first_name" SET NOT NULL,
ALTER COLUMN "last_name" SET NOT NULL;


-- Remove the old name column
ALTER TABLE "admins"
DROP COLUMN "name";

ALTER TABLE "users"
DROP COLUMN "name";