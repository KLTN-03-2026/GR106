BEGIN;
SET LOCAL app.bypass_rls = 'true';
-- 1. Add nullable column trước
ALTER TABLE public.work_logs
ADD COLUMN status varchar(20);

-- 2. Backfill dữ liệu cũ
UPDATE public.work_logs
SET status =
    CASE
        WHEN locked_at IS NOT NULL THEN 'LOCKED'
        ELSE 'COMPLETED'
    END;

-- 3. Set default
ALTER TABLE public.work_logs
ALTER COLUMN status SET DEFAULT 'WORKING';

-- 4. Set NOT NULL
ALTER TABLE public.work_logs
ALTER COLUMN status SET NOT NULL;

-- 5. Add constraint
ALTER TABLE public.work_logs
ADD CONSTRAINT chk_work_logs_status
CHECK (status IN (
    'WORKING',
    'COMPLETED',
    'FORCE_CLOSED',
    'LOCKED'
));
SET LOCAL app.bypass_rls = 'false';
COMMIT;