"""Users: list (admin), create (admin), get one (admin any / else own), update (admin)."""
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user, hash_password, RequireAdmin
from app.models import Role
from app.store import (
    list_users,
    get_user_by_id,
    create_user as store_create_user,
    update_user as store_update_user,
    update_user_password,
)
from app.schemas.user import UserResponse, UserCreate, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


def _user_to_response(u: dict) -> UserResponse:
    return UserResponse(
        id=u["id"],
        email=u["email"],
        full_name=u["full_name"],
        role=Role(u["role"]) if isinstance(u["role"], str) else u["role"],
        manager_id=u.get("manager_id"),
        is_active=u.get("is_active", True),
    )


@router.get("", response_model=list[UserResponse])
async def list_users_route(current_user=RequireAdmin):
    """List all users (admin only)."""
    users = list_users()
    return [_user_to_response(u) for u in users]


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_route(body: UserCreate, current_user=RequireAdmin):
    """Create user (admin only). Password is hashed before storing."""
    try:
        u = store_create_user(
            email=body.email,
            hashed_password=hash_password(body.password),
            full_name=body.full_name,
            role=body.role.value,
            manager_id=body.manager_id,
        )
        return _user_to_response(u)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_route(
    user_id: int,
    current_user=Depends(get_current_user),
):
    """Get one user. Admin: any; Employee/Manager: own id only (read-only)."""
    if current_user.role != Role.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Can only view own user")
    u = get_user_by_id(user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return _user_to_response(u)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user_route(
    user_id: int,
    body: UserUpdate,
    current_user=RequireAdmin,
):
    """Update user (admin only). Optionally set password (hashed)."""
    u = get_user_by_id(user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    payload = body.model_dump(exclude_unset=True)
    password = payload.pop("password", None)
    allowed = {"full_name", "role", "manager_id", "is_active"}
    updates = {k: v for k, v in payload.items() if k in allowed}
    if "role" in updates and updates["role"] is not None:
        updates["role"] = updates["role"].value
    if updates:
        store_update_user(user_id, **updates)
    if password is not None:
        update_user_password(user_id, hash_password(password))
    u = get_user_by_id(user_id)
    return _user_to_response(u)
