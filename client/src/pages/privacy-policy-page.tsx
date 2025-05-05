import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-[hsl(var(--cwg-dark))] py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-[hsl(var(--cwg-orange))] mb-8">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <p className="text-[hsl(var(--cwg-muted))]">
              Last Updated: May 05, 2024
            </p>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">1. Introduction</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              Welcome to ClockWork Gamers. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our website and 
              tell you about your privacy rights and how the law protects you.
            </p>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">2. The Data We Collect</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              We may collect, use, store and transfer different kinds of personal data about you including:
            </p>
            <ul className="list-disc pl-6 text-[hsl(var(--cwg-muted))]">
              <li>Identity Data: includes first name, last name, username or similar identifier, date of birth.</li>
              <li>Contact Data: includes email address and telephone numbers.</li>
              <li>Technical Data: includes internet protocol (IP) address, your login data, browser type and version, 
                time zone setting and location, browser plug-in types and versions, operating system and platform, and 
                other technology on the devices you use to access this website.</li>
              <li>Profile Data: includes your username and password, purchases or orders made by you, your interests, 
                preferences, feedback and survey responses.</li>
              <li>Wallet Data: includes public wallet addresses used to interact with our Web3 features.</li>
            </ul>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">3. How We Use Your Data</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data 
              in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-[hsl(var(--cwg-muted))]">
              <li>To register you as a new customer or member.</li>
              <li>To process and deliver your orders or services.</li>
              <li>To manage our relationship with you including notifying you about changes to our terms or privacy policy.</li>
              <li>To enable you to participate in interactive features of our service.</li>
              <li>To administer and protect our business and this website.</li>
              <li>To deliver relevant website content and advertisements to you.</li>
              <li>To facilitate Web3 and crypto transactions when you use our blockchain features.</li>
            </ul>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">4. Data Security</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, 
              used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal 
              data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">5. Web3 & Blockchain Considerations</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              Please be aware that blockchain technology, by its nature, creates immutable records. When you interact with 
              blockchain features on our platform:
            </p>
            <ul className="list-disc pl-6 text-[hsl(var(--cwg-muted))]">
              <li>Your wallet address and transaction data become part of the public blockchain and cannot be deleted.</li>
              <li>We may store off-chain data related to your blockchain interactions in accordance with this privacy policy.</li>
              <li>Third-party Web3 services integrated with our platform may collect additional data according to their own policies.</li>
            </ul>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">6. Your Legal Rights</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including:
            </p>
            <ul className="list-disc pl-6 text-[hsl(var(--cwg-muted))]">
              <li>Request access to your personal data.</li>
              <li>Request correction of your personal data.</li>
              <li>Request erasure of your personal data.</li>
              <li>Object to processing of your personal data.</li>
              <li>Request restriction of processing your personal data.</li>
              <li>Request transfer of your personal data.</li>
              <li>Right to withdraw consent.</li>
            </ul>
            <p className="text-[hsl(var(--cwg-muted))]">
              Please note that some of these rights may be limited when information has been recorded on a public blockchain.
            </p>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">7. Contact Us</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
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