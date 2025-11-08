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
import { Gift, Star, Users, Award, Settings, Plus, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import type { User, Booking } from '@/lib/data';

interface LoyaltySystemProps {
  users: User[];
  bookings: Booking[];
  loading: boolean;
}

const loyaltyTierSchema = z.object({
  name: z.string().min(1, "Tier name is required"),
  minPoints: z.coerce.number().min(0, "Minimum points must be 0 or higher"),
  discountPercentage: z.coerce.number().min(0).max(100, "Discount must be between 0-100%"),
  benefits: z.string().min(1, "Benefits description is required"),
  color: z.string().min(1, "Color is required")
});

type LoyaltyTierFormData = z.infer<typeof loyaltyTierSchema>;

interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  discountPercentage: number;
  benefits: string;
  color: string;
  isActive: boolean;
}

export function LoyaltySystem({ users, bookings, loading }: LoyaltySystemProps) {
  const [loyaltyTiers, setLoyaltyTiers] = useState<LoyaltyTier[]>([
    {
      id: '1',
      name: 'Bronze',
      minPoints: 0,
      discountPercentage: 0,
      benefits: 'Basic member benefits',
      color: '#CD7F32',
      isActive: true
    },
    {
      id: '2',
      name: 'Silver',
      minPoints: 100,
      discountPercentage: 5,
      benefits: '5% discount on all trips',
      color: '#C0C0C0',
      isActive: true
    },
    {
      id: '3',
      name: 'Gold',
      minPoints: 500,
      discountPercentage: 10,
      benefits: '10% discount + priority booking',
      color: '#FFD700',
      isActive: true
    },
    {
      id: '4',
      name: 'Platinum',
      minPoints: 1000,
      discountPercentage: 15,
      benefits: '15% discount + free upgrades',
      color: '#E5E4E2',
      isActive: true
    }
  ]);

  const [isAddingTier, setIsAddingTier] = useState(false);
  const [editingTier, setEditingTier] = useState<string | null>(null);

  const form = useForm<LoyaltyTierFormData>({
    resolver: zodResolver(loyaltyTierSchema),
    defaultValues: {
      name: '',
      minPoints: 0,
      discountPercentage: 0,
      benefits: '',
      color: '#3B82F6'
    }
  });

  // Calculate user loyalty data
  const loyaltyData = useMemo(() => {
    if (!users.length || !bookings.length) return [];

    return users
      .filter(user => user.userType === 'passenger')
      .map(user => {
        const userBookings = bookings.filter(booking => booking.passengerId === user.id);
        const completedBookings = userBookings.filter(booking => 
          booking.status === 'Completed' || booking.status === 'Delivered'
        );
        
        // Calculate points (1 point per ₦100 spent)
        const totalSpent = completedBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
        const points = Math.floor(totalSpent / 100);
        
        // Determine tier
        const userTier = loyaltyTiers
          .filter(tier => tier.isActive)
          .sort((a, b) => b.minPoints - a.minPoints)
          .find(tier => points >= tier.minPoints) || loyaltyTiers[0];

        const nextTier = loyaltyTiers
          .filter(tier => tier.isActive && tier.minPoints > userTier.minPoints)
          .sort((a, b) => a.minPoints - b.minPoints)[0];

        const pointsToNextTier = nextTier ? nextTier.minPoints - points : 0;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          points,
          tier: userTier,
          totalSpent,
          totalTrips: completedBookings.length,
          pointsToNextTier,
          nextTier: nextTier?.name || null,
          lastTrip: completedBookings.length > 0 
            ? completedBookings.sort((a, b) => 
                new Date(b.createdAt?.toDate?.() || b.createdAt).getTime() - 
                new Date(a.createdAt?.toDate?.() || a.createdAt).getTime()
              )[0]
            : null
        };
      })
      .sort((a, b) => b.points - a.points);
  }, [users, bookings, loyaltyTiers]);

  const handleAddTier = (data: LoyaltyTierFormData) => {
    const newTier: LoyaltyTier = {
      id: Date.now().toString(),
      ...data,
      isActive: true
    };
    
    setLoyaltyTiers(prev => [...prev, newTier].sort((a, b) => a.minPoints - b.minPoints));
    setIsAddingTier(false);
    form.reset();
    toast.success("Loyalty tier added successfully");
  };

  const handleEditTier = (tierId: string, data: LoyaltyTierFormData) => {
    setLoyaltyTiers(prev => prev.map(tier => 
      tier.id === tierId ? { ...tier, ...data } : tier
    ));
    setEditingTier(null);
    form.reset();
    toast.success("Loyalty tier updated successfully");
  };

  const handleDeleteTier = (tierId: string) => {
    setLoyaltyTiers(prev => prev.filter(tier => tier.id !== tierId));
    toast.success("Loyalty tier deleted successfully");
  };

  const toggleTierStatus = (tierId: string) => {
    setLoyaltyTiers(prev => prev.map(tier => 
      tier.id === tierId ? { ...tier, isActive: !tier.isActive } : tier
    ));
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

  return (
    <div className="space-y-6">
      {/* Loyalty Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{loyaltyData.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Tiers</p>
                <p className="text-2xl font-bold">{loyaltyTiers.filter(tier => tier.isActive).length}</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Points Issued</p>
                <p className="text-2xl font-bold">
                  {loyaltyData.reduce((sum, user) => sum + user.points, 0).toLocaleString()}
                </p>
              </div>
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="tiers">Tier Management</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Members</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Trips</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Next Tier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loyaltyData.slice(0, 20).map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          style={{ backgroundColor: member.tier.color, color: 'white' }}
                        >
                          {member.tier.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          {member.points.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>{member.totalTrips}</TableCell>
                      <TableCell>₦{member.totalSpent.toLocaleString()}</TableCell>
                      <TableCell>
                        {member.nextTier ? (
                          <div className="text-sm">
                            <p className="font-medium">{member.nextTier}</p>
                            <p className="text-muted-foreground">
                              {member.pointsToNextTier} points to go
                            </p>
                          </div>
                        ) : (
                          <Badge variant="outline">Max Tier</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Loyalty Tiers</CardTitle>
              <Button onClick={() => setIsAddingTier(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tier
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loyaltyTiers.map((tier) => (
                  <Card key={tier.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: tier.color }}
                          />
                          <div>
                            <h3 className="font-medium">{tier.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {tier.minPoints}+ points • {tier.discountPercentage}% discount
                            </p>
                            <p className="text-sm">{tier.benefits}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={tier.isActive}
                            onCheckedChange={() => toggleTierStatus(tier.id)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTier(tier.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTier(tier.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pointsPerNaira">Points per ₦100 spent</Label>
                  <Input id="pointsPerNaira" defaultValue="1" />
                </div>
                <div>
                  <Label htmlFor="referralPoints">Referral bonus points</Label>
                  <Input id="referralPoints" defaultValue="50" />
                </div>
                <div>
                  <Label htmlFor="birthdayPoints">Birthday bonus points</Label>
                  <Input id="birthdayPoints" defaultValue="100" />
                </div>
                <div>
                  <Label htmlFor="anniversaryPoints">Anniversary bonus points</Label>
                  <Input id="anniversaryPoints" defaultValue="200" />
                </div>
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
