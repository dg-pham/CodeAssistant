import os

from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine, Session

load_dotenv()

# Sử dụng biến môi trường hoặc mặc định
DATABASE_URL = os.getenv("DATABASE_URL")

# Tạo engine
engine = create_engine(
    DATABASE_URL,
    echo=True,  # In các SQL query, nên tắt trong môi trường production
    connect_args={"check_same_thread": False}  # Chỉ cần cho SQLite
)

# Hàm tạo session để sử dụng với FastAPI Depends
def get_session():
    with Session(engine) as session:
        yield session

# Hàm khởi tạo database
def init_database():
    SQLModel.metadata.create_all(engine)