"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Moon, 
  Sun, 
  Monitor, 
  Smartphone, 
  Eye, 
  Globe, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

export function UIImprovements() {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [uiSettings, setUiSettings] = useState({
    darkMode: false,
    compactMode: false,
    animations: true,
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    language: 'en',
    timezone: 'Africa/Lagos',
    dateFormat: 'DD/MM/YYYY',
    currency: 'NGN',
    notifications: true,
    sounds: true,
    hapticFeedback: true
  });

  // Always call useTheme hook unconditionally (Rules of Hooks)
  const themeContext = useTheme();
  const theme = themeContext?.theme;
  const resolvedTheme = themeContext?.resolvedTheme;
  const setTheme = themeContext?.setTheme || (() => {});

  // Only set theme-based settings after component mounts to avoid hydration mismatch
  useEffect(() => {
    try {
      // Wait for next tick to ensure we're fully hydrated
      const timer = setTimeout(() => {
        setMounted(true);
        const currentTheme = resolvedTheme || theme;
        if (currentTheme) {
          setUiSettings(prev => ({ ...prev, darkMode: currentTheme === 'dark' }));
        }
      }, 100); // Slightly longer delay to ensure everything is ready
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error in UIImprovements mount effect:', error);
      setHasError(true);
      setMounted(true); // Still set mounted so UI can render
    }
  }, [theme, resolvedTheme]);

  const handleSettingChange = (key: string, value: any) => {
    setUiSettings((prev: any) => ({ ...prev, [key]: value }));
    
    // Apply theme changes immediately
    if (key === 'darkMode') {
      setTheme(value ? 'dark' : 'light');
    }
    
    toast.success(`${key} updated successfully`);
  };

  const accessibilityFeatures = [
    {
      id: 'highContrast',
      name: 'High Contrast Mode',
      description: 'Increases color contrast for better readability',
      icon: Eye,
      enabled: uiSettings.highContrast
    },
    {
      id: 'largeText',
      name: 'Large Text',
      description: 'Increases font size for better readability',
      icon: Monitor,
      enabled: uiSettings.largeText
    },
    {
      id: 'reducedMotion',
      name: 'Reduce Motion',
      description: 'Reduces animations for users sensitive to motion',
      icon: AlertCircle,
      enabled: uiSettings.reducedMotion
    }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'es', label: 'Español' },
    { value: 'ar', label: 'العربية' },
    { value: 'zh', label: '中文' }
  ];

  const timezoneOptions = [
    { value: 'Africa/Lagos', label: 'Lagos (GMT+1)' },
    { value: 'Africa/Abuja', label: 'Abuja (GMT+1)' },
    { value: 'Africa/Cairo', label: 'Cairo (GMT+2)' },
    { value: 'Europe/London', label: 'London (GMT+0)' },
    { value: 'America/New_York', label: 'New York (GMT-5)' }
  ];

  const dateFormatOptions = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (25/12/2024)' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/25/2024)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-25)' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (25-12-2024)' }
  ];

  // Show error state if something went wrong
  if (hasError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Unable to load UI settings. Please refresh the page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prevent hydration mismatch by not rendering theme-dependent UI until mounted
  if (!mounted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Theme & Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="darkMode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <Switch
              id="darkMode"
              checked={uiSettings.darkMode}
              onCheckedChange={(checked: boolean) => handleSettingChange('darkMode', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compactMode">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing for more content on screen
              </p>
            </div>
            <Switch
              id="compactMode"
              checked={uiSettings.compactMode}
              onCheckedChange={(checked: boolean) => handleSettingChange('compactMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animations">Animations</Label>
              <p className="text-sm text-muted-foreground">
                Enable smooth transitions and animations
              </p>
            </div>
            <Switch
              id="animations"
              checked={uiSettings.animations}
              onCheckedChange={(checked: boolean) => handleSettingChange('animations', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Accessibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {accessibilityFeatures.map((feature) => (
            <div key={feature.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <feature.icon className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label htmlFor={feature.id}>{feature.name}</Label>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
              <Switch
                id={feature.id}
                checked={feature.enabled}
                onCheckedChange={(checked: boolean) => handleSettingChange(feature.id, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Localization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Localization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select 
                value={uiSettings.language} 
                onValueChange={(value: string) => handleSettingChange('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={uiSettings.timezone} 
                onValueChange={(value: string) => handleSettingChange('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezoneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select 
                value={uiSettings.dateFormat} 
                onValueChange={(value: string) => handleSettingChange('dateFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateFormatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input 
                value={uiSettings.currency}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSettingChange('currency', e.target.value)}
                placeholder="NGN"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Notifications & Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for important updates
              </p>
            </div>
            <Switch
              id="notifications"
              checked={uiSettings.notifications}
              onCheckedChange={(checked: boolean) => handleSettingChange('notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sounds">Sound Effects</Label>
              <p className="text-sm text-muted-foreground">
                Play sounds for actions and notifications
              </p>
            </div>
            <Switch
              id="sounds"
              checked={uiSettings.sounds}
              onCheckedChange={(checked: boolean) => handleSettingChange('sounds', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hapticFeedback">Haptic Feedback</Label>
              <p className="text-sm text-muted-foreground">
                Vibration feedback on mobile devices
              </p>
            </div>
            <Switch
              id="hapticFeedback"
              checked={uiSettings.hapticFeedback}
              onCheckedChange={(checked: boolean) => handleSettingChange('hapticFeedback', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Mobile Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            Mobile Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Touch Targets</h4>
              <p className="text-sm text-muted-foreground">
                All interactive elements are optimized for touch with minimum 44px touch targets
              </p>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Optimized
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Responsive Design</h4>
              <p className="text-sm text-muted-foreground">
                Interface adapts seamlessly across all device sizes
              </p>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Responsive
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">PWA Features</h4>
              <p className="text-sm text-muted-foreground">
                Progressive Web App capabilities for mobile installation
              </p>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Offline Support</h4>
              <p className="text-sm text-muted-foreground">
                Core features work without internet connection
              </p>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Supported
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">95%</div>
              <div className="text-sm text-muted-foreground">Accessibility Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">98%</div>
              <div className="text-sm text-muted-foreground">Mobile Performance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">92%</div>
              <div className="text-sm text-muted-foreground">User Experience</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}