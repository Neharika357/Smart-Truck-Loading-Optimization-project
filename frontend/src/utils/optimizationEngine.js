import React from "react";

// --- 1. ROBUST COORDINATE DATABASE (Top 100+ Indian Logistics Cities) ---
// This acts as your "Offline Google Maps"
const INDIA_CITIES = {
  // Metros
  "delhi": { lat: 28.7041, lng: 77.1025 },
  "new delhi": { lat: 28.6139, lng: 77.2090 },
  "mumbai": { lat: 19.0760, lng: 72.8777 },
  "bangalore": { lat: 12.9716, lng: 77.5946 },
  "bengaluru": { lat: 12.9716, lng: 77.5946 },
  "hyderabad": { lat: 17.3850, lng: 78.4867 },
  "chennai": { lat: 13.0827, lng: 80.2707 },
  "kolkata": { lat: 22.5726, lng: 88.3639 },
  "pune": { lat: 18.5204, lng: 73.8567 },
  "ahmedabad": { lat: 23.0225, lng: 72.5714 },
  
  // North Zone
  "jaipur": { lat: 26.9124, lng: 75.7873 },
  "lucknow": { lat: 26.8467, lng: 80.9462 },
  "kanpur": { lat: 26.4499, lng: 80.3319 },
  "ludhiana": { lat: 30.9010, lng: 75.8573 },
  "chandigarh": { lat: 30.7333, lng: 76.7794 },
  "amritsar": { lat: 31.6340, lng: 74.8723 },
  "agra": { lat: 27.1767, lng: 78.0081 },
  "varanasi": { lat: 25.3176, lng: 82.9739 },
  "gurgaon": { lat: 28.4595, lng: 77.0266 },
  "noida": { lat: 28.5355, lng: 77.3910 },
  "ghaziabad": { lat: 28.6692, lng: 77.4538 },
  "faridabad": { lat: 28.4089, lng: 77.3178 },
  "dehradun": { lat: 30.3165, lng: 78.0322 },

  // West Zone
  "surat": { lat: 21.1702, lng: 72.8311 },
  "vadodara": { lat: 22.3072, lng: 73.1812 },
  "rajkot": { lat: 22.3039, lng: 70.8022 },
  "nagpur": { lat: 21.1458, lng: 79.0882 },
  "nashik": { lat: 19.9975, lng: 73.7898 },
  "thane": { lat: 19.2183, lng: 72.9781 },
  "aurangabad": { lat: 19.8762, lng: 75.3433 },
  "indore": { lat: 22.7196, lng: 75.8577 },
  "bhopal": { lat: 23.2599, lng: 77.4126 },
  "gwalior": { lat: 26.2183, lng: 78.1828 },
  "jodhpur": { lat: 26.2389, lng: 73.0243 },
  "udaipur": { lat: 24.5854, lng: 73.7125 },

  // South Zone
  "coimbatore": { lat: 11.0168, lng: 76.9558 },
  "madurai": { lat: 9.9252, lng: 78.1198 },
  "kochi": { lat: 9.9312, lng: 76.2673 },
  "trivandrum": { lat: 8.5241, lng: 76.9366 },
  "mysore": { lat: 12.2958, lng: 76.6394 },
  "mangalore": { lat: 12.9141, lng: 74.8560 },
  "visakhapatnam": { lat: 17.6868, lng: 83.2185 },
  "vizag": { lat: 17.6868, lng: 83.2185 },
  "vijayawada": { lat: 16.5062, lng: 80.6480 },
  "guntur": { lat: 16.3067, lng: 80.4365 },
  "nellore": { lat: 14.4426, lng: 79.9865 },
  "tirupati": { lat: 13.6288, lng: 79.4192 },
  "warangal": { lat: 17.9689, lng: 79.5941 },
  "rajahmundry": { lat: 17.0005, lng: 81.8040 },
  "kakinada": { lat: 16.9891, lng: 82.2475 },
  "palakol": { lat: 16.5186, lng: 81.7282 },
  "mancherial": { lat: 18.8679, lng: 79.4639 },

  // East Zone
  "patna": { lat: 25.5941, lng: 85.1376 },
  "ranchi": { lat: 23.3441, lng: 85.3096 },
  "jamshedpur": { lat: 22.8046, lng: 86.2029 },
  "bhubaneswar": { lat: 20.2961, lng: 85.8245 },
  "cuttack": { lat: 20.4625, lng: 85.8828 },
  "guwahati": { lat: 26.1445, lng: 91.7364 },
  "raipur": { lat: 21.2514, lng: 81.6296 },
  "durgapur": { lat: 23.5204, lng: 87.3119 },
  "siliguri": { lat: 26.7271, lng: 88.3953 }
};

