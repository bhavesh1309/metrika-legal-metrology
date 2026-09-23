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

    # Officer-specific fields
    employee_code: str | None = None
    designation: str | None = None
    district: str | None = None
    state: str | None = None
    specialization: str | None = None
    is_available: bool | None = None

    created_at: datetime | None = None

class AdminApplicationResponse(BaseModel):
    id: int
    application_number: str

    business_id: int
    business_name: str | None = None
    business_email: str | None = None

    instrument_id: int
    instrument_code: str | None = None
    instrument_type: str | None = None
    serial_number: str | None = None

    application_type: str
    preferred_date: date | None = None
    preferred_time: time | None = None
    location: str

    status: str
    submitted_at: datetime
    updated_at: datetime

    assigned_officer_id: int | None = None
    assigned_officer_name: str | None = None
    scheduled_date: date | None = None
    scheduled_time: time | None = None

    inspection_result: str | None = None
    rejection_reason: str | None = None

    certificate_number: str | None = None

class AdminInstrumentResponse(BaseModel):
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

    verification_status: str
    last_verification_date: date | None = None
    valid_until: date | None = None
    certificate_number: str | None = None

class AdminCertificateResponse(BaseModel):
    id: int
    certificate_number: str

    application_id: int

    business_id: int
    business_name: str | None = None

    instrument_id: int
    instrument_code: str | None = None
    instrument_type: str | None = None
    serial_number: str | None = None

    verification_date: date
    valid_until: date

    status: str

class AdminAuditLogResponse(BaseModel):
    id: int

    user_id: int | None = None
    user_name: str | None = None
    user_role: str | None = None

    action: str
    entity_type: str
    entity_id: int | None = None

    old_value: dict | None = None
    new_value: dict | None = None

    ip_address: str | None = None
    created_at: datetime

class AdminReportsResponse(BaseModel):
    total_applications: int
    completed_verifications: int
    pending_applications: int
    pass_rate: float

    failed_inspections: int
    certificates_issued: int
    expiring_soon: int
    active_officers: int

    application_status: dict[str, int]
    inspection_results: dict[str, int]

    application_trends: list[dict]
    officer_workload: list[dict]
    instrument_distribution: list[dict]

    expiring_certificates: list[dict]

class AdminDashboardResponse(BaseModel):
    total_applications: int
    pending_applications: int
    scheduled_inspections: int
    certificates_issued: int
    active_officers: int

    application_status: dict[str, int]
    inspection_results: dict[str, int]

    pending_actions: dict[str, int]

    recent_activity: list[dict]