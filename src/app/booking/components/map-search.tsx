// components/map/map-search.tsx

"use client";

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Loader2, MapPin, X, LocateFixed } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDebounce } from "use-debounce";

import { useMap } from "@/context/map-context";
import { cn } from "@/lib/utils";
import {
  LocationFeature,
  LocationSuggestion,
} from "@/lib/mapbox/utils";
import mapboxgl from "mapbox-gl";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { nigeriaData } from "@/lib/nigeria-data";

export default function MapSearch({ 
    placeholder, 
    onLocationSelect, 
    value,
    onFocus
}: { 
    placeholder: string, 
    onLocationSelect: (location: LocationFeature | null) => void,
    value: string | null,
    onFocus?: () => void
}) {
  const { map } = useMap();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [displayValue, setDisplayValue] = useState(value || "");
  const [results, setResults] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery] = useDebounce(query, 400);
  const commandRef = useRef<HTMLDivElement>(null);
  
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    setDisplayValue(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim()) {
        if (!sessionToken) {
            setSessionToken(`mapbox-session-${Date.now()}`);
        }
        searchLocations();
    } else {
      setResults([]);
      setIsOpen(false);
      // New session for next search
      setSessionToken(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const searchLocations = async () => {
    if (!debouncedQuery.trim()) return;

    setIsSearching(true);
    setIsOpen(true);
    
    const proximity = map ? `${map.getCenter().lng},${map.getCenter().lat}` : '6.33,5.62';
    
    let url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
          debouncedQuery
        )}&access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN!
        }&session_token=${sessionToken}&limit=5&proximity=${proximity}&country=NG`; // Always filter by Nigeria

    try {
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.suggestions ?? []);
    } catch (err) {
      console.error("Geocoding error:", err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };


  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    setDisplayValue(value);
    if (!isOpen) setIsOpen(true);
    if (!value) {
      onLocationSelect(null);
    }
  };

  const handleSelect = useCallback(async (suggestion: LocationSuggestion) => {
    setIsOpen(false);
    setDisplayValue(suggestion.name);
    try {
      setIsSearching(true);

      const res = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}&session_token=${sessionToken}`
      );

      const data = await res.json();
      const feature: LocationFeature = data?.features?.[0];

      if (map && feature) {
        const coordinates = feature.geometry.coordinates;

        map.flyTo({
          center: coordinates,
          zoom: 14,
          speed: 2,
          duration: 1000,
          essential: true,
        });

        onLocationSelect(feature);
        setDisplayValue(feature.properties.full_address || suggestion.name);
      }
    } catch (err) {
      console.error("Retrieve error:", err);
    } finally {
      setIsSearching(false);
      setSessionToken(null); // End session
    }
  }, [map, onLocationSelect, sessionToken]);


  // Clear search
  const clearSearch = () => {
    setQuery("");
    setDisplayValue("");
    setResults([]);
    setIsOpen(false);
    onLocationSelect(null);
    setSessionToken(null); // End session
  };
  
  const handleGeolocate = () => {
     if (!map) return;
      const geolocateControl = map._controls.find(
        (control) => control instanceof mapboxgl.GeolocateControl
      ) as mapboxgl.GeolocateControl;
      if (geolocateControl) {
        geolocateControl.once('geolocate', (e) => {
            const { longitude, latitude } = (e as any).coords;
            
            // Reverse geocode to get address
            fetch(`https://api.mapbox.com/search/searchbox/v1/reverse?longitude=${longitude}&latitude=${latitude}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}`)
                .then(response => response.json())
                .then(data => {
                    if (data.features && data.features[0]) {
                        const feature = data.features[0];
                        onLocationSelect(feature);
                        setDisplayValue(feature.properties.full_address || feature.properties.name);
                    } else {
                        toast({ variant: 'destructive', title: "Could not find address"});
                    }
                })
        })
        geolocateControl.trigger();
      }
  }

  return (
    <section className="relative w-full rounded-lg" ref={commandRef}>
      <Command className="rounded-lg bg-transparent">
        <div className={cn("w-full flex items-center justify-between px-2 gap-1 border bg-background rounded-full")}>
          <CommandInput
            placeholder={placeholder}
            value={displayValue}
            onValueChange={handleInputChange}
            onFocus={() => {
              setIsOpen(true);
              onFocus?.();
            }}
            className="flex-1 h-12 border-0 bg-transparent"
          />
          <div className="flex items-center">
            {displayValue && !isSearching && (
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={clearSearch}>
                <X className="size-4 shrink-0 text-muted-foreground" />
              </Button>
            )}
            {isSearching && (
              <Loader2 className="size-4 shrink-0 text-primary animate-spin mr-2" />
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleGeolocate}>
                <LocateFixed className="size-4 shrink-0 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {isOpen && (
          <CommandList className="absolute w-full z-20 mt-1 bg-background rounded-lg border shadow-lg max-h-60 overflow-y-auto">
            {!query.trim() || isSearching ? null : results.length === 0 ? (
              <CommandEmpty className="py-6 text-center">
                <div className="flex flex-col items-center justify-center space-y-1">
                  <p className="text-sm font-medium">No locations found</p>
                  <p className="text-xs text-muted-foreground">
                    Try a different search term
                  </p>
                </div>
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((location) => (
                  <CommandItem
                    key={location.mapbox_id}
                    onSelect={() => handleSelect(location)}
                    value={`${location.name} ${location.place_formatted} ${location.mapbox_id}`}
                    className="flex items-center py-3 px-2 cursor-pointer hover:bg-accent rounded-md"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">
                        {location.name}
                      </span>
                      <span className="text-sm text-muted-foreground truncate block">
                        {location.place_formatted}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </Command>
    </section>
  );
}
