from fastapi import FastAPI, APIRouter, Query, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import random
import math
import numpy as np
import hashlib
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Energy-Morph API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class GridMetrics(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str
    solar_output: float
    wind_output: float
    megapack_charge: float
    grid_demand: float
    efficiency_ratio: float
    zone: str

class KPIData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    total_renewable_output: float
    grid_uptime: float
    efficiency_gain: float
    co2_savings: float
    megapack_capacity: float
    peak_demand_handled: float
    sparkline_data: List[float]

class SNNPrediction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str
    predicted_demand: List[float]
    predicted_solar: List[float]
    predicted_wind: List[float]
    confidence: float
    spike_patterns: List[Dict[str, Any]]

class BlockchainTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tx_hash: str
    timestamp: str
    energy_type: str
    amount_kwh: float
    source: str
    destination: str
    verified: bool
    block_number: int

class HeatmapData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    zones: List[str]
    timestamps: List[str]
    power_values: List[List[float]]
    efficiency_values: List[List[float]]

class QueryRequest(BaseModel):
    query_type: str
    date_range: Optional[str] = "24h"
    zone: Optional[str] = None
    metric: Optional[str] = None

class QueryResponse(BaseModel):
    results: List[Dict[str, Any]]
    aggregations: Dict[str, Any]
    query_time_ms: float

# ==================== DATA GENERATION ====================

def generate_time_series(hours: int = 24, base: float = 100, variance: float = 20) -> List[float]:
    """Generate realistic time-series data with daily patterns"""
    data = []
    for i in range(hours):
        hour_factor = math.sin((i / 24) * 2 * math.pi - math.pi/2) * 0.3 + 1
        noise = random.gauss(0, variance)
        value = base * hour_factor + noise
        data.append(max(0, round(value, 2)))
    return data

def generate_snn_spike_patterns() -> List[Dict[str, Any]]:
    """Generate simplified SNN-inspired spike patterns for grid prediction"""
    patterns = []
    neuron_groups = ["solar_input", "wind_input", "demand_sensor", "storage_control", "grid_balance"]
    
    for group in neuron_groups:
        spike_times = sorted([random.uniform(0, 100) for _ in range(random.randint(5, 15))])
        patterns.append({
            "neuron_group": group,
            "spike_times": spike_times,
            "firing_rate": len(spike_times) / 100,
            "membrane_potential": random.uniform(-70, -50)
        })
    return patterns

def generate_blockchain_hash() -> str:
    """Generate mock blockchain transaction hash"""
    random_data = str(random.random()) + str(datetime.now(timezone.utc).timestamp())
    return "0x" + hashlib.sha256(random_data.encode()).hexdigest()

def generate_heatmap_data(zones: int = 6, hours: int = 24) -> Dict:
    """Generate heatmap data for power distribution visualization"""
    zone_names = [f"Zone_{chr(65+i)}" for i in range(zones)]
    timestamps = [(datetime.now(timezone.utc) - timedelta(hours=hours-i)).isoformat() for i in range(hours)]
    
    power_values = []
    efficiency_values = []
    
    for zone_idx in range(zones):
        zone_power = []
        zone_efficiency = []
        base_power = 50 + zone_idx * 20
        
        for hour_idx in range(hours):
            hour_factor = math.sin((hour_idx / 24) * 2 * math.pi - math.pi/2) * 0.3 + 1
            power = base_power * hour_factor + random.gauss(0, 10)
            efficiency = 0.7 + random.gauss(0, 0.1) + (power / 500)
            
            zone_power.append(round(max(0, power), 2))
            zone_efficiency.append(round(min(1, max(0, efficiency)), 3))
        
        power_values.append(zone_power)
        efficiency_values.append(zone_efficiency)
    
    return {
        "zones": zone_names,
        "timestamps": timestamps,
        "power_values": power_values,
        "efficiency_values": efficiency_values
    }

# ==================== API ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "Energy-Morph API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Grid Metrics Endpoints
@api_router.get("/grid/metrics", response_model=List[GridMetrics])
async def get_grid_metrics(hours: int = Query(default=24, le=168)):
    """Get grid metrics for the specified time range"""
    metrics = []
    zones = ["Zone_A", "Zone_B", "Zone_C", "Zone_D", "Zone_E", "Zone_F"]
    
    for i in range(hours):
        timestamp = (datetime.now(timezone.utc) - timedelta(hours=hours-i)).isoformat()
        for zone in zones:
            hour_factor = math.sin((i / 24) * 2 * math.pi - math.pi/2) * 0.3 + 1
            
            metrics.append(GridMetrics(
                timestamp=timestamp,
                solar_output=round(80 * hour_factor + random.gauss(0, 10), 2),
                wind_output=round(60 + random.gauss(0, 15), 2),
                megapack_charge=round(random.uniform(40, 95), 2),
                grid_demand=round(120 * hour_factor + random.gauss(0, 20), 2),
                efficiency_ratio=round(0.75 + random.gauss(0, 0.05), 3),
                zone=zone
            ))
    
    return metrics

@api_router.get("/grid/realtime")
async def get_realtime_metrics():
    """Get current real-time grid status"""
    zones = ["Zone_A", "Zone_B", "Zone_C", "Zone_D", "Zone_E", "Zone_F"]
    
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_generation": round(random.uniform(400, 600), 2),
        "total_demand": round(random.uniform(350, 550), 2),
        "grid_frequency": round(60 + random.gauss(0, 0.02), 3),
        "zones": {
            zone: {
                "power_output": round(random.uniform(50, 150), 2),
                "demand": round(random.uniform(40, 140), 2),
                "efficiency": round(random.uniform(0.7, 0.95), 3),
                "status": random.choice(["optimal", "nominal", "high_demand"])
            }
            for zone in zones
        }
    }

