"""refactor_settings_for_multislot

Revision ID: 307ceb054af9
Revises: a1b2c3d4e5f6
Create Date: 2026-01-04 08:32:57.548133

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '307ceb054af9'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Exception Dates: Allow multiple slots per date (remove unique index)
    op.drop_index(op.f('ix_exception_dates_date'), table_name='exception_dates')
    op.create_index(op.f('ix_exception_dates_date'), 'exception_dates', ['date'], unique=False)

    # 2. Operating Hours: Change PK from day_of_week to id
    # Add ID column (nullable first to populate)
    op.add_column('operating_hours', sa.Column('id', sa.Uuid(), nullable=True))

    # Populate IDs
    op.execute("UPDATE operating_hours SET id = gen_random_uuid()")

    # Make ID not nullable
    op.alter_column('operating_hours', 'id', nullable=False)

    # Add Label column
    op.add_column('operating_hours', sa.Column('label', sqlmodel.sql.sqltypes.AutoString(), nullable=True))

    # Drop old PK (day_of_week)
    op.drop_constraint('operating_hours_pkey', 'operating_hours', type_='primary')

    # Create new PK (id)
    op.create_primary_key('operating_hours_pkey', 'operating_hours', ['id'])

    # Create Index on day_of_week (since it's no longer PK)
    op.create_index(op.f('ix_operating_hours_day_of_week'), 'operating_hours', ['day_of_week'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # 1. Operating Hours: Revert PK to day_of_week
    op.drop_index(op.f('ix_operating_hours_day_of_week'), table_name='operating_hours')
    op.drop_constraint('operating_hours_pkey', 'operating_hours', type_='primary')

    # WARNING: This might fail if duplicates were introduced.
    # We assume rollback is done on clean state or we accept failure on data loss.
    op.create_primary_key('operating_hours_pkey', 'operating_hours', ['day_of_week'])

    op.drop_column('operating_hours', 'label')
    op.drop_column('operating_hours', 'id')

    # 2. Exception Dates: Revert to unique index
    op.drop_index(op.f('ix_exception_dates_date'), table_name='exception_dates')
    op.create_index(op.f('ix_exception_dates_date'), 'exception_dates', ['date'], unique=True)

