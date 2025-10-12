
"use client";

import { Button } from "@/components/ui/button";
import { Languages, AppWindow } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePreloader } from "@/context/preloader-context";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubHeader } from "@/components/sub-header";


export default function PreferencesPage() {
    const router = useRouter();
    const { preloaderEnabled, setPreloaderEnabled } = usePreloader();
    
    return (
        <>
            <SubHeader title="Preferences" />
            <main className="p-4 md:p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Display & Experience</CardTitle>
                        <CardDescription>Customize your user experience within the app.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                            <div className="space-y-1">
                                <Label htmlFor="preloader-toggle" className="font-semibold flex items-center gap-2"><AppWindow className="h-4 w-4"/> Enable Page Transitions</Label>
                                <p className="text-xs text-muted-foreground">Show a loading animation when navigating between pages.</p>
                            </div>
                            <Switch 
                                id="preloader-toggle"
                                checked={preloaderEnabled}
                                onCheckedChange={setPreloaderEnabled}
                            />
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                             <Label htmlFor="language-select" className="font-semibold flex items-center gap-2"><Languages className="h-4 w-4"/> App Language</Label>
                             <p className="text-xs text-muted-foreground">Choose your preferred language for the app interface.</p>
                             <Select defaultValue="en">
                                <SelectTrigger id="language-select">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="yo" disabled>Yoruba (coming soon)</SelectItem>
                                    <SelectItem value="ha" disabled>Hausa (coming soon)</SelectItem>
                                    <SelectItem value="ig" disabled>Igbo (coming soon)</SelectItem>
                                </SelectContent>
                             </Select>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
