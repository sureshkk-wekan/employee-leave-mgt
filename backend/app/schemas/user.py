"""User schemas."""
from pydantic import BaseModel
from app.models import Role


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: Role
    manager_id: int | None = None
    is_active: bool = True

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: Role
    manager_id: int | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    role: Role | None = None
    manager_id: int | None = None
    is_active: bool | None = None
    password: str | None = None
