
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, Wifi, Download, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { getFirestore, doc, onSnapshot, collection, query, orderBy, deleteDoc } from 'firebase/firestore';
import { useAuth } from "@/firebase";
import type { WiFi, Vehicle } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import QRCode from 'qrcode.react';
import { toPng } from 'html-to-image';
import { LogoIcon } from "@/components/icons/logo-icon";

const logoImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMC43NCAxNS4yNiI+PGcgZmlsbD0iIzAwMCI+PHBhdGggZD0iTTQuNTUgMTUuMjZjMC4zNSwtMC40NiAwLjcyLC0wLjk5IDEuMDgsLTEuNTVsLTEuMiAwLjI3IC0wLjAxIC0wLjQ1IDEuNiAtMC40MyAwLjEgLTAuMTYgLTEuNjUgMC40MSAtMC4wMSAtMS4wMiAyLjQyIC0wLjcyIC0wLjAxIDAuMDRjMC4wNiwtMC4xMSAwLjEyLC0wLjIyIDAuMTgsLTAuMzRsLTEuNzUgMC40NCAtMC4wMyAtMC42NSAyLjIxIC0wLjY3YzAuMDQsLTAuMDcgMC4wNywtMC4xNSAwLjEsLTAuMjJsLTIuMjcgMC42NCAtMC4wNiAtMS40OCAzLjA5IC0xLjAxYzAuNDMsLTEuMjMgMC42OSwtMi40NSAwLjY5LC0zLjU1IDAsLTAuMTcgLTAuMDEsLTAuMzMgLTAuMDMsLTAuNDkgLTAuMDgsMC4wMSAtMC4xNiwwLjAxIC0wLjI3LC0wIDAsMC4wNyAwLjAxLDAuMTUgMC4wMSwwLjIyIDAsMi4xNCAtMS43MywzLjg3IC0zLjg3LDMuODcgLTIuMTQsMCAtMy44NywtMS43MyAtMy44NywtMy44NyAwLC0yLjE0IDEuNzMsLTMuODcgMy44NywtMy44NyAwLjQ3LDAgMC45MywwLjA5IDEuMzUsMC4yNCAwLC0wLjA5IC0wLC0wLjE5IC0wLjAxLC0wLjI4IC0wLjUyLC0wLjIxIC0xLjA5LC0wLjMzIC0xLjY5LC0wLjMzIC0yLjIzLDAgLTQuMDcsMS42MSAtNC40NSwzLjczIC0wLjI5LDEuNjMgMC41OCw0LjAzIDEuNjksNi4yOWwzLjMgLTAuOTEgMC4wNCAwLjYgLTIuODggMC44MyAwLjEgMC4yOCAyLjc4IC0wLjAzIDAuMDQgMC42NSAtMi42OSAwLjcyYzAuMDQsMC4wOCAwLjA5LDAuMTYgMC4xMywwLjI0bDIuNTYgLTAuNzQgMC4wMyAwLjYyIC0yLjI4IDAuNjggMC4xMyAwLjIyIDEuMzIgLTAuMzIgMC4wMiAwLjQyIC0xLjEyIDAuMjkgMC4xIDAuMTcgMS4wMSAtMC4yNyAwLjAxIDAuNDUgLTAuOCAwLjE5IDAuMDkgMC4xNCAwLjcyIC0wLjE5IDAuMDEgMC40MyAtMC41IDAuMTNjMC4yNiwwLjQzIDAuNSwwLjgxIDAuNywxLjE0em0xLjg2IC0yLjgxYzAuMDQsLTAuMDggMC4wOSwtMC4xNSAwLjEzLC0wLjIzbC0xLjU0IDAuMzkgLTAgMC4xOSAxLjQgLTAuMzcgMCAwLjAyem0xLjQ4IC0yLjk2YzAuMDQsLTAuMSAwLjA4LC0wLjE5IDAuMTIsLTAuMjlsLTEuOTYgMC41NiAwLjAxIDAuMjcgMS44MyAtMC41M3oiIC8+PHBhdGggZD0iTTYuOTcgMGMwLjM0LDIuNCAxLjc5LDMuMTMgMy43NywzLjA4IC0yLjQxLDAuMTcgLTMuNzYsMS4xMSAtMy43NywzLjA4IDAuMjcsLTIuMyAtMS41OCwtMi44MiAtMy43NywtMy4wOCAyLjIsMC4xNSAzLjQ0LC0wLjg4IDMuNzcsLTMuMTh6IiAvPjwvZz48L3N2Zz4=";

const WifiQRCard = React.forwardRef(({ wifi }: { wifi: WiFi }, ref: React.Ref<HTMLDivElement>) => (
    <div ref={ref} className="bg-primary p-8 rounded-2xl w-[320px] flex flex-col items-center text-center text-primary-foreground">
        <LogoIcon className="h-10 w-10 mb-4" />
        <h3 className="text-2xl font-bold">Scan to Connect</h3>
        <p className="text-base text-primary-foreground/80 mb-6">Point your camera at the QR code to join our WiFi</p>
        <div className="bg-white p-3 rounded-lg">
             <QRCode
                value={`WIFI:S:${wifi.name};T:WPA;P:${wifi.password};;`}
                size={150}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                imageSettings={{
                    src: logoImage,
                    x: undefined,
                    y: undefined,
                    height: 24,
                    width: 24,
                    excavate: true,
                }}
            />
        </div>
        <div className="mt-6 space-y-3">
            <div>
                <p className="text-sm text-primary-foreground/80">Network (SSID)</p>
                <p className="font-semibold text-lg">{wifi.name}</p>
            </div>
            <div>
                <p className="text-sm text-primary-foreground/80">Password</p>
                <p className="font-semibold text-lg font-mono">{wifi.password}</p>
            </div>
        </div>
    </div>
));
WifiQRCard.displayName = "WifiQRCard";

export default function InventoryPage() {
    const router = useRouter();
    const [wifiNetworks, setWifiNetworks] = useState<WiFi[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const { firestore } = useAuth();
    const qrCardRef = useRef<HTMLDivElement>(null);
    const [selectedWifiForQR, setSelectedWifiForQR] = useState<WiFi | null>(null);

    useEffect(() => {
        const unsubWifi = onSnapshot(query(collection(firestore, 'wifi'), orderBy('name')), (snapshot) => {
            setWifiNetworks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WiFi)));
            setLoading(false);
        });
        const unsubVehicles = onSnapshot(query(collection(firestore, 'vehicles')), (snapshot) => {
            setVehicles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle)));
        });
        return () => {
            unsubWifi();
            unsubVehicles();
        }
    }, [firestore]);
    
    const handleDownload = async (wifi: WiFi) => {
        setSelectedWifiForQR(wifi);
        
        setTimeout(async () => {
            if (qrCardRef.current === null) {
                toast.error("QR card element not found.");
                return;
            }
            try {
                const dataUrl = await toPng(qrCardRef.current, { cacheBust: true, pixelRatio: 2 });
                const link = document.createElement('a');
                link.download = `${wifi.name}-wifi-qr.png`;
                link.href = dataUrl;
                link.click();
            } catch (err) {
                console.error('Failed to generate QR image', err);
                toast.error("Failed to generate QR code image.");
            } finally {
                setSelectedWifiForQR(null);
            }
        }, 100);
    };

    const getVehiclePlate = (wifiId: string) => {
        const vehicle = vehicles.find(v => v.wifiId === wifiId);
        return vehicle?.licensePlate || 'N/A';
    }

    return (
        <div className="flex flex-col h-dvh">
            <header className="flex items-center justify-between p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">WiFi Inventory</h1>
                </div>
            </header>
             <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Wifi className="h-5 w-5"/>Onboard WiFi Networks</CardTitle>
                        <CardDescription>WiFi credentials are auto-generated when a vehicle is created. Download QR codes for passengers here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Vehicle Plate</TableHead>
                                    <TableHead>Network Name (SSID)</TableHead>
                                    <TableHead>Password</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? Array.from({length: 3}).map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-12 w-full"/></TableCell></TableRow>
                                )) : wifiNetworks.length > 0 ? wifiNetworks.map(wifi => (
                                    <TableRow key={wifi.id}>
                                        <TableCell className="font-semibold">{getVehiclePlate(wifi.id)}</TableCell>
                                        <TableCell className="font-semibold">{wifi.name}</TableCell>
                                        <TableCell className="font-mono">{wifi.password}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleDownload(wifi)}>
                                                <Download className="mr-2 h-4 w-4"/> Download QR
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24">No WiFi networks found. Add a vehicle to auto-generate one.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
             </main>
             {/* Hidden element for QR code generation */}
             {selectedWifiForQR && (
                <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                    <WifiQRCard ref={qrCardRef} wifi={selectedWifiForQR} />
                </div>
            )}
        </div>
    )
}
