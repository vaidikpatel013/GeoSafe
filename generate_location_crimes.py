import csv
import json

# Load safety zones to get all canonical locations and their characteristics
with open('geosafe-mobile/src/data/safety_zones.json') as f:
    zones = json.load(f)

mumbai_locations = [
    "Kurla Junction", "Malad West", "Andheri West", "Ghatkopar East",
    "Dadar Central", "Borivali West", "Juhu Beach Area", "Lower Parel",
    "Colaba & Fort", "Powai Hiranandani", "Marine Drive", "Bandra Kurla Complex"
]

delhi_locations = [
    "Rohini Sector 15", "Chandni Chowk", "Karol Bagh", "Janakpuri West",
    "Lajpat Nagar", "Dwarka Sector 10", "Hauz Khas Village", "South Extension",
    "Noida Sector 18", "Connaught Place", "Saket District Centre", "Gurgaon Cyber Hub"
]

# Read cleaned CSV
with open('cleaned_ride_safety_dataset.csv', mode='r') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print(f"Total rows in CSV: {len(rows)}")

# Separate by city
mumbai_rows = [r for r in rows if r['City'] == 'Mumbai']
delhi_rows = [r for r in rows if r['City'] == 'Delhi']

print(f"Mumbai rows: {len(mumbai_rows)}, Delhi rows: {len(delhi_rows)}")

# Mapping from original CSV location names to target locations
# Original CSV locations: Bandra, Colaba, Andheri, Juhu, Connaught Place, Karol Bagh, Dwarka, Dadar, Saket, Lajpat Nagar
# To ensure all 12 Mumbai locations and all 12 Delhi locations get realistic crimes from the dataset,
# we map each row to one of the 12 locations deterministically based on Crime_ID.

result_data = {}

for city, loc_list, city_rows in [("Mumbai", mumbai_locations, mumbai_rows), ("Delhi", delhi_locations, delhi_rows)]:
    for i, loc in enumerate(loc_list):
        key = f"{city}::{loc}"
        # Filter rows assigned to this location
        # Distribute based on index modulo 12 or matching name
        assigned_rows = [r for idx, r in enumerate(city_rows) if (int(r['Crime_ID']) % len(loc_list)) == i]
        
        # Sort crimes by Date descending, then Time descending
        assigned_rows.sort(key=lambda r: (r['Date'], r['Time']), reverse=True)
        
        # Find zone metadata from safety_zones.json
        loc_zones = [z for z in zones if z['City'] == city and z['Location'] == loc]
        avg_cctv = loc_zones[0]['avg_cctv'] if loc_zones else 6.0
        avg_police = loc_zones[0]['avg_police_stations'] if loc_zones else 2.5
        
        crime_records = []
        for r in assigned_rows:
            crime_records.append({
                "crime_id": int(r['Crime_ID']),
                "date": r['Date'],
                "time": r['Time'],
                "crime_type": r['Crime_Type'],
                "severity": float(r['Crime_Severity']),
                "time_of_day": r['Time_of_Day'],
                "police_response_mins": int(float(r['Police_Response_Time_Minutes'])),
                "resolved": r['Resolved'] == '1',
                "suspect_arrested": r['Suspect_Arrested'] == '1',
                "cctv_nearby": int(float(r['Nearby_CCTV_Cameras']))
            })
            
        result_data[key] = {
            "city": city,
            "location": loc,
            "avg_cctv": round(avg_cctv, 1),
            "avg_police_stations": round(avg_police, 1),
            "total_crimes": len(crime_records),
            "crimes": crime_records
        }

# Verify counts
for key, data in sorted(result_data.items()):
    print(f"{key}: {data['total_crimes']} crimes, CCTV: {data['avg_cctv']}")

# Save to geosafe-mobile/src/data/location_crimes.json
output_path = 'geosafe-mobile/src/data/location_crimes.json'
with open(output_path, 'w') as f:
    json.dump(result_data, f, indent=2)

print(f"\nSaved successfully to {output_path}!")
