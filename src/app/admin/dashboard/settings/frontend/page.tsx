
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft, Edit, FileText, Image as ImageIcon, Info, BadgePercent, Car } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const frontendLinks = [
    {
        title: "Landing Page",
        description: "Edit hero image, headlines, and call-to-action buttons.",
        href: "/admin/dashboard/settings/frontend/landing",
        icon: ImageIcon,
    },
     {
        title: "Vehicle Showcase",
        description: "Manage images shown on the booking details screen.",
        href: "/admin/dashboard/settings/frontend/vehicle-showcase",
        icon: Car,
    },
    {
        title: "About Us Page",
        description: "Manage the content of your company's about us page.",
        href: "/admin/dashboard/settings/frontend/about",
        icon: Info,
    },
    {
        title: "Privacy Policy",
        "description": "Manage the content of your privacy policy page.",
        href: "/admin/dashboard/settings/frontend/privacy-policy",
        icon: FileText,
    },
    {
        title: "Terms of Service",
        "description": "Manage the content of your terms of service page.",
        href: "/admin/dashboard/settings/frontend/terms-of-service",
        icon: FileText,
    },
]

export default function FrontendSettingsPage() {
    const router = useRouter();
    
    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-center p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2 absolute left-4">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Frontend CMS</h1>
            </header>
            <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Content Management</CardTitle>
                        <CardDescription>
                            Update content across your application's public-facing pages.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {frontendLinks.map(link => (
                            <Link href={link.href} key={link.title} className="block">
                                <Card className="hover:border-primary transition-colors">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg">{link.title}</CardTitle>
                                            <CardDescription>{link.description}</CardDescription>
                                        </div>
                                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted text-muted-foreground">
                                            <link.icon className="h-5 w-5" />
                                        </div>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
