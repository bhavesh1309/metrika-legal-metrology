from pydantic import BaseModel, EmailStr, ConfigDict
from decimal import Decimal
from datetime import date, time, datetime



class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None
    password: str
    role: str = "CUSTOMER"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    role: str

class InstrumentCreate(BaseModel):
    instrument_type: str
    manufacturer: str | None = None
    model: str | None = None
    serial_number: str | None = None
    capacity: Decimal
    capacity_unit: str
    least_count: Decimal
    location: str


class InstrumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    instrument_id: str
    business_id: int
    instrument_type: str
    manufacturer: str | None
    model: str | None
    serial_number: str | None
    capacity: Decimal
    capacity_unit: str
    least_count: Decimal
    location: str
    status: str

class ApplicationCreate(BaseModel):
    instrument_id: int
    application_type: str = "INITIAL_VERIFICATION"
    preferred_date: date | None = None
    preferred_time: time | None = None
    location: str


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    application_number: str
    instrument_id: int
    business_id: int
    application_type: str
    preferred_date: date | None
    preferred_time: time | None
    location: str
    status: str
    submitted_at: datetime
    updated_at: datetime

class OfficerRecommendationResponse(BaseModel):
    officer_id: int
    officer_name: str
    officer_type: str
    designation: str | None
    district: str | None
    state: str | None
    specialization: str | None
    is_available: bool
    current_workload: int
    recommendation_score: int


class AssignmentCreate(BaseModel):
    officer_id: int
    scheduled_date: date | None = None
    scheduled_time: time | None = None


class AssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    application_id: int
    officer_id: int
    assigned_by: int | None
    scheduled_date: date
    scheduled_time: time
    assignment_status: str
    recommendation_score: int | None
    assigned_at: datetime

class OfficerAssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    application_id: int
    officer_id: int
    scheduled_date: date
    scheduled_time: time
    assignment_status: str
    recommendation_score: int | None

class InspectionCreate(BaseModel):
    result: str
    remarks: str | None = None
    latitude: Decimal | None = None
    longitude: Decimal | None = None


class InspectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    application_id: int
    officer_id: int
    started_at: datetime
    completed_at: datetime | None
    latitude: Decimal | None
    longitude: Decimal | None
    overall_result: str
    remarks: str | None

class CertificateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    certificate_number: str
    application_id: int
    instrument_id: int
    business_id: int
    officer_id: int
    verification_date: date
    valid_until: date
    result: str
    certificate_hash: str
    pdf_url: str | None
    issued_at: datetime

class AdminUserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str | None = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True