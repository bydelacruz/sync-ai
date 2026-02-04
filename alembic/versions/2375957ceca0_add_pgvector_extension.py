"""add_pgvector_extension

Revision ID: 2375957ceca0
Revises: 338168752a5e
Create Date: 2026-02-03 14:06:01.589722

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2375957ceca0"
down_revision: Union[str, Sequence[str], None] = "338168752a5e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP EXTENSION vector")
