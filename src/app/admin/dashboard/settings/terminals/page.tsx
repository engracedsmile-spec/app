
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, Trash2, Edit, Route as RouteIcon, RefreshCw, TerminalSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { getFirestore, doc, onSnapshot, setDoc, collection, serverTimestamp, writeBatch, query, orderBy } from 'firebase/firestore';
import { useAuth } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { v4 as uuidv4 } from 'uuid';
import type { Terminal } from "@/lib/data";
import { AdminHelp } from "../../help";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerBody } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { nigeriaData } from "@/lib/nigeria-data";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const terminalSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Terminal name must be at least 3 characters long."),
  city: z.string().min(1, "Please select a city."),
  state: z.string().min(1, "Please select a state."),
  address: z.string().min(1, "Address is required."),
  heroImageUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']),
});


const AddEditTerminalForm = ({ onComplete, terminalToEdit }: { onComplete: () => void, terminalToEdit?: Terminal }) => {
    const { user, firestore } = useAuth();
    const isEditMode = !!terminalToEdit;

    const form = useForm<z.infer<typeof terminalSchema>>({
        resolver: zodResolver(terminalSchema),
        defaultValues: isEditMode ? terminalToEdit : { 
            id: uuidv4(), name: "", city: "", state: "", address: "", heroImageUrl: "", status: 'active'
        }
    });

    const onSubmit = async (data: z.infer<typeof terminalSchema>) => {
        if (!user) return;
        
        try {
            const docRef = doc(firestore, 'terminals', data.id);
            const submissionData = {
                ...data,
                updatedAt: serverTimestamp(),
                ...(isEditMode ? {} : { createdAt: serverTimestamp(), createdBy: user.id })
            }
            await setDoc(docRef, submissionData, { merge: true });
            toast.success(isEditMode ? "Terminal Updated" : "Terminal Created");
            onComplete();
        } catch (error) {
            console.error("Error saving terminal:", error);
            toast.error("Save Failed", { description: "Could not save terminal."});
        }
    }

    const states = nigeriaData.map(s => s.state).sort();

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Terminal Name</FormLabel><FormControl><Input placeholder="e.g. Benin Central Terminal" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <div className="grid grid-cols-2 gap-4">
                     <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem><FormLabel>State</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger></FormControl><SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="e.g. Benin City" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                 <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Full Address</FormLabel><FormControl><Textarea placeholder="123 Benin-Sapele Road, Benin City" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="heroImageUrl" render={({ field }) => (
                    <FormItem><FormLabel>Hero Image URL</FormLabel><FormControl><Input placeholder="https://example.com/image.jpg" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                 <FormField control={form.control} name="status" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><FormLabel>Active Status</FormLabel><FormControl><Switch checked={field.value === 'active'} onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'inactive')} /></FormControl></FormItem>)}/>

                <DrawerFooter>
                    <Button type="submit">{isEditMode ? "Save Changes" : "Create Terminal"}</Button>
                </DrawerFooter>
            </form>
        </Form>
    )
}

export default function TerminalsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTerminal, setEditingTerminal] = useState<Terminal | undefined>(undefined);
    const { firestore } = useAuth();
    
    useEffect(() => {
        const terminalsRef = collection(firestore, 'terminals');
        const q = query(terminalsRef, orderBy('name'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTerminals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Terminal)));
            setLoading(false);
        }, (error) => {
            console.error(error);
            setLoading(false);
        });
        return unsubscribe;
    }, [firestore]);
    
    const openForm = (terminal?: Terminal) => {
        setEditingTerminal(terminal);
        setIsFormOpen(true);
    }
    
    const onFormComplete = () => {
        setIsFormOpen(false);
        setEditingTerminal(undefined);
    }

    return (
         <div className="flex flex-col h-dvh">
            <header className="flex items-center justify-between p-4 sticky top-0 bg-background z-10 border-b border-border/50">
                 <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Terminal Management</h1>
                </div>
                 <div className="flex items-center gap-2">
                    <Button asChild variant="outline"><Link href="/admin/dashboard/settings/routes"><RouteIcon className="mr-2 h-4 w-4" /> Manage Routes</Link></Button>
                    <Button onClick={() => openForm()}><Plus className="mr-2 h-4 w-4" /> New Terminal</Button>
                 </div>
            </header>
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6 overflow-hidden">
                <Card className="lg:col-span-3">
                     <CardHeader>
                        <CardTitle>All Terminals</CardTitle>
                        <CardDescription>Manage all physical locations. After creating terminals, proceed to create routes between them.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Terminal Name</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : terminals.map(terminal => (
                                    <TableRow key={terminal.id}>
                                        <TableCell className="font-bold">{terminal.name}</TableCell>
                                        <TableCell>{terminal.city}, {terminal.state}</TableCell>
                                        <TableCell><span className={`px-2 py-1 text-xs rounded-full ${terminal.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>{terminal.status}</span></TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => openForm(terminal)}>
                                                <Edit className="h-4 w-4"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>

             <ResponsiveDialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                 <DrawerHeader>
                    <DrawerTitle>{editingTerminal ? "Edit" : "Create"} Terminal</DrawerTitle>
                    <DrawerDescription>
                        {editingTerminal 
                            ? `Editing the ${editingTerminal.name} terminal.`
                            : `Define a new physical terminal.`
                        }
                    </DrawerDescription>
                </DrawerHeader>
                <DrawerBody>
                    <AddEditTerminalForm 
                        onComplete={onFormComplete} 
                        terminalToEdit={editingTerminal}
                    />
                </DrawerBody>
             </ResponsiveDialog>
        </div>
    )
}
