-- Run once as the postgres superuser:
--   psql -U postgres -d mdm_db -f apps/web/db/grant-permissions.sql

GRANT ALL ON SCHEMA public TO mdm_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mdm_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mdm_user;
