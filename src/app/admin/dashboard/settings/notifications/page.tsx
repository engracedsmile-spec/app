"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubHeader } from "@/components/sub-header";

const notificationSettings = [
    { id: "shipment-created", title: "Shipment Created", description: "Notify user when a new shipment is successfully booked." },
    { id: "out-for-delivery", title: "Out for Delivery", description: "Notify user when a courier is on their way." },
    { id: "shipment-delivered", title: "Shipment Delivered", description: "Notify user upon successful delivery." },
    { id: "shipment-delayed", title: "Shipment Delayed", description: "Notify user if there's a delay in their shipment." },
    { id: "promotions", title: "Promotional Emails", description: "Send users marketing and promotional content." },
]

export default function NotificationSettingsPage() {
    const router = useRouter();
    return (
        <>
            <SubHeader title="Notification Settings" />
            <main className="p-4 md:p-6 space-y-6">
                <Link href="/admin/dashboard/settings/notifications/compose">
                    <Button className="w-full h-12 text-base">
                        <Send className="mr-2 h-5 w-5" />
                        Compose New Notification
                    </Button>
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle>Automated Notifications</CardTitle>
                        <CardDescription>Configure automated notifications sent to users at different stages of the delivery process.</CardDescription>
                    </CardHeader>
                    <CardContent className="divide-y divide-border">
                        {notificationSettings.map(setting => (
                            <div key={setting.id} className="flex items-center justify-between py-4">
                                <div>
                                    <h3 className="font-semibold">{setting.title}</h3>
                                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                                </div>
                                <Switch defaultChecked={setting.id !== 'promotions'} />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </main>
        </>
    )
}
