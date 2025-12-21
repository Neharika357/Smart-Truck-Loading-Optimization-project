import React from "react";
const getStringSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 100;
  if (s1.includes(s2) || s2.includes(s1)) return 85;
  return 0;
};

export const getOptimizedTrucks = (shipment, trucks) => {
  return trucks
  
    .filter(truck => 
      Number(truck.capacityWeight) >= Number(shipment.weight) &&
      Number(truck.capacityVolume) >= Number(shipment.volume)
    )
    .map(truck => {
      const utilization = Math.min(100, (shipment.volume / truck.capacityVolume) * 100);

      const originMatch = getStringSimilarity(shipment.origin, truck.currentLocation || '');
      const destMatch = getStringSimilarity(shipment.destination, truck.preferredRouteTo || '');
      const routeScore = (originMatch * 0.4) + (destMatch * 0.6); 

      const baseRate = truck.pricePerKm || 50; 
      const costScore = Math.max(0, 100 - (baseRate / 2)); 

      const co2Score = utilization;
      let co2Label = "High";
      if (utilization > 80) co2Label = "Very Low";
      else if (utilization > 50) co2Label = "Low";
      else if (utilization > 30) co2Label = "Medium";

      const finalScore = Math.round(
        (utilization * 0.35) + 
        (routeScore * 0.35) + 
        (costScore * 0.20) + 
        (co2Score * 0.10)
      );

      return {
        ...truck,
        id: truck.truckId,
        capacityVolume : truck.capacityVolume,
        match: finalScore,
        co2: co2Label,
        estimatedCost: Math.round(baseRate * 12.5), 
        utilization: Math.round(utilization)
      };
    })
    .sort((a, b) => b.match - a.match) 
    .slice(0, 5); 
};