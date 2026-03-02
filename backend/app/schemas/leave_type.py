"""Leave type schemas."""
from pydantic import BaseModel


class LeaveTypeBase(BaseModel):
    name: str
    code: str
    default_days_per_year: int = 0
    allow_carry_over: bool = False


class LeaveTypeCreate(LeaveTypeBase):
    pass


class LeaveTypeUpdate(BaseModel):
    name: str | None = None
    default_days_per_year: int | None = None
    allow_carry_over: bool | None = None
    is_active: bool | None = None


class LeaveTypeResponse(LeaveTypeBase):
    id: int
    is_active: bool = True

    class Config:
        from_attributes = True
