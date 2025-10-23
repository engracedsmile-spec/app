/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 *
 * So, you're looking at my code, huh? That's cool. Just don't copy it without asking.
 * I poured my heart, soul, and a questionable amount of caffeine into this.
 * Find me on socials @mdtbmw if you want to geek out over code.
 */

export type Language = {
  name: string;
  code: string;
  isDefault?: boolean;
};

export type TranslationData = {
  [langCode: string]: {
    [key: string]: string;
  };
};

// Our little Rosetta Stone. Starting with English and Yoruba.
// More languages? Sure, why not. Just don't ask me to translate Klingon.
let languages: Language[] = [
  { name: 'English', code: 'en', isDefault: true },
  { name: 'Yoruba', code: 'yo', isDefault: false },
];

// The actual dictionary. If a key is missing, well, that's a you-problem.
let translations: TranslationData = {
  en: {
    welcome_message: 'Welcome to our app!',
    book_trip: 'Book a Trip',
    track_shipment: 'Track Shipment',
    greeting: 'Hello, {name}!',
  },
  yo: {
    welcome_message: 'Kaabo si app wa!',
    book_trip: 'Iwe fun Irin-ajo',
    track_shipment: 'Tẹle Gbigbe rẹ',
    greeting: 'Bawo, {name}!',
  },
};

// Just gives you the list of languages we support. No magic here.
export const getLanguages = (): Language[] => {
  return languages;
};

// Hands you the entire translation book. Use it wisely.
export const getTranslations = (): TranslationData => {
  return translations;
};

// Want to add a new language? This is your function.
// It's smart enough not to add duplicates. It also pre-populates
// the new language with empty strings so you know what you need to translate.
export const addLanguage = (name: string, code: string): void => {
  if (!languages.find(lang => lang.code === code)) {
    languages.push({ name, code });
    translations[code] = {};
     Object.keys(translations.en).forEach(key => {
        translations[code][key] = ''; // Now go do the actual work.
    })
  }
};

// Found a typo? Or want to add a new translation? This is the one.
// Pass the language code, the key, and the new shiny value.
export const updateTranslation = (langCode: string, key: string, value: string): void => {
  if (translations[langCode]) {
    translations[langCode][key] = value;
  }
};

/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
* to the maximum extent possible under the law.
 *
 * TL;DR: Don't steal my stuff. I worked hard on this.
 *
 * @see https://github.com/mdtbmw
 */
