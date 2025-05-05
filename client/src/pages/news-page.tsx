import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { News } from "@shared/schema";
import { format } from "date-fns";
import { Loader2, Search, Tag, Calendar, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Fetch news articles
  const { data: news = [], isLoading } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });
  
  // Filter news based on search term and category
  const filteredNews = news.filter(article => 
    (activeCategory === "All" || article.category === activeCategory) &&
    (article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     article.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Get unique categories
  const categories = ["All", ...Array.from(new Set(news.map(article => article.category)))];
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero section */}
        <section className="bg-mesh py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-[hsl(var(--cwg-orange))]">
              Latest News & Updates
            </h1>
            <p className="mt-4 text-lg md:text-xl text-[hsl(var(--cwg-muted))] max-w-3xl mx-auto">
              Stay updated with the latest news from ClockWork Gamers, Web3 gaming, and the cryptocurrency space.
            </p>
            
            <div className="mt-8 max-w-xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--cwg-muted))]" />
              <Input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[hsl(var(--cwg-dark-blue))]/70 border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]"
              />
            </div>
          </div>
        </section>
        
        {/* News section */}
        <section className="py-16 bg-[hsl(var(--cwg-dark))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="All" value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="mb-10 flex flex-wrap gap-2 justify-center">
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="font-orbitron"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={activeCategory}>
                {isLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-12 w-12 animate-spin text-[hsl(var(--cwg-orange))]" />
                  </div>
                ) : filteredNews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredNews.map((article) => (
                      <div key={article.id} className="card-gradient rounded-xl overflow-hidden border border-[hsl(var(--cwg-dark-blue))] transition-transform hover:scale-[1.02] duration-300">
                        <div className="aspect-video bg-[hsl(var(--cwg-dark-blue))] flex items-center justify-center">
                          <div className="text-4xl font-bold font-orbitron text-[hsl(var(--cwg-orange))]">
                            CWG
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-3 py-1 rounded-full text-xs bg-[hsl(var(--cwg-orange))]/20 text-[hsl(var(--cwg-orange))] flex items-center">
                              <Tag className="h-3 w-3 mr-1" />
                              {article.category}
                            </span>
                            <span className="text-xs text-[hsl(var(--cwg-muted))] flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(article.publishDate), "MMM d, yyyy")}
                            </span>
                          </div>
                          
                          <h3 className="font-orbitron font-semibold text-xl mb-3 line-clamp-2 text-[hsl(var(--cwg-text))]">
                            {article.title}
                          </h3>
                          
                          <p className="text-[hsl(var(--cwg-muted))] mb-4 line-clamp-3">
                            {article.content}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[hsl(var(--cwg-muted))] flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              Author ID: {article.authorId}
                            </span>
                            <button className="text-[hsl(var(--cwg-blue))] text-sm font-medium hover:text-[hsl(var(--cwg-blue))]/80">
                              Read More
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <h3 className="text-2xl font-orbitron text-[hsl(var(--cwg-muted))]">
                      No news articles found
                    </h3>
                    <p className="mt-2 text-[hsl(var(--cwg-muted))]">
                      {searchTerm ? `No results matching "${searchTerm}"` : "Check back later for updates"}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}