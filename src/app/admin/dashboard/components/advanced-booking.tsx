"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Clock, MapPin, Star, Settings, Plus, Edit, Trash2, Repeat, Users2, Gift } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import type { Booking, ScheduledTrip } from '@/lib/data';

interface AdvancedBookingProps {
  bookings: Booking[];
  scheduledTrips: ScheduledTrip[];
  loading: boolean;
}

const recurringBookingSchema = z.object({
  name: z.string().min(1, "Booking name is required"),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  daysOfWeek: z.array(z.number()).optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  routeId: z.string().min(1, "Route is required"),
  passengerCount: z.coerce.number().min(1, "At least 1 passenger required"),
  discountPercentage: z.coerce.number().min(0).max(100, "Discount must be between 0-100%")
});

const groupBookingSchema = z.object({
  groupName: z.string().min(1, "Group name is required"),
  organizerName: z.string().min(1, "Organizer name is required"),
  organizerPhone: z.string().min(10, "Valid phone number required"),
  passengerCount: z.coerce.number().min(2, "Group must have at least 2 passengers"),
  routeId: z.string().min(1, "Route is required"),
  travelDate: z.date(),
  specialRequirements: z.string().optional(),
  groupDiscount: z.coerce.number().min(0).max(100, "Discount must be between 0-100%")
});

type RecurringBookingFormData = z.infer<typeof recurringBookingSchema>;
type GroupBookingFormData = z.infer<typeof groupBookingSchema>;