# KPI Endpoints
@api_router.get("/kpi/summary", response_model=KPIData)
async def get_kpi_summary():
    """Get summary KPIs for the dashboard"""
    return KPIData(
        total_renewable_output=round(random.uniform(450, 550), 2),
        grid_uptime=round(99.5 + random.uniform(0, 0.5), 2),
        efficiency_gain=round(25 + random.uniform(0, 10), 2),
        co2_savings=round(1200 + random.uniform(0, 300), 2),
        megapack_capacity=round(random.uniform(70, 95), 2),
        peak_demand_handled=round(random.uniform(85, 98), 2),
        sparkline_data=generate_time_series(24, 100, 15)
    )

@api_router.get("/kpi/aggregations")
async def get_kpi_aggregations(
    date_range: str = Query(default="24h", description="Time range: 1h, 24h, 7d, 30d")
):
    """Get aggregated KPIs using MongoDB-style aggregations"""
    # Simulate SQL-like aggregations with MongoDB pipelines
    hours = {"1h": 1, "24h": 24, "7d": 168, "30d": 720}.get(date_range, 24)
    
    return {
        "date_range": date_range,
        "aggregations": {
            "avg_efficiency": round(0.82 + random.gauss(0, 0.03), 3),
            "max_demand": round(550 + random.uniform(0, 100), 2),
            "min_demand": round(200 + random.uniform(0, 50), 2),
            "total_renewable_kwh": round(hours * 450 + random.uniform(0, 1000), 2),
            "peak_solar_output": round(120 + random.uniform(0, 30), 2),
            "peak_wind_output": round(90 + random.uniform(0, 25), 2),
            "uptime_percentage": round(99.5 + random.uniform(0, 0.5), 2)
        },
        "time_series": {
            "demand": generate_time_series(min(hours, 48), 400, 50),
            "generation": generate_time_series(min(hours, 48), 450, 40),
            "efficiency": [round(0.75 + random.gauss(0, 0.05), 3) for _ in range(min(hours, 48))]
        }
    }

# SNN Prediction Endpoints
@api_router.get("/snn/predictions", response_model=SNNPrediction)
async def get_snn_predictions():
    """Get SNN-based grid predictions for the next 24 hours"""
    return SNNPrediction(
        timestamp=datetime.now(timezone.utc).isoformat(),
        predicted_demand=generate_time_series(24, 420, 30),
        predicted_solar=generate_time_series(24, 80, 20),
        predicted_wind=generate_time_series(24, 60, 25),
        confidence=round(0.85 + random.uniform(0, 0.1), 3),
        spike_patterns=generate_snn_spike_patterns()
    )

@api_router.get("/snn/neuron-activity")
async def get_neuron_activity():
    """Get detailed SNN neuron group activity"""
    neuron_groups = {
        "solar_input": {"neurons": 100, "active": random.randint(20, 50)},
        "wind_input": {"neurons": 100, "active": random.randint(30, 60)},
        "demand_sensor": {"neurons": 150, "active": random.randint(40, 80)},
        "storage_control": {"neurons": 80, "active": random.randint(15, 40)},
        "grid_balance": {"neurons": 200, "active": random.randint(60, 120)}
    }
    
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "neuron_groups": neuron_groups,
        "total_spikes": sum(g["active"] for g in neuron_groups.values()),
        "network_state": "active",
        "learning_rate": round(0.01 + random.gauss(0, 0.002), 4)
    }

