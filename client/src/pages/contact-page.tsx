import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageCircleCode, Send, AlertCircle, MessageSquareText, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FloatingChat from "@/components/chat/FloatingChat";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });
  
  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/contact", values);
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Show success toast
        toast({
          title: "Message Sent!",
          description: "We've received your message and will respond soon.",
          variant: "default",
        });
        
        // Reset form
        form.reset();
      } else {
        // Show error toast with message from server if available
        toast({
          title: "Message Not Sent",
          description: data.message || "There was an error sending your message. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending contact form:", error);
      toast({
        title: "Connection Error",
        description: "Could not connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-[hsl(var(--cwg-dark))] py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-orbitron font-bold text-[hsl(var(--cwg-orange))]">Contact Us</h1>
            <p className="mt-4 text-[hsl(var(--cwg-muted))] max-w-2xl mx-auto">
              Have questions about ClockWork Gamers or need support? We're here to help.
              Get in touch with our team using any of the methods below.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-6 md:p-8 border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark-blue))]/20 space-y-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-mesh opacity-10 z-0"></div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-text))] mb-6">
                    Send Us a Message
                  </h2>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[hsl(var(--cwg-muted))]">Your Name</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] focus:border-[hsl(var(--cwg-orange))]" 
                                  placeholder="Enter your name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[hsl(var(--cwg-muted))]">Email</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="email"
                                  className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] focus:border-[hsl(var(--cwg-orange))]" 
                                  placeholder="Enter your email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[hsl(var(--cwg-muted))]">Subject</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] focus:border-[hsl(var(--cwg-orange))]" 
                                placeholder="What is your message about?"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[hsl(var(--cwg-muted))]">Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] focus:border-[hsl(var(--cwg-orange))] min-h-[150px]" 
                                placeholder="Tell us how we can help..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange-dark))] text-white py-2 px-4 rounded-lg font-orbitron font-medium hover:brightness-110 transition-all duration-300 disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </Card>
            </div>
            
            {/* Contact Info */}
            <div>
              <Card className="p-6 md:p-8 border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark-blue))]/20 space-y-8 h-full">
                <div>
                  <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-text))] mb-6">
                    Contact Information
                  </h2>
                  
                  <ul className="space-y-6">
                    <li className="flex items-start">
                      <Mail className="text-[hsl(var(--cwg-orange))] mt-1 mr-4 h-5 w-5" />
                      <div>
                        <h3 className="text-[hsl(var(--cwg-text))] font-medium">Email</h3>
                        <p className="text-[hsl(var(--cwg-muted))]">contact@clockworkgamers.net</p>
                      </div>
                    </li>
                    
                    <li className="flex items-start">
                      <MessageCircleCode className="text-[hsl(var(--cwg-orange))] mt-1 mr-4 h-5 w-5" />
                      <div>
                        <h3 className="text-[hsl(var(--cwg-text))] font-medium">Discord</h3>
                        <p className="text-[hsl(var(--cwg-muted))]">
                          <a 
                            href="https://discord.gg/qC3wMKXYQb" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[hsl(var(--cwg-orange))] transition-colors"
                          >
                            discord.gg/qC3wMKXYQb
                          </a>
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="pt-6 border-t border-[hsl(var(--cwg-dark-blue))]">
                  <h3 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-text))] mb-4">
                    Live Support
                  </h3>
                  <p className="text-[hsl(var(--cwg-muted))] mb-6">
                    Need immediate assistance? Chat with our support team directly.
                  </p>
                  <Button
                    onClick={() => {
                      // Trigger opening the chat widget (support tab)
                      const chatEvent = new CustomEvent('openChatWidget', { 
                        detail: { tab: 'support' } 
                      });
                      window.dispatchEvent(chatEvent);
                      
                      toast({
                        title: "Live Chat",
                        description: "Opening support chat",
                      });
                    }}
                    className="w-full bg-[hsl(var(--cwg-blue))] text-white py-2 px-4 rounded-lg font-medium hover:bg-[hsl(var(--cwg-blue))]/80 transition-colors"
                  >
                    <MessageSquareText className="mr-2 h-4 w-4" />
                    Start Live Chat
                  </Button>
                </div>
                
                <div className="pt-6 border-t border-[hsl(var(--cwg-dark-blue))]">
                  <h3 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-text))] mb-4">
                    Report an Issue
                  </h3>
                  <p className="text-[hsl(var(--cwg-muted))] mb-4">
                    Found a bug or technical issue? Let us know.
                  </p>
                  <Button
                    onClick={() => {
                      // In a real app, we would navigate or open a modal
                      toast({
                        title: "Report Issue",
                        description: "Our bug reporting system is coming soon",
                        variant: "default",
                      });
                    }}
                    variant="outline"
                    className="w-full border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))] hover:bg-[hsl(var(--cwg-orange))]/10 transition-colors"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Report Issue
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Chat Widget */}
      <FloatingChat />
    </div>
  );
}