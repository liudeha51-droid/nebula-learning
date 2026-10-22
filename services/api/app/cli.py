import getpass
import argparse
from sqlalchemy import select
from .db import SessionLocal
from .models import User
from .seed import seed
from .config import settings


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('command',choices=['seed','admin'])
    args=parser.parse_args()
    with SessionLocal.begin() as db:
        if args.command=='seed':
            if settings.environment!='development': raise SystemExit('Development fixtures cannot seed production')
            seed(db); print('Development fixtures loaded idempotently; no real AI reviews claimed.')
        else:
            from .main import ph
            email=input('Admin email: ').strip().lower()
            password=getpass.getpass('Admin password (12+ characters): ')
            if len(password)<12 or '@' not in email: raise SystemExit('Invalid email or weak password')
            if db.scalar(select(User).where(User.email==email)): raise SystemExit('User already exists; no role changed')
            db.add(User(email=email,name='Administrator',password_hash=ph.hash(password),role='admin',profile={}))
            print('Administrator created; password not stored in plaintext.')


if __name__=='__main__': main()