# Blockchain Tracking Endpoints
@api_router.get("/blockchain/transactions", response_model=List[BlockchainTransaction])
async def get_blockchain_transactions(limit: int = Query(default=20, le=100)):
    """Get recent blockchain transactions for renewable energy tracking"""
    transactions = []
    energy_types = ["solar", "wind", "hydro", "geothermal"]
    sources = ["GigaFactory_1", "GigaFactory_2", "Solar_Farm_A", "Wind_Farm_B", "Hydro_Plant_C"]
    destinations = ["Grid_Main", "Megapack_Bank_1", "Megapack_Bank_2", "Industrial_Zone", "Residential_Zone"]
    
    for i in range(limit):
        transactions.append(BlockchainTransaction(
            tx_hash=generate_blockchain_hash(),
            timestamp=(datetime.now(timezone.utc) - timedelta(minutes=i*5)).isoformat(),
            energy_type=random.choice(energy_types),
            amount_kwh=round(random.uniform(50, 500), 2),
            source=random.choice(sources),
            destination=random.choice(destinations),
            verified=random.random() > 0.05,
            block_number=15000000 + random.randint(0, 100000)
        ))
    
    return transactions

@api_router.get("/blockchain/summary")
async def get_blockchain_summary():
    """Get blockchain tracking summary"""
    return {
        "total_tracked_kwh": round(random.uniform(50000, 100000), 2),
        "verified_transactions": random.randint(900, 1000),
        "pending_transactions": random.randint(0, 10),
        "renewable_percentage": round(random.uniform(85, 98), 2),
        "by_source": {
            "solar": round(random.uniform(30, 40), 1),
            "wind": round(random.uniform(25, 35), 1),
            "hydro": round(random.uniform(15, 25), 1),
            "geothermal": round(random.uniform(5, 15), 1)
        },
        "last_block": 15000000 + random.randint(0, 100000),
        "network_hash_rate": f"{round(random.uniform(100, 200), 2)} TH/s"
    }

# Heatmap Endpoints
@api_router.get("/heatmap/data", response_model=HeatmapData)
async def get_heatmap_data(hours: int = Query(default=24, le=168)):
    """Get heatmap data for power zone visualization"""
    data = generate_heatmap_data(6, hours)
    return HeatmapData(**data)

@api_router.get("/heatmap/realtime")
async def get_realtime_heatmap():
    """Get real-time heatmap data for morphing visualization"""
    zones = ["Zone_A", "Zone_B", "Zone_C", "Zone_D", "Zone_E", "Zone_F"]
    
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "zones": {
            zone: {
                "power_level": round(random.uniform(30, 100), 2),
                "efficiency": round(random.uniform(0.7, 0.95), 3),
                "status": random.choice(["optimal", "nominal", "high_load", "low_load"]),
                "color_intensity": round(random.uniform(0.3, 1.0), 2)
            }
            for zone in zones
        }
    }

# Query Interface Endpoints
@api_router.post("/query/execute", response_model=QueryResponse)
async def execute_query(request: QueryRequest):
    """Execute ad-hoc queries with MongoDB aggregation pipelines"""
    import time
    start_time = time.time()
    
    # Simulate different query types
    results = []
    aggregations = {}
    
    hours = {"1h": 1, "24h": 24, "7d": 168, "30d": 720}.get(request.date_range, 24)
    
    if request.query_type == "efficiency":
        results = [
            {"zone": f"Zone_{chr(65+i)}", "avg_efficiency": round(0.75 + random.gauss(0, 0.05), 3)}
            for i in range(6)
        ]
        aggregations = {"overall_avg": round(0.82, 3), "best_zone": "Zone_C", "worst_zone": "Zone_F"}
    
    elif request.query_type == "demand":
        results = [
            {"hour": i, "demand_mw": round(400 + random.gauss(0, 50), 2)}
            for i in range(min(hours, 48))
        ]
        aggregations = {"peak_demand": round(550, 2), "min_demand": round(250, 2), "avg_demand": round(400, 2)}
    
    elif request.query_type == "renewable":
        results = [
            {"source": src, "output_kwh": round(random.uniform(1000, 5000), 2)}
            for src in ["solar", "wind", "hydro", "geothermal"]
        ]
        aggregations = {"total_renewable": round(sum(r["output_kwh"] for r in results), 2), "renewable_ratio": round(0.87, 2)}
    
    elif request.query_type == "zone":
        zone = request.zone or "Zone_A"
        results = [
            {"timestamp": (datetime.now(timezone.utc) - timedelta(hours=i)).isoformat(), 
             "power": round(100 + random.gauss(0, 20), 2)}
            for i in range(min(hours, 48))
        ]
        aggregations = {"zone": zone, "avg_power": round(100, 2), "peak_power": round(140, 2)}
    
    else:
        results = [{"message": "Unknown query type"}]
        aggregations = {}
    
    query_time = (time.time() - start_time) * 1000
    
    return QueryResponse(
        results=results,
        aggregations=aggregations,
        query_time_ms=round(query_time, 2)
    )

