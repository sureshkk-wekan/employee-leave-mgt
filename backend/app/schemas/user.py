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
