"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, setDoc, increment } from 'firebase/firestore';
import firebaseApp from '@/firebase/config';
import type { Conversation, Message, User, SupportSettings } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Preloader } from "@/components/preloader";
import { useDoc } from "@/firebase/firestore/use-collection";

const WelcomeMessage = ({ onQuickReply, quickReplies }: { onQuickReply: (text: string) => void, quickReplies: string[] }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 h-full">
            <Avatar className="h-20 w-20 mb-4 border-4 border-primary/20">
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">S</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">Welcome to Support</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
                Hi! I'm your automated assistant. How can I help you today? You can also type your own question below.
            </p>
            <div className="flex flex-col gap-2 mt-8 w-full max-w-sm">
                {quickReplies.map((reply) => (
                    <Button
                        key={reply}
                        variant="outline"
                        className="justify-start h-auto py-3"
                        onClick={() => onQuickReply(reply)}
                    >
                        <Sparkles className="h-4 w-4 mr-3 text-primary" />
                        {reply}
                    </Button>
                ))}
            </div>
        </div>
    )
}

const ChatView = ({ conversation, messages, onSendMessage, supportSettings }: { conversation: Conversation | null, messages: Message[], onSendMessage: (text: string) => void, supportSettings: SupportSettings | null }) => {
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if(newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage("");
        }
    }
    
    const handleQuickReply = (text: string) => {
        onSendMessage(text);
    }
    
    if (!conversation) return <Preloader />;

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="flex items-center p-4 border-b border-border/50 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="mr-2">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 mr-3 border-2 border-primary/30">
                    <AvatarFallback>S</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h2 className="font-bold">Support Team</h2>
                    <p className="text-xs text-green-500 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        Online
                    </p>
                </div>
            </header>
             <ScrollArea className="flex-1">
                 {messages.length <= 1 ? (
                    <WelcomeMessage onQuickReply={handleQuickReply} quickReplies={supportSettings?.quickReplies || []} />
                 ) : (
                    <div className="p-4 space-y-6">
                        {messages.map((msg, index) => (
                            <div key={msg.id || index} className={cn("flex items-end gap-2 w-full", msg.senderId === user?.id ? 'justify-end' : 'justify-start')}>
                                {msg.senderId !== user?.id && (
                                    <Avatar className="h-8 w-8 self-end">
                                        <AvatarFallback>S</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm text-sm md:text-base", 
                                    msg.senderId === user?.id 
                                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                                        : 'bg-card rounded-bl-none'
                                )}>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </ScrollArea>
             <footer className="p-4 border-t border-border/50 bg-background shrink-0">
                <form onSubmit={handleSend} className="relative">
                    <Input placeholder="Type a message..." className="h-12 pr-12 rounded-full bg-card text-base" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                    <Button type="submit" size="icon" className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full h-9 w-9 bg-primary">
                        <Send className="h-5 w-5"/>
                    </Button>
                </form>
            </footer>
        </div>
    );
};


export default function MessagesPage() {
    const { user } = useAuth();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const db = getFirestore(firebaseApp);
    const { data: supportSettings } = useDoc<SupportSettings>('settings/support');
    
    useEffect(() => {
        if (!user) return;

        setLoading(true);
        const convoRef = collection(db, "conversations");
        const q = query(convoRef, where("userId", "==", user.id));
        
        const unsubscribeConvo = onSnapshot(q, async (snapshot) => {
            if (snapshot.empty) {
                // No conversation exists, create one
                const newConvoRef = doc(collection(db, "conversations"));
                const newConvoData: Conversation = {
                    id: newConvoRef.id,
                    userId: user.id,
                    userName: user.name,
                    userAvatar: user.profilePictureUrl || `https://i.pravatar.cc/150?u=${user.email}`,
                    lastMessage: null,
                    unreadByAdmin: 1, // Start with 1 unread for admin
                    unreadByUser: 0,
                };
                await setDoc(newConvoRef, newConvoData);

                // Add the initial welcome message from support
                const messagesRef = collection(db, "conversations", newConvoRef.id, "messages");
                const welcomeMessage = {
                    conversationId: newConvoRef.id,
                    senderId: 'support', // Automated message from support
                    text: `Hi ${user.name}! Welcome to Engraced Smiles support. How can I help you today?`,
                    createdAt: serverTimestamp(),
                    receiverId: user.id,
                };
                await addDoc(messagesRef, welcomeMessage);
                
                setConversation(newConvoData);
                setLoading(false);
            } else {
                const convoDoc = snapshot.docs[0];
                const convoData = { id: convoDoc.id, ...convoDoc.data() } as Conversation;
                setConversation(convoData);
                
                // Mark messages as read by user
                if(convoData.unreadByUser > 0) {
                    updateDoc(doc(db, "conversations", convoData.id), { unreadByUser: 0 });
                }
            }
        }, (error) => {
            console.error(error);
            setLoading(false);
        });

        return () => unsubscribeConvo();
    }, [user, db]);


     useEffect(() => {
        if (!conversation) return;

        const messagesRef = collection(db, "conversations", conversation.id, "messages");
        const q = query(messagesRef, orderBy("createdAt"));
        const unsubscribeMessages = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);
             if (loading) setLoading(false);
        });
        
        return () => unsubscribeMessages();

    }, [conversation, db, loading]);
    
    const handleSendMessage = async (text: string) => {
        if (!user || !conversation) return;

        const messagesRef = collection(db, "conversations", conversation.id, "messages");
        const convoRef = doc(db, "conversations", conversation.id);

        const newMessageData = {
            conversationId: conversation.id,
            senderId: user.id,
            text,
            createdAt: serverTimestamp(),
            receiverId: 'support', // Generic ID for support team
        };

        const lastMessageData = {
            text,
            createdAt: new Date(),
        };

        try {
            await addDoc(messagesRef, newMessageData);
            await updateDoc(convoRef, { 
                lastMessage: lastMessageData,
                unreadByAdmin: increment(1)
            });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };
    
     if (loading) {
        return <Preloader />
     }

    return (
        <ChatView
            conversation={conversation}
            messages={messages}
            onSendMessage={handleSendMessage}
            supportSettings={supportSettings}
        />
    );
}
