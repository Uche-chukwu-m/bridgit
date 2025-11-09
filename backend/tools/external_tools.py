import requests
import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

MAPBOX_TOKEN = os.getenv("VITE_MAPBOX_TOKEN")
OPENWEATHER_KEY = os.getenv("OPENWEATHER_API_KEY")

class ExternalTools:
    """Tools that agents can use"""
    
    @staticmethod
    def geocode_location(address: str) -> Dict[str, Any]:
        """
        Convert address to coordinates using Mapbox
        Falls back to mock coordinates if API fails
        """
        if not MAPBOX_TOKEN:
            print("No Mapbox token, using mock geocoding")
            return ExternalTools._get_mock_geocoding(address)
            
        try:
            url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{address}.json"
            params = {
                "access_token": MAPBOX_TOKEN,
                "limit": 1
            }
            response = requests.get(url, params=params, timeout=5)
            
            if response.status_code != 200:
                print(f"Mapbox API error: {response.status_code}, using mock data")
                return ExternalTools._get_mock_geocoding(address)
                
            data = response.json()
            
            if data.get("features"):
                feature = data["features"][0]
                coords = feature["geometry"]["coordinates"]
                return {
                    "success": True,
                    "longitude": coords[0],
                    "latitude": coords[1],
                    "place_name": feature.get("place_name"),
                    "tool_used": "mapbox_geocoding"
                }
            else:
                return ExternalTools._get_mock_geocoding(address)
                
        except Exception as e:
            print(f"Geocoding failed: {e}, using mock data")
            return ExternalTools._get_mock_geocoding(address)
    
    @staticmethod
    def _get_mock_geocoding(address: str) -> Dict[str, Any]:
        """
        Return mock coordinates for common cities
        """
        mock_locations = {
            "boston": {"lat": 42.3601, "lon": -71.0589, "name": "Boston, MA"},
            "new york": {"lat": 40.7128, "lon": -74.0060, "name": "New York, NY"},
            "chicago": {"lat": 41.8781, "lon": -87.6298, "name": "Chicago, IL"},
            "los angeles": {"lat": 34.0522, "lon": -118.2437, "name": "Los Angeles, CA"},
        }
        
        address_lower = address.lower()
        for key, coords in mock_locations.items():
            if key in address_lower:
                return {
                    "success": True,
                    "longitude": coords["lon"],
                    "latitude": coords["lat"],
                    "place_name": coords["name"],
                    "tool_used": "mock_geocoding",
                    "note": "Using mock data - Mapbox API unavailable"
                }
        
        # Default to Boston
        return {
            "success": True,
            "longitude": -71.0589,
            "latitude": 42.3601,
            "place_name": "Boston, MA (default)",
            "tool_used": "mock_geocoding",
            "note": "Unknown location - defaulting to Boston"
        }
    
    @staticmethod
    def query_bridges_nearby(lat: float, lon: float, radius_km: float = 10) -> Dict[str, Any]:
        """
        Query OpenStreetMap for bridges near location
        Falls back to mock data if API fails
        """
        try:
            # Overpass API query
            query = f"""
            [out:json][timeout:10];
            (
              way(around:{radius_km * 1000},{lat},{lon})["bridge"="yes"]["maxheight"];
              way(around:{radius_km * 1000},{lat},{lon})["bridge"]["maxheight"];
            );
            out body;
            >;
            out skel qt;
            """
            
            url = "https://overpass-api.de/api/interpreter"
            response = requests.post(url, data=query, timeout=15)
            data = response.json()
            
            bridges = []
            elements = data.get("elements", [])
            
            for element in elements:
                if element.get("type") == "way" and element.get("tags", {}).get("maxheight"):
                    tags = element.get("tags", {})
                    bridges.append({
                        "osm_id": element.get("id"),
                        "name": tags.get("name", "Unnamed Bridge"),
                        "maxheight": tags.get("maxheight"),
                        "bridge_type": tags.get("bridge"),
                        "ref": tags.get("ref", "")
                    })
            
            if bridges:
                return {
                    "success": True,
                    "bridges_found": len(bridges),
                    "bridges": bridges[:10],  # Limit to 10
                    "tool_used": "osm_overpass_api"
                }
            else:
                # No bridges found, return mock data for demo
                return ExternalTools._get_mock_bridges(lat, lon)
                
        except Exception as e:
            # API failed, return mock data
            print(f"Bridge query failed: {e}, using mock data")
            return ExternalTools._get_mock_bridges(lat, lon)
    
    @staticmethod
    def _get_mock_bridges(lat: float, lon: float) -> Dict[str, Any]:
        """
        Return mock bridge data for demo purposes
        """
        # Boston area bridges
        if 42.0 < lat < 43.0 and -72.0 < lon < -70.0:
            bridges = [
                {
                    "osm_id": "mock_001",
                    "name": "Storrow Drive Overpass",
                    "maxheight": "10'6\"",
                    "bridge_type": "arch",
                    "ref": "US-1"
                },
                {
                    "osm_id": "mock_002", 
                    "name": "Memorial Drive Bridge",
                    "maxheight": "11'0\"",
                    "bridge_type": "beam",
                    "ref": ""
                },
                {
                    "osm_id": "mock_003",
                    "name": "BU Bridge",
                    "maxheight": "14'0\"",
                    "bridge_type": "arch",
                    "ref": "MA-2"
                }
            ]
        else:
            # Generic bridges
            bridges = [
                {
                    "osm_id": "mock_generic_001",
                    "name": "Local Bridge #1",
                    "maxheight": "13'6\"",
                    "bridge_type": "beam",
                    "ref": ""
                },
                {
                    "osm_id": "mock_generic_002",
                    "name": "Highway Overpass",
                    "maxheight": "14'6\"",
                    "bridge_type": "concrete",
                    "ref": ""
                }
            ]
        
        return {
            "success": True,
            "bridges_found": len(bridges),
            "bridges": bridges,
            "tool_used": "mock_data_fallback",
            "note": "Using mock data - OSM API unavailable"
        }
    
    @staticmethod
    def get_weather_conditions(lat: float, lon: float) -> Dict[str, Any]:
        """
        Get current weather conditions using OpenWeather API
        Falls back to mock data if API fails
        """
        if not OPENWEATHER_KEY:
            print("No OpenWeather API key, using mock data")
            return ExternalTools._get_mock_weather(lat, lon)
            
        try:
            url = "https://api.openweathermap.org/data/2.5/weather"
            params = {
                "lat": lat,
                "lon": lon,
                "appid": OPENWEATHER_KEY,
                "units": "imperial"
            }
            response = requests.get(url, params=params, timeout=5)
            
            if response.status_code != 200:
                print(f"Weather API error: {response.status_code}, using mock data")
                return ExternalTools._get_mock_weather(lat, lon)
                
            data = response.json()
            
            weather = data.get("weather", [{}])[0]
            main = data.get("main", {})
            
            # Determine if conditions affect clearance
            conditions = weather.get("main", "").lower()
            temp = main.get("temp", 50)
            
            clearance_impact = 0
            warnings = []
            
            if "snow" in conditions or "ice" in conditions:
                clearance_impact = -2  # Ice buildup reduces clearance
                warnings.append("Ice/snow may reduce bridge clearance by 2 inches")
            
            if temp < 32:
                clearance_impact = -1  # Freezing conditions
                warnings.append("Freezing conditions - watch for ice")
            
            return {
                "success": True,
                "condition": weather.get("main"),
                "description": weather.get("description"),
                "temperature": temp,
                "clearance_impact_inches": clearance_impact,
                "warnings": warnings,
                "tool_used": "openweather_api"
            }
        except Exception as e:
            print(f"Weather API failed: {e}, using mock data")
            return ExternalTools._get_mock_weather(lat, lon)
    
    @staticmethod
    def _get_mock_weather(lat: float, lon: float) -> Dict[str, Any]:
        """
        Return mock weather data for demo
        """
        return {
            "success": True,
            "condition": "Clear",
            "description": "clear sky",
            "temperature": 68,
            "clearance_impact_inches": 0,
            "warnings": [],
            "tool_used": "mock_weather_data",
            "note": "Using mock data - OpenWeather API unavailable"
        }
    
    @staticmethod
    def lookup_vehicle_specs(vehicle_type: str) -> Dict[str, Any]:
        """
        Look up known vehicle specifications
        Mock database for now - in production would query real database
        """
        vehicle_db = {
            "u-haul 10": {"base_height": 83, "name": "U-Haul 10' Truck"},
            "u-haul 15": {"base_height": 150, "name": "U-Haul 15' Truck"},
            "u-haul 20": {"base_height": 162, "name": "U-Haul 20' Truck"},
            "penske 16": {"base_height": 152, "name": "Penske 16' Truck"},
            "box truck": {"base_height": 150, "name": "Standard Box Truck"},
            "class a rv": {"base_height": 156, "name": "Class A RV"},
            "class c rv": {"base_height": 138, "name": "Class C RV"}
        }
        
        # Fuzzy match
        vehicle_lower = vehicle_type.lower()
        for key, specs in vehicle_db.items():
            if key in vehicle_lower or vehicle_lower in key:
                return {
                    "success": True,
                    "found": True,
                    "vehicle_name": specs["name"],
                    "base_height_inches": specs["base_height"],
                    "tool_used": "vehicle_database"
                }
        
        return {
            "success": True,
            "found": False,
            "vehicle_name": vehicle_type,
            "base_height_inches": None,
            "tool_used": "vehicle_database"
        }