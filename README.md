# Code Agent

Code Agent là một ứng dụng AI thông minh hỗ trợ lập trình viên trong việc tạo, tối ưu hóa, dịch và giải thích mã nguồn. Ứng dụng kết hợp giao diện chat trực quan với editor mã nguồn mạnh mẽ và hệ thống học hỏi từ tương tác người dùng.

## Tính năng chính

- **AI-Powered Code Generation**: Tạo mã từ mô tả bằng ngôn ngữ tự nhiên
- **Code Optimization**: Tối ưu hóa mã nguồn hiện có với nhiều cấp độ tùy chỉnh
- **Code Translation**: Chuyển đổi mã nguồn giữa các ngôn ngữ lập trình khác nhau
- **Code Explanation**: Giải thích chi tiết mã nguồn và cách hoạt động
- **Code Snippets Management**: Lưu trữ và quản lý đoạn mã hay dùng
- **Personalized AI**: Hệ thống AI học hỏi từ tương tác và feedback để cá nhân hóa phản hồi
- **Chat Interface**: Giao diện chat thân thiện để tương tác với AI

## Kiến trúc ứng dụng

Ứng dụng được chia thành hai phần chính:

### Backend

- **Framework**: FastAPI
- **Database**: SQLite với SQLModel ORM
- **AI Integration**: Azure OpenAI
- **Authentication**: JWT-based (đơn giản hóa với anonymous users)

### Frontend

- **Framework**: React 18 với TypeScript
- **State Management**: Redux Toolkit
- **UI Library**: Material UI
- **Code Editor**: Monaco Editor
- **Styling**: Tailwind CSS + Material UI
- **Routing**: React Router

## Yêu cầu hệ thống

- Node.js 16+
- Python 3.8+
- Azure OpenAI API key
- Git

## Cài đặt và chạy

### Backend Setup

1. Clone repository:
   ```bash
   git clone https://github.com/dg-pham/codeAssistant.git
   ```

2. Tạo và kích hoạt môi trường ảo Python:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. Cài đặt dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Tạo file `.env` trong thư mục gốc với các thông tin sau:
   ```
   DATABASE_URL=sqlite:///code_agent.db
   AZURE_OPENAI_API_KEY=your_api_key
   AZURE_OPENAI_ENDPOINT=your_endpoint
   AZURE_OPENAI_API_VERSION=your_api_version
   AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
   ```

5. Alembic:
   ```bash
   cd backend
   alembic init migrations
   alembic revision --autogenerate -m "Initial database setup"
   alembic upgrade hea
   ```

6. Khởi chạy server:
   ```bash
   python main.py
   ```

Backend API sẽ chạy tại `http://localhost:8000`.

### Frontend Setup

1. Di chuyển đến thư mục frontend:
   ```bash
   cd frontend
   ```

2. Cài đặt dependencies:
   ```bash
   npm install
   ```

3. Tạo file `.env` trong thư mục frontend:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   VITE_APP_NAME=Code Agent
   ```

4. Khởi chạy ứng dụng:
   ```bash
   npm run dev
   ```

Frontend sẽ chạy tại `http://localhost:3000`.

## Cấu trúc thư mục

```
├── backend/                    # Backend code
│   ├── LLM_Bundle/             # LLM integration  
│   ├── agent_managers/         # Agent management
│   ├── db/                     # Database models and services
│   │   ├── models/             # Database models
│   │   └── services/           # Database services
│   ├── migrations/             # Alembic
│   ├── schemas/                # API schemas
│   ├── API/                    # API endpoints
│   │   └── endpoints/          # Route handlers
│   └── main.py                 # Entry point
│
├── frontend/                   # Frontend code
│   ├── public/                 # Static assets
│   └── src/
│       ├── api/                # API services
│       ├── components/         # UI components
│       │   ├── chat/           # Chat components
│       │   ├── code/           # Code editor components
│       │   └── layout/         # Layout components
│       ├── hooks/              # Custom React hooks
│       ├── pages/              # Application pages
│       ├── router/             # Routing configuration
│       ├── store/              # Redux store
│       │   └── slices/         # Redux slices
│       ├── styles/             # Global styles
│       ├── theme/              # Theme configuration
│       ├── contexts/           # Context definitions
│       ├── types/              # TypeScript type definitions
│       ├── utils/              # Utility functions
│       ├── App.tsx             # Root component
│       └── index.tsx           # Entry point
│
├── .gitignore                  # Git ignore file
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

## Sử dụng ứng dụng

### 1. Tạo tài khoản hoặc tiếp tục dưới dạng khách

Bạn có thể đăng ký tài khoản mới hoặc chọn "Continue as Guest" để bắt đầu sử dụng.

### 2. Tạo mã với AI

- Di chuyển đến tab "Chat" và mô tả mã bạn muốn tạo
- Hoặc sử dụng trang "Code Editor" và chọn "Generate Code"

### 3. Tối ưu hoặc dịch mã

- Dán mã vào Code Editor
- Chọn chức năng "Optimize" hoặc "Translate"
- Điều chỉnh các tùy chọn và chọn "Process"

### 4. Lưu và quản lý code snippets

- Sau khi tạo hoặc chỉnh sửa mã, chọn "Save"
- Quản lý các snippets từ trang "Snippets"

### 5. Tương tác với AI

Sử dụng giao diện chat để:
- Đặt câu hỏi về lập trình
- Yêu cầu giải thích mã
- Tạo mã từ mô tả
- Nhận đề xuất cải tiến mã

### 6. Quản lý Agent Memory

Trong phần "Settings > Agent Memory", bạn có thể:
- Xem thông tin AI đã học được về sở thích của bạn
- Điều chỉnh mức độ ưu tiên của từng memory
- Xóa các memory không mong muốn

## Công nghệ sử dụng

### Backend
- FastAPI
- SQLModel + SQLite
- Azure OpenAI
- Pydantic
- Uvicorn

### Frontend
- React 18
- TypeScript
- Redux Toolkit
- Material UI
- Monaco Editor
- React Router
- Axios
- Tailwind CSS

## Giấy phép

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

## Liên hệ

Nếu bạn có bất kỳ câu hỏi nào hoặc muốn đóng góp cho dự án, vui lòng liên hệ thông qua:
- GitHub Issues
- Email: [thegunners.ptd@gmail.com](mailto:thegunners.ptd@gmail.com)