export function AdvancedBooking({ bookings, scheduledTrips, loading }: AdvancedBookingProps) {
  const [recurringBookings, setRecurringBookings] = useState<any[]>([]);
  const [groupBookings, setGroupBookings] = useState<any[]>([]);
  const [isAddingRecurring, setIsAddingRecurring] = useState(false);
  const [isAddingGroup, setIsAddingGroup] = useState(false);

  const recurringForm = useForm<RecurringBookingFormData>({
    resolver: zodResolver(recurringBookingSchema),
    defaultValues: {
      name: '',
      frequency: 'weekly',
      daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
      startDate: new Date(),
      passengerCount: 1,
      discountPercentage: 0
    }
  });

  const groupForm = useForm<GroupBookingFormData>({
    resolver: zodResolver(groupBookingSchema),
    defaultValues: {
      groupName: '',
      organizerName: '',
      organizerPhone: '',
      passengerCount: 2,
      travelDate: new Date(),
      groupDiscount: 10
    }
  });

  // Calculate booking analytics
  const bookingAnalytics = useMemo(() => {
    if (!bookings.length) return null;

    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(booking => 
      booking.status === 'Completed' || booking.status === 'Delivered'
    ).length;
    
    const groupBookingsCount = bookings.filter(booking => 
      booking.passengerCount && booking.passengerCount > 1
    ).length;
    
    const recurringBookingsCount = bookings.filter(booking => 
      booking.isRecurring
    ).length;

    const averageGroupSize = bookings
      .filter(booking => booking.passengerCount && booking.passengerCount > 1)
      .reduce((sum, booking) => sum + (booking.passengerCount || 0), 0) / 
      Math.max(groupBookingsCount, 1);

    const totalRevenue = bookings
      .filter(booking => booking.status === 'Completed' || booking.status === 'Delivered')
      .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

    const groupRevenue = bookings
      .filter(booking => booking.passengerCount && booking.passengerCount > 1)
      .filter(booking => booking.status === 'Completed' || booking.status === 'Delivered')
      .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

    return {
      totalBookings,
      completedBookings,
      groupBookingsCount,
      recurringBookingsCount,
      averageGroupSize: Math.round(averageGroupSize),
      totalRevenue,
      groupRevenue,
      groupRevenuePercentage: totalRevenue > 0 ? Math.round((groupRevenue / totalRevenue) * 100) : 0
    };
  }, [bookings]);

  const handleAddRecurringBooking = (data: RecurringBookingFormData) => {
    const newRecurringBooking = {
      id: Date.now().toString(),
      ...data,
      status: 'active',
      createdAt: new Date(),
      nextBooking: data.startDate
    };
    
    setRecurringBookings(prev => [...prev, newRecurringBooking]);
    setIsAddingRecurring(false);
    recurringForm.reset();
    toast.success("Recurring booking created successfully");
  };

  const handleAddGroupBooking = (data: GroupBookingFormData) => {
    const newGroupBooking = {
      id: Date.now().toString(),
      ...data,
      status: 'pending',
      createdAt: new Date()
    };
    
    setGroupBookings(prev => [...prev, newGroupBooking]);
    setIsAddingGroup(false);
    groupForm.reset();
    toast.success("Group booking request created successfully");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bookingAnalytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No booking data available</p>
        </CardContent>
      </Card>
    );
  }

  const { totalBookings, completedBookings, groupBookingsCount, recurringBookingsCount, averageGroupSize, totalRevenue, groupRevenue, groupRevenuePercentage } = bookingAnalytics;

  return (
    <div className="space-y-6">
      {/* Booking Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{totalBookings}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {completedBookings} completed
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Group Bookings</p>
                <p className="text-2xl font-bold">{groupBookingsCount}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Avg: {averageGroupSize} passengers
                </p>
              </div>
              <Users2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recurring Bookings</p>
                <p className="text-2xl font-bold">{recurringBookingsCount}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Active subscriptions
                </p>
              </div>
              <Repeat className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Group Revenue</p>
                <p className="text-2xl font-bold">₦{groupRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {groupRevenuePercentage}% of total
                </p>
              </div>
              <Gift className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recurring" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recurring">Recurring Bookings</TabsTrigger>
          <TabsTrigger value="groups">Group Bookings</TabsTrigger>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
        </TabsList>

        <TabsContent value="recurring" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recurring Bookings</CardTitle>
              <Button onClick={() => setIsAddingRecurring(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Recurring Booking
              </Button>
            </CardHeader>
            <CardContent>
              {isAddingRecurring && (
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <form onSubmit={recurringForm.handleSubmit(handleAddRecurringBooking)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Booking Name</Label>
                          <Input {...recurringForm.register('name')} placeholder="e.g., Daily Commute" />
                        </div>
                        <div>
                          <Label htmlFor="frequency">Frequency</Label>
                          <select {...recurringForm.register('frequency')} className="w-full p-2 border rounded">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="passengerCount">Passenger Count</Label>
                          <Input type="number" {...recurringForm.register('passengerCount')} />
                        </div>
                        <div>
                          <Label htmlFor="discountPercentage">Discount %</Label>
                          <Input type="number" {...recurringForm.register('discountPercentage')} />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit">Create Recurring Booking</Button>
                        <Button type="button" variant="outline" onClick={() => setIsAddingRecurring(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Passengers</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Booking</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurringBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{booking.frequency}</Badge>
                      </TableCell>
                      <TableCell>{booking.passengerCount}</TableCell>
                      <TableCell>{booking.discountPercentage}%</TableCell>
                      <TableCell>
                        <Badge variant={booking.status === 'active' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(booking.nextBooking).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Group Bookings</CardTitle>
              <Button onClick={() => setIsAddingGroup(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Group Booking
              </Button>
            </CardHeader>
            <CardContent>
              {isAddingGroup && (
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <form onSubmit={groupForm.handleSubmit(handleAddGroupBooking)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="groupName">Group Name</Label>
                          <Input {...groupForm.register('groupName')} placeholder="e.g., Company Retreat" />
                        </div>
                        <div>
                          <Label htmlFor="organizerName">Organizer Name</Label>
                          <Input {...groupForm.register('organizerName')} />
                        </div>
                        <div>
                          <Label htmlFor="organizerPhone">Organizer Phone</Label>
                          <Input {...groupForm.register('organizerPhone')} />
                        </div>
                        <div>
                          <Label htmlFor="passengerCount">Group Size</Label>
                          <Input type="number" {...groupForm.register('passengerCount')} />
                        </div>
                        <div>
                          <Label htmlFor="travelDate">Travel Date</Label>
                          <Input type="date" {...groupForm.register('travelDate')} />
                        </div>
                        <div>
                          <Label htmlFor="groupDiscount">Group Discount %</Label>
                          <Input type="number" {...groupForm.register('groupDiscount')} />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="specialRequirements">Special Requirements</Label>
                        <Input {...groupForm.register('specialRequirements')} placeholder="Any special needs or requests" />
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit">Create Group Booking</Button>
                        <Button type="button" variant="outline" onClick={() => setIsAddingGroup(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.groupName}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.organizerName}</p>
                          <p className="text-sm text-muted-foreground">{booking.organizerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{booking.passengerCount} people</TableCell>
                      <TableCell>{new Date(booking.travelDate).toLocaleDateString()}</TableCell>
                      <TableCell>{booking.groupDiscount}%</TableCell>
                      <TableCell>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Discount Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Group Discounts</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>2-4 passengers</span>
                        <Badge>5% off</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>5-9 passengers</span>
                        <Badge>10% off</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>10+ passengers</span>
                        <Badge>15% off</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Loyalty Discounts</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Bronze Members</span>
                        <Badge>0% off</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Silver Members</span>
                        <Badge>5% off</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Gold Members</span>
                        <Badge>10% off</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Platinum Members</span>
                        <Badge>15% off</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}