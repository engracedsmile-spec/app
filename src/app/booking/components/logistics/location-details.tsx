
"use client";

import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import MapSearch from '@/components/map/map-search';
import { LocationFeature } from '@/lib/mapbox/utils';
import { LocationMarker } from '@/components/location-marker';
import { useMap } from '@/context/map-context';
import mapboxgl from 'mapbox-gl';


export type LocationData = {
    pickupAddress: string;
    destinationAddress: string;
}

interface LocationDetailsProps {
    onNext: (data: LocationData) => void;
    onBack: () => void;
    initialData: Partial<LocationData>;
    onClose?: () => void;
}

const RouteDrawer = ({ pickup, destination }: { pickup: LocationFeature | null, destination: LocationFeature | null }) => {
    const { map } = useMap();

    useEffect(() => {
        if (!map) return;

        const setupRoute = async () => {
            if (pickup && destination) {
                const coords1 = pickup.geometry.coordinates;
                const coords2 = destination.geometry.coordinates;
                const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords1[0]},${coords1[1]};${coords2[0]},${coords2[1]}?steps=true&geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}`;
                
                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    if (data.routes && data.routes[0]) {
                        const route = data.routes[0].geometry.coordinates;
                        const geojson = {
                            type: 'Feature' as const,
                            properties: {},
                            geometry: {
                                type: 'LineString' as const,
                                coordinates: route
                            }
                        };

                        const routeSource = map.getSource('route') as mapboxgl.GeoJSONSource;
                        if (routeSource) {
                            routeSource.setData(geojson);
                        } else {
                            map.addSource('route', { type: 'geojson', data: geojson });
                            map.addLayer({
                                id: 'route',
                                type: 'line',
                                source: 'route',
                                layout: { 'line-join': 'round', 'line-cap': 'round' },
                                paint: { 'line-color': 'hsl(var(--primary))', 'line-width': 5, 'line-opacity': 0.75 }
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error fetching route:", error);
                }
            }
        };

        setupRoute();
        
        return () => {
             if (map && map.isStyleLoaded() && map.getSource('route')) {
                try {
                    if (map.getLayer('route')) map.removeLayer('route');
                    map.removeSource('route');
                } catch (error) {
                    // console.warn("Error removing route from map during cleanup", error);
                }
            }
        };

    }, [map, pickup, destination]);

    return null;
}

export const LogisticsLocationDetails = ({ onNext, onBack, initialData, onClose }: LocationDetailsProps) => {
    const { toast } = useToast();
    
    const [pickup, setPickup] = useState<LocationFeature | null>(null);
    const [destination, setDestination] = useState<LocationFeature | null>(null);

    const handleConfirm = () => {
        if (pickup && destination) {
            onNext({ 
                pickupAddress: pickup.properties.full_address || pickup.properties.name, 
                destinationAddress: destination.properties.full_address || destination.properties.name
            });
        } else {
            toast({ variant: 'destructive', title: "Missing Information", description: "Please select both pickup and destination." });
        }
    }

    return (
        <div className="h-full w-full flex flex-col justify-between">
            {pickup && <LocationMarker location={pickup} onHover={() => {}} />}
            {destination && <LocationMarker location={destination} onHover={() => {}} />}
            <RouteDrawer pickup={pickup} destination={destination} />
                
            <div className="absolute top-0 left-0 right-0 z-10 p-4 space-y-3">
                <header className="flex items-center justify-center relative p-2 bg-background/80 backdrop-blur-lg rounded-full border border-border/50 shadow-lg">
                    <Button variant="ghost" size="icon" onClick={onBack} className="absolute left-2 top-1/2 -translate-y-1/2 text-foreground hover:bg-muted/50 rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-bold text-foreground">Shipment Locations</h1>
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground hover:bg-muted/50 rounded-full">
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </header>
                <div className="space-y-2">
                    <MapSearch 
                        placeholder="Select pickup location"
                        onLocationSelect={setPickup}
                        value={initialData?.pickupAddress || null}
                    />
                     <MapSearch 
                        placeholder="Select destination"
                        onLocationSelect={setDestination}
                        value={initialData?.destinationAddress || null}
                    />
                </div>
            </div>

             <div className="absolute bottom-4 left-4 right-4 z-10">
                <Button 
                    className="w-full h-14 text-lg font-bold shadow-2xl"
                    onClick={handleConfirm}
                    disabled={!pickup || !destination}
                >
                    Confirm Locations
                </Button>
            </div>
        </div>
    )
}
