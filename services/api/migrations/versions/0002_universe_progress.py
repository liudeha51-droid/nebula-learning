"""Mathematics Universe learner progress (level bitmask per knowledge point)."""
from alembic import op
import sqlalchemy as sa

revision="0002"
down_revision="0001"


def upgrade():
    op.create_table('universe_progress',
    sa.Column('user_id', sa.String(length=36), nullable=False),
    sa.Column('kp_id', sa.String(length=80), nullable=False),
    sa.Column('levels', sa.Integer(), nullable=False),
    sa.Column('updated', sa.DateTime(), nullable=False),
    sa.CheckConstraint('levels >= 0 AND levels < 64', name='ck_universe_levels'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('user_id', 'kp_id')
    )


def downgrade():
    op.drop_table('universe_progress')
