
// components/map/map-controls.tsx

import React from "react";
import { PlusIcon, MinusIcon, LocateFixed, Layers3 } from "lucide-react";

import { useMap } from "@/context/map-context";
import { Button } from "../ui/button";
import MapStyles from "./map-styles";
import mapboxgl from "mapbox-gl";

export function MapControls({ isMobile }: { isMobile: boolean }) {
  const { map } = useMap();

  const zoomIn = () => {
    if (!map) return;
    map.zoomIn();
  };

  const zoomOut = () => {
    if (!map) return;
    map.zoomOut();
  };
  
  const geolocate = () => {
      if (!map) return;
      const geolocateControl = map._controls.find(
        (control) => control instanceof mapboxgl.GeolocateControl
      ) as mapboxgl.GeolocateControl;
      if (geolocateControl) {
        geolocateControl.trigger();
      }
  }

  return (
    <div className="flex flex-col gap-2 items-end">
        <div className="flex flex-col items-center bg-background/80 backdrop-blur-sm shadow-lg rounded-full border border-border/50">
            <Button variant="ghost" size="icon" onClick={zoomIn} className="rounded-full h-12 w-12 hover:bg-background">
                <PlusIcon className="w-6 h-6" />
                <span className="sr-only">Zoom in</span>
            </Button>
            <div className="h-px w-8 bg-border"/>
            <Button variant="ghost" size="icon" onClick={zoomOut} className="rounded-full h-12 w-12 hover:bg-background">
                <MinusIcon className="w-6 h-6" />
                <span className="sr-only">Zoom out</span>
            </Button>
        </div>
        <div className="bg-background/80 backdrop-blur-sm shadow-lg rounded-full border border-border/50">
             <MapStyles />
        </div>
    </div>
  );
}