# Export Endpoints
@api_router.get("/export/csv")
async def export_csv(data_type: str = Query(default="metrics")):
    """Generate CSV export data"""
    if data_type == "metrics":
        headers = ["timestamp", "zone", "solar_output", "wind_output", "demand", "efficiency"]
        rows = []
        for i in range(24):
            ts = (datetime.now(timezone.utc) - timedelta(hours=i)).isoformat()
            for zone in ["Zone_A", "Zone_B", "Zone_C"]:
                rows.append({
                    "timestamp": ts,
                    "zone": zone,
                    "solar_output": round(random.uniform(50, 100), 2),
                    "wind_output": round(random.uniform(40, 80), 2),
                    "demand": round(random.uniform(100, 200), 2),
                    "efficiency": round(random.uniform(0.7, 0.95), 3)
                })
        return {"headers": headers, "rows": rows, "filename": f"metrics_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
    
    return {"error": "Unknown data type"}

@api_router.get("/export/report")
async def generate_report():
    """Generate summary report data"""
    return {
        "report_title": "Energy-Morph Grid Performance Report",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "period": "Last 24 Hours",
        "summary": {
            "grid_uptime": "99.7%",
            "efficiency_gain": "+30%",
            "renewable_ratio": "87%",
            "co2_savings": "1,450 tons"
        },
        "highlights": [
            "Peak demand of 542 MW handled successfully at 14:00",
            "Solar output exceeded forecast by 12%",
            "Megapack discharge optimized for peak shaving",
            "SNN predictions achieved 92% accuracy"
        ],
        "recommendations": [
            "Consider expanding Zone_C capacity",
            "Wind turbine maintenance recommended for Unit 7",
            "Storage optimization potential in overnight hours"
        ]
    }

# Scenario Endpoints
@api_router.get("/scenarios/list")
async def get_scenarios():
    """Get available simulation scenarios"""
    return {
        "scenarios": [
            {"id": "peak_ai", "name": "Peak AI Training Load", "description": "Simulate high GPU cluster demand"},
            {"id": "solar_peak", "name": "Solar Peak Production", "description": "Midday solar maximum scenario"},
            {"id": "grid_outage", "name": "Grid Outage Recovery", "description": "Test Megapack backup response"},
            {"id": "demand_surge", "name": "Demand Surge", "description": "Sudden 40% demand increase"},
            {"id": "wind_drop", "name": "Wind Power Drop", "description": "Wind turbine output reduction"}
        ]
    }

@api_router.post("/scenarios/simulate")
async def simulate_scenario(scenario_id: str = Query(...)):
    """Run a scenario simulation"""
    scenarios = {
        "peak_ai": {"demand_increase": 35, "megapack_discharge": 60, "efficiency_impact": -5},
        "solar_peak": {"solar_boost": 40, "storage_charge": 25, "efficiency_impact": 10},
        "grid_outage": {"megapack_discharge": 90, "islanding_mode": True, "recovery_time_sec": 0.2},
        "demand_surge": {"demand_increase": 40, "price_spike": 25, "load_shedding": False},
        "wind_drop": {"wind_reduction": 50, "solar_compensation": 15, "storage_support": 30}
    }
    
    if scenario_id not in scenarios:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    scenario = scenarios[scenario_id]
    
    return {
        "scenario_id": scenario_id,
        "simulation_result": "success",
        "parameters": scenario,
        "impact": {
            "grid_stability": round(random.uniform(0.9, 1.0), 3),
            "cost_impact_usd": round(random.uniform(-1000, 5000), 2),
            "renewable_utilization": round(random.uniform(0.7, 0.95), 2)
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Include the router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
