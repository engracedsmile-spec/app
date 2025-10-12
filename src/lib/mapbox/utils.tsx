/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

// lib/mapbox/utils.tsx

export type LocationSuggestion = {
  mapbox_id: string;
  name: string;
  place_formatted: string;
  maki?: string;
};

export type LocationFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    name: string;
    name_preferred?: string;
    mapbox_id: string;
    feature_type: string;
    address?: string;
    full_address?: string;
    place_formatted?: string;
    context: {
      country?: {
        name: string;
        country_code: string;
        country_code_alpha_3: string;
      };
      region?: {
        name: string;
        region_code: string;
        region_code_full: string;
      };
      postcode?: { name: string };
      district?: { name: string };
      place?: { name: string };
      locality?: { name: string };
      neighborhood?: { name: string };
      address?: {
        name: string;
        address_number?: string;
        street_name?: string;
      };
      street?: { name: string };
    };
    coordinates: {
      latitude: number;
      longitude: number;
      accuracy?: string;
      routable_points?: {
        name: string;
        latitude: number;
        longitude: number;
        note?: string;
      }[];
    };
    language?: string;
    maki?: string;
    poi_category?: string[];
    poi_category_ids?: string[];
    brand?: string[];
    brand_id?: string[];
    external_ids?: Record<string, string>;
    metadata?: Record<string, unknown>;
    bbox?: [number, number, number, number];
    operational_status?: string;
  };
};
/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */
