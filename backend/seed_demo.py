from database import SessionLocal
from models import User, Officer
from auth import hash_password


db = SessionLocal()

try:
    # -------------------------
    # ADMIN
    # -------------------------

    admin = db.query(User).filter(
        User.email == "admin@sih.gov.in"
    ).first()

    if admin is None:
        admin = User(
            full_name="System Administrator",
            email="admin@sih.gov.in",
            phone="9000000001",
            password_hash=hash_password("Admin@123"),
            role="ADMIN",
            is_active=True
        )

        db.add(admin)
        db.flush()

        print("Admin created")

    # -------------------------
    # OFFICER 1
    # -------------------------

    officer_user = db.query(User).filter(
        User.email == "officer1@sih.gov.in"
    ).first()

    if officer_user is None:
        officer_user = User(
            full_name="Rajesh Kumar",
            email="officer1@sih.gov.in",
            phone="9000000002",
            password_hash=hash_password("Officer@123"),
            role="LMO",
            is_active=True
        )

        db.add(officer_user)
        db.flush()

        officer = Officer(
            user_id=officer_user.id,
            officer_type="LMO",
            designation="Legal Metrology Officer",
            employee_code="LMO-001",
            district="Delhi",
            state="Delhi",
            specialization="Electronic Weighing Machine",
            is_available=True
        )

        db.add(officer)

    # -------------------------
    # OFFICER 2
    # -------------------------

    officer_user2 = db.query(User).filter(
        User.email == "officer2@sih.gov.in"
    ).first()

    if officer_user2 is None:
        officer_user2 = User(
            full_name="Amit Sharma",
            email="officer2@sih.gov.in",
            phone="9000000003",
            password_hash=hash_password("Officer@123"),
            role="GATC",
            is_active=True
        )

        db.add(officer_user2)
        db.flush()

        officer2 = Officer(
            user_id=officer_user2.id,
            officer_type="GATC",
            designation="GATC Officer",
            employee_code="GATC-001",
            district="Delhi",
            state="Delhi",
            specialization="Weighing Instruments",
            is_available=True
        )

        db.add(officer2)

    db.commit()

    print("Demo data created successfully")

finally:
    db.close()