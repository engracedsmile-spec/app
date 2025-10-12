
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, where, increment } from 'firebase/firestore';
import firebaseApp from '@/firebase/config';
import type { Conversation, Message } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

const ConversationItem = ({ convo, onSelect, isActive }: { convo: Conversation, onSelect: () => void, isActive: boolean }) => (
    <div 
        className={cn("flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors", isActive ? "bg-primary/10" : "hover:bg-muted/50")}
        onClick={onSelect}
    >
        <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={convo.userAvatar} />
            <AvatarFallback>{convo.userName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
            <div className="flex justify-between items-center">
                <p className="font-bold truncate">{convo.userName}</p>
                {convo.lastMessage?.createdAt && <p className="text-xs text-muted-foreground flex-shrink-0">{new Date(convo.lastMessage.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
            </div>
            <div className="flex justify-between items-start mt-1">
                <p className="text-sm text-muted-foreground truncate">{convo.lastMessage?.text || "No messages yet."}</p>
                {convo.unreadByAdmin > 0 && <Badge className="bg-primary h-5 w-5 p-0 flex items-center justify-center text-xs">{convo.unreadByAdmin}</Badge>}
            </div>
        </div>
    </div>
);


const ChatView = ({ conversation, messages, onSendMessage, onBack }: { conversation: Conversation, messages: Message[], onSendMessage: (text: string) => void, onBack: () => void }) => {
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="flex items-center p-4 border-b border-border/50 shrink-0">
                <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 md:hidden">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={conversation.userAvatar} />
                    <AvatarFallback>{conversation.userName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h2 className="font-bold">{conversation.userName}</h2>
                </div>
            </header>
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    {messages.map((msg) => (
                         <div key={msg.id} className={cn("flex items-end gap-2 w-full", msg.senderId !== conversation.userId ? 'justify-end' : 'justify-start')}>
                            {msg.senderId === conversation.userId && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={conversation.userAvatar} />
                                    <AvatarFallback>{conversation.userName[0]}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn("max-w-[75%] rounded-2xl p-3 shadow-sm", msg.senderId !== conversation.userId ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card rounded-bl-none')}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div ref={messagesEndRef} />
            </ScrollArea>
             <footer className="p-4 border-t border-border/50 bg-background shrink-0">
                <form onSubmit={handleSend} className="relative">
                    <Input placeholder="Type a message..." className="h-12 pr-12 rounded-full bg-card" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                    <Button type="submit" size="icon" className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full h-9 w-9 bg-primary">
                        <Send className="h-5 w-5"/>
                    </Button>
                </form>
            </footer>
        </div>
    )
}

export default function SupportPage() {
    const router = useRouter();
    const { user: adminUser } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingConvos, setLoadingConvos] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const db = getFirestore(firebaseApp);

    useEffect(() => {
        const q = query(collection(db, "conversations"), orderBy("lastMessage.createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
            setConversations(convos);
            setLoadingConvos(false);
        });
        return () => unsubscribe();
    }, [db]);

     useEffect(() => {
        if (!selectedConversation) return;

        setLoadingMessages(true);
        const messagesRef = collection(db, "conversations", selectedConversation.id, "messages");
        const q = query(messagesRef, orderBy("createdAt"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);
            setLoadingMessages(false);
        }, (error) => {
            console.error(error);
            setLoadingMessages(false);
        });

        const convoRef = doc(db, 'conversations', selectedConversation.id);
        if (selectedConversation.unreadByAdmin > 0) {
            updateDoc(convoRef, { unreadByAdmin: 0 });
        }

        return () => unsubscribe();
    }, [selectedConversation, db]);

     const handleSendMessage = async (text: string) => {
        if (!adminUser || !selectedConversation) return;

        const messagesRef = collection(db, "conversations", selectedConversation.id, "messages");
        const convoRef = doc(db, "conversations", selectedConversation.id);

        const newMessageData = {
            conversationId: selectedConversation.id,
            senderId: adminUser.id,
            text,
            createdAt: serverTimestamp(),
            receiverId: selectedConversation.userId,
        };
        const lastMessageData = {
            text,
            createdAt: new Date(),
        };

        try {
            await addDoc(messagesRef, newMessageData);
            await updateDoc(convoRef, {
                lastMessage: lastMessageData,
                unreadByUser: increment(1)
            });
        } catch (error) {
            console.error("Error sending message:", error);
            // Optionally show an error toast
        }
    }


    const Sidebar = () => (
         <div className="h-full flex flex-col border-r border-border/50">
             <header className="flex items-center justify-center p-4 sticky top-0 bg-background z-10 border-b border-border/50 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2 absolute left-4">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Support Center</h1>
            </header>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {loadingConvos ? (
                        Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
                    ) : conversations.length > 0 ? (
                        conversations.map(convo => (
                            <ConversationItem 
                                key={convo.id} 
                                convo={convo} 
                                onSelect={() => setSelectedConversation(convo)}
                                isActive={selectedConversation?.id === convo.id}
                            />
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground p-8">No conversations yet.</p>
                    )}
                </div>
            </ScrollArea>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-dvh">
            <div className={cn("hidden md:flex md:flex-col", selectedConversation && "md:hidden lg:flex")}>
                <Sidebar />
            </div>
             <div className={cn("md:col-span-2 lg:col-span-3", !selectedConversation && "hidden md:flex md:items-center md:justify-center", selectedConversation && "block")}>
                 {selectedConversation ? (
                     <ChatView 
                        conversation={selectedConversation} 
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        onBack={() => setSelectedConversation(null)}
                    />
                 ) : (
                     <div className="text-center text-muted-foreground">
                        <p className="text-lg font-semibold">Select a conversation</p>
                        <p>Choose a conversation from the left to start chatting.</p>
                    </div>
                 )}
            </div>
        </div>
    );
}

    