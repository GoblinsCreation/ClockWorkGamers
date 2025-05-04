import { Trophy, Coins, Users, Diamond } from "lucide-react";

export function GuildAchievements() {
  const achievements = [
    {
      icon: <Trophy className="text-[hsl(var(--cwg-blue))] text-2xl" />,
      title: "Weekly Rankings",
      value: "Top 1-3",
      color: "blue",
      description: "Consistently ranked among the best guilds globally"
    },
    {
      icon: <Coins className="text-[hsl(var(--cwg-orange))] text-2xl" />,
      title: "Guild Assets",
      value: "25K+",
      color: "orange",
      description: "Total in-game assets owned by our guild members"
    },
    {
      icon: <Users className="text-[hsl(var(--cwg-blue))] text-2xl" />,
      title: "Active Members",
      value: "200+",
      color: "blue",
      description: "Dedicated gamers from around the world"
    },
    {
      icon: <Diamond className="text-[hsl(var(--cwg-orange))] text-2xl" />,
      title: "Transcendent Assets",
      value: "25+",
      color: "orange",
      description: "Rare and valuable in-game collectibles"
    }
  ];

  return (
    <section className="py-16 bg-[hsl(var(--cwg-dark))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-orbitron font-bold text-[hsl(var(--cwg-orange))]">Guild Highlights</h2>
          <p className="mt-2 text-[hsl(var(--cwg-muted))] max-w-2xl mx-auto">
            Showcasing our top accomplishments and achievements in the Web3 gaming space
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => (
            <div 
              key={index} 
              className={`bg-[hsl(var(--cwg-dark-blue))]/60 rounded-xl p-6 border border-[hsl(var(--cwg-${achievement.color}))]/20 hover:border-[hsl(var(--cwg-${achievement.color}))] transition-colors duration-300`}
            >
              <div className={`h-14 w-14 rounded-lg bg-[hsl(var(--cwg-${achievement.color}))]/20 flex items-center justify-center mb-4`}>
                {achievement.icon}
              </div>
              <h3 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-text))]">{achievement.title}</h3>
              <p className={`text-3xl font-orbitron font-bold text-[hsl(var(--cwg-${achievement.color}))] mt-2`}>{achievement.value}</p>
              <p className="mt-2 text-[hsl(var(--cwg-muted))]">{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default GuildAchievements;
