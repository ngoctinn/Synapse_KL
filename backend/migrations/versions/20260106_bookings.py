"""create_bookings_tables

Revision ID: 20260106_bookings
Revises:
Create Date: 2026-01-06

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20260106_bookings'
down_revision = 'f73f287705ff'  # Migration cuối cùng hiện tại
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Tạo bảng bookings
    op.create_table(
        'bookings',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('customer_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('guest_name', sa.String(255), nullable=True),
        sa.Column('guest_phone', sa.String(50), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='PENDING'),
        sa.Column('source', sa.String(20), nullable=False, server_default='ONLINE'),
        sa.Column('preferred_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('preferred_time_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('preferred_time_end', sa.DateTime(timezone=True), nullable=False),
        sa.Column('preferred_staff_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('optimization_status', sa.String(50), nullable=True),
        sa.Column('optimization_message', sa.Text, nullable=True),
        sa.Column('optimized_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('scheduled_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('scheduled_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('checked_in_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('checked_out_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('cancelled_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('cancellation_reason', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['preferred_staff_id'], ['staff_profiles.user_id'], ondelete='SET NULL'),
    )

    # Indexes cho bookings
    op.create_index('ix_bookings_customer_id', 'bookings', ['customer_id'])
    op.create_index('ix_bookings_preferred_date', 'bookings', ['preferred_date'])
    op.create_index('ix_bookings_status', 'bookings', ['status'])

    # Tạo bảng booking_items
    op.create_table(
        'booking_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('booking_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('service_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('assigned_staff_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('assigned_resource_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('scheduled_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('scheduled_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('actual_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('actual_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('sequence_order', sa.Integer, nullable=False, server_default='1'),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['service_id'], ['services.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['assigned_staff_id'], ['staff_profiles.user_id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['assigned_resource_id'], ['resources.id'], ondelete='SET NULL'),
    )

    # Indexes cho booking_items
    op.create_index('ix_booking_items_booking_id', 'booking_items', ['booking_id'])
    op.create_index('ix_booking_items_service_id', 'booking_items', ['service_id'])
    op.create_index('ix_booking_items_assigned_staff_id', 'booking_items', ['assigned_staff_id'])
    op.create_index('ix_booking_items_scheduled_start', 'booking_items', ['scheduled_start'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_booking_items_scheduled_start', table_name='booking_items')
    op.drop_index('ix_booking_items_assigned_staff_id', table_name='booking_items')
    op.drop_index('ix_booking_items_service_id', table_name='booking_items')
    op.drop_index('ix_booking_items_booking_id', table_name='booking_items')

    op.drop_index('ix_bookings_status', table_name='bookings')
    op.drop_index('ix_bookings_preferred_date', table_name='bookings')
    op.drop_index('ix_bookings_customer_id', table_name='bookings')

    # Drop tables
    op.drop_table('booking_items')
    op.drop_table('bookings')
