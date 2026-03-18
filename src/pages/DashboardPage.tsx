import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Filter, ChevronRight, Activity, AlertCircle, X, ShieldCheck, Lock, Globe, Trophy, Newspaper, Palette, Zap, Loader2 } from 'lucide-react';
import { fetchRealMatches, fetchRealNews, fetchMatchDetails } from '../lib/predictionEngine';
import { Link, useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [matchDetails, setMatchDetails] = useState<any | null>(null);
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  const [activeLeague, setActiveLeague] = useState<string>('All');
  const [isLeagueLoading, setIsLeagueLoading] = useState(false);
  const [news, setNews] = useState<any[]>([]);
  const [theme, setTheme] = useState<'hacker' | 'cyan' | 'purple' | 'emerald' | 'rose'>('hacker');
  const navigate = useNavigate();

  // VARIABLE REWARD LOOPS & DOPAMINE-DRIVEN UI/UX
  const [userStats, setUserStats] = useState({
    streak: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    coins: 0,
    dailyRewardClaimed: false,
    lastLogin: null,
    achievements: [] as string[],
    mysteryBoxAvailable: false,
    mysteryBoxTimer: 0
  });

  const [showMysteryBox, setShowMysteryBox] = useState(false);
  const [rewardNotification, setRewardNotification] = useState<{ type: 'success' | 'warning' | 'info'; message: string } | null>(null);
  const [spinWheelActive, setSpinWheelActive] = useState(false);
  const [spinWheelResult, setSpinWheelResult] = useState<string | null>(null);

  // Akses Full Power Pro Diberikan Secara Gratis Sesuai Request User
  const isPremium = true;

  useEffect(() => {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', theme);

    // Fetch Matches
    fetchRealMatches().then(data => {
      setMatches(data);
      setLoading(false);
    });

    // Fetch News for Ticker
    fetchRealNews().then(data => {
      setNews(data);
    });
  }, []);

  // Variable Reward System - Daily Login Bonus
  useEffect(() => {
    const checkDailyReward = () => {
      const today = new Date().toDateString();
      const lastLogin = localStorage.getItem('lastLoginDate');

      if (lastLogin !== today) {
        // Check if user had streak yesterday
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const streakData = localStorage.getItem('userStreak');

        let newStreak = 1;
        if (streakData && lastLogin === yesterday) {
          const parsedStreak = parseInt(streakData);
          newStreak = parsedStreak + 1;
        }

        localStorage.setItem('userStreak', newStreak.toString());
        localStorage.setItem('lastLoginDate', today);

        // Award XP and coins based on streak
        const xpReward = Math.min(50 + (newStreak * 5), 200); // Max 200 XP
        const coinReward = Math.min(10 + (newStreak * 2), 100); // Max 100 coins

        setUserStats(prev => ({
          ...prev,
          streak: newStreak,
          xp: prev.xp + xpReward,
          coins: prev.coins + coinReward,
          dailyRewardClaimed: true,
          lastLogin: today
        }));

        setRewardNotification({
          type: 'success',
          message: `Daily Reward! +${xpReward} XP, +${coinReward} Coins (${newStreak} day streak!)`
        });

        // Check for level up
        setUserStats(prev => {
          const newXP = prev.xp + xpReward;
          if (newXP >= prev.xpToNextLevel) {
            const newLevel = prev.level + 1;
            const newXPToNextLevel = Math.floor(100 * (newLevel * 1.5));
            const excessXP = newXP - prev.xpToNextLevel;

            setRewardNotification({
              type: 'success',
              message: `Level Up! You are now level ${newLevel}!`
            });

            return {
              ...prev,
              level: newLevel,
              xp: excessXP,
              xpToNextLevel: newXPToNextLevel
            };
          }

          return {
            ...prev,
            xp: newXP
          };
        });
      } else if (!lastLogin) {
        // First time user
        localStorage.setItem('lastLoginDate', today);
        localStorage.setItem('userStreak', '1');

        setUserStats(prev => ({
          ...prev,
          streak: 1,
          xp: prev.xp + 50,
          coins: prev.coins + 20,
          dailyRewardClaimed: true,
          lastLogin: today
        }));

        setRewardNotification({
          type: 'info',
          message: 'Welcome! You received 50 XP and 20 coins for signing in.'
        });
      }
    };

    checkDailyReward();

    // Mystery box timer (appears every 2-4 hours)
    const mysteryBoxInterval = setInterval(() => {
      setUserStats(prev => ({
        ...prev,
        mysteryBoxAvailable: true,
        mysteryBoxTimer: Math.floor(Math.random() * 120) + 120 // 2-4 hours in minutes
      }));

      setRewardNotification({
        type: 'warning',
        message: '🎁 Mystery Box Available! Open it for exclusive rewards!'
      });
    }, 300000); // Check every 5 minutes

    // Spin wheel timer (daily chance)
    const spinWheelInterval = setInterval(() => {
      // Reset spin wheel chance daily
      const today = new Date().toDateString();
      const lastSpin = localStorage.getItem('lastSpinDate');

      if (lastSpin !== today) {
        localStorage.setItem('lastSpinDate', today);
        setUserStats(prev => ({
          ...prev,
          mysteryBoxAvailable: true // Give a spin chance daily
        }));
      }
    }, 300000); // Check every 5 minutes

    return () => {
      clearInterval(mysteryBoxInterval);
      clearInterval(spinWheelInterval);
    };
  }, []);

  // Handle mystery box opening
  const openMysteryBox = () => {
    if (!userStats.mysteryBoxAvailable) return;

    setSpinWheelActive(true);

    // Simulate spin
    setTimeout(() => {
      const rewards = [
        { type: 'xp', amount: Math.floor(Math.random() * 100) + 50, message: '+{amount} XP!' },
        { type: 'coins', amount: Math.floor(Math.random() * 200) + 50, message: '+{amount} Coins!' },
        { type: 'boost', amount: 2, message: '2x XP Boost for 1 hour!' },
        { type: 'premium', amount: 1, message: 'Free Premium Access for 6 hours!' },
        { type: 'jackpot', amount: 1000, message: 'JACKPOT! +1000 Coins!' }
      ];

      const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
      setSpinWheelResult(randomReward.message.replace('{amount}', randomReward.amount.toString()));

      // Apply reward
      setUserStats(prev => {
        let updated = { ...prev, mysteryBoxAvailable: false };

        if (randomReward.type === 'xp') {
          let newXP = prev.xp + randomReward.amount;
          let newLevel = prev.level;
          let newXPToNextLevel = prev.xpToNextLevel;

          // Check for level up
          while (newXP >= newXPToNextLevel) {
            newLevel++;
            newXP -= newXPToNextLevel;
            newXPToNextLevel = Math.floor(100 * (newLevel * 1.5));
          }

          updated = {
            ...updated,
            xp: newXP,
            level: newLevel,
            xpToNextLevel: newXPToNextLevel
          };
        } else if (randomReward.type === 'coins') {
          updated = {
            ...updated,
            coins: prev.coins + randomReward.amount
          };
        } else if (randomReward.type === 'boost') {
          // In a real app, this would activate a timed boost
          setRewardNotification({
            type: 'success',
            message: randomReward.message
          });
        } else if (randomReward.type === 'premium') {
          // Temporary premium access
          setRewardNotification({
            type: 'success',
            message: randomReward.message
          });
        } else if (randomReward.type === 'jackpot') {
          updated = {
            ...updated,
            coins: prev.coins + randomReward.amount
          };
        }

        return updated;
      });

      setSpinWheelActive(false);
    }, 3000); // Spin duration
  };

  // Handle spin wheel
  const spinWheel = () => {
    if (spinWheelActive) return;

    // Daily spin wheel - once per day
    const today = new Date().toDateString();
    const lastSpin = localStorage.getItem('lastSpinDate');

    if (lastSpin === today) {
      setRewardNotification({
        type: 'info',
        message: 'You have already used your daily spin! Come back tomorrow.'
      });
      return;
    }

    setSpinWheelActive(true);

    setTimeout(() => {
      const rewards = [
        { type: 'xp', amount: 25, message: '+25 XP!' },
        { type: 'coins', amount: 75, message: '+75 Coins!' },
        { type: 'xp', amount: 100, message: '+100 XP!' },
        { type: 'coins', amount: 150, message: '+150 Coins!' },
        { type: 'boost', amount: 1, message: '1.5x XP Boost for 30 minutes!' },
        { type: 'mystery', amount: 1, message: 'Mystery Prize! Check your inventory!' }
      ];

      const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
      setSpinWheelResult(randomReward.message);

      // Apply reward
      setUserStats(prev => {
        let updated = { ...prev };

        if (randomReward.type === 'xp') {
          let newXP = prev.xp + randomReward.amount;
          let newLevel = prev.level;
          let newXPToNextLevel = prev.xpToNextLevel;

          // Check for level up
          while (newXP >= newXPToNextLevel) {
            newLevel++;
            newXP -= newXPToNextLevel;
            newXPToNextLevel = Math.floor(100 * (newLevel * 1.5));
          }

          updated = {
            ...updated,
            xp: newXP,
            level: newLevel,
            xpToNextLevel: newXPToNextLevel
          };
        } else if (randomReward.type === 'coins') {
          updated = {
            ...updated,
            coins: prev.coins + randomReward.amount
          };
        } else if (randomReward.type === 'boost') {
          setRewardNotification({
            type: 'success',
            message: randomReward.message
          });
        } else if (randomReward.type === 'mystery') {
          // Add mystery box chance
          updated = {
            ...updated,
            mysteryBoxAvailable: true
          };
          setRewardNotification({
            type: 'warning',
            message: 'You earned a Mystery Box!'
          });
        }

        // Mark spin as used today
        localStorage.setItem('lastSpinDate', today);

        return updated;
      });

      setSpinWheelActive(false);
    }, 3000); // Spin duration
  };

  // Achievement system
  const checkAchievements = () => {
    const newAchievements = [];

    // Streak achievements
    if (userStats.streak >= 7 && !userStats.achievements.includes('week_warrior')) {
      newAchievements.push('week_warrior');
    }
    if (userStats.streak >= 30 && !userStats.achievements.includes('monthly_marathon')) {
      newAchievements.push('monthly_marathon');
    }

    // Level achievements
    if (userStats.level >= 10 && !userStats.achievements.includes('level_10')) {
      newAchievements.push('level_10');
    }
    if (userStats.level >= 25 && !userStats.achievements.includes('level_25')) {
      newAchievements.push('level_25');
    }

    // XP achievements
    if (userStats.xp >= 1000 && !userStats.achievements.includes('xp_1000')) {
      newAchievements.push('xp_1000');
    }

    // Coin achievements
    if (userStats.coins >= 5000 && !userStats.achievements.includes('coin_collector')) {
      newAchievements.push('coin_collector');
    }

    if (newAchievements.length > 0) {
      setUserStats(prev => ({
        ...prev,
        achievements: [...prev.achievements, ...newAchievements]
      }));

      newAchievements.forEach(achievement => {
        let message = '';
        switch (achievement) {
          case 'week_warrior':
            message = 'Achievement Unlocked: Week Warrior (7 day streak!)';
            break;
          case 'monthly_marathon':
            message = 'Achievement Unlocked: Monthly Marathon (30 day streak!)';
            break;
          case 'level_10':
            message = 'Achievement Unlocked: Level 10 Reached!';
            break;
          case 'level_25':
            message = 'Achievement Unlocked: Level 25 Reached!';
            break;
          case 'xp_1000':
            message = 'Achievement Unlocked: XP Collector (1000+ XP)!';
            break;
          case 'coin_collector':
            message = 'Achievement Unlocked: Coin Collector (5000+ Coins)!';
            break;
        }

        setRewardNotification({
          type: 'success',
          message
        });
      });
    }
  };

  // Run achievement check periodically
  useEffect(() => {
    const achievementInterval = setInterval(checkAchievements, 10000); // Check every 10 seconds
    return () => clearInterval(achievementInterval);
  }, [userStats]);

  const changeTheme = (newTheme: 'hacker' | 'cyan' | 'purple' | 'emerald' | 'rose') => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const [showAllLeagues, setShowAllLeagues] = useState(false);
  const [isLeagueFilterOpen, setIsLeagueFilterOpen] = useState(true);

  const handleLeagueChange = (league: string) => {
    setIsLeagueLoading(true);
    setActiveLeague(league);
    setTimeout(() => {
      setIsLeagueLoading(false);
    }, 200); // Simulate brief loading
  };

  const handleMatchClick = async (match: any) => {
    setIsMatchLoading(true);
    setSelectedMatch(match);

    // Fetch real lineups and details
    if (isPremium) {
      const details = await fetchMatchDetails(match.leagueId, match.id);
      setMatchDetails(details);
    }

    setIsMatchLoading(false);
  };

  const leagues = ['All', ...Array.from(new Set(matches.map(m => m.league)))];
  const displayedLeagues = showAllLeagues ? leagues : leagues.slice(0, 8);
  const filteredMatches = activeLeague === 'All' ? matches : matches.filter(m => m.league === activeLeague);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[var(--brand-bg)] text-[var(--brand-50)] pb-20 transition-colors duration-500 relative"
    >
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="bg-blob bg-blob-1"></div>
        <div className="bg-blob bg-blob-2"></div>
        <div className="bg-blob bg-blob-3"></div>
        <img src="https://images.unsplash.com/photo-1574629810360-7efbb1925b36?q=80&w=2000&auto=format&fit=crop" alt="Background" className="w-full h-full object-cover opacity-10 mix-blend-luminosity filter blur-xl" referrerPolicy="no-referrer" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 relative z-10">

        {/* Left Sidebar: Filters & Theme */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-6">
          {/* Theme Switcher */}
          <div className="bg-[var(--brand-950)]/30 backdrop-blur-md border border-[var(--brand-500)]/20 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-[var(--brand-400)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Mode Warna
            </h3>
            <div className="flex gap-2">
              <button onClick={() => changeTheme('hacker')} className={`w-8 h-8 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] ${theme === 'hacker' ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--brand-bg)]' : 'opacity-50 hover:opacity-100'}`} title="Hacker Grid"></button>
              <button onClick={() => changeTheme('cyan')} className={`w-8 h-8 rounded-full bg-cyan-500 ${theme === 'cyan' ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--brand-bg)]' : 'opacity-50 hover:opacity-100'}`} title="Cyan"></button>
              <button onClick={() => changeTheme('purple')} className={`w-8 h-8 rounded-full bg-purple-500 ${theme === 'purple' ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--brand-bg)]' : 'opacity-50 hover:opacity-100'}`} title="Purple"></button>
              <button onClick={() => changeTheme('emerald')} className={`w-8 h-8 rounded-full bg-emerald-500 ${theme === 'emerald' ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--brand-bg)]' : 'opacity-50 hover:opacity-100'}`} title="Emerald"></button>
              <button onClick={() => changeTheme('rose')} className={`w-8 h-8 rounded-full bg-rose-500 ${theme === 'rose' ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--brand-bg)]' : 'opacity-50 hover:opacity-100'}`} title="Rose"></button>
            </div>
          </div>

          {/* League Filters */}
          <div className="bg-[var(--brand-950)]/30 backdrop-blur-md border border-[var(--brand-500)]/20 rounded-2xl p-4 flex flex-col gap-2">
            <button
              onClick={() => setIsLeagueFilterOpen(!isLeagueFilterOpen)}
              className="flex items-center justify-between w-full text-left group"
            >
              <h3 className="text-xs font-bold text-[var(--brand-400)] uppercase tracking-wider flex items-center gap-2 group-hover:text-[var(--brand-300)] transition-colors">
                <Trophy className="w-4 h-4" /> Filter Liga
              </h3>
              <ChevronRight className={`w-4 h-4 text-[var(--brand-500)] transition-transform duration-300 ${isLeagueFilterOpen ? 'rotate-90' : ''}`} />
            </button>

            <div className={`flex flex-col gap-2 overflow-hidden transition-all duration-300 ${isLeagueFilterOpen ? 'max-h-[1000px] mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
              {displayedLeagues.map((league) => (
                <button
                  key={String(league)}
                  onClick={() => handleLeagueChange(String(league))}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold transition-all text-left ${activeLeague === league
                    ? 'bg-[var(--brand-500)]/20 border-[var(--brand-400)] text-[var(--brand-300)] shadow-[0_0_15px_rgba(var(--brand-500),0.4)]'
                    : 'bg-[var(--brand-950)]/30 border-[var(--brand-900)]/50 text-[var(--brand-600)] hover:bg-[var(--brand-900)]/40 hover:text-[var(--brand-400)]'
                    }`}
                >
                  {league === 'All' ? <Globe className="w-4 h-4 shrink-0" /> : <div className="w-2 h-2 rounded-full bg-[var(--brand-500)] shrink-0" />}
                  <span className="truncate">{league}</span>
                </button>
              ))}
              {leagues.length > 8 && (
                <button
                  onClick={() => setShowAllLeagues(!showAllLeagues)}
                  className="mt-2 text-xs font-bold text-[var(--brand-400)] hover:text-[var(--brand-300)] transition-colors py-2 text-center border border-dashed border-[var(--brand-500)]/30 rounded-xl"
                >
                  {showAllLeagues ? 'Tampilkan Lebih Sedikit' : `Tampilkan Semua (${leagues.length})`}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header & Premium Banner */}
          <div className="flex flex-col gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-[0_0_15px_rgba(var(--brand-500),0.5)] glitch-wrapper w-fit">
                <span className="glitch" data-text="PREDIKSI HARI INI">PREDIKSI HARI INI</span>
              </h1>
              <p className="text-[var(--brand-200)]/70">Akurasi rata-rata 30 hari terakhir: <span className="text-[var(--brand-400)] font-bold drop-shadow-[0_0_10px_rgba(var(--brand-500),0.8)]">92.4%</span></p>
            </div>

            {!isPremium && (
              <div className="bg-gradient-to-r from-[var(--brand-900)]/40 to-[#000] border border-[var(--brand-500)]/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(var(--brand-500),0.15)]">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-400" /> Buka Potensi Penuh Prediksi
                  </h3>
                  <p className="text-sm text-[var(--brand-100)]/80 max-w-xl">
                    Dapatkan akses ke susunan pemain eksklusif, info insider di balik layar, analisis mendalam berbasis AI, dan akurasi prediksi yang jauh lebih tinggi.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/pricing')}
                  className="shrink-0 px-6 py-3 rounded-full bg-[var(--brand-600)] text-white font-bold text-sm hover:bg-[var(--brand-500)] hover:shadow-[0_0_20px_rgba(var(--brand-500),0.6)] transition-all whitespace-nowrap"
                >
                  Upgrade Premium
                </button>
              </div>
            )}
          </div>

          {/* Match Grid */}
          {loading || isLeagueLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bounce-ball mb-4"></div>
              <p className="text-[var(--brand-400)] font-bold animate-pulse">Memuat Data Pertandingan...</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="text-center py-20 bg-[var(--brand-950)]/10 rounded-3xl border border-[var(--brand-900)]/30">
              <p className="text-[var(--brand-600)] font-medium">Tidak ada pertandingan yang dijadwalkan untuk liga ini hari ini.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredMatches.map((match, i) => (
                <motion.div
                  key={match.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleMatchClick(match)}
                  className="group cursor-pointer rounded-2xl bg-[var(--brand-950)]/30 backdrop-blur-md border border-[var(--brand-500)]/20 hover:border-[var(--brand-400)] hover:shadow-[0_0_25px_rgba(var(--brand-500),0.3)] transition-all overflow-hidden flex flex-col"
                >
                  {/* Card Header */}
                  <div className="px-6 py-4 border-b border-[var(--brand-500)]/10 flex justify-between items-center bg-black/40">
                    <span className="text-xs font-bold tracking-wider text-[var(--brand-500)] uppercase">{match.league}</span>
                    <span className="text-xs font-bold text-[var(--brand-300)] bg-[var(--brand-500)]/10 border border-[var(--brand-500)]/20 px-2 py-1 rounded-md shadow-[0_0_10px_rgba(var(--brand-500),0.2)]">
                      {format(new Date(match.matchDate), 'HH:mm')}
                    </span>
                  </div>

                  {/* Teams */}
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex flex-col items-center gap-2 w-1/3 text-center">
                        {match.homeLogo && <img src={match.homeLogo} alt={match.homeTeam} className="w-10 h-10 object-contain drop-shadow-md" referrerPolicy="no-referrer" />}
                        <div className="text-sm font-bold text-white line-clamp-2">{match.homeTeam}</div>
                      </div>
                      <div className="text-sm font-bold text-[var(--brand-800)] w-1/3 text-center">VS</div>
                      <div className="flex flex-col items-center gap-2 w-1/3 text-center">
                        {match.awayLogo && <img src={match.awayLogo} alt={match.awayTeam} className="w-10 h-10 object-contain drop-shadow-md" referrerPolicy="no-referrer" />}
                        <div className="text-sm font-bold text-white line-clamp-2">{match.awayTeam}</div>
                      </div>
                    </div>

                    {/* Top Predictions */}
                    <div className="space-y-3 mt-6">
                      {match.predictions.slice(0, 5).map((pred: any) => (
                        <div key={pred.id} className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-[var(--brand-900)]/30 group-hover:border-[var(--brand-500)]/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-[var(--brand-600)] w-12">{pred.type}</span>
                            <span className="text-sm font-bold text-[var(--brand-50)]">{pred.value}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pred.confidence === 'HIGH' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                              {pred.confidence}
                            </span>
                            <span className="text-sm font-bold text-[var(--brand-400)] drop-shadow-[0_0_5px_rgba(var(--brand-500),0.5)]">{pred.probability}%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Live Odds (Premium Only) */}
                    {isPremium && match.odds && (
                      <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-[var(--brand-900)]/20 to-black/20 border border-[var(--brand-500)]/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-[var(--brand-400)] uppercase tracking-wider flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Live Odds ({match.odds.provider})
                          </span>
                        </div>
                        <div className="flex justify-between text-xs font-medium text-[var(--brand-100)]">
                          <span>1X2: <span className="text-white font-bold">{match.odds.details || 'N/A'}</span></span>
                          <span>O/U: <span className="text-white font-bold">{match.odds.overUnder || 'N/A'}</span></span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 border-t border-[var(--brand-500)]/10 flex justify-between items-center text-sm text-[var(--brand-600)] group-hover:text-[var(--brand-400)] transition-colors bg-black/20">
                    <span className="font-medium">Lihat Analisis Lengkap</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000]/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-4xl bg-[var(--brand-bg)] border border-[var(--brand-500)]/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(var(--brand-500),0.15)] flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-[var(--brand-500)]/20 flex justify-between items-center bg-black/40">
              <div>
                <div className="text-sm font-bold text-[var(--brand-500)] mb-1 tracking-wider uppercase">{selectedMatch.league}</div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  {selectedMatch.homeLogo && <img src={selectedMatch.homeLogo} alt="" className="w-8 h-8 object-contain drop-shadow-lg" referrerPolicy="no-referrer" />}
                  {selectedMatch.homeTeam} <span className="text-[var(--brand-800)] text-lg">VS</span> {selectedMatch.awayTeam}
                  {selectedMatch.awayLogo && <img src={selectedMatch.awayLogo} alt="" className="w-8 h-8 object-contain drop-shadow-lg" referrerPolicy="no-referrer" />}
                </h2>
              </div>
              <button
                onClick={() => { setSelectedMatch(null); setMatchDetails(null); }}
                className="p-2 rounded-full bg-[var(--brand-950)]/50 hover:bg-[var(--brand-900)] text-[var(--brand-500)] hover:text-[var(--brand-300)] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {isMatchLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="bounce-ball mb-4"></div>
                  <p className="text-[var(--brand-400)] font-bold animate-pulse">Menganalisis Data Pertandingan...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Predictions List */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 drop-shadow-[0_0_10px_rgba(var(--brand-500),0.5)]">
                        <Activity className="w-5 h-5 text-[var(--brand-400)]" />
                        Semua Pasar Prediksi
                      </h3>
                      <div className="space-y-3">
                        {selectedMatch.predictions.map((pred: any) => (
                          <div key={pred.id} className="p-4 rounded-xl bg-[var(--brand-950)]/30 border border-[var(--brand-900)]/50 hover:border-[var(--brand-500)]/30 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-bold text-[var(--brand-600)]">{pred.type}</span>
                              <span className={`text-xs font-bold px-2 py-1 rounded ${pred.confidence === 'HIGH' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                {pred.confidence} CONFIDENCE
                              </span>
                            </div>
                            <div className="flex justify-between items-end">
                              <span className="text-xl font-bold text-white">{pred.value}</span>
                              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-400)] to-blue-500 drop-shadow-[0_0_10px_rgba(var(--brand-500),0.3)]">
                                {pred.probability}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Team Morale Preview */}
                    <div className="p-5 rounded-2xl bg-[var(--brand-950)]/30 border border-[var(--brand-900)]/50">
                      <h4 className="text-xs font-bold text-[var(--brand-600)] mb-4 uppercase tracking-wider">Team Morale (Berdasarkan Form)</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-[var(--brand-50)]">{selectedMatch.homeTeam}</span>
                            <span className="text-sm font-black text-[var(--brand-400)]">{Math.round(selectedMatch.stats.home.moraleScore)}/100</span>
                          </div>
                          <div className="w-full h-2 bg-[var(--brand-950)] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-400)]" style={{ width: `${selectedMatch.stats.home.moraleScore}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-[var(--brand-50)]">{selectedMatch.awayTeam}</span>
                            <span className="text-sm font-black text-[var(--brand-400)]">{Math.round(selectedMatch.stats.away.moraleScore)}/100</span>
                          </div>
                          <div className="w-full h-2 bg-[var(--brand-950)] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-400)]" style={{ width: `${selectedMatch.stats.away.moraleScore}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* X-Factor & Premium */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 drop-shadow-[0_0_10px_rgba(var(--brand-500),0.5)]">
                      <AlertCircle className="w-5 h-5 text-[var(--brand-400)]" />
                      Analisis Mendalam & Insider Info
                    </h3>

                    {/* Premium Info Logic */}
                    {isPremium ? (
                      <div className="space-y-4">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--brand-900)]/40 to-black/40 border border-[var(--brand-400)]/50 shadow-[0_0_30px_rgba(var(--brand-500),0.2)]">
                          <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck className="w-5 h-5 text-[var(--brand-300)]" />
                            <span className="text-xs font-black text-[var(--brand-300)] tracking-widest uppercase">Akses Premium Aktif</span>
                          </div>

                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-bold text-[var(--brand-400)] mb-2">Susunan Pemain Resmi / Prediksi AI</h4>
                              {matchDetails && (matchDetails.homeLineup.length > 0 || matchDetails.awayLineup.length > 0) ? (
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <span className="font-bold text-[var(--brand-200)] block mb-2 border-b border-[var(--brand-500)]/20 pb-1">{selectedMatch.homeTeam}</span>
                                    <ul className="text-[var(--brand-100)]/70 space-y-2">
                                      {matchDetails.homeLineup.map((p: any, i: number) => (
                                        <li key={i} className="flex flex-col gap-1 bg-black/20 p-2 rounded-lg border border-[var(--brand-500)]/10">
                                          <div className="flex items-center gap-2">
                                            <img src={p.headshot} alt={p.name} className="w-6 h-6 rounded-full object-cover bg-white/10" referrerPolicy="no-referrer" />
                                            <span className="flex-1 truncate font-medium">{p.jersey ? `${p.jersey}. ` : ''}{p.name}</span>
                                            <span className="text-[10px] bg-[var(--brand-900)]/50 px-1.5 py-0.5 rounded text-[var(--brand-300)]">{p.position}</span>
                                          </div>
                                          {p.stats !== 'N/A' && (
                                            <span className="text-[9px] text-[var(--brand-400)]/80 pl-8">{p.stats}</span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <span className="font-bold text-[var(--brand-200)] block mb-2 border-b border-[var(--brand-500)]/20 pb-1">{selectedMatch.awayTeam}</span>
                                    <ul className="text-[var(--brand-100)]/70 space-y-2">
                                      {matchDetails.awayLineup.map((p: any, i: number) => (
                                        <li key={i} className="flex flex-col gap-1 bg-black/20 p-2 rounded-lg border border-[var(--brand-500)]/10">
                                          <div className="flex items-center gap-2">
                                            <img src={p.headshot} alt={p.name} className="w-6 h-6 rounded-full object-cover bg-white/10" referrerPolicy="no-referrer" />
                                            <span className="flex-1 truncate font-medium">{p.jersey ? `${p.jersey}. ` : ''}{p.name}</span>
                                            <span className="text-[10px] bg-[var(--brand-900)]/50 px-1.5 py-0.5 rounded text-[var(--brand-300)]">{p.position}</span>
                                          </div>
                                          {p.stats !== 'N/A' && (
                                            <span className="text-[9px] text-[var(--brand-400)]/80 pl-8">{p.stats}</span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-[var(--brand-100)]/80 leading-relaxed">
                                  Susunan pemain resmi belum dirilis (biasanya rilis 1 jam sebelum kick-off). Berdasarkan data latihan terakhir, {selectedMatch.homeTeam} kemungkinan besar akan menurunkan formasi menyerang 4-3-3, sementara {selectedMatch.awayTeam} akan bermain bertahan dengan 5-3-2.
                                </p>
                              )}
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-[var(--brand-400)] mb-2">Info Di Balik Layar (Insider & Mafia)</h4>
                              <p className="text-sm text-[var(--brand-100)]/80 leading-relaxed border-l-2 border-yellow-500 pl-3 italic mb-4">
                                "{matchDetails?.insiderInfo || "Sedang mengais informasi dari agen lapangan..."}"
                              </p>

                              {matchDetails?.injuries && matchDetails.injuries.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-bold text-red-400 mb-2 mt-4">Daftar Absen / Cedera Pemain (Real Data)</h4>
                                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2.5">
                                    {matchDetails.injuries.map((inj: any, idx: number) => (
                                      <div key={idx} className="bg-red-900/20 border border-red-500/30 p-2 rounded-lg flex flex-col">
                                        <div className="flex justify-between items-start">
                                          <span className="text-xs font-bold text-red-200">{inj.name}</span>
                                          <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">{inj.team}</span>
                                        </div>
                                        <span className="text-[10px] text-red-300/80 mt-1 capitalize">{inj.status}: {inj.detail}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {matchDetails?.dataSourceInfo && (
                                <div className="mt-6 p-4 rounded-xl bg-[var(--brand-950)]/40 border border-[var(--brand-700)] shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
                                  <h4 className="text-[11px] font-black text-[var(--brand-400)] mb-3 uppercase tracking-widest flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5" /> Sumber Data & Verifikasi Real-Time
                                  </h4>
                                  <div className="space-y-2 text-[10px] text-[var(--brand-200)]/80">
                                    <div className="flex justify-between border-b border-[var(--brand-900)] pb-1">
                                      <span className="font-bold">Provider API:</span>
                                      <span className="text-white">{matchDetails.dataSourceInfo.provider}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-[var(--brand-900)] pb-1">
                                      <span className="font-bold">Data Terkumpul:</span>
                                      <span className="text-white">{matchDetails.dataSourceInfo.dataPoints}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-[var(--brand-900)] pb-1">
                                      <span className="font-bold">Last Synchronized:</span>
                                      <span className="text-white">{format(new Date(matchDetails.dataSourceInfo.lastUpdated), 'dd MMM yyyy, HH:mm:ss')}</span>
                                    </div>
                                    <div className="flex justify-between pt-1">
                                      <span className="font-bold">Skor Kredibilitas Data:</span>
                                      <span className="text-green-400 font-black">{matchDetails.dataSourceInfo.credibilityScore}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-[var(--brand-400)] mb-2">Analisis Wasit & Cuaca</h4>
                              <p className="text-sm text-[var(--brand-100)]/80 leading-relaxed">
                                Wasit: <span className="font-bold text-white">{matchDetails?.referee || "Belum ditentukan"}</span>. Rata-rata {(3 + (parseInt(selectedMatch.id) % 30) / 10).toFixed(1)} kartu per pertandingan.
                                Venue: <span className="font-bold text-white">{matchDetails?.venue || "Stadion Utama"}</span>.
                                {parseInt(selectedMatch.id) % 2 === 0 ? " Cuaca cerah, lapangan optimal untuk permainan cepat." : " Kemungkinan hujan ringan, lapangan sedikit licin."}
                              </p>
                            </div>

                            <div className="p-4 bg-[var(--brand-950)]/50 rounded-xl border border-[var(--brand-800)]">
                              <h4 className="text-sm font-bold text-white mb-2">Kesimpulan AI Omni-9000</h4>
                              <p className="text-sm text-[var(--brand-200)] leading-relaxed">
                                Melihat formasi agresif tuan rumah dan masalah internal tim tamu, probabilitas kemenangan {selectedMatch.homeTeam} sangat tinggi. Disarankan untuk mengambil opsi <span className="font-bold text-[var(--brand-400)]">Home Win</span> atau <span className="font-bold text-[var(--brand-400)]">Over 2.5 Goals</span> karena potensi pertandingan berjalan berat sebelah.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-[var(--brand-950)]/50 border border-[var(--brand-900)]/50 relative overflow-hidden h-full min-h-[400px]">
                        <div className="absolute inset-0 backdrop-blur-md bg-[var(--brand-bg)]/80 flex flex-col items-center justify-center text-center p-8 z-10">
                          <Lock className="w-10 h-10 text-[var(--brand-500)] mb-4 drop-shadow-[0_0_10px_rgba(var(--brand-500),0.5)]" />
                          <h4 className="text-xl font-bold text-white mb-3">Fitur Premium Terkunci</h4>
                          <p className="text-sm text-[var(--brand-200)]/80 mb-6 max-w-sm">
                            Buka akses untuk melihat prediksi susunan pemain, info insider ruang ganti, analisis wasit, dan kesimpulan AI yang lebih akurat.
                          </p>
                          <button
                            onClick={() => navigate('/pricing')}
                            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-400)] text-white font-bold text-sm hover:shadow-[0_0_25px_rgba(var(--brand-500),0.6)] transition-all"
                          >
                            Upgrade Sekarang
                          </button>
                        </div>
                        {/* Blurred background content */}
                        <div className="space-y-6 opacity-20 blur-sm pointer-events-none">
                          <div className="space-y-2">
                            <div className="h-5 bg-[var(--brand-500)] rounded w-1/3"></div>
                            <div className="h-4 bg-[var(--brand-500)] rounded w-full"></div>
                            <div className="h-4 bg-[var(--brand-500)] rounded w-5/6"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-5 bg-[var(--brand-500)] rounded w-1/2"></div>
                            <div className="h-4 bg-[var(--brand-500)] rounded w-full"></div>
                            <div className="h-4 bg-[var(--brand-500)] rounded w-4/5"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-5 bg-[var(--brand-500)] rounded w-2/5"></div>
                            <div className="h-20 bg-[var(--brand-500)] rounded w-full"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Scrolling News Ticker */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--brand-950)]/90 backdrop-blur-xl border-t border-[var(--brand-500)]/30 py-2 z-40 flex items-center group">
        <div className="flex items-center gap-2 px-4 border-r border-[var(--brand-500)]/30 bg-[var(--brand-950)]/90 z-10 shrink-0">
          <Newspaper className="w-4 h-4 text-[var(--brand-400)]" />
          <span className="text-xs font-black text-[var(--brand-400)] uppercase tracking-wider">LIVE NEWS</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1 flex items-center">
          <div className="animate-[marquee_120s_linear_infinite] inline-block group-hover:[animation-play-state:paused]">
            {news.length > 0 ? news.map((item, i) => (
              <span key={i} className="mx-8 text-sm text-[var(--brand-100)]">
                <span className="text-[var(--brand-500)] font-bold mr-2">[{format(new Date(item.timestamp), 'HH:mm')}]</span>
                {item.title}
                <span className="text-[var(--brand-700)] text-xs ml-2">({item.source})</span>
              </span>
            )) : (
              <span className="mx-8 text-sm text-[var(--brand-100)]">Memuat berita terkini...</span>
            )}
            {/* Duplicate for seamless loop */}
            {news.length > 0 && news.map((item, i) => (
              <span key={`dup-${i}`} className="mx-8 text-sm text-[var(--brand-100)]">
                <span className="text-[var(--brand-500)] font-bold mr-2">[{format(new Date(item.timestamp), 'HH:mm')}]</span>
                {item.title}
                <span className="text-[var(--brand-700)] text-xs ml-2">({item.source})</span>
              </span>
            ))}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 border-l border-[var(--brand-500)]/30 bg-[var(--brand-950)]/90 z-10 shrink-0">
          <AlertCircle className="w-4 h-4 text-yellow-500" />
          <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Disclaimer: Prediksi bukan jaminan 100%</span>
        </div>
      </div>
    </motion.div>
  );
}
