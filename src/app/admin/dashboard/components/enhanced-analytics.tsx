"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, DollarSign, Clock, MapPin, Star, Award, CheckCircle } from 'lucide-react';
import { ChartContainer } from '@/components/ui/chart';
import { Bar, Line, Pie, PieChart, ResponsiveContainer, Tooltip, Legend, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { Booking, User, Vehicle } from '@/lib/data';

interface EnhancedAnalyticsProps {
  bookings: Booking[];
  users: User[];
  vehicles: Vehicle[];
  loading: boolean;
}

export function EnhancedAnalytics({ bookings, users, vehicles, loading }: EnhancedAnalyticsProps) {
  // Calculate analytics data
  const analyticsData = useMemo(() => {
    if (!bookings.length) return null;

    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Revenue trends
    const dailyRevenue = bookings
      .filter(booking => booking.status === 'Completed' || booking.status === 'Delivered')
      .reduce((acc, booking) => {
        const date = new Date(booking.createdAt?.toDate?.() || booking.createdAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + (booking.totalAmount || 0);
        return acc;
      }, {} as Record<string, number>);

    const revenueData = Object.entries(dailyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, revenue]) => ({ date, revenue }));

    // Route performance
    const routePerformance = bookings
      .filter(booking => booking.status === 'Completed' || booking.status === 'Delivered')
      .reduce((acc, booking) => {
        const route = booking.routeName || 'Unknown';
        if (!acc[route]) {
          acc[route] = { bookings: 0, revenue: 0, rating: 0 };
        }
        acc[route].bookings += 1;
        acc[route].revenue += booking.totalAmount || 0;
        return acc;
      }, {} as Record<string, { bookings: number; revenue: number; rating: number }>);

    const routeData = Object.entries(routePerformance)
      .map(([route, data]) => ({
        route: route.length > 15 ? route.substring(0, 15) + '...' : route,
        bookings: data.bookings,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Driver performance
    const driverPerformance = bookings
      .filter(booking => booking.status === 'Completed' || booking.status === 'Delivered')
      .reduce((acc, booking) => {
        const driver = booking.driverName || 'Unknown';
        if (!acc[driver]) {
          acc[driver] = { trips: 0, revenue: 0, rating: 4.5 };
        }
        acc[driver].trips += 1;
        acc[driver].revenue += booking.totalAmount || 0;
        return acc;
      }, {} as Record<string, { trips: number; revenue: number; rating: number }>);

    const driverData = Object.entries(driverPerformance)
      .map(([driver, data]) => ({
        driver: driver.length > 12 ? driver.substring(0, 12) + '...' : driver,
        trips: data.trips,
        revenue: data.revenue,
        rating: data.rating
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    // Status distribution
    const statusDistribution = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusData = Object.entries(statusDistribution).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / bookings.length) * 100)
    }));

    // Calculate key metrics
    const totalRevenue = bookings
      .filter(booking => booking.status === 'Completed' || booking.status === 'Delivered')
      .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

    const completedTrips = bookings.filter(booking => 
      booking.status === 'Completed' || booking.status === 'Delivered'
    ).length;

    const activeDrivers = users.filter(user => 
      user.userType === 'driver' && ['Active', 'Online'].includes(user.status || '')
    ).length;

    const averageTripValue = completedTrips > 0 ? totalRevenue / completedTrips : 0;

    // Calculate growth rates
    const last30DaysRevenue = bookings
      .filter(booking => {
        const bookingDate = new Date(booking.createdAt?.toDate?.() || booking.createdAt);
        return bookingDate >= last30Days && 
               (booking.status === 'Completed' || booking.status === 'Delivered');
      })
      .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

    const previous30DaysRevenue = bookings
      .filter(booking => {
        const bookingDate = new Date(booking.createdAt?.toDate?.() || booking.createdAt);
        const previous30Days = new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000);
        return bookingDate >= previous30Days && bookingDate < last30Days &&
               (booking.status === 'Completed' || booking.status === 'Delivered');
      })
      .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

    const revenueGrowth = previous30DaysRevenue > 0 
      ? ((last30DaysRevenue - previous30DaysRevenue) / previous30DaysRevenue) * 100 
      : 0;

    return {
      totalRevenue,
      completedTrips,
      activeDrivers,
      averageTripValue,
      revenueGrowth,
      revenueData,
      routeData,
      driverData,
      statusData
    };
  }, [bookings, users]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No data available for analytics</p>
        </CardContent>
      </Card>
    );
  }

  const { totalRevenue, completedTrips, activeDrivers, averageTripValue, revenueGrowth, revenueData, routeData, driverData, statusData } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {revenueGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(revenueGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Trips</p>
                <p className="text-2xl font-bold">{completedTrips}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Avg: ₦{averageTripValue.toLocaleString()}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Drivers</p>
                <p className="text-2xl font-bold">{activeDrivers}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {vehicles.length} vehicles
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {bookings.length > 0 ? Math.round((completedTrips / bookings.length) * 100) : 0}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {bookings.length} total bookings
                </p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <Line data={revenueData} dataKey="revenue" />
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Route Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <Bar data={routeData} dataKey="revenue" />
              <XAxis dataKey="route" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Driver Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {driverData.slice(0, 5).map((driver, index) => (
                <div key={driver.driver} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{driver.driver}</p>
                      <p className="text-sm text-muted-foreground">{driver.trips} trips</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₦{driver.revenue.toLocaleString()}</p>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                      <span className="text-sm text-muted-foreground">{driver.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Booking Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusData.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{status.status}</Badge>
                    <span className="text-sm text-muted-foreground">{status.count} bookings</span>
                  </div>
                  <span className="font-medium">{status.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
