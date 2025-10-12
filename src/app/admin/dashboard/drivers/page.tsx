
"use client"
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User, UserStatus } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DriverApplication } from '@/lib/data';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { AdminHelp } from '../help';
import { useAuth, useFirestore } from '@/firebase';
import { doc, updateDoc, writeBatch, collection, onSnapshot } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ApplicationStatusBadge = ({ status }: { status: string }) => {
    const variants: { [key: string]: string } = {
        'pending': 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10',
        'approved': 'text-green-500 border-green-500/50 bg-green-500/10',
        'rejected': 'text-red-500 border-red-500/50 bg-red-500/10',
    };
    return <Badge variant="outline" className={variants[status]}>{status}</Badge>;
}

export default function AdminDriversPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const [drivers, setDrivers] = useState<User[]>([]);
    const [applications, setApplications] = useState<DriverApplication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubUsers = onSnapshot(collection(firestore, 'users'), (snapshot) => {
            setDrivers(snapshot.docs.map(doc => doc.data() as User).filter(u => u.userType === 'driver'));
            setLoading(false);
        });
        const unsubApps = onSnapshot(collection(firestore, 'driverApplications'), (snapshot) => {
            setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DriverApplication)));
            setLoading(false);
        });

        return () => {
            unsubUsers();
            unsubApps();
        }
    }, [firestore]);
    
    const handleApplicationApproval = async (appId: string) => {
        const appRef = doc(firestore, 'driverApplications', appId);
        const updateData = { status: 'approved' };
        
        updateDoc(appRef, updateData).then(() => {
            toast.success("Application Approved", { 
                description: `Next, create their official user account using the 'Add User' button.`,
                action: {
                    label: "Go to Users",
                    onClick: () => router.push('/admin/dashboard/users'),
                }
            });
        }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: appRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    };
    
    const handleApplicationRejection = async (appId: string) => {
        const appRef = doc(firestore, 'driverApplications', appId);
        const updateData = { status: 'rejected' };
        
        updateDoc(appRef, updateData).then(() => {
            toast.error("Application Rejected");
            // State will update via onSnapshot
        }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: appRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    }


    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Driver Management</h1>
                </div>
                <div className="flex items-center gap-2">
                     <Button asChild><Link href="/admin/dashboard/users"><Plus className="mr-2 h-4 w-4" /> Add User</Link></Button>
                    <AdminHelp page="drivers" />
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                <Tabs defaultValue="drivers">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="drivers">All Drivers</TabsTrigger>
                        <TabsTrigger value="applications">Applications</TabsTrigger>
                    </TabsList>
                    <TabsContent value="drivers" className="mt-4">
                         <Card>
                            <CardHeader>
                                <CardTitle>All Drivers</CardTitle>
                                <CardDescription>A list of all active and registered drivers.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Driver</TableHead>
                                            <TableHead>Date Joined</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-14 w-full" /></TableCell></TableRow>
                                        )) : drivers && drivers.length > 0 ? (
                                            drivers.map((driver: User) => (
                                                <TableRow key={driver.id}>
                                                    <TableCell className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={`https://i.pravatar.cc/150?u=${driver.email}`} />
                                                            <AvatarFallback>{driver.name?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{driver.name}</p>
                                                            <p className="text-xs text-muted-foreground">{driver.phone}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{driver.dateJoined}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{driver.status}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreHorizontal />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admin/dashboard/drivers/${driver.id}`}>View Details</Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>Suspend</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow><TableCell colSpan={4} className="text-center h-24">No drivers found.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="applications" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Driver Applications</CardTitle>
                                <CardDescription>Review pending applications. After approving, create an official user account for the driver in the main "Users" tab.</CardDescription>
                            </CardHeader>
                             <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Applicant</TableHead>
                                            <TableHead>License No.</TableHead>
                                            <TableHead>NIN</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? Array.from({ length: 3 }).map((_, i) => (
                                            <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-14 w-full" /></TableCell></TableRow>
                                        )) : applications && applications.length > 0 ? (
                                            applications.map((app: DriverApplication) => (
                                                <TableRow key={app.id}>
                                                    <TableCell>
                                                        <p className="font-medium">{app.name}</p>
                                                        <p className="text-xs text-muted-foreground">{app.phoneNumber}</p>
                                                    </TableCell>
                                                    <TableCell>{app.driversLicenseNumber}</TableCell>
                                                    <TableCell>{app.nin}</TableCell>
                                                    <TableCell><ApplicationStatusBadge status={app.status} /></TableCell>
                                                    <TableCell>
                                                        {app.status === 'pending' && (
                                                           <AlertDialog>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent>
                                                                        <DropdownMenuItem onClick={() => handleApplicationApproval(app.id)}>Approve</DropdownMenuItem>
                                                                        <AlertDialogTrigger asChild>
                                                                            <DropdownMenuItem className="text-red-500" onSelect={(e) => e.preventDefault()}>Reject</DropdownMenuItem>
                                                                        </AlertDialogTrigger>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                                <AlertDialogContent>
                                                                     <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>This action will permanently reject the application. You cannot undo this.</AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleApplicationRejection(app.id)}>Yes, Reject</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow><TableCell colSpan={5} className="text-center h-24">No new applications.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
