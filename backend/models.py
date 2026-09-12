from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    Time,
    func,
)
from sqlalchemy.dialects.postgresql import INET, JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from datetime import date, datetime, time
from typing import Optional


# ============================================================
# BASE
# ============================================================

class Base(DeclarativeBase):
    pass


# ============================================================
# ENUMS
# ============================================================

UserRole = Enum(
    "CUSTOMER",
    "LMO",
    "GATC",
    "ADMIN",
    name="user_role",
    create_type=False,
)

InstrumentStatus = Enum(
    "ACTIVE",
    "VERIFICATION_DUE",
    "EXPIRED",
    "INACTIVE",
    name="instrument_status",
    create_type=False,
)

ApplicationType = Enum(
    "INITIAL_VERIFICATION",
    "RE_VERIFICATION",
    name="application_type",
    create_type=False,
)

ApplicationStatus = Enum(
    "SUBMITTED",
    "UNDER_REVIEW",
    "SCHEDULED",
    "INSPECTION",
    "PASSED",
    "FAILED",
    "CERTIFICATE_GENERATED",
    "CANCELLED",
    name="application_status",
    create_type=False,
)

AssignmentStatus = Enum(
    "ASSIGNED",
    "ACCEPTED",
    "COMPLETED",
    "REASSIGNED",
    "CANCELLED",
    name="assignment_status",
    create_type=False,
)

InspectionResult = Enum(
    "PENDING",
    "PASS",
    "FAIL",
    name="inspection_result",
    create_type=False,
)

DocumentType = Enum(
    "INSTRUMENT_PHOTO",
    "SUPPORTING_DOCUMENT",
    "PREVIOUS_CERTIFICATE",
    "INSPECTION_PHOTO",
    "OTHER",
    name="document_type",
    create_type=False,
)

CertificateResult = Enum(
    "VALID",
    "REVOKED",
    "EXPIRED",
    name="certificate_result",
    create_type=False,
)

NotificationType = Enum(
    "APPLICATION_UPDATE",
    "ASSIGNMENT",
    "SCHEDULED",
    "CERTIFICATE_ISSUED",
    "EXPIRING_SOON",
    "EXPIRED",
    "SYSTEM",
    name="notification_type",
    create_type=False,
)


# ============================================================
# USERS
# ============================================================

class User(Base):

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)

    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True
    )

    phone: Mapped[Optional[str]] = mapped_column(
        String(15),
        unique=True
    )

    password_hash: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    role: Mapped[str] = mapped_column(
        UserRole,
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    # Relationships

    business: Mapped[Optional["Business"]] = relationship(
        back_populates="user",
        uselist=False
    )

    officer: Mapped[Optional["Officer"]] = relationship(
        back_populates="user",
        uselist=False
    )

    notifications: Mapped[list["Notification"]] = relationship(
        back_populates="user"
    )

    audit_logs: Mapped[list["AuditLog"]] = relationship(
        back_populates="user"
    )


# ============================================================
# BUSINESSES
# ============================================================

class Business(Base):

    __tablename__ = "businesses"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True
    )

    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    business_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    owner_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    phone: Mapped[Optional[str]] = mapped_column(
        String(15)
    )

    email: Mapped[Optional[str]] = mapped_column(
        String(255)
    )

    address: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    city: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    district: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    state: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    pincode: Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    business_type: Mapped[Optional[str]] = mapped_column(
        String(100)
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    # Relationships

    user: Mapped["User"] = relationship(
        back_populates="business"
    )

    instruments: Mapped[list["Instrument"]] = relationship(
        back_populates="business"
    )

    applications: Mapped[list["Application"]] = relationship(
        back_populates="business"
    )

    certificates: Mapped[list["Certificate"]] = relationship(
        back_populates="business"
    )


# ============================================================
# OFFICERS
# ============================================================

class Officer(Base):

    __tablename__ = "officers"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True
    )

    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    officer_type: Mapped[str] = mapped_column(
        UserRole,
        nullable=False
    )

    designation: Mapped[Optional[str]] = mapped_column(
        String(100)
    )

    employee_code: Mapped[Optional[str]] = mapped_column(
        String(50),
        unique=True
    )

    district: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    state: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    specialization: Mapped[Optional[str]] = mapped_column(
        String(200)
    )

    is_available: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    # Relationships

    user: Mapped["User"] = relationship(
        back_populates="officer"
    )

    assignments: Mapped[list["Assignment"]] = relationship(
        back_populates="officer"
    )

    inspections: Mapped[list["Inspection"]] = relationship(
        back_populates="officer"
    )

    certificates: Mapped[list["Certificate"]] = relationship(
        back_populates="officer"
    )


# ============================================================
# INSTRUMENTS
# ============================================================

class Instrument(Base):

    __tablename__ = "instruments"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True
    )

    instrument_id: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True
    )

    business_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False
    )

    instrument_type: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    manufacturer: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    model: Mapped[Optional[str]] = mapped_column(
        String(150)
    )

    serial_number: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    capacity: Mapped[Optional[float]] = mapped_column(
        Numeric(12, 3)
    )

    capacity_unit: Mapped[Optional[str]] = mapped_column(
        String(20)
    )

    least_count: Mapped[Optional[float]] = mapped_column(
        Numeric(12, 6)
    )

    location: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        InstrumentStatus,
        nullable=False,
        default="ACTIVE"
    )

    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    # Relationships

    business: Mapped["Business"] = relationship(
        back_populates="instruments"
    )

    applications: Mapped[list["Application"]] = relationship(
        back_populates="instrument"
    )

    certificates: Mapped[list["Certificate"]] = relationship(
        back_populates="instrument"
    )

    documents: Mapped[list["Document"]] = relationship(
        back_populates="instrument"
    )

    __table_args__ = (
        CheckConstraint(
            "capacity IS NULL OR capacity > 0",
            name="positive_capacity"
        ),
        CheckConstraint(
            "least_count IS NULL OR least_count > 0",
            name="positive_least_count"
        ),
        Index(
            "idx_instruments_business",
            "business_id"
        ),
        Index(
            "idx_instruments_serial",
            "serial_number"
        ),
    )


# ============================================================
# APPLICATIONS
# ============================================================

class Application(Base):

    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True
    )

    application_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True
    )

    instrument_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("instruments.id", ondelete="RESTRICT"),
        nullable=False
    )

    business_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("businesses.id", ondelete="RESTRICT"),
        nullable=False
    )

    application_type: Mapped[str] = mapped_column(
        ApplicationType,
        nullable=False
    )

    preferred_date: Mapped[Optional[date]] = mapped_column(
        Date
    )

    preferred_time: Mapped[Optional[time]] = mapped_column(
        Time
    )

    location: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        ApplicationStatus,
        nullable=False,
        default="SUBMITTED"
    )

    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    # Relationships

    instrument: Mapped["Instrument"] = relationship(
        back_populates="applications"
    )

    business: Mapped["Business"] = relationship(
        back_populates="applications"
    )

    assignments: Mapped[list["Assignment"]] = relationship(
        back_populates="application"
    )

    inspection: Mapped[Optional["Inspection"]] = relationship(
        back_populates="application",
        uselist=False
    )

    certificate: Mapped[Optional["Certificate"]] = relationship(
        back_populates="application",
        uselist=False
    )

    documents: Mapped[list["Document"]] = relationship(
        back_populates="application"
    )

    notifications: Mapped[list["Notification"]] = relationship(
        back_populates="application"
    )

    __table_args__ = (
        Index(
            "idx_applications_status",
            "status"
        ),
        Index(
            "idx_applications_business",
            "business_id"
        ),
    )


# ============================================================
# ASSIGNMENTS
# ============================================================

class Assignment(Base):

    __tablename__ = "assignments"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True
    )

    application_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False
    )

    officer_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("officers.id", ondelete="RESTRICT"),
        nullable=False
    )

    assigned_by: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="SET NULL")
    )

    scheduled_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    scheduled_time: Mapped[time] = mapped_column(
        Time,
        nullable=False
    )

    assignment_status: Mapped[str] = mapped_column(
        AssignmentStatus,
        nullable=False,
        default="ASSIGNED"
    )

    recommendation_score: Mapped[Optional[float]] = mapped_column(
        Numeric(5, 2)
    )

    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    application: Mapped["Application"] = relationship(
        back_populates="assignments"
    )

    officer: Mapped["Officer"] = relationship(
        back_populates="assignments"
    )

    __table_args__ = (
        CheckConstraint(
            "recommendation_score IS NULL OR "
            "recommendation_score BETWEEN 0 AND 100",
            name="valid_score"
        ),
        Index(
            "idx_assignments_officer",
            "officer_id"
        ),
        Index(
            "idx_assignments_date",
            "scheduled_date"
        ),
    )


# ============================================================
# INSPECTIONS
# ============================================================

