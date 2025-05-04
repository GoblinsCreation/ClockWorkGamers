import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { News } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

function NewsCard({ news }: { news: News }) {
  return (
    <div className="card-gradient rounded-xl overflow-hidden group hover:border border-[hsl(var(--cwg-orange))]/50 transition-all duration-300">
      <div className="relative h-48">
        <div className="w-full h-full bg-[hsl(var(--cwg-dark-blue))]">
          <svg
            viewBox="0 0 800 450"
            className="w-full h-full"
          >
            <rect width="800" height="450" fill="#1E1E2F" />
            <circle cx="400" cy="225" r="100" fill="#2A2A3A" />
            <path d="M375,175 L450,225 L375,275 Z" fill="#FF6B00" fillOpacity="0.5" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--cwg-dark))] to-transparent"></div>
        <div className="absolute bottom-4 left-4 bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))] px-3 py-1 rounded-md font-orbitron text-xs">
          {news.category}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-text))] group-hover:text-[hsl(var(--cwg-orange))] transition-colors">
          {news.title}
        </h3>
        <p className="mt-2 text-[hsl(var(--cwg-muted))] line-clamp-2">
          {news.content.length > 120 ? news.content.slice(0, 120) + "..." : news.content}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[hsl(var(--cwg-muted))] text-sm">
            {format(new Date(news.publishDate), "MMM d, yyyy")}
          </span>
          <a href="#" className="text-[hsl(var(--cwg-orange))] text-sm flex items-center hover:underline">
            Read More <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function LatestNews() {
  const { data: newsItems = [], isLoading } = useQuery<News[]>({
    queryKey: ["/api/news?limit=3"],
  });
  
  // Display at most 3 news items
  const displayNews = newsItems.slice(0, 3);
  
  // Create placeholder news when data is loading
  const placeholders = [
    {
      id: 1,
      title: "New Boss Fighters Season Starts Next Week",
      content: "Get ready for new challenges and rewards as the next season launches with exciting updates and gameplay changes.",
      category: "Web3 Gaming",
      authorId: 1,
      imageUrl: null,
      publishDate: new Date("2023-05-15")
    },
    {
      id: 2,
      title: "BFToken Price Surges 30% This Month",
      content: "The native token for Boss Fighters has seen significant growth as adoption increases across the gaming ecosystem.",
      category: "Crypto",
      authorId: 2,
      imageUrl: null,
      publishDate: new Date("2023-05-12")
    },
    {
      id: 3,
      title: "ClockWork Gamers Takes First at Guild Wars",
      content: "Our team dominated the latest Guild Wars tournament, securing a prize pool of over 50,000 BFT and exclusive NFT rewards.",
      category: "Tournaments",
      authorId: 3,
      imageUrl: null,
      publishDate: new Date("2023-05-08")
    }
  ];
  
  const renderNews = isLoading || displayNews.length === 0 ? placeholders : displayNews;

  return (
    <section className="py-16 bg-[hsl(var(--cwg-dark-blue))]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h2 className="text-3xl font-orbitron font-bold text-[hsl(var(--cwg-orange))]">Latest Updates</h2>
            <p className="mt-2 text-[hsl(var(--cwg-muted))]">Stay informed with the newest developments in our guild</p>
          </div>
          
          <Button className="mt-4 md:mt-0 px-5 py-2 border border-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-orange))] rounded-lg font-orbitron text-sm hover:bg-[hsl(var(--cwg-orange))] hover:text-[hsl(var(--cwg-dark))] transition-colors duration-200 flex items-center">
            View All News <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderNews.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default LatestNews;
