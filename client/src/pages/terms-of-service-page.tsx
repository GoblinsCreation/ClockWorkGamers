import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-[hsl(var(--cwg-dark))] py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-[hsl(var(--cwg-orange))] mb-8">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <p className="text-[hsl(var(--cwg-muted))]">
              Last Updated: May 05, 2024
            </p>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">1. Agreement to Terms</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              By accessing or using ClockWork Gamers, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
              If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">2. Use License</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              Permission is granted to temporarily access the materials on ClockWork Gamers' website for personal, 
              non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and 
              under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-[hsl(var(--cwg-muted))]">
              <li>Modify or copy the materials;</li>
              <li>Use the materials for any commercial purpose or for any public display;</li>
              <li>Attempt to reverse engineer any software contained on the website;</li>
              <li>Remove any copyright or other proprietary notations from the materials; or</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">3. Web3 & Blockchain Services</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              Our platform incorporates Web3 and blockchain technologies. By using these features:
            </p>
            <ul className="list-disc pl-6 text-[hsl(var(--cwg-muted))]">
              <li>You acknowledge that blockchain transactions are irreversible and we cannot recover lost or stolen digital assets.</li>
              <li>You assume all risks associated with using cryptocurrencies and NFTs, including volatility in value.</li>
              <li>You are responsible for maintaining the security of your wallet and private keys.</li>
              <li>You will comply with all applicable laws regarding cryptocurrency and digital assets in your jurisdiction.</li>
              <li>You understand that blockchain networks may experience delays, congestion, or technical difficulties outside our control.</li>
            </ul>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">4. Gaming Services</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              As a gaming-focused platform, we provide various gaming-related services including:
            </p>
            <ul className="list-disc pl-6 text-[hsl(var(--cwg-muted))]">
              <li>Access to play-to-earn games</li>
              <li>NFT rentals and scholarships</li>
              <li>Gaming courses and education</li>
              <li>Streaming features</li>
              <li>Community features</li>
            </ul>
            <p className="text-[hsl(var(--cwg-muted))]">
              Use of these services is subject to additional terms specific to each service, which may be updated from time to time.
            </p>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">5. User Accounts</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              When you create an account with us, you are responsible for maintaining the security of your account, 
              and you are fully responsible for all activities that occur under the account. You must immediately 
              notify us of any unauthorized uses of your account or any other breaches of security.
            </p>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">6. User Content</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              Our platform may allow you to post, link, store, share and otherwise make available certain information, 
              text, graphics, videos, or other material. You are responsible for what you post, and you agree not to post content that:
            </p>
            <ul className="list-disc pl-6 text-[hsl(var(--cwg-muted))]">
              <li>Is unlawful, harmful, threatening, abusive, harassing, defamatory, or invasive of another's privacy</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains software viruses or any other code designed to disrupt our services</li>
              <li>Is used to impersonate any person or entity</li>
              <li>Constitutes unauthorized advertising or solicitation</li>
            </ul>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">7. Disclaimer</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              The materials on ClockWork Gamers' website and services are provided on an 'as is' basis. 
              ClockWork Gamers makes no warranties, expressed or implied, and hereby disclaims and negates 
              all other warranties including, without limitation, implied warranties or conditions of merchantability, 
              fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">8. Limitations</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              In no event shall ClockWork Gamers or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability to 
              use the materials on ClockWork Gamers' website and services.
            </p>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">9. Governing Law</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              These terms and conditions are governed by and construed in accordance with the laws of the United States, 
              and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
            
            <h2 className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">10. Contact Us</h2>
            <p className="text-[hsl(var(--cwg-muted))]">
              If you have any questions about these Terms of Service, please contact us at:
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