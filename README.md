# Energy-Morph Dashboard

<div align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
</div>

<br />

<div align="center">
  <strong>🔋 Adaptive Power Grid Management Dashboard for Tesla Gigafactories</strong>
  <br />
  <em>Featuring SNN-inspired predictions, blockchain energy tracking, and real-time monitoring</em>
</div>

---

## 🚀 Live Demo

**[View Live Dashboard](https://megapack-dash.preview.emergentagent.com)**

---

## 📋 Overview

Energy-Morph is a cutting-edge dashboard application designed for adaptive power grid management in Tesla Gigafactories. It showcases modern approaches to energy monitoring, predictive maintenance, and renewable energy tracking using simulated Spiking Neural Network (SNN) predictions and blockchain-based energy verification.

### Key Features

- **📊 Real-Time KPI Monitoring** - Grid uptime, efficiency gains, renewable output, CO₂ savings with sparklines
- **🗺️ Power Zone Heatmap** - Interactive visualization of power distribution across 6 zones
- **🧠 SNN Predictions** - Neural network-inspired demand and generation forecasting
- **⛓️ Blockchain Tracking** - Transparent renewable energy transaction verification
- **🔍 Query Interface** - Ad-hoc analysis with efficiency, demand, and zone queries
- **🎮 Scenario Simulator** - Test grid responses to various conditions
- **🌓 Dark/Light Mode** - Premium UI with Tesla-inspired color scheme
- **📥 Export Options** - PDF dashboard summary, CSV data, and detailed reports

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Energy-Morph Dashboard                    │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React 19)                                         │
│  ├── Recharts - Interactive data visualization              │
│  ├── Framer Motion - Smooth animations                      │
│  ├── Tailwind CSS + Shadcn/UI - Premium styling             │
│  └── jsPDF + html2canvas - PDF export                       │
├─────────────────────────────────────────────────────────────┤
│  Backend (FastAPI)                                           │
│  ├── RESTful API endpoints                                  │
│  ├── Simulated SNN predictions                              │
│  ├── Mock blockchain transactions                           │
│  └── Time-series data generation                            │
├─────────────────────────────────────────────────────────────┤
│  Database (MongoDB)                                          │
│  └── Persistent data storage                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Recharts** - Declarative charting library
- **Framer Motion** - Animation library
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Accessible component library
- **jsPDF** - Client-side PDF generation
- **Axios** - HTTP client

### Backend
- **FastAPI** - High-performance Python framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **NumPy/Pandas** - Data processing

### Infrastructure
- **MongoDB** - NoSQL database
- **Docker** - Containerization (optional)

---

## 📁 Project Structure

```
/app
├── backend/
│   ├── server.py          # FastAPI application & API endpoints
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── KPICards.jsx
│   │   │   ├── MorphingHeatmap.jsx
│   │   │   ├── SNNPredictions.jsx
│   │   │   ├── BlockchainTracker.jsx
│   │   │   ├── QueryInterface.jsx
│   │   │   ├── ScenarioPanel.jsx
│   │   │   ├── RealtimeMetrics.jsx
│   │   │   ├── OnboardingTour.jsx
│   │   │   └── ui/       # Shadcn components
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   ├── App.js        # Main app with theme provider
│   │   ├── index.css     # Global styles & theme
│   │   └── App.css       # Component styles
│   ├── package.json
│   └── .env
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ & Yarn
- Python 3.10+
- MongoDB 6.0+

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/energy-morph-dashboard.git
cd energy-morph-dashboard
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
cd frontend
yarn install
```

4. **Environment Configuration**

Backend `.env`:
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="energy_morph"
CORS_ORIGINS="*"
```

Frontend `.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

5. **Start the Application**

```bash
# Terminal 1 - Backend
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Terminal 2 - Frontend
cd frontend
yarn start
```

6. **Access the Dashboard**
Open [http://localhost:3000](http://localhost:3000)

---

## 📡 API Endpoints

### Grid Metrics
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/grid/metrics` | GET | Historical grid metrics |
| `/api/grid/realtime` | GET | Real-time grid status |

### KPIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/kpi/summary` | GET | Dashboard KPIs with sparklines |
| `/api/kpi/aggregations` | GET | Time-range aggregations |

### SNN Predictions
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/snn/predictions` | GET | 24-hour demand/generation forecasts |
| `/api/snn/neuron-activity` | GET | Neural network activity |

### Blockchain
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/blockchain/transactions` | GET | Energy transaction history |
| `/api/blockchain/summary` | GET | Blockchain tracking summary |

### Heatmap
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/heatmap/data` | GET | Historical zone data |
| `/api/heatmap/realtime` | GET | Real-time zone status |

### Query & Scenarios
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/query/execute` | POST | Execute ad-hoc queries |
| `/api/scenarios/list` | GET | Available simulation scenarios |
| `/api/scenarios/simulate` | POST | Run scenario simulation |

### Export
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/export/csv` | GET | CSV data export |
| `/api/export/report` | GET | Generate summary report |

---

## 🎨 Design System

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Electric Blue | `#00BFFF` | Energy flows, primary actions |
| Forest Green | `#228B22` | Efficiency, renewable, success |
| Tesla Red | `#E82127` | Alerts, high demand |
| Metallic Silver | `#C0C0C0` | Borders, dividers |
| Dark Surface | `#0F0F10` | Cards in dark mode |

### Typography
- **Headings**: Manrope (300, 700)
- **Body**: IBM Plex Sans (400, 500)
- **Data/Code**: JetBrains Mono (400)

---

## 🔮 Connection to Predictive Maintenance in Manufacturing

Energy-Morph demonstrates key concepts applicable to **predictive maintenance** in manufacturing environments:

### 1. **Real-Time Monitoring**
- Continuous tracking of equipment status (power zones)
- Instant alerts for anomalies (high load, efficiency drops)
- Live data feeds with 5-second refresh intervals

### 2. **Neural Network Predictions**
- SNN-inspired forecasting simulates how ML models predict:
  - Equipment failure before it happens
  - Demand spikes requiring maintenance scheduling
  - Optimal times for preventive maintenance

### 3. **Pattern Recognition**
- Heatmap visualization reveals:
  - Zones under consistent stress (predictive wear indicators)
  - Time-based patterns (shift correlations)
  - Efficiency degradation trends

### 4. **Scenario Simulation**
- Test "what-if" scenarios similar to:
  - Equipment failure impact analysis
  - Maintenance scheduling optimization
  - Capacity planning under various conditions

### 5. **Data-Driven Decision Making**
- Query interface for custom analysis
- Aggregation pipelines for historical trends
- Export capabilities for reporting and ML training data

---

## 📊 Screenshots

### Main Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Energy-Morph+Dashboard)

### SNN Predictions
![Predictions](https://via.placeholder.com/800x400?text=SNN+Predictions)

### Blockchain Tracking
![Blockchain](https://via.placeholder.com/800x400?text=Blockchain+Tracking)

---

## 🛠️ Future Enhancements

- [ ] User authentication & role-based access
- [ ] Real-time WebSocket connections
- [ ] Integration with actual grid data APIs
- [ ] Advanced ML models for predictions
- [ ] Mobile-responsive optimizations
- [ ] Multi-factory support

---

## 📄 License

MIT License - feel free to use for personal and commercial projects.

---

## 👨‍💻 Author

Built with ⚡ for Tesla Gigafactory energy management demonstration.

---

<div align="center">
  <strong>Energy-Morph Dashboard</strong>
  <br />
  <em>Powering the future of sustainable manufacturing</em>
</div>
