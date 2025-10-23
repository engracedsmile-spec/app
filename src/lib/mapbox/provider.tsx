
// lib/mapbox/provider.tsx

"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { MapContext } from "@/context/map-context";
import { Loader2 } from "lucide-react";

type MapComponentProps = {
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  children?: React.ReactNode;
};

export default function MapProvider({
  initialViewState = { longitude: 7.48, latitude: 9.08, zoom: 5.5 },
  children,
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (mapRef.current) return; // initialize map only once
    if (!mapContainerRef.current) return;
    
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      const errorMessage = "Mapbox token is not configured. Please set NEXT_PUBLIC_MAPBOX_TOKEN in your environment variables.";
      setError(errorMessage);
      console.error(errorMessage);
      return;
    }

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/standard",
      center: [initialViewState.longitude, initialViewState.latitude],
      zoom: initialViewState.zoom,
      attributionControl: false,
      logoPosition: "bottom-right",
    });
    
    mapRef.current = mapInstance;
    setMap(mapInstance);

    const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
    });
    mapInstance.addControl(geolocate);


    mapInstance.on("load", () => {
      setIsMapReady(true);
    });
    
    mapInstance.on('error', (e) => {
        setError(e.error.message);
        console.error("Mapbox GL Error:", e.error);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMap(null);
      setIsMapReady(false);
    };
  }, [initialViewState]);
  
   if (error) {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 z-20">
            <div className="flex flex-col items-center gap-2 text-lg font-medium p-4 bg-background/80 rounded-lg backdrop-blur-sm text-destructive max-w-md text-center">
                <h2 className="font-bold">Map Error</h2>
                <p className="text-sm">{error}</p>
            </div>
        </div>
      );
  }


  return (
    <>
      <div ref={mapContainerRef} className="absolute inset-0 h-full w-full z-0" />
      {isMapReady && map ? (
        <MapContext.Provider value={{ map }}>
          {children}
        </MapContext.Provider>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
            <div className="flex items-center gap-2 text-lg font-medium p-4 bg-background/80 rounded-lg backdrop-blur-sm">
                <Loader2 className="h-6 w-6 animate-spin"/>
                Loading map...
            </div>
        </div>
      )}
    </>
  );
}
