INSERT INTO permissions (name, description) VALUES
('farm:create', 'Tạo farm'),
('farm:read', 'Xem farm'),
('farm:update', 'Cập nhật farm'),
('farm:delete', 'Xoá farm'),
('member:invite', 'Mời thành viên'),
('member:remove', 'Xoá thành viên'),
('plan:create', 'Tạo kế hoạch'),
('plan:read', 'Xem kế hoạch'),
('plan:update', 'Cập nhật kế hoạch'),
('task:create', 'Tạo công việc'),
('task:read', 'Xem công việc'),
('task:update', 'Cập nhật công việc'),
('warehouse:manage', 'Quản lý kho'),
('report:read', 'Xem báo cáo'),
('diagnosis:request', 'Yêu cầu chẩn đoán');

INSERT INTO farm_roles (name, description) VALUES
('OWNER', 'Chủ farm — toàn quyền'),
('MANAGER', 'Quản lý farm'),
('AGRONOMIST', 'Kỹ sư nông nghiệp'),
('WORKER', 'Nhân công');

-- OWNER: tất cả permissions
INSERT INTO farm_role_permissions (farm_role_id, permission_id)
SELECT r.id, p.id FROM farm_roles r, permissions p
WHERE r.name = 'OWNER';

-- MANAGER: hầu hết trừ delete farm
INSERT INTO farm_role_permissions (farm_role_id, permission_id)
SELECT r.id, p.id FROM farm_roles r, permissions p
WHERE r.name = 'MANAGER'
AND p.name != 'farm:delete';

-- AGRONOMIST
INSERT INTO farm_role_permissions (farm_role_id, permission_id)
SELECT r.id, p.id FROM farm_roles r, permissions p
WHERE r.name = 'AGRONOMIST'
AND p.name IN ('plan:create','plan:read','plan:update',
               'task:create','task:read','task:update',
               'diagnosis:request','report:read');

-- WORKER
INSERT INTO farm_role_permissions (farm_role_id, permission_id)
SELECT r.id, p.id FROM farm_roles r, permissions p
WHERE r.name = 'WORKER'
AND p.name IN ('task:read','task:update','report:read');

INSERT INTO subscription_plans 
(name, price_monthly, price_annual, max_plots, max_members, 
 has_ai_diagnosis, has_pdf_export, has_map, description) VALUES
('FREE',    0,         0,          2,  3,  FALSE, FALSE, FALSE, 'Gói miễn phí'),
('BASIC',   199000,    1990000,    5,  10, FALSE, TRUE,  FALSE, 'Gói cơ bản'),
('PRO',     499000,    4990000,    20, 50, TRUE,  TRUE,  TRUE,  'Gói chuyên nghiệp'),
('ENTERPRISE', 999000, 9990000,   999,999, TRUE,  TRUE,  TRUE,  'Gói doanh nghiệp');

INSERT INTO units (code, name, unit_type) VALUES
('kg',  'Kilogram',  'WEIGHT'),
('g',   'Gram',      'WEIGHT'),
('ton', 'Tấn',       'WEIGHT'),
('l',   'Lít',       'VOLUME'),
('ml',  'Mililit',   'VOLUME'),
('m2',  'Mét vuông', 'AREA'),
('ha',  'Hecta',     'AREA'),
('cai', 'Cái',       'COUNT'),
('bao', 'Bao',       'COUNT'),
('thung', 'Thùng',   'COUNT');

INSERT INTO crop_types (name, description) VALUES
('Lúa',          'Các giống lúa'),
('Rau củ',       'Rau củ các loại'),
('Cây ăn trái',  'Cây ăn quả'),
('Cây công nghiệp', 'Cà phê, cao su, tiêu...'),
('Hoa màu',      'Ngô, khoai, sắn...'),
('Thủy sản',     'Tôm, cá, cua...');

INSERT INTO plan_stage_statuses 
(code, name, is_initial, is_terminal, order_index, color) VALUES
('NOT_STARTED', 'Chưa bắt đầu', TRUE,  FALSE, 1, '#94A3B8'),
('IN_PROGRESS', 'Đang thực hiện', FALSE, FALSE, 2, '#3B82F6'),
('COMPLETED',   'Hoàn thành',    FALSE, TRUE,  3, '#22C55E'),
('SKIPPED',     'Bỏ qua',        FALSE, TRUE,  4, '#F59E0B'),
('CANCELLED',   'Đã huỷ',        FALSE, TRUE,  5, '#EF4444');

INSERT INTO task_statuses 
(code, name, is_initial, is_terminal, order_index, color) VALUES
('TODO',        'Chờ thực hiện', TRUE,  FALSE, 1, '#94A3B8'),
('IN_PROGRESS', 'Đang làm',      FALSE, FALSE, 2, '#3B82F6'),
('DONE',        'Hoàn thành',    FALSE, TRUE,  3, '#22C55E'),
('CANCELLED',   'Đã huỷ',        FALSE, TRUE,  4, '#EF4444');

INSERT INTO quality_grades (code, name, order_index, description) VALUES
('A',    'Loại A',     1, 'Chất lượng cao nhất'),
('B',    'Loại B',     2, 'Chất lượng tốt'),
('C',    'Loại C',     3, 'Chất lượng trung bình'),
('REJECT', 'Loại thải', 4, 'Không đạt tiêu chuẩn');

-- Roles hệ thống
INSERT INTO roles (name, description) VALUES
('ADMIN', 'Quản trị viên hệ thống'),
('USER',  'Người dùng thông thường');

-- System permissions
INSERT INTO permissions (name, description) VALUES
('system:user:manage',         'Quản lý users'),
('system:farm:view-all',       'Xem tất cả farms'),
('system:subscription:manage', 'Quản lý gói subscription'),
('system:plan:manage',         'Quản lý subscription plans');

-- Gán tất cả permissions cho ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN';