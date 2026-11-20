export interface AchievementDef {
  id: string
  title: string
  desc: string
  icon: 'message' | 'flag' | 'flame' | 'mic' | 'compass' | 'crown'
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-conversation', title: 'First Conversation', desc: 'Speak your first sentence to a local.', icon: 'message' },
  { id: 'first-mission', title: 'First Mission', desc: 'Complete your first story mission.', icon: 'flag' },
  { id: 'streak-7', title: 'Seven-Day Streak', desc: 'Practise seven days in a row.', icon: 'flame' },
  { id: 'confident-speaker', title: 'Confident Speaker', desc: 'Score 90+ on five spoken replies.', icon: 'mic' },
  { id: 'city-explorer', title: 'City Explorer', desc: 'Discover all eight places in Kochi.', icon: 'compass' },
  { id: 'local-legend', title: 'Local Legend', desc: 'Complete every story mission in Kochi.', icon: 'crown' },
]
