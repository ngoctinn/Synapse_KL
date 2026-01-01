"""add_staff_scheduling_tables

Revision ID: a1b2c3d4e5f6
Revises: 2b3877664e70
Create Date: 2026-01-01

Tạo bảng staff_profiles, shifts, staff_schedules, và staff_skill_links
cho module quản lý nhân viên và lịch làm việc.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import ENUM as PgENUM

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '2b3877664e70'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Tạo ENUM type cho schedule_status (nếu chưa tồn tại)
    op.execute("DO $$ BEGIN CREATE TYPE schedule_status AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;")

    # Tạo bảng shifts (Ca làm việc)
    op.create_table(
        'shifts',
        sa.Column('id', sa.UUID(), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
        sa.Column('color_code', sa.String(7), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # Tạo bảng staff_profiles (Hồ sơ nhân viên)
    # Lưu ý: user_id tham chiếu đến auth.users của Supabase, không đặt FK constraint ở đây
    # vì auth.users nằm ở schema khác và được quản lý bởi Supabase
    op.create_table(
        'staff_profiles',
        sa.Column('user_id', sa.UUID(), primary_key=True),
        sa.Column('full_name', sa.String(100), nullable=False),
        sa.Column('title', sa.String(100), nullable=False, server_default='Kỹ thuật viên'),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('color_code', sa.String(7), nullable=False, server_default='#6366F1'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # Tạo bảng staff_schedules (Lịch làm việc)
    op.create_table(
        'staff_schedules',
        sa.Column('id', sa.UUID(), primary_key=True),
        sa.Column('staff_id', sa.UUID(), sa.ForeignKey('staff_profiles.user_id'), nullable=False),
        sa.Column('shift_id', sa.UUID(), sa.ForeignKey('shifts.id'), nullable=False),
        sa.Column('work_date', sa.Date(), nullable=False),
        sa.Column('status', PgENUM('DRAFT', 'PUBLISHED', 'CANCELLED', name='schedule_status', create_type=False), nullable=False, server_default='DRAFT'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_staff_schedules_staff_id', 'staff_schedules', ['staff_id'])
    op.create_index('ix_staff_schedules_work_date', 'staff_schedules', ['work_date'])

    # Tạo bảng staff_skill_links (Liên kết Staff-Skill)
    op.create_table(
        'staff_skill_links',
        sa.Column('staff_id', sa.UUID(), sa.ForeignKey('staff_profiles.user_id'), primary_key=True),
        sa.Column('skill_id', sa.UUID(), sa.ForeignKey('skills.id'), primary_key=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('staff_skill_links')
    op.drop_table('staff_schedules')
    op.drop_table('staff_profiles')
    op.drop_table('shifts')
    op.execute("DROP TYPE schedule_status")
