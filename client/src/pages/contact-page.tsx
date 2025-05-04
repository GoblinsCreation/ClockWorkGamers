import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, MessageSquare, User, Send, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      toast({
        title: "Message sent",
        description: "We'll get back to you as soon as possible.",
      });
      
      form.reset();
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header section */}
        <section className="bg-mesh py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-orbitron font-bold text-[hsl(var(--cwg-orange))]">Contact Us</h1>
              <p className="mt-3 text-[hsl(var(--cwg-muted))] max-w-2xl mx-auto">
                Have questions or want to learn more about ClockWork Gamers? We're here to help.
              </p>
            </div>
          </div>
        </section>
        
        {/* Contact section */}
        <section className="py-12 bg-[hsl(var(--cwg-dark))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <div className="card-gradient rounded-xl p-8 border border-[hsl(var(--cwg-dark-blue))]">
                  <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-orange))] mb-6">Send Us a Message</h2>
                  
                  {isSuccess ? (
                    <div className="text-center py-12">
                      <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                      <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-2">Message Sent Successfully!</h3>
                      <p className="text-[hsl(var(--cwg-muted))] mb-6">
                        Thank you for reaching out. We'll respond to your inquiry as soon as possible.
                      </p>
                      <Button 
                        onClick={() => setIsSuccess(false)}
                        className="bg-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-dark))] hover:bg-[hsl(var(--cwg-blue))]/90"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[hsl(var(--cwg-muted))] flex items-center">
                                <User className="mr-2 h-4 w-4" /> Full Name
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]" 
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
                              <FormLabel className="text-[hsl(var(--cwg-muted))] flex items-center">
                                <Mail className="mr-2 h-4 w-4" /> Email Address
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]" 
                                  placeholder="Enter your email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[hsl(var(--cwg-muted))] flex items-center">
                                <MessageSquare className="mr-2 h-4 w-4" /> Subject
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]">
                                    <SelectValue placeholder="Select a subject" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                                  <SelectItem value="general">General Inquiry</SelectItem>
                                  <SelectItem value="membership">Guild Membership</SelectItem>
                                  <SelectItem value="courses">Course Information</SelectItem>
                                  <SelectItem value="rentals">Asset Rentals</SelectItem>
                                  <SelectItem value="technical">Technical Support</SelectItem>
                                  <SelectItem value="partnership">Partnership Opportunities</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[hsl(var(--cwg-muted))] flex items-center">
                                <MessageSquare className="mr-2 h-4 w-4" /> Message
                              </FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] min-h-[120px]" 
                                  placeholder="Type your message here..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange))]/80 text-white py-3 rounded-lg font-orbitron font-medium btn-hover transition-all duration-300"
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
                  )}
                </div>
              </div>
              
              {/* Contact Info */}
              <div>
                <div className="card-gradient rounded-xl p-8 border border-[hsl(var(--cwg-dark-blue))] mb-8">
                  <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))] mb-6">Get in Touch</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-lg bg-[hsl(var(--cwg-blue))]/20 flex items-center justify-center mr-4">
                        <Mail className="text-[hsl(var(--cwg-blue))] h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-orbitron font-semibold text-[hsl(var(--cwg-text))]">Email</h3>
                        <p className="text-[hsl(var(--cwg-muted))]">contact@clockworkgamers.net</p>
                        <p className="text-[hsl(var(--cwg-muted))]">support@clockworkgamers.net</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-lg bg-[hsl(var(--cwg-orange))]/20 flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[hsl(var(--cwg-orange))]">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-orbitron font-semibold text-[hsl(var(--cwg-text))]">Virtual Headquarters</h3>
                        <p className="text-[hsl(var(--cwg-muted))]">Discord: discord.gg/qC3wMKXYQb</p>
                        <p className="text-[hsl(var(--cwg-muted))]">Metaverse: ClockWork Tower, Decentraland</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-lg bg-[hsl(var(--cwg-blue))]/20 flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[hsl(var(--cwg-blue))]">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-orbitron font-semibold text-[hsl(var(--cwg-text))]">Support Hours</h3>
                        <p className="text-[hsl(var(--cwg-muted))]">Monday - Friday: 9AM - 9PM UTC</p>
                        <p className="text-[hsl(var(--cwg-muted))]">Weekends: 12PM - 6PM UTC</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card-gradient rounded-xl p-8 border border-[hsl(var(--cwg-dark-blue))]">
                  <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-orange))] mb-6">Connect With Us</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <a 
                      href="https://discord.gg/qC3wMKXYQb" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center p-4 rounded-lg bg-[hsl(var(--cwg-dark))] border border-[hsl(var(--cwg-dark-blue))] hover:border-[hsl(var(--cwg-blue))] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[hsl(var(--cwg-blue))] mb-2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="4"></circle>
                        <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                        <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                        <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                        <line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line>
                        <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
                      </svg>
                      <span className="text-sm font-orbitron text-[hsl(var(--cwg-text))]">Discord</span>
                    </a>
                    
                    <a 
                      href="#" 
                      className="flex flex-col items-center p-4 rounded-lg bg-[hsl(var(--cwg-dark))] border border-[hsl(var(--cwg-dark-blue))] hover:border-[hsl(var(--cwg-blue))] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[hsl(var(--cwg-blue))] mb-2">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                      </svg>
                      <span className="text-sm font-orbitron text-[hsl(var(--cwg-text))]">Twitter</span>
                    </a>
                    
                    <a 
                      href="#" 
                      className="flex flex-col items-center p-4 rounded-lg bg-[hsl(var(--cwg-dark))] border border-[hsl(var(--cwg-dark-blue))] hover:border-[hsl(var(--cwg-orange))] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[hsl(var(--cwg-orange))] mb-2">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                      <span className="text-sm font-orbitron text-[hsl(var(--cwg-text))]">Instagram</span>
                    </a>
                    
                    <a 
                      href="#" 
                      className="flex flex-col items-center p-4 rounded-lg bg-[hsl(var(--cwg-dark))] border border-[hsl(var(--cwg-dark-blue))] hover:border-[hsl(var(--cwg-orange))] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[hsl(var(--cwg-orange))] mb-2">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                      </svg>
                      <span className="text-sm font-orbitron text-[hsl(var(--cwg-text))]">YouTube</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-12 bg-[hsl(var(--cwg-dark-blue))]/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-orbitron font-bold text-[hsl(var(--cwg-orange))]">Frequently Asked Questions</h2>
              <p className="mt-2 text-[hsl(var(--cwg-muted))] max-w-2xl mx-auto">
                Find quick answers to common questions about our guild and services
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                <h3 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))] mb-3">How do I join ClockWork Gamers?</h3>
                <p className="text-[hsl(var(--cwg-muted))]">
                  You can join our guild by registering on our website and selecting "ClockWork Gamers" as your guild. After registration, join our Discord for community access and verification.
                </p>
              </div>
              
              <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                <h3 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))] mb-3">What benefits do guild members receive?</h3>
                <p className="text-[hsl(var(--cwg-muted))]">
                  Members get access to exclusive calculators, discounted course rates, priority for asset rentals, and participation in guild tournaments with prize pools.
                </p>
              </div>
              
              <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                <h3 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))] mb-3">How can I become a CWG streamer?</h3>
                <p className="text-[hsl(var(--cwg-muted))]">
                  Active guild members can apply to be featured streamers. We look for regular streaming schedules and engagement with Web3 games. Contact us for details.
                </p>
              </div>
              
              <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                <h3 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))] mb-3">Do you offer refunds for courses?</h3>
                <p className="text-[hsl(var(--cwg-muted))]">
                  We offer a 7-day satisfaction guarantee for all courses. If you're not satisfied, contact support for a full refund within the first week of purchase.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
