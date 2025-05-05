import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function CookiePolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-[hsl(var(--cwg-dark))] py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-[hsl(var(--cwg-orange))] mb-8">Cookie Policy</h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <p className="text-[hsl(var(--cwg-muted))]">
              Last Updated: May 05, 2024
            </p>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">1. Introduction</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              ClockWork Gamers uses cookies and similar technologies on our website. By using our website, 
              you consent to the use of cookies in accordance with this Cookie Policy.
            </p>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">2. What Are Cookies?</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. 
              They are widely used in order to make websites work more efficiently, provide a better user experience, 
              and to provide information to the owners of the site.
            </p>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">3. How We Use Cookies</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              We use different types of cookies for different reasons:
            </p>
            <ul className="list-disc pl-6 text-[hsl(var(--cwg-muted))]">
              <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms.</li>
              <li><strong>Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.</li>
              <li><strong>Functional Cookies:</strong> These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.</li>
              <li><strong>Targeting Cookies:</strong> These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites.</li>
            </ul>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">4. Web3 & DApp Cookies</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              As a Web3 gaming platform, we also use specialized cookies and local storage for:
            </p>
            <ul className="list-disc pl-6 text-[hsl(var(--cwg-muted))]">
              <li>Remembering connected wallet addresses</li>
              <li>Storing user preferences for blockchain interactions</li>
              <li>Maintaining secure sessions during DApp usage</li>
              <li>Improving the performance of Web3 features</li>
            </ul>
            <p className="text-[hsl(var(--cwg-muted))]">
              Note that some Web3 interactions may involve third-party wallets or services that have their own cookie policies.
            </p>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">5. Third-Party Cookies</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              Our website includes functionality provided by third parties. Please be aware that these third parties may use cookies, 
              over which we have no control. These third parties include (but are not limited to):
            </p>
            <ul className="list-disc pl-6 text-[hsl(var(--cwg-muted))]">
              <li>Analytics providers (e.g., Google Analytics)</li>
              <li>Wallet providers</li>
              <li>Social media platforms</li>
              <li>Advertising networks</li>
              <li>Gaming and streaming partners</li>
            </ul>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">6. Managing Cookies</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, 
              including how to see what cookies have been set and how to manage and delete them, visit 
              <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--cwg-orange))] hover:underline"> www.allaboutcookies.org</a>.
            </p>
            <p className="text-[hsl(var(--cwg-muted))]">
              To opt out of being tracked by Google Analytics across all websites visit: 
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--cwg-orange))] hover:underline"> https://tools.google.com/dlpage/gaoptout</a>.
            </p>
            <p className="text-[hsl(var(--cwg-muted))]">
              Please note that blocking all cookies may impact your experience on our website, as some features may not function properly.
            </p>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">7. Changes to This Cookie Policy</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new 
              Cookie Policy on this page and updating the "Last Updated" date.
            </p>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">8. Contact Us</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              If you have any questions about our Cookie Policy, please contact us at:
              <br />
              Email: contact@clockworkgamers.net
              <br />
              Discord: discord.gg/qC3wMKXYQb
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}