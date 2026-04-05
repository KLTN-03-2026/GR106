-- ============================================================
-- V2__seed_data.sql
-- ============================================================

-- ============================================================
-- 1. SYSTEM ROLES
-- ============================================================
INSERT INTO roles (name, description) VALUES
('ADMIN', 'Quản trị viên hệ thống'),
('USER',  'Người dùng thông thường');

-- ============================================================
-- 2. PERMISSIONS
-- ============================================================
INSERT INTO permissions (name, description) VALUES
-- System
('system:user:manage',         'Quản lý users'),
('system:farm:view-all',       'Xem tất cả farms'),
('system:subscription:manage', 'Quản lý gói subscription'),
('system:plan:manage',         'Quản lý subscription plans'),

-- Farm
('farm:create',       'Tạo farm'),
('farm:read',         'Xem farm'),
('farm:update',       'Cập nhật farm'),
('farm:delete',       'Xoá farm'),

-- Member
('member:invite',     'Mời thành viên'),
('member:remove',     'Xoá thành viên'),
('member:read',       'Xem danh sách thành viên'),
('member:update',     'Cập nhật vai trò thành viên'),

-- Plan
('plan:create',       'Tạo kế hoạch'),
('plan:read',         'Xem kế hoạch'),
('plan:update',       'Cập nhật kế hoạch'),
('plan:delete',       'Xoá kế hoạch'),

-- Task
('task:create',       'Tạo công việc'),
('task:read',         'Xem công việc'),
('task:update',       'Cập nhật công việc'),
('task:delete',       'Xoá công việc'),
('task:assign',       'Phân công nhân viên'),
('task:approve',      'Duyệt công việc'),

-- Plot
('plot:create',       'Tạo thửa đất'),
('plot:read',         'Xem thửa đất'),
('plot:update',       'Cập nhật thửa đất'),
('plot:delete',       'Xoá thửa đất'),

-- Work log
('worklog:create',    'Ghi nhật ký công việc'),
('worklog:read',      'Xem nhật ký công việc'),
('worklog:update',    'Cập nhật nhật ký'),

-- Warehouse
('warehouse:manage',  'Quản lý kho'),
('warehouse:read',    'Xem kho'),

-- Diagnosis
('diagnosis:request', 'Yêu cầu chẩn đoán'),
('diagnosis:read',    'Xem kết quả chẩn đoán'),

-- Report
('report:read',       'Xem báo cáo'),

-- Wage
('wage:manage',       'Quản lý lương nhân công'),

-- Subscription
('subscription:manage', 'Quản lý gói đăng ký');

-- ============================================================
-- 3. SYSTEM ROLE PERMISSIONS (ADMIN nhận tất cả system permissions)
-- ============================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN'
AND p.name IN (
    'system:user:manage',
    'system:farm:view-all',
    'system:subscription:manage',
    'system:plan:manage'
);

-- ============================================================
-- 4. FARM ROLES
-- ============================================================
INSERT INTO farm_roles (name, description) VALUES
('OWNER',      'Chủ farm — toàn quyền'),
('MANAGER',    'Quản lý farm'),
('WORKER',     'Nhân công');

-- ============================================================
-- 5. FARM ROLE PERMISSIONS
-- ============================================================

-- OWNER: tất cả farm permissions
INSERT INTO farm_role_permissions (farm_role_id, permission_id)
SELECT r.id, p.id FROM farm_roles r, permissions p
WHERE r.name = 'OWNER'
AND p.name NOT IN (
    'system:user:manage',
    'system:farm:view-all',
    'system:subscription:manage',
    'system:plan:manage'
);

-- MANAGER: hầu hết trừ farm:delete và subscription:manage
INSERT INTO farm_role_permissions (farm_role_id, permission_id)
SELECT r.id, p.id FROM farm_roles r, permissions p
WHERE r.name = 'MANAGER'
AND p.name NOT IN (
    'farm:delete',
    'subscription:manage',
    'system:user:manage',
    'system:farm:view-all',
    'system:subscription:manage',
    'system:plan:manage'
);


-- WORKER: thực hiện task và ghi nhật ký
INSERT INTO farm_role_permissions (farm_role_id, permission_id)
SELECT r.id, p.id FROM farm_roles r, permissions p
WHERE r.name = 'WORKER'
AND p.name IN (
    'farm:read',
    'member:read',
    'task:read', 'task:update',
    'plot:read',
    'worklog:create', 'worklog:read',
    'warehouse:read',
    'diagnosis:read',
    'report:read'
);

-- ============================================================
-- 6. SUBSCRIPTION PLANS
-- ============================================================
INSERT INTO subscription_plans
(name, price_monthly, price_annual, max_plots, max_members,
 has_ai_diagnosis, has_pdf_export, has_map, description) VALUES
('FREE',       0,        0,         2,   3,   FALSE, FALSE, FALSE, 'Gói miễn phí'),
('BASIC',      199000,   1990000,   5,   10,  FALSE, TRUE,  FALSE, 'Gói cơ bản'),
('PRO',        499000,   4990000,   20,  50,  TRUE,  TRUE,  TRUE,  'Gói chuyên nghiệp'),
('ENTERPRISE', 999000,   9990000,   999, 999, TRUE,  TRUE,  TRUE,  'Gói doanh nghiệp');

-- ============================================================
-- 7. UNITS
-- ============================================================
INSERT INTO units (code, name, unit_type) VALUES
-- Weight
('kg',    'Kilogram',    'WEIGHT'),
('g',     'Gram',        'WEIGHT'),
('ton',   'Tấn',         'WEIGHT'),
('mg',    'Miligram',    'WEIGHT'),

-- Volume
('l',     'Lít',         'VOLUME'),
('ml',    'Mililít',     'VOLUME'),
('m3',    'Mét khối',    'VOLUME'),

-- Area
('m2',    'Mét vuông',   'AREA'),
('ha',    'Hecta',       'AREA'),
('sao',   'Sào',         'AREA'),

-- Count
('cai',   'Cái',         'COUNT'),
('bao',   'Bao',         'COUNT'),
('thung', 'Thùng',       'COUNT'),
('hop',   'Hộp',         'COUNT'),
('chai',  'Chai',        'COUNT'),
('goi',   'Gói',         'COUNT'),

-- Length
('m',     'Mét',         'LENGTH'),
('cm',    'Centimét',    'LENGTH');

-- ============================================================
-- 8. CROP TYPES
-- ============================================================
INSERT INTO crop_types (name, description) VALUES
('Lúa',             'Các giống lúa'),
('Rau củ',          'Rau củ các loại'),
('Cây ăn trái',     'Cây ăn quả'),
('Cây công nghiệp', 'Cà phê, cao su, tiêu, điều...'),
('Hoa màu',         'Ngô, khoai, sắn...'),
('Thủy sản',        'Tôm, cá, cua...'),
('Hoa cây cảnh',    'Hoa, cây kiểng'),
('Nấm',             'Nấm các loại');

-- ============================================================
-- 9. PLAN STAGE STATUSES
-- ============================================================
INSERT INTO plan_stage_statuses
(code, name, is_initial, is_terminal, order_index, color) VALUES
('NOT_STARTED', 'Chưa bắt đầu', TRUE,  FALSE, 1, '#94A3B8'),
('IN_PROGRESS', 'Đang thực hiện', FALSE, FALSE, 2, '#3B82F6'),
('COMPLETED',   'Hoàn thành',     FALSE, TRUE,  3, '#22C55E'),
('SKIPPED',     'Bỏ qua',         FALSE, TRUE,  4, '#F59E0B'),
('CANCELLED',   'Đã huỷ',         FALSE, TRUE,  5, '#EF4444');

-- ============================================================
-- 10. TASK STATUSES
-- ============================================================
INSERT INTO task_statuses
(code, name, is_initial, is_terminal, order_index, color) VALUES
('TODO',        'Chờ thực hiện', TRUE,  FALSE, 1, '#94A3B8'),
('IN_PROGRESS', 'Đang làm',      FALSE, FALSE, 2, '#3B82F6'),
('DONE',        'Hoàn thành',    FALSE, TRUE,  3, '#22C55E'),
('CANCELLED',   'Đã huỷ',        FALSE, TRUE,  4, '#EF4444'),
('OVERDUE',     'Quá hạn',       FALSE, FALSE, 5, '#F97316');

-- ============================================================
-- 11. QUALITY GRADES
-- ============================================================
INSERT INTO quality_grades (code, name, order_index, description) VALUES
('A',      'Loại A',      1, 'Chất lượng cao nhất'),
('B',      'Loại B',      2, 'Chất lượng tốt'),
('C',      'Loại C',      3, 'Chất lượng trung bình'),
('REJECT', 'Loại thải',   4, 'Không đạt tiêu chuẩn');