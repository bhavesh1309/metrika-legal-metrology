from fastapi import FastAPI
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4
from models import User, Business, Instrument, Application, Officer, Assignment, Inspection, Certificate, UserRole, Document
from database import get_db
from schemas import RegisterRequest, UserResponse, InstrumentCreate, InstrumentResponse, LoginRequest, TokenResponse, ApplicationCreate, ApplicationResponse, AssignmentCreate, AssignmentResponse, OfficerRecommendationResponse, OfficerAssignmentResponse, InspectionCreate, InspectionResponse, CertificateResponse, AdminUserResponse
from auth import hash_password, verify_password, create_access_token, get_current_user, require_admin
from sqlalchemy import func, desc
from datetime import datetime, timezone, date, timedelta
import os
import hashlib

import qrcode

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

os.makedirs("generated/certificates", exist_ok=True)
os.makedirs("generated/qr", exist_ok=True)

app = FastAPI(
    title="Legal Metrology Verification System",
    description="Digital platform for verification and certification of weighing and measuring instruments",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/files",
    StaticFiles(directory="generated"),
    name="files"
)

@app.get("/")
def root():
    return {
        "message": "Legal Metrology API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }

@app.post("/auth/register", response_model=UserResponse)
def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hash_password(user_data.password),
        role="CUSTOMER"
    )

    db.add(new_user)
    db.flush()

    new_business = Business(
    user_id=new_user.id,
    business_name=f"{user_data.full_name}'s Business",
    owner_name=user_data.full_name,
    phone=user_data.phone,
    email=user_data.email,
    address="Not provided",
    city="Not provided",
    district="Not provided",
    state="Not provided",
    pincode="000000",
    business_type="General"
)

    db.add(new_business)
    db.commit()
    db.refresh(new_user)

    return new_user

@app.post("/instruments", response_model=InstrumentResponse)
def create_instrument(
    instrument_data: InstrumentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business = db.query(Business).filter(
    Business.user_id == current_user.id
).first()

    if business is None:
        raise HTTPException(
            status_code=404,
            detail="Business not found"
        )

    new_instrument = Instrument(
        instrument_id=f"INST-{uuid4().hex[:8].upper()}",
        business_id=business.id,
        instrument_type=instrument_data.instrument_type,
        manufacturer=instrument_data.manufacturer,
        model=instrument_data.model,
        serial_number=instrument_data.serial_number,
        capacity=instrument_data.capacity,
        capacity_unit=instrument_data.capacity_unit,
        least_count=instrument_data.least_count,
        location=instrument_data.location
    )

    db.add(new_instrument)
    db.commit()
    db.refresh(new_instrument)

    return new_instrument

@app.get("/instruments", response_model=list[InstrumentResponse])
def get_instruments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business = db.query(Business).filter(
        Business.user_id == current_user.id
    ).first()

    if business is None:
        raise HTTPException(
            status_code=404,
            detail="Business not found"
        )

    instruments = db.query(Instrument).filter(
        Instrument.business_id == business.id
    ).all()

    return instruments

@app.get("/instruments/{instrument_id}", response_model=InstrumentResponse)
def get_instrument(
    instrument_id: int,
    db: Session = Depends(get_db)
):
    instrument = db.query(Instrument).filter(
        Instrument.id == instrument_id
    ).first()

    if instrument is None:
        raise HTTPException(
            status_code=404,
            detail="Instrument not found"
        )

    return instrument

@app.post("/auth/login", response_model=TokenResponse)
def login(
    user_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role.value if hasattr(user.role, "value") else user.role
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@app.get("/auth/me", response_model=UserResponse)
def get_current_user_details(
    current_user: User = Depends(get_current_user)
):
    return current_user

@app.post("/applications", response_model=ApplicationResponse)
def create_application(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business = db.query(Business).filter(
        Business.user_id == current_user.id
    ).first()

    if business is None:
        raise HTTPException(
            status_code=404,
            detail="Business not found"
        )

    instrument = db.query(Instrument).filter(
        Instrument.id == application_data.instrument_id,
        Instrument.business_id == business.id
    ).first()

    if instrument is None:
        raise HTTPException(
            status_code=404,
            detail="Instrument not found"
        )

    new_application = Application(
        application_number=f"APP-{uuid4().hex[:8].upper()}",
        instrument_id=instrument.id,
        business_id=business.id,
        application_type=application_data.application_type,
        preferred_date=application_data.preferred_date,
        preferred_time=application_data.preferred_time,
        location=application_data.location,
        status="SUBMITTED"
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    return new_application

@app.get("/applications")
def get_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business = db.query(Business).filter(
        Business.user_id == current_user.id
    ).first()

    if business is None:
        raise HTTPException(
            status_code=404,
            detail="Business not found"
        )

    applications = (
        db.query(Application)
        .filter(Application.business_id == business.id)
        .order_by(Application.submitted_at.desc())
        .all()
    )

    result = []

    for application in applications:

        # Find the latest inspection for this application
        inspection = (
            db.query(Inspection)
            .filter(
                Inspection.application_id == application.id
            )
            .order_by(Inspection.id.desc())
            .first()
        )

        rejection_reason = None

        if inspection:
            inspection_result = (
                inspection.overall_result.value
                if hasattr(inspection.overall_result, "value")
                else inspection.overall_result
            )

            if inspection_result == "FAIL":
                rejection_reason = inspection.remarks

        result.append({
            "id": application.id,
            "applicationNumber": application.application_number,
            "instrumentId": application.instrument_id,
            "businessId": application.business_id,
            "applicationType": application.application_type,
            "preferredDate": application.preferred_date,
            "preferredTime": application.preferred_time,
            "location": application.location,
            "status": (
                application.status.value
                if hasattr(application.status, "value")
                else application.status
            ),
            "submittedAt": application.submitted_at,
            "updatedAt": application.updated_at,
            "rejectionReason": rejection_reason,
        })

    return result

@app.get("/applications/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    business = db.query(Business).filter(
        Business.user_id == current_user.id
    ).first()

    if business is None:
        raise HTTPException(
            status_code=404,
            detail="Business not found"
        )

    application = db.query(Application).filter(
        Application.id == application_id,
        Application.business_id == business.id
    ).first()

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    return application

@app.get("/admin/applications", response_model=list[ApplicationResponse])
def get_all_applications(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    applications = db.query(Application).order_by(
        Application.submitted_at.desc()
    ).all()

    return applications

@app.get(
    "/admin/applications/{application_id}/recommendations",
    response_model=list[OfficerRecommendationResponse]
)
def recommend_officers(
    application_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(
        Application.id == application_id
    ).first()

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    instrument = db.query(Instrument).filter(
        Instrument.id == application.instrument_id
    ).first()

    business = db.query(Business).filter(
        Business.id == application.business_id
    ).first()

    officers = db.query(Officer).all()

    recommendations = []

    for officer in officers:

        # Count active assignments
        workload = db.query(func.count(Assignment.id)).filter(
            Assignment.officer_id == officer.id,
            Assignment.assignment_status.in_(
                ["ASSIGNED", "ACCEPTED"]
            )
        ).scalar() or 0

        score = 0

        # Availability
        if officer.is_available:
            score += 40

        # District match
        if (
            business
            and business.district
            and business.district != "Not provided"
            and officer.district
            and business.district.lower() == officer.district.lower()
        ):
            score += 30

        # Specialization match
        if (
            officer.specialization
            and instrument
            and instrument.instrument_type
            and (
                instrument.instrument_type.lower()
                in officer.specialization.lower()
                or officer.specialization.lower()
                in instrument.instrument_type.lower()
            )
        ):
            score += 20

        # Lower workload = better score
        score += max(0, 10 - workload * 2)

        score = min(score, 100)

        recommendations.append(
            OfficerRecommendationResponse(
                officer_id=officer.id,
                officer_name=officer.user.full_name,
                officer_type=(
                    officer.officer_type.value
                    if hasattr(officer.officer_type, "value")
                    else officer.officer_type
                ),
                designation=officer.designation,
                district=officer.district,
                state=officer.state,
                specialization=officer.specialization,
                is_available=officer.is_available,
                current_workload=workload,
                recommendation_score=score
            )
        )

    recommendations.sort(
        key=lambda x: x.recommendation_score,
        reverse=True
    )

    return recommendations

@app.post(
    "/admin/applications/{application_id}/assign",
    response_model=AssignmentResponse
)
def assign_officer(
    application_id: int,
    assignment_data: AssignmentCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(
        Application.id == application_id
    ).first()

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    officer = db.query(Officer).filter(
        Officer.id == assignment_data.officer_id
    ).first()

    if officer is None:
        raise HTTPException(
            status_code=404,
            detail="Officer not found"
        )

    if not officer.is_available:
        raise HTTPException(
            status_code=400,
            detail="Officer is currently unavailable"
        )

    # Use customer's preferred schedule if admin didn't provide one
    scheduled_date = (
        assignment_data.scheduled_date
        or application.preferred_date
    )

    scheduled_time = (
        assignment_data.scheduled_time
        or application.preferred_time
    )

    if scheduled_date is None or scheduled_time is None:
        raise HTTPException(
            status_code=400,
            detail="Scheduled date and time are required"
        )

    # Calculate current workload
    workload = db.query(func.count(Assignment.id)).filter(
        Assignment.officer_id == officer.id,
        Assignment.assignment_status.in_(
            ["ASSIGNED", "ACCEPTED"]
        )
    ).scalar() or 0

    # Simple recommendation score
    score = 40 if officer.is_available else 0

    business = db.query(Business).filter(
        Business.id == application.business_id
    ).first()

    instrument = db.query(Instrument).filter(
        Instrument.id == application.instrument_id
    ).first()

    if (
        business
        and business.district != "Not provided"
        and officer.district
        and business.district.lower() == officer.district.lower()
    ):
        score += 30

    if (
        officer.specialization
        and instrument
        and (
            instrument.instrument_type.lower()
            in officer.specialization.lower()
            or officer.specialization.lower()
            in instrument.instrument_type.lower()
        )
    ):
        score += 20

    score += max(0, 10 - workload * 2)
    score = min(score, 100)

    new_assignment = Assignment(
        application_id=application.id,
        officer_id=officer.id,
        assigned_by=admin.id,
        scheduled_date=scheduled_date,
        scheduled_time=scheduled_time,
        assignment_status="ASSIGNED",
        recommendation_score=score
    )

    db.add(new_assignment)

    # Move application forward
    application.status = "SCHEDULED"

    db.commit()
    db.refresh(new_assignment)

    return new_assignment

@app.get(
    "/officer/assignments",
    response_model=list[OfficerAssignmentResponse]
)
def get_officer_assignments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    officer = db.query(Officer).filter(
        Officer.user_id == current_user.id
    ).first()

    if officer is None:
        raise HTTPException(
            status_code=404,
            detail="Officer profile not found"
        )

    assignments = db.query(Assignment).filter(
        Assignment.officer_id == officer.id,
        Assignment.assignment_status.in_(["ASSIGNED", "ACCEPTED"])
    ).order_by(
        Assignment.scheduled_date,
        Assignment.scheduled_time
    ).all()

    return assignments

@app.get("/officer/dashboard")
def get_officer_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    officer = db.query(Officer).filter(
        Officer.user_id == current_user.id
    ).first()

    if officer is None:
        raise HTTPException(
            status_code=404,
            detail="Officer profile not found"
        )

    today = date.today()

    # All applications assigned to this officer
    total_applications = (
        db.query(func.count(Assignment.id))
        .filter(Assignment.officer_id == officer.id)
        .scalar()
        or 0
    )

    # Applications currently waiting for officer action
    pending_statuses = [
        "SUBMITTED",
        "UNDER_REVIEW",
        "SCHEDULED",
        "INSPECTION",
    ]

    pending_review = (
        db.query(func.count(Application.id))
        .join(
            Assignment,
            Assignment.application_id == Application.id
        )
        .filter(
            Assignment.officer_id == officer.id,
            Application.status.in_(pending_statuses)
        )
        .scalar()
        or 0
    )

    # Today's active inspection assignments
    today_inspections = (
        db.query(func.count(Assignment.id))
        .filter(
            Assignment.officer_id == officer.id,
            Assignment.scheduled_date == today,
            Assignment.assignment_status.in_(["ASSIGNED", "ACCEPTED"])
        )
        .scalar()
        or 0
    )

    # Certificates issued by this officer
    certificates_issued = (
        db.query(func.count(Certificate.id))
        .filter(Certificate.officer_id == officer.id)
        .scalar()
        or 0
    )

    # Recent applications assigned to this officer
    recent_rows = (
        db.query(Application, Instrument, Business)
        .join(
            Assignment,
            Assignment.application_id == Application.id
        )
        .join(
            Instrument,
            Instrument.id == Application.instrument_id
        )
        .join(
            Business,
            Business.id == Application.business_id
        )
        .filter(
            Assignment.officer_id == officer.id
        )
        .order_by(Application.submitted_at.desc())
        .limit(4)
        .all()
    )

    recent_applications = []

    for application, instrument, business in recent_rows:
        recent_applications.append({
            "id": application.id,
            "application_number": application.application_number,
            "applicant": business.business_name,
            "instrument": instrument.instrument_type,
            "status": application.status,
        })

    # Today's inspection plan
    inspection_rows = (
        db.query(Application, Instrument, Business, Assignment)
        .join(
            Assignment,
            Assignment.application_id == Application.id
        )
        .join(
            Instrument,
            Instrument.id == Application.instrument_id
        )
        .join(
            Business,
            Business.id == Application.business_id
        )
        .filter(
            Assignment.officer_id == officer.id,
            Assignment.scheduled_date == today,
            Assignment.assignment_status.in_(["ASSIGNED", "ACCEPTED"])
        )
        .order_by(Assignment.scheduled_time)
        .all()
    )

    inspection_plan = []

    for application, instrument, business, assignment in inspection_rows:
        inspection_plan.append({
            "id": assignment.id,
            "application_id": application.id,
            "instrument": instrument.instrument_type,
            "applicant": business.business_name,
            "scheduled_date": assignment.scheduled_date,
            "scheduled_time": assignment.scheduled_time,
        })

    return {
        "officer": {
            "id": officer.id,
            "name": current_user.full_name,
            "role": (
                current_user.role.value
                if hasattr(current_user.role, "value")
                else current_user.role
            ),
            "employee_code": officer.employee_code,
            "designation": officer.designation,
            "district": officer.district,
        },
        "stats": {
            "totalApplications": total_applications,
            "pending": pending_review,
            "todayInspections": today_inspections,
            "approved": certificates_issued,
        },
        "recentApplications": recent_applications,
        "inspectionPlan": inspection_plan,
    }

@app.post(
    "/officer/applications/{application_id}/inspection",
    response_model=InspectionResponse
)
def submit_inspection(
    application_id: int,
    inspection_data: InspectionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    officer = db.query(Officer).filter(
        Officer.user_id == current_user.id
    ).first()

    if officer is None:
        raise HTTPException(
            status_code=404,
            detail="Officer profile not found"
        )

    assignment = db.query(Assignment).filter(
        Assignment.application_id == application_id,
        Assignment.officer_id == officer.id,
        Assignment.assignment_status.in_(["ASSIGNED", "ACCEPTED"])
    ).first()

    if assignment is None:
        raise HTTPException(
            status_code=403,
            detail="You are not assigned to this application"
        )

    application = db.query(Application).filter(
        Application.id == application_id
    ).first()

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    existing_inspection = db.query(Inspection).filter(
        Inspection.application_id == application_id
    ).first()

    if existing_inspection:
        raise HTTPException(
            status_code=400,
            detail="Inspection already submitted"
        )

    if inspection_data.result not in ["PASS", "FAIL"]:
        raise HTTPException(
            status_code=400,
            detail="Result must be PASS or FAIL"
        )

    now = datetime.now(timezone.utc)

    inspection = Inspection(
        application_id=application.id,
        officer_id=officer.id,
        started_at=now,
        completed_at=now,
        latitude=inspection_data.latitude,
        longitude=inspection_data.longitude,
        overall_result=inspection_data.result,
        remarks=inspection_data.remarks
    )

    db.add(inspection)

    assignment.assignment_status = "COMPLETED"

    if inspection_data.result == "PASS":
        application.status = "PASSED"
    else:
        application.status = "FAILED"

    db.commit()
    db.refresh(inspection)

    return inspection

@app.post(
    "/officer/applications/{application_id}/certificate",
    response_model=CertificateResponse
)
def generate_certificate(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    officer = db.query(Officer).filter(
        Officer.user_id == current_user.id
    ).first()

    if officer is None:
        raise HTTPException(
            status_code=404,
            detail="Officer profile not found"
        )

    application = db.query(Application).filter(
        Application.id == application_id
    ).first()

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    inspection = db.query(Inspection).filter(
        Inspection.application_id == application_id,
        Inspection.officer_id == officer.id
    ).first()

    if inspection is None:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found"
        )

    if inspection.overall_result != "PASS":
        raise HTTPException(
            status_code=400,
            detail="Certificate can only be generated for a passed inspection"
        )

    existing_certificate = db.query(Certificate).filter(
        Certificate.application_id == application_id
    ).first()

    if existing_certificate:
        raise HTTPException(
            status_code=400,
            detail="Certificate already generated"
        )

    instrument = db.query(Instrument).filter(
        Instrument.id == application.instrument_id
    ).first()

    business = db.query(Business).filter(
        Business.id == application.business_id
    ).first()

    if instrument is None or business is None:
        raise HTTPException(
            status_code=404,
            detail="Instrument or business not found"
        )

    verification_date = date.today()
    valid_until = verification_date + timedelta(days=365)

    certificate_number = f"CERT-{uuid4().hex[:8].upper()}"

    certificate_hash = hashlib.sha256(
        f"{certificate_number}-{application.id}-{instrument.instrument_id}".encode()
    ).hexdigest()

    os.makedirs("generated/certificates", exist_ok=True)
    os.makedirs("generated/qr", exist_ok=True)

    pdf_filename = f"{certificate_number}.pdf"
    pdf_path = os.path.join(
        "generated",
        "certificates",
        pdf_filename
    )

    pdf = canvas.Canvas(pdf_path, pagesize=A4)

    width, height = A4

    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawCentredString(
        width / 2,
        height - 80,
        "LEGAL METROLOGY VERIFICATION CERTIFICATE"
    )

    pdf.setFont("Helvetica", 12)

    pdf.drawString(
        60,
        height - 140,
        f"Certificate Number: {certificate_number}"
    )

    pdf.drawString(
        60,
        height - 165,
        f"Business: {business.business_name}"
    )

    pdf.drawString(
        60,
        height - 190,
        f"Instrument ID: {instrument.instrument_id}"
    )

    pdf.drawString(
        60,
        height - 215,
        f"Instrument Type: {instrument.instrument_type}"
    )

    pdf.drawString(
        60,
        height - 240,
        f"Manufacturer: {instrument.manufacturer or 'N/A'}"
    )

    pdf.drawString(
        60,
        height - 265,
        f"Model: {instrument.model or 'N/A'}"
    )

    pdf.drawString(
        60,
        height - 290,
        f"Serial Number: {instrument.serial_number or 'N/A'}"
    )

    pdf.drawString(
        60,
        height - 325,
        f"Verification Date: {verification_date}"
    )

    pdf.drawString(
        60,
        height - 350,
        f"Valid Until: {valid_until}"
    )

    pdf.setFont("Helvetica-Bold", 14)

    pdf.drawString(
        60,
        height - 400,
        "RESULT: VERIFIED / PASS"
    )

    pdf.setFont("Helvetica", 9)

    pdf.drawString(
        60,
        80,
        f"Certificate Hash: {certificate_hash}"
    )

    pdf.save()

    verification_url = (
        f"http://localhost:8000/verify/{certificate_number}"
    )

    qr = qrcode.make(verification_url)

    qr_filename = f"{certificate_number}.png"

    qr_path = os.path.join(
        "generated",
        "qr",
        qr_filename
    )

    qr.save(qr_path)

    certificate = Certificate(
        certificate_number=certificate_number,
        application_id=application.id,
        instrument_id=instrument.id,
        business_id=business.id,
        officer_id=officer.id,
        verification_date=verification_date,
        valid_until=valid_until,
        result="VALID",
        certificate_hash=certificate_hash,
        pdf_url=f"/files/certificates/{pdf_filename}"
    )

    db.add(certificate)

    application.status = "CERTIFICATE_GENERATED"

    db.commit()
    db.refresh(certificate)

    return certificate

@app.get("/certificates/{certificate_id}", response_model=CertificateResponse)
def get_certificate(
    certificate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    certificate = db.query(Certificate).filter(
        Certificate.id == certificate_id
    ).first()

    if certificate is None:
        raise HTTPException(
            status_code=404,
            detail="Certificate not found"
        )

    return certificate

@app.get("/verify/{certificate_number}")
def verify_certificate(
    certificate_number: str,
    db: Session = Depends(get_db)
):
    certificate = db.query(Certificate).filter(
        Certificate.certificate_number == certificate_number
    ).first()

    if certificate is None:
        raise HTTPException(
            status_code=404,
            detail="Certificate not found"
        )

    today = date.today()

    if certificate.result == "VALID" and certificate.valid_until >= today:
        status = "VALID"
        message = "CERTIFICATE VALID"

    elif certificate.valid_until < today:
        status = "EXPIRED"
        message = "CERTIFICATE EXPIRED"

    else:
        status = certificate.result
        message = f"CERTIFICATE {certificate.result}"

    return {
        "certificate_number": certificate.certificate_number,
        "status": status,
        "message": message,
        "verification_date": certificate.verification_date,
        "valid_until": certificate.valid_until,
        "application_id": certificate.application_id,
        "instrument_id": certificate.instrument_id,
        "business_id": certificate.business_id,
        "certificate_hash": certificate.certificate_hash
    }

@app.get(
    "/admin/users",
    response_model=list[AdminUserResponse]
)
def get_admin_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    users = (
        db.query(User)
        .order_by(User.id)
        .all()
    )

    return users

@app.get("/admin/instruments", response_model=list[InstrumentResponse])
def get_admin_instruments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    instruments = (
        db.query(Instrument)
        .order_by(Instrument.id.desc())
        .all()
    )

    return instruments

@app.get("/officer/applications")
def get_officer_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    officer = (
        db.query(Officer)
        .filter(Officer.user_id == current_user.id)
        .first()
    )

    if officer is None:
        raise HTTPException(
            status_code=404,
            detail="Officer profile not found"
        )

    rows = (
        db.query(Application, Instrument, Business, Assignment, User)
        .join(
            Assignment,
            Assignment.application_id == Application.id
        )
        .join(
            Instrument,
            Instrument.id == Application.instrument_id
        )
        .join(
            Business,
            Business.id == Application.business_id
        )
        .join(
            Officer,
            Officer.id == Assignment.officer_id
        )
        .join(
            User,
            User.id == Officer.user_id
        )
        .filter(
            Assignment.officer_id == officer.id
        )
        .order_by(Application.submitted_at.desc())
        .all()
    )

    applications = []

    for application, instrument, business, assignment, officer_user in rows:

        # Get documents uploaded for this application
        documents = (
            db.query(Document)
            .filter(
                Document.application_id == application.id
            )
            .order_by(Document.uploaded_at.asc())
            .all()
        )

        document_list = []

        for document in documents:
            document_type = (
                document.document_type.value
                if hasattr(document.document_type, "value")
                else document.document_type
            )

            document_list.append({
                "id": document.id,
                "type": document_type,
                "fileName": document.file_name,
                "fileUrl": document.file_url,
                "uploadedAt": document.uploaded_at,
            })

        applications.append({
            "id": application.id,
            "applicationNumber": application.application_number,

            # Business information
            "applicant": business.business_name,
            "owner": business.owner_name,

            # Instrument information
            "instrument": instrument.instrument_type,
            "serialNumber": instrument.serial_number,

            # Application information
            "location": application.location,
            "submittedDate": application.submitted_at.date(),

            # Assignment / schedule information
            "scheduledDate": assignment.scheduled_date,
            "scheduledTime": assignment.scheduled_time,
            "assignmentStatus": (
                assignment.assignment_status.value
                if hasattr(assignment.assignment_status, "value")
                else assignment.assignment_status
            ),

            # Officer
            "officer": officer_user.full_name,

            # Application status
            "status": (
                application.status.value
                if hasattr(application.status, "value")
                else application.status
            ),

            # Documents
            "documents": document_list,
            "documentCount": len(document_list),
        })

    return applications

@app.get("/officer/instruments")
def get_officer_instruments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    officer = (
        db.query(Officer)
        .filter(Officer.user_id == current_user.id)
        .first()
    )

    if officer is None:
        raise HTTPException(
            status_code=404,
            detail="Officer profile not found"
        )

    rows = (
        db.query(Instrument, Business, Application)
        .join(
            Application,
            Application.instrument_id == Instrument.id
        )
        .join(
            Assignment,
            Assignment.application_id == Application.id
        )
        .join(
            Business,
            Business.id == Application.business_id
        )
        .filter(
            Assignment.officer_id == officer.id
        )
        .order_by(Instrument.id.desc())
        .all()
    )

    instruments = []
    seen = set()

    for instrument, business, application in rows:
        if instrument.id in seen:
            continue

        seen.add(instrument.id)

        instruments.append({
            "id": instrument.id,
            "instrumentId": instrument.instrument_id,
            "instrument": instrument.instrument_type,
            "manufacturer": instrument.manufacturer,
            "model": instrument.model,
            "serialNumber": instrument.serial_number,
            "capacity": str(instrument.capacity),
            "capacityUnit": instrument.capacity_unit,
            "leastCount": str(instrument.least_count),
            "location": instrument.location,
            "status": (
                instrument.status.value
                if hasattr(instrument.status, "value")
                else instrument.status
            ),
            "applicant": business.business_name,
            "applicationNumber": application.application_number,
        })

    return instruments

@app.get("/officer/inspections")
def get_officer_inspections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    officer = (
        db.query(Officer)
        .filter(Officer.user_id == current_user.id)
        .first()
    )

    if officer is None:
        raise HTTPException(
            status_code=404,
            detail="Officer profile not found"
        )

    rows = (
        db.query(
            Inspection,
            Application,
            Instrument,
            Business
        )
        .join(
            Application,
            Application.id == Inspection.application_id
        )
        .join(
            Instrument,
            Instrument.id == Application.instrument_id
        )
        .join(
            Business,
            Business.id == Application.business_id
        )
        .filter(
            Inspection.officer_id == officer.id
        )
        .order_by(Inspection.started_at.desc())
        .all()
    )

    inspections = []

    for inspection, application, instrument, business in rows:
        inspections.append({
            "id": inspection.id,
            "applicationNumber": application.application_number,
            "applicant": business.business_name,
            "instrument": instrument.instrument_type,
            "serialNumber": instrument.serial_number,
            "location": application.location,
            "startedAt": inspection.started_at,
            "completedAt": inspection.completed_at,
            "result": (
                inspection.overall_result.value
                if hasattr(inspection.overall_result, "value")
                else inspection.overall_result
            ),
            "remarks": inspection.remarks,
            "latitude": (
                str(inspection.latitude)
                if inspection.latitude is not None
                else None
            ),
            "longitude": (
                str(inspection.longitude)
                if inspection.longitude is not None
                else None
            ),
        })

    return inspections

@app.get("/officer/certificates")
def get_officer_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    officer = (
        db.query(Officer)
        .filter(Officer.user_id == current_user.id)
        .first()
    )

    if officer is None:
        raise HTTPException(
            status_code=404,
            detail="Officer profile not found"
        )

    rows = (
        db.query(
            Certificate,
            Application,
            Instrument,
            Business
        )
        .join(
            Application,
            Application.id == Certificate.application_id
        )
        .join(
            Instrument,
            Instrument.id == Certificate.instrument_id
        )
        .join(
            Business,
            Business.id == Certificate.business_id
        )
        .filter(
            Certificate.officer_id == officer.id
        )
        .order_by(Certificate.issued_at.desc())
        .all()
    )

    certificates = []

    for certificate, application, instrument, business in rows:
        certificates.append({
            "id": certificate.id,
            "certificateNumber": certificate.certificate_number,
            "applicationNumber": application.application_number,
            "applicant": business.business_name,
            "instrument": instrument.instrument_type,
            "serialNumber": instrument.serial_number,
            "verificationDate": certificate.verification_date,
            "validUntil": certificate.valid_until,
            "result": (
                certificate.result.value
                if hasattr(certificate.result, "value")
                else certificate.result
            ),
            "certificateHash": certificate.certificate_hash,
            "pdfUrl": certificate.pdf_url,
            "issuedAt": certificate.issued_at,
        })

    return certificates

@app.get("/officer/users")
def get_officer_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    officer = (
        db.query(Officer)
        .filter(Officer.user_id == current_user.id)
        .first()
    )

    if officer is None:
        raise HTTPException(
            status_code=404,
            detail="Officer profile not found"
        )

    users = (
        db.query(User)
        .filter(User.role == "CUSTOMER")
        .order_by(User.id.desc())
        .all()
    )

    return [
        {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "role": "Business",
            "status": "Active" if user.is_active else "Inactive",
            "createdAt": user.created_at,
        }
        for user in users
    ]

@app.get("/certificates")
def get_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    business = (
        db.query(Business)
        .filter(Business.user_id == current_user.id)
        .first()
    )

    if business is None:
        raise HTTPException(
            status_code=404,
            detail="Business profile not found"
        )

    certificates = (
        db.query(Certificate)
        .filter(Certificate.business_id == business.id)
        .order_by(Certificate.id.desc())
        .all()
    )

    result = []

    for certificate in certificates:
        instrument = (
            db.query(Instrument)
            .filter(Instrument.id == certificate.instrument_id)
            .first()
        )

        result.append({
            "id": certificate.id,
            "certificateNumber": certificate.certificate_number,
            "instrument": instrument.instrument_type if instrument else "Instrument",
            "serialNumber": instrument.serial_number if instrument else None,
            "result": (
                certificate.result.value
                if hasattr(certificate.result, "value")
                else certificate.result
            ),
            "verificationDate": certificate.verification_date,
            "validUntil": certificate.valid_until,
            "pdfUrl": certificate.pdf_url,
        })

    return result