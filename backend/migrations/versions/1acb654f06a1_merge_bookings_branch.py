"""merge_bookings_branch

Revision ID: 1acb654f06a1
Revises: 20260106_bookings, e253bcda3613
Create Date: 2026-01-06 06:56:24.067030

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1acb654f06a1'
down_revision: Union[str, Sequence[str], None] = ('20260106_bookings', 'e253bcda3613')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
