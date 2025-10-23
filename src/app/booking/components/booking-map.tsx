
"use client";

import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

interface BookingMapProps {
    pickup: { lat: number, lng: number } | null;
    destination: { lat: number, lng: number } | null;
}

export const BookingMap: React.FC<BookingMapProps> = ({ pickup, destination }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});

    const defaultCenter: [number, number] = [6.33, 5.62]; // Edo State
    const defaultZoom = 6.5;

    useEffect(() => {
        if (map.current) return; // initialize map only once
        if (!mapContainer.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: defaultCenter,
            zoom: defaultZoom,
        });

        map.current.on('load', () => {
             map.current?.resize();
        });
    }, []);

    const updateMap = () => {
        if (!map.current) return;
        
        const bounds = new mapboxgl.LngLatBounds();
        let hasPoints = false;
        
        // Handle Pickup Marker
        if (pickup) {
            if (markers.current.pickup) {
                markers.current.pickup.setLngLat([pickup.lng, pickup.lat]);
            } else {
                markers.current.pickup = new mapboxgl.Marker({ color: '#3b82f6' })
                    .setLngLat([pickup.lng, pickup.lat])
                    .addTo(map.current);
            }
            bounds.extend([pickup.lng, pickup.lat]);
            hasPoints = true;
        } else if (markers.current.pickup) {
            markers.current.pickup.remove();
            delete markers.current.pickup;
        }

        // Handle Destination Marker
        if (destination) {
             if (markers.current.destination) {
                markers.current.destination.setLngLat([destination.lng, destination.lat]);
            } else {
                markers.current.destination = new mapboxgl.Marker({ color: '#f97316' })
                    .setLngLat([destination.lng, destination.lat])
                    .addTo(map.current);
            }
            bounds.extend([destination.lng, destination.lat]);
            hasPoints = true;
        } else if (markers.current.destination) {
            markers.current.destination.remove();
            delete markers.current.destination;
        }

        // Update Route
        const routeSource = map.current.getSource('route');
        if (pickup && destination) {
            const route = {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [pickup.lng, pickup.lat],
                        [destination.lng, destination.lat]
                    ]
                }
            };
            if (routeSource) {
                 // @ts-ignore
                routeSource.setData(route);
            } else {
                map.current.addSource('route', { type: 'geojson', data: route as any });
                map.current.addLayer({
                    id: 'route',
                    type: 'line',
                    source: 'route',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#16a34a', 'line-width': 4, 'line-dasharray': [2, 2] }
                });
            }
        } else if (routeSource) {
            if (map.current.getLayer('route')) map.current.removeLayer('route');
            map.current.removeSource('route');
        }
        
        // Adjust map view
        if (hasPoints) {
            map.current.fitBounds(bounds, { padding: 60, maxZoom: 12, duration: 1000 });
        } else {
            map.current.flyTo({ center: defaultCenter, zoom: defaultZoom, duration: 1000 });
        }
    };

    useEffect(updateMap, [pickup, destination]);

    return <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />;
};
