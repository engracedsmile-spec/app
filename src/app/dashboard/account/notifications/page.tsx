
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { SubHeader } from "@/components/sub-header";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Preloader } from "@/components/preloader";

const notificationSettingsList = [
    { id: "trip-updates", title: "Trip Updates", description: "Receive real-time updates about your trip status." },
    { id: "booking-confirmations", title: "Booking Confirmations", description: "Get a confirmation when your booking is successful." },
    { id: "promotions", title: "Promotions & Offers", description: "Receive news about special deals and offers." },
    { id: "account-activity", title: "Account Activity", description: "Get alerts for logins and other account activities." },
];

export default function NotificationSettingsPage() {
    const router = useRouter();
    const { user, firestore, loading: authLoading } = useAuth();
    const [settings, setSettings] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        if (user) {
            const initialSettings: { [key: string]: boolean } = {};
            notificationSettingsList.forEach(s => {
                initialSettings[s.id] = user.notificationSettings?.[s.id] ?? true;
            });
            setSettings(initialSettings);
        }
    }, [user]);

    const handleSettingChange = (settingId: string, checked: boolean) => {
        if (!user) return;
        
        const newSettings = { ...settings, [settingId]: checked };
        setSettings(newSettings);

        const userRef = doc(firestore, 'users', user.id);
        setDoc(userRef, {
            notificationSettings: newSettings
        }, { merge: true }).then(() => {
            toast.success("Preferences updated");
        }).catch(err => {
            toast.error("Failed to update preferences");
            // Revert UI on error
            setSettings(settings);
        });
    }
    
    if (authLoading || !user) {
        return <Preloader />;
    }

    return (
        <>
            <SubHeader title="Notification Settings" />

            <main className="p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Your Notifications</CardTitle>
                        <CardDescription>Choose which updates you want to receive.</CardDescription>
                    </CardHeader>
                    <CardContent className="divide-y divide-border/50">
                        {notificationSettingsList.map(setting => (
                            <div key={setting.id} className="flex items-center justify-between py-4">
                                <div>
                                    <h3 className="font-semibold">{setting.title}</h3>
                                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                                </div>
                                <Switch 
                                    checked={settings[setting.id] ?? true}
                                    onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
