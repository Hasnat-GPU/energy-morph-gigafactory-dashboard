#!/usr/bin/env python3
"""
Energy-Morph Dashboard Backend API Testing
Tests all API endpoints for the Tesla Gigafactory power grid management system.
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, List, Any

class EnergyMorphAPITester:
    def __init__(self, base_url="https://megapack-dash.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int = 200, 
                 data: Dict = None, params: Dict = None) -> tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        self.tests_run += 1
        
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, params=params, timeout=10)
            elif method == 'POST':
                response = self.session.post(url, json=data, params=params, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, list) and len(response_data) > 0:
                        print(f"   Response: List with {len(response_data)} items")
                    elif isinstance(response_data, dict):
                        print(f"   Response keys: {list(response_data.keys())[:5]}")
                    return True, response_data
                except:
                    return True, {}
            else:
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200] if response.text else "No response"
                })
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_endpoints(self):
        """Test basic health and info endpoints"""
        print("\n" + "="*50)
        print("TESTING HEALTH & INFO ENDPOINTS")
        print("="*50)
        
        self.run_test("API Root", "GET", "")
        self.run_test("Health Check", "GET", "health")

    def test_grid_metrics(self):
        """Test grid metrics endpoints"""
        print("\n" + "="*50)
        print("TESTING GRID METRICS ENDPOINTS")
        print("="*50)
        
        # Test grid metrics with different parameters
        self.run_test("Grid Metrics (24h)", "GET", "grid/metrics")
        self.run_test("Grid Metrics (48h)", "GET", "grid/metrics", params={"hours": 48})
        self.run_test("Grid Metrics (1h)", "GET", "grid/metrics", params={"hours": 1})
        
        # Test realtime metrics
        self.run_test("Realtime Grid Metrics", "GET", "grid/realtime")

    def test_kpi_endpoints(self):
        """Test KPI endpoints"""
        print("\n" + "="*50)
        print("TESTING KPI ENDPOINTS")
        print("="*50)
        
        self.run_test("KPI Summary", "GET", "kpi/summary")
        self.run_test("KPI Aggregations (24h)", "GET", "kpi/aggregations")
        self.run_test("KPI Aggregations (7d)", "GET", "kpi/aggregations", params={"date_range": "7d"})

    def test_snn_endpoints(self):
        """Test SNN prediction endpoints"""
        print("\n" + "="*50)
        print("TESTING SNN PREDICTION ENDPOINTS")
        print("="*50)
        
        self.run_test("SNN Predictions", "GET", "snn/predictions")
        self.run_test("Neuron Activity", "GET", "snn/neuron-activity")

    def test_blockchain_endpoints(self):
        """Test blockchain tracking endpoints"""
        print("\n" + "="*50)
        print("TESTING BLOCKCHAIN ENDPOINTS")
        print("="*50)
        
        self.run_test("Blockchain Transactions", "GET", "blockchain/transactions")
        self.run_test("Blockchain Transactions (limit 5)", "GET", "blockchain/transactions", params={"limit": 5})
        self.run_test("Blockchain Summary", "GET", "blockchain/summary")

    def test_heatmap_endpoints(self):
        """Test heatmap data endpoints"""
        print("\n" + "="*50)
        print("TESTING HEATMAP ENDPOINTS")
        print("="*50)
        
        self.run_test("Heatmap Data (24h)", "GET", "heatmap/data")
        self.run_test("Heatmap Data (48h)", "GET", "heatmap/data", params={"hours": 48})
        self.run_test("Realtime Heatmap", "GET", "heatmap/realtime")

    def test_query_endpoints(self):
        """Test query interface endpoints"""
        print("\n" + "="*50)
        print("TESTING QUERY INTERFACE ENDPOINTS")
        print("="*50)
        
        # Test different query types
        queries = [
            {"query_type": "efficiency", "date_range": "24h"},
            {"query_type": "demand", "date_range": "24h"},
            {"query_type": "renewable", "date_range": "7d"},
            {"query_type": "zone", "date_range": "24h", "zone": "Zone_A"}
        ]
        
        for i, query in enumerate(queries):
            self.run_test(f"Query Execute ({query['query_type']})", "POST", "query/execute", data=query)

    def test_export_endpoints(self):
        """Test export functionality"""
        print("\n" + "="*50)
        print("TESTING EXPORT ENDPOINTS")
        print("="*50)
        
        self.run_test("Export CSV", "GET", "export/csv")
        self.run_test("Export CSV (metrics)", "GET", "export/csv", params={"data_type": "metrics"})
        self.run_test("Generate Report", "GET", "export/report")

    def test_scenario_endpoints(self):
        """Test scenario simulation endpoints"""
        print("\n" + "="*50)
        print("TESTING SCENARIO ENDPOINTS")
        print("="*50)
        
        self.run_test("List Scenarios", "GET", "scenarios/list")
        
        # Test scenario simulations
        scenarios = ["peak_ai", "solar_peak", "grid_outage", "demand_surge", "wind_drop"]
        for scenario in scenarios:
            self.run_test(f"Simulate {scenario}", "POST", "scenarios/simulate", params={"scenario_id": scenario})

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Energy-Morph Dashboard API Tests")
        print(f"🌐 Base URL: {self.base_url}")
        print(f"📡 API URL: {self.api_url}")
        
        start_time = datetime.now()
        
        # Run all test suites
        self.test_health_endpoints()
        self.test_grid_metrics()
        self.test_kpi_endpoints()
        self.test_snn_endpoints()
        self.test_blockchain_endpoints()
        self.test_heatmap_endpoints()
        self.test_query_endpoints()
        self.test_export_endpoints()
        self.test_scenario_endpoints()
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Print final results
        print("\n" + "="*60)
        print("📊 FINAL TEST RESULTS")
        print("="*60)
        print(f"✅ Tests passed: {self.tests_passed}/{self.tests_run}")
        print(f"⏱️  Total time: {duration:.2f} seconds")
        print(f"📈 Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed tests ({len(self.failed_tests)}):")
            for failure in self.failed_tests:
                error_msg = failure.get('error', f"Status {failure.get('actual', 'unknown')}")
                print(f"   • {failure['test']}: {error_msg}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = EnergyMorphAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())