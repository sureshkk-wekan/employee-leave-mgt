"""Leave balances: list own or (manager reportees / admin any); optional year."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query

from app.auth import get_current_user
from app.models import Role
from app.store import list_leave_balances, list_reportees, get_user_by_id

router = APIRouter(prefix="/leave-balances", tags=["leave-balances"])


def _balance_response(b: dict) -> dict:
    return {
        "id": b["id"],
        "user_id": b["user_id"],
        "leave_type_id": b["leave_type_id"],
        "year": b["year"],
        "entitlement_days": b.get("entitlement_days", 0),
        "carried_over_days": b.get("carried_over_days", 0),
        "used_days": b.get("used_days", 0),
        "remaining_days": max(
            0,
            b.get("entitlement_days", 0) + b.get("carried_over_days", 0) - b.get("used_days", 0),
        ),
    }


@router.get("/reportees")
async def get_reportees(current_user=Depends(get_current_user)):
    """Manager only: list reportees (for balances dropdown)."""
    if current_user.role != Role.MANAGER:
        return []
    return list_reportees(current_user.id)


@router.get("")
async def list_balances(
    current_user=Depends(get_current_user),
    user_id: int | None = Query(None, description="User whose balances to list; default = own"),
    year: int | None = Query(None, description="Filter by year; default = current year"),
):
    """
    List leave balances.
    - Employee: own only (user_id ignored or must be self).
    - Manager: own or pass user_id for a reportee only.
    - Admin: any user_id.
    """
    target_id = user_id if user_id is not None else current_user.id
    if target_id != current_user.id:
        if current_user.role == Role.EMPLOYEE:
            raise HTTPException(status_code=403, detail="Can only view own balances")
        if current_user.role == Role.MANAGER:
            reportees = [r["id"] for r in list_reportees(current_user.id)]
            if target_id not in reportees:
                raise HTTPException(status_code=403, detail="Can only view own or reportees' balances")
        # Admin: any target_id allowed
    effective_year = year
    if effective_year is None:
        effective_year = datetime.now(timezone.utc).year
    balances = list_leave_balances(target_id, year=effective_year)
    # Enrich with leave type name if we want; for MVP return as-is, frontend can map leave_type_id
    return [_balance_response(b) for b in balances]
