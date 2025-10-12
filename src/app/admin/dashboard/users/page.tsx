
"use client"
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { User, UserStatus } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, ArrowLeft, Search, Plus, User as UserIcon, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/firebase';
import { AdminHelp } from '../help';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { DrawerBody, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import Link from 'next/link';
import { SubHeader } from '@/components/sub-header';
import { PhoneInput } from '@/components/ui/phone-input';
import useSWR from 'swr';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { usePreloader } from '@/context/preloader-context';


const fetcher = async (url: string, idToken: string | undefined) => {
    if (!idToken) throw new Error("Not authorized");
    const res = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` }});
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `An error occurred on the server (${res.status}).` }));
        const error = new Error(errorData.message || 'An error occurred while fetching data.');
        throw error;
    }
    
    return res.json();
}

const addUserFormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Invalid email."),
  phone: z.string().min(10, "A valid phone number is required."),
  userType: z.enum(["customer", "driver", "admin"]),
  role: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const AddUserDialog = ({ onUserAdded }: { onUserAdded: () => void }) => {
    const [open, setOpen] = useState(false);
    const { firebaseUser } = useAuth();

    const form = useForm<z.infer<typeof addUserFormSchema>>({
        resolver: zodResolver(addUserFormSchema),
        defaultValues: { name: "", email: "", phone: "", password: "", userType: "customer", role: "Customer" },
    });

    const onSubmit = async (data: z.infer<typeof addUserFormSchema>) => {
        if (!firebaseUser) return;
        
        let apiData = { ...data };
        if (data.userType !== 'admin') {
            apiData.role = data.userType;
        }

        try {
            const idToken = await firebaseUser.getIdToken();
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify(apiData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add user.');
            }

            toast.success("User Added", { description: `${data.name} has been added.` });
            onUserAdded();
            setOpen(false);

        } catch(e: any) {
            toast.error('Error adding user', { description: e.message || 'Could not add user.' });
        }
    };

    return (
        <ResponsiveDialog open={open} onOpenChange={setOpen} trigger={
            <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add User
            </Button>
        }>
            <DrawerHeader>
                <DrawerTitle>Add New User</DrawerTitle>
                <DrawerDescription>Enter the details for the new user.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
                <div className="p-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} id="add-user-form" className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input type="text" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <PhoneInput 
                                            {...field} 
                                            control={form.control} 
                                            defaultCountry="NG"
                                            international
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField
                                control={form.control}
                                name="userType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>User Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="customer">Customer</SelectItem>
                                                <SelectItem value="driver">Driver</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {form.watch('userType') === 'admin' && (
                                <FormField control={form.control} name="role" render={({ field }) => (
                                    <FormItem><FormLabel>Admin Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Manager">Manager</SelectItem>
                                                <SelectItem value="Support">Support</SelectItem>
                                                <SelectItem value="Finance">Finance</SelectItem>
                                                <SelectItem value="Marketing">Marketing</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    <FormMessage /></FormItem>
                                )} />
                            )}
                            <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </form>
                    </Form>
                </div>
            </DrawerBody>
            <DrawerFooter>
                <Button type="submit" form="add-user-form">Add User</Button>
            </DrawerFooter>
        </ResponsiveDialog>
    );
};


const StatusBadge = ({ status }: { status: UserStatus }) => {
    const variants: Record<UserStatus, string> = {
        'Active': 'text-green-500 border-green-500/50 bg-green-500/10',
        'Inactive': 'text-muted-foreground border-border bg-card',
        'Suspended': 'text-red-500 border-red-500/50 bg-red-500/10',
        'Online': 'text-green-500 border-green-500/50 bg-green-500/10',
        'Offline': 'text-muted-foreground border-border bg-card',
    };
    return <Badge variant="outline" className={variants[status]}>{status}</Badge>;
};

const UserActionsMenu = ({ user, onActionComplete }: { user: User; onActionComplete: () => void }) => {
    const { firebaseUser } = useAuth();
    const { showPreloader } = usePreloader();
    const router = useRouter();

    const handleSuspend = async () => {
        const newStatus = user.status === 'Suspended' ? 'Active' : 'Suspended';
        
        try {
            if (!firebaseUser) throw new Error("Not authenticated");
            const idToken = await firebaseUser.getIdToken();
            const response = await fetch(`/api/admin/users/${user.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update status.");
            }
            
            toast.success(`User ${newStatus}`, { description: `${user.name}'s account has been updated.`});
            onActionComplete();
        } catch (error: any) {
            toast.error('Error', { description: error.message || 'Could not update user status.' });
        }
    };
    
    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        showPreloader();
        router.push(href);
    }
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem asChild>
                    <Link href={`/admin/dashboard/users/${user.id}`} onClick={(e) => handleLinkClick(e, `/admin/dashboard/users/${user.id}`)}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSuspend}>
                    {user.status === 'Suspended' ? 'Activate' : 'Suspend'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const UserCard = ({ user, onActionComplete }: { user: User, onActionComplete: () => void }) => {
    const { showPreloader } = usePreloader();
    const router = useRouter();
    const handleCardClick = () => {
        showPreloader();
        router.push(`/admin/dashboard/users/${user.id}`);
    };
    return (
        <Card onClick={handleCardClick} className="cursor-pointer">
            <CardContent className="p-4 flex items-start gap-4">
                 <Avatar>
                    <AvatarImage src={user.profilePictureUrl || `https://i.pravatar.cc/150?u=${user.email}`} />
                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                        <p className="font-bold">{user.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 pt-1">
                        <StatusBadge status={user.status} />
                        <Badge variant="secondary" className="capitalize">{user.role || user.userType}</Badge>
                    </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                    <UserActionsMenu user={user} onActionComplete={onActionComplete} />
                </div>
            </CardContent>
        </Card>
    )
}

export default function AdminUsersPage() {
    const isMobile = useIsMobile();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const { firebaseUser } = useAuth();
    const [idToken, setIdToken] = useState<string | undefined>();

    useEffect(() => {
        firebaseUser?.getIdToken().then(setIdToken);
    }, [firebaseUser]);

    const { data: users, isLoading: loading, error, mutate } = useSWR<User[]>(
        idToken ? ['/api/admin/users', idToken] : null, 
        ([url, token]) => fetcher(url, token)
    );
    
    if (error) {
        throw error;
    }


    const filteredUsers = useMemo(() => {
        if (!users) return [];
        let filtered = users;
        
        if (filter !== 'all') {
            filtered = filtered.filter(user => {
                if (filter === 'admin') return user.userType === 'admin';
                if (filter === 'driver') return user.userType === 'driver';
                if (filter === 'customer') return user.userType === 'customer';
                return true;
            });
        }

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filtered = filtered.filter(user => 
                user.name.toLowerCase().includes(lowercasedFilter) ||
                (user.email && user.email.toLowerCase().includes(lowercasedFilter))
            );
        }

        return filtered;
    }, [searchTerm, filter, users]);

    return (
        <div className="flex flex-col h-full">
             <SubHeader title="User Management">
                 <div className="flex items-center gap-2">
                    <AddUserDialog onUserAdded={mutate} />
                    <AdminHelp page="users" />
                </div>
            </SubHeader>
            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                        <div className="pt-4 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    type="text"
                                    placeholder="Search by name or email..." 
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                             <Tabs defaultValue="all" onValueChange={setFilter}>
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="customer">Customers</TabsTrigger>
                                    <TabsTrigger value="driver">Drivers</TabsTrigger>
                                    <TabsTrigger value="admin">Admins</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </CardHeader>
                    <CardContent>
                       {loading ? (
                             <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                             </div>
                       ) : isMobile ? (
                            filteredUsers.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredUsers.map(user => <UserCard key={user.id} user={user} onActionComplete={mutate} />)}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-muted-foreground">
                                    <UserIcon className="h-16 w-16 mx-auto text-primary/20" />
                                    <p className="text-lg font-semibold mt-4">No users found</p>
                                    <p className="mt-1">Try adjusting your search or filter.</p>
                                </div>
                            )
                       ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Date Joined</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                   {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.email}>
                                                <TableCell className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={user.profilePictureUrl || `https://i.pravatar.cc/150?u=${user.email}`} />
                                                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="capitalize">{user.role || user.userType}</TableCell>
                                                <TableCell>{user.dateJoined}</TableCell>
                                                <TableCell>
                                                    <StatusBadge status={user.status} />
                                                </TableCell>
                                                <TableCell>
                                                    <UserActionsMenu user={user} onActionComplete={mutate} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                         <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24">
                                                No users match your criteria.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                       )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

