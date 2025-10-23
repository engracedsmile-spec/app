"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Bell, Send, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SubHeader } from "@/components/sub-header";

const formSchema = z.object({
  targetAudience: z.string({ required_error: "Please select an audience." }),
  title: z.string().min(5, "Title must be at least 5 characters.").max(50, "Title is too long."),
  message: z.string().min(10, "Message must be at least 10 characters.").max(200, "Message is too long."),
});

const NotificationPreview = ({ title, message }: { title: string, message: string }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Preview
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="w-full max-w-sm mx-auto rounded-xl border-4 border-foreground bg-background p-4 shadow-lg">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-primary/20 text-primary">
                        <Bell className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-sm">{title || "Notification Title"}</p>
                        <p className="text-xs text-muted-foreground">{message || "Your notification message will appear here."}</p>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
)

export default function ComposeNotificationPage() {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            targetAudience: "all",
            title: "",
            message: "",
        }
    });

    const watchedTitle = form.watch("title");
    const watchedMessage = form.watch("message");

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        toast("Notification Sent!", { 
            description: `Your message has been sent to '${data.targetAudience}' users.` 
        });
        console.log("Sending notification:", data);
        router.push("/admin/dashboard/settings/notifications");
    }

    return (
        <>
            <SubHeader title="Compose Notification" />
            <main className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Message Details</CardTitle>
                            <CardDescription>Craft your message and choose who to send it to.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="targetAudience"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Target Audience</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select an audience" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Users</SelectItem>
                                                        <SelectItem value="customers">Customers Only</SelectItem>
                                                        <SelectItem value="riders">Riders Only</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl><Input placeholder="e.g., Weekend Promo" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Message</FormLabel>
                                                <FormControl><Textarea placeholder="Enter your notification message here..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" size="lg" className="w-full">
                                        <Send className="mr-2 h-5 w-5" /> Send Notification
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <NotificationPreview title={watchedTitle} message={watchedMessage} />
                </div>
            </main>
        </>
    )
}