// --- 2. HELPER FUNCTIONS ---

const getDistanceKm = (city1, city2) => {
  const c1Name = city1.toString().toLowerCase().trim();
  const c2Name = city2.toString().toLowerCase().trim();

  // If same city, distance is 0
  if (c1Name === c2Name) return 0;

  const c1 = INDIA_CITIES[c1Name];
  const c2 = INDIA_CITIES[c2Name];

  // FALLBACK LOGIC: If we don't know the city
  if (!c1 || !c2) {
    console.warn(`City coordinates missing for: ${!c1 ? c1Name : ''} ${!c2 ? c2Name : ''}`);
    // If we don't know the distance, we assume a "Medium-Long Haul" distance of 600km
    // This is safer than breaking the app.
    return 600; 
  }

  // Haversine Formula for real calculation
  const R = 6371; // Radius of Earth in km
  const dLat = (c2.lat - c1.lat) * (Math.PI / 180);
  const dLon = (c2.lng - c1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(c1.lat * (Math.PI / 180)) *
    Math.cos(c2.lat * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

const getStringSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  const s1 = str1.toString().toLowerCase().trim();
  const s2 = str2.toString().toLowerCase().trim();
  
  if (s1 === s2) return 100;
  if (s1.includes(s2) || s2.includes(s1)) return 80;
  return 0;
};

// --- 3. MAIN OPTIMIZATION ENGINE ---

export const getOptimizedTrucks = (shipment, trucks) => {
  // Step A: Hard Filter (Must fit physically & Must be Available)
  const capableTrucks = trucks.filter(truck => 
    truck.status === "Available" && 
    Number(truck.capacityWeight) >= Number(shipment.weight) &&
    Number(truck.capacityVolume) >= Number(shipment.volume)
  );

  const scoredTrucks = capableTrucks.map(truck => {
      // 1. Calculate Real Distance
      const distance = getDistanceKm(shipment.origin, shipment.destination);
      
      // 2. Calculate Utilization (Weight OR Volume - whichever is higher)
      const volUtil = (shipment.volume / truck.capacityVolume) * 100;
      const weightUtil = (shipment.weight / truck.capacityWeight) * 100;
      const finalUtilization = Math.min(100, Math.max(volUtil, weightUtil));

      // 3. Route Matching
      const originMatch = getStringSimilarity(shipment.origin, truck.route?.from);
      const destMatch = getStringSimilarity(shipment.destination, truck.route?.to);
      const routeScore = (originMatch * 0.6) + (destMatch * 0.4); 

      // 4. Cost Calculation (Using Real Distance)
      const baseRate = Number(truck.pricePerKm) || 50; 
      const estimatedTotalCost = Math.round(baseRate * distance);
      
      // Cost Score: Lower is better. 
      const costScore = Math.max(0, 100 - (baseRate * 1.5)); 

      // 5. CO2 Score
      let co2Label = "High";
      if (finalUtilization > 85) co2Label = "Very Low";
      else if (finalUtilization > 60) co2Label = "Low";
      else if (finalUtilization > 40) co2Label = "Medium";

      // 6. Final Weighted Score
      const finalScore = Math.round(
        (routeScore * 0.50) +      // Priority #1: Route
        (finalUtilization * 0.30) + // Priority #2: Utilization (Weight/Vol)
        (costScore * 0.20)         // Priority #3: Price
      );

      return {
        ...truck,
        id: truck.truckId,
        match: finalScore,
        co2: co2Label,
        estimatedCost: estimatedTotalCost,
        utilization: Math.round(finalUtilization),
        distance: distance 
      };
    });

    // Step B: Sort Logic (Route First, Then Score)
    scoredTrucks.sort((a, b) => {
        const routeMatchA = getStringSimilarity(shipment.origin, a.route?.from);
        const routeMatchB = getStringSimilarity(shipment.origin, b.route?.from);
        
        // Critical Fix: Sort by Route Match FIRST
        if (routeMatchA !== routeMatchB) {
            return routeMatchB - routeMatchA; 
        }
        return b.match - a.match;
    });

    return scoredTrucks.slice(0, 5);
};