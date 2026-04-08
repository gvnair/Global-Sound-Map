import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "leaflet.heat";
import L from "leaflet";

interface HeatLayerProps {
  points: [number, number, number][];
}

export function HeatLayer({ points }: HeatLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const heat = (L as unknown as { heatLayer: (pts: [number, number, number][], opts: object) => L.Layer }).heatLayer(
      points,
      {
        radius: 40,
        blur: 25,
        maxZoom: 8,
        max: 3,
        gradient: { 0.2: "#00b4ff", 0.5: "#00e5ff", 0.8: "#ffcc00", 1.0: "#ff4400" },
      }
    );
    heat.addTo(map);
    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}
