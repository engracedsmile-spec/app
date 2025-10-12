
// components/map/map-styles.tsx

"use client";

import React, { useEffect, useState } from "react";
import {
  Layers3,
  MapIcon,
  MoonIcon,
  SatelliteIcon,
  SunIcon,
  TreesIcon,
} from "lucide-react";
import { useTheme } from "next-themes";

import { useMap } from "@/context/map-context";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";

type StyleOption = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: "standard",
    label: "Map",
    icon: <MapIcon className="w-5 h-5" />,
  },
  {
    id: "satellite-streets-v12",
    label: "Satellite",
    icon: <SatelliteIcon className="w-5 h-5" />,
  },
  {
    id: "outdoors-v12",
    label: "Terrain",
    icon: <TreesIcon className="w-5 h-5" />,
  },
];

export default function MapStyles() {
  const { map } = useMap();
  const { theme, systemTheme } = useTheme();
  const [activeStyle, setActiveStyle] = useState("standard");

  const handleChange = (value: string) => {
    if (!map) return;
    map.setStyle(`mapbox://styles/mapbox/${value}`);
    setActiveStyle(value);
  };
  
  useEffect(() => {
    if (!map) return;

    const applyTheme = () => {
        const currentTheme = theme === 'system' ? systemTheme : theme;
        if (currentTheme === 'dark') {
            map.setConfigProperty('basemap', 'lightPreset', 'dusk');
        } else {
            map.setConfigProperty('basemap', 'lightPreset', 'day');
        }
    };
    
    if (map.isStyleLoaded()) {
        applyTheme();
    } else {
        map.once('styledata', applyTheme);
    }
  }, [map, theme, systemTheme]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-background">
          <Layers3 className="w-6 h-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Tabs
          value={activeStyle}
          onValueChange={handleChange}
          orientation="vertical"
        >
          <TabsList className="bg-transparent">
            {STYLE_OPTIONS.map((style) => (
              <TabsTrigger
                key={style.id}
                value={style.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm flex items-center justify-start gap-2 w-full"
              >
                {style.icon}
                <span>{style.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