class Inspection(Base):

    __tablename__ = "inspections"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True
    )

    application_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    officer_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("officers.id", ondelete="RESTRICT"),
        nullable=False
    )

    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True)
    )

    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True)
    )

    latitude: Mapped[Optional[float]] = mapped_column(
        Numeric(10, 7)
    )

    longitude: Mapped[Optional[float]] = mapped_column(
        Numeric(10, 7)
    )

    overall_result: Mapped[str] = mapped_column(
        InspectionResult,
        nullable=False,
        default="PENDING"
    )

    remarks: Mapped[Optional[str]] = mapped_column(
        Text
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    application: Mapped["Application"] = relationship(
        back_populates="inspection"
    )

    officer: Mapped["Officer"] = relationship(
        back_populates="inspections"
    )

    observations: Mapped[list["InspectionObservation"]] = relationship(
        back_populates="inspection",
        cascade="all, delete-orphan"
    )

    documents: Mapped[list["Document"]] = relationship(
        back_populates="inspection"
    )

    __table_args__ = (
        CheckConstraint(
            "(latitude IS NULL AND longitude IS NULL) OR "
            "(latitude BETWEEN -90 AND 90 AND "
            "longitude BETWEEN -180 AND 180)",
            name="valid_coordinates"
        ),
        Index(
            "idx_inspections_officer",
            "officer_id"
        ),
    )


# ============================================================
# INSPECTION OBSERVATIONS
# ============================================================

class InspectionObservation(Base):

    __tablename__ = "inspection_observations"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True
    )

    inspection_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("inspections.id", ondelete="CASCADE"),
        nullable=False
    )

    check_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    result: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False
    )

    observed_value: Mapped[Optional[str]] = mapped_column(
        String(200)
    )

    expected_value: Mapped[Optional[str]] = mapped_column(
        String(200)
    )

    remarks: Mapped[Optional[str]] = mapped_column(
        Text
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    inspection: Mapped["Inspection"] = relationship(
        back_populates="observations"
    )


# ============================================================
# DOCUMENTS
# ============================================================

class Document(Base):

    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True
    )

    document_type: Mapped[str] = mapped_column(
        DocumentType,
        nullable=False
    )

    instrument_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("instruments.id", ondelete="CASCADE")
    )

    application_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("applications.id", ondelete="CASCADE")
    )

    inspection_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("inspections.id", ondelete="CASCADE")
    )

    file_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    file_url: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    uploaded_by: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="SET NULL")
    )

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    instrument: Mapped[Optional["Instrument"]] = relationship(
        back_populates="documents"
    )

    application: Mapped[Optional["Application"]] = relationship(
        back_populates="documents"
    )

    inspection: Mapped[Optional["Inspection"]] = relationship(
        back_populates="documents"
    )


# ============================================================
# CERTIFICATES
# ============================================================

class Certificate(Base):

    __tablename__ = "certificates"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True
    )

    certificate_number: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True
    )

    application_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("applications.id", ondelete="RESTRICT"),
        nullable=False,
        unique=True
    )

    instrument_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("instruments.id", ondelete="RESTRICT"),
        nullable=False
    )

    business_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("businesses.id", ondelete="RESTRICT"),
        nullable=False
    )

    officer_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("officers.id", ondelete="RESTRICT"),
        nullable=False
    )

    verification_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    valid_until: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    result: Mapped[str] = mapped_column(
        CertificateResult,
        nullable=False,
        default="VALID"
    )

    certificate_hash: Mapped[Optional[str]] = mapped_column(
        String(128),
        unique=True
    )

    pdf_url: Mapped[Optional[str]] = mapped_column(
        Text
    )

    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    application: Mapped["Application"] = relationship(
        back_populates="certificate"
    )

    instrument: Mapped["Instrument"] = relationship(
        back_populates="certificates"
    )

    business: Mapped["Business"] = relationship(
        back_populates="certificates"
    )

    officer: Mapped["Officer"] = relationship(
        back_populates="certificates"
    )

    __table_args__ = (
        CheckConstraint(
            "valid_until >= verification_date",
            name="valid_certificate_period"
        ),
        Index(
            "idx_certificates_valid_until",
            "valid_until"
        ),
    )


# ============================================================
# NOTIFICATIONS
# ============================================================

class Notification(Base):

    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True
    )

    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    notification_type: Mapped[str] = mapped_column(
        NotificationType,
        nullable=False
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    is_read: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )

    related_application_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("applications.id", ondelete="SET NULL")
    )

    related_certificate_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("certificates.id", ondelete="SET NULL")
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    user: Mapped["User"] = relationship(
        back_populates="notifications"
    )

    application: Mapped[Optional["Application"]] = relationship(
        back_populates="notifications"
    )


# ============================================================
# AUDIT LOGS
# ============================================================

class AuditLog(Base):

    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True
    )

    user_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="SET NULL")
    )

    action: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    entity_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    entity_id: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False
    )

    old_value: Mapped[Optional[dict]] = mapped_column(
        JSONB
    )

    new_value: Mapped[Optional[dict]] = mapped_column(
        JSONB
    )

    ip_address: Mapped[Optional[str]] = mapped_column(
        INET
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    user: Mapped[Optional["User"]] = relationship(
        back_populates="audit_logs"
    )

    __table_args__ = (
        Index(
            "idx_audit_logs_entity",
            "entity_type",
            "entity_id"
        ),
    )