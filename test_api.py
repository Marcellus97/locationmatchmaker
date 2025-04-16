#!/usr/bin/env python3
"""
Test script for the Location Matchmaking API
Place this in your data directory and run after starting the container
"""
import requests
import json
import sys

def test_api(base_url="http://localhost:8080"):
    """Test the API with a simple request"""
    print("Testing Location Matchmaking API...")
    
    # Test data
    test_data = {
        "state": "",  # Leave blank for nationwide search
        "num_adults": 2,
        "num_children": 0,
        "Average Temperature F": 70,
        "Life Expectancy": 80,
        "Unemployment_Rate": 4.0
    }
    
    # print(f"Sending request to {base_url}/api/ranking")
    # print(f"Request data: {json.dumps(test_data, indent=2)}")
    
    try:
        response = requests.post(
            f"{base_url}/api/ranking",
            json=test_data,
            timeout=30
        )
        
        # Check response
        if response.status_code == 200:
            print("\n✅ API Test Successful!")
            print(f"Status Code: {response.status_code}")
            print("Response data:")
            # print(json.dumps(response.json(), indent=2))
            return True
        else:
            print("\n❌ API Test Failed!")
            print(f"Status Code: {response.status_code}")
            print("Response data:")
            print(response.text)
            return False
    
    except requests.exceptions.ConnectionError:
        print("\n❌ Connection Error: Unable to connect to the API")
        print("Make sure the Docker container is running and the API is accessible")
        return False
    
    except Exception as e:
        print(f"\n❌ Test Error: {str(e)}")
        return False

if __name__ == "__main__":
    # Allow custom URL from command line argument
    url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
    success = test_api(url)
    if not success:
        sys.exit(1)