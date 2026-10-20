"""Add waitlist offer and booking link fields.

Revision ID: 20261019_waitlist_offer_fields
Revises:
Create Date: 2026-10-19
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "20261019_waitlist_offer_fields"
down_revision = None
branch_labels = None
depends_on = None


def _has_index(inspector, table_name, index_name):
    return any(
        index["name"] == index_name
        for index in inspector.get_indexes(table_name)
    )


def upgrade():
    bind = op.get_bind()
    inspector = inspect(bind)
    tables = inspector.get_table_names()

    if "waitlist_entries" not in tables:
        op.create_table(
            "waitlist_entries",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("restaurant_id", sa.Integer(), nullable=False),
            sa.Column("visit_date", sa.Date(), nullable=False),
            sa.Column("visit_time", sa.Time(), nullable=False),
            sa.Column("party_size", sa.Integer(), nullable=False),
            sa.Column("status", sa.String(length=20), nullable=False, server_default="waiting"),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("offered_at", sa.DateTime()),
            sa.Column("offer_expires_at", sa.DateTime()),
            sa.Column("booking_id", sa.Integer()),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.ForeignKeyConstraint(["restaurant_id"], ["restaurants.id"]),
            sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"]),
            sa.UniqueConstraint("booking_id", name="uq_waitlist_entries_booking_id"),
        )
        op.create_index("ix_waitlist_entries_user_id", "waitlist_entries", ["user_id"])
        op.create_index("ix_waitlist_entries_restaurant_id", "waitlist_entries", ["restaurant_id"])
        op.create_index(
            "ix_waitlist_slot_status",
            "waitlist_entries",
            ["restaurant_id", "visit_date", "visit_time", "status"],
        )
        return

    existing_columns = {
        column["name"] for column in inspector.get_columns("waitlist_entries")
    }
    missing_columns = {
        "offered_at": sa.Column("offered_at", sa.DateTime()),
        "offer_expires_at": sa.Column("offer_expires_at", sa.DateTime()),
        "booking_id": sa.Column("booking_id", sa.Integer()),
    }

    with op.batch_alter_table("waitlist_entries") as batch:
        for name, column in missing_columns.items():
            if name not in existing_columns:
                batch.add_column(column)
        if "booking_id" not in existing_columns:
            batch.create_foreign_key(
                "fk_waitlist_entries_booking_id",
                "bookings",
                ["booking_id"],
                ["id"],
            )
            batch.create_unique_constraint(
                "uq_waitlist_entries_booking_id",
                ["booking_id"],
            )

    inspector = inspect(bind)
    if not _has_index(inspector, "waitlist_entries", "ix_waitlist_slot_status"):
        op.create_index(
            "ix_waitlist_slot_status",
            "waitlist_entries",
            ["restaurant_id", "visit_date", "visit_time", "status"],
        )


def downgrade():
    bind = op.get_bind()
    inspector = inspect(bind)
    if "waitlist_entries" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("waitlist_entries")}
    with op.batch_alter_table("waitlist_entries") as batch:
        if "booking_id" in columns:
            batch.drop_constraint("uq_waitlist_entries_booking_id", type_="unique")
            batch.drop_constraint("fk_waitlist_entries_booking_id", type_="foreignkey")
            batch.drop_column("booking_id")
        if "offer_expires_at" in columns:
            batch.drop_column("offer_expires_at")
        if "offered_at" in columns:
            batch.drop_column("offered_at")
