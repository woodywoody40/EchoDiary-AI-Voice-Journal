
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { JournalEntry, Mood } from '../types';
import { getMoodInfo } from '../utils/moodUtils';

interface DashboardViewProps {
  entries: JournalEntry[];
}

const moodOrder: Mood[] = [Mood.Sad, Mood.Stressed, Mood.Neutral, Mood.Reflective, Mood.Content, Mood.Joyful];

const moodValue = (mood: Mood): number => moodOrder.indexOf(mood);

export const DashboardView: React.FC<DashboardViewProps> = ({ entries }) => {
  const processedData = useMemo(() => {
    return entries
      .map(entry => ({
        date: new Date(entry.id).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
        mood: moodValue(entry.mood),
        moodName: getMoodInfo(entry.mood).displayName,
      }))
      .reverse();
  }, [entries]);

  const moodDistribution = useMemo(() => {
    const counts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<Mood, number>);

    return Object.entries(counts).map(([name, value]) => ({ name: name as Mood, value, displayName: getMoodInfo(name as Mood).displayName }));
  }, [entries]);

  if (entries.length === 0) {
    return (
       <div className="text-center py-24 bg-surface rounded-3xl shadow-card border border-border-color/30 flex flex-col items-center slide-in-up">
            <div className="float-animation mb-6">
                <span className="material-symbols-outlined empty-state-icon" style={{ fontSize: '100px', color: '#D1D9E0' }}>monitoring</span>
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">目前尚無足夠資料</h3>
            <p className="text-text-secondary mb-8 max-w-md">建立一些日記來查看您的心情趨勢和數據分析</p>
            <div className="glass-effect px-5 py-3 rounded-xl">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>insights</span>
                    至少需要一篇日記才能顯示統計資訊
                </p>
            </div>
        </div>
    );
  }

  const totalEntries = entries.length;
  const averageMood = useMemo(() => {
    const sum = entries.reduce((acc, entry) => acc + moodValue(entry.mood), 0);
    return sum / entries.length;
  }, [entries]);

  const mostCommonMood = useMemo(() => {
    if (moodDistribution.length === 0) return null;
    return moodDistribution.reduce((prev, current) => (prev.value > current.value ? prev : current));
  }, [moodDistribution]);

  return (
    <div className="slide-in-up">
      <div className="mb-8">
        <h2 className="text-4xl font-bold gradient-text">儀表板</h2>
        <p className="text-sm text-text-secondary mt-1">您的心情分析與統計</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stats-card scale-in">
          <div className="flex items-center justify-between mb-3">
            <span className="material-symbols-outlined text-primary text-3xl">article</span>
            <div className="bg-primary/10 px-3 py-1 rounded-full">
              <span className="text-primary text-xs font-bold">總數</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-text-primary mb-1">{totalEntries}</p>
          <p className="text-sm text-text-secondary">日記篇數</p>
        </div>

        <div className="stats-card scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="material-symbols-outlined text-accent text-3xl">sentiment_satisfied</span>
            <div className="bg-accent/10 px-3 py-1 rounded-full">
              <span className="text-accent text-xs font-bold">平均</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-text-primary mb-1">{getMoodInfo(moodOrder[Math.round(averageMood)]).displayName}</p>
          <p className="text-sm text-text-secondary">平均心情</p>
        </div>

        <div className="stats-card scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="material-symbols-outlined text-secondary text-3xl">trending_up</span>
            <div className="bg-secondary/10 px-3 py-1 rounded-full">
              <span className="text-secondary text-xs font-bold">最多</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-text-primary mb-1">
            {mostCommonMood ? mostCommonMood.displayName : '-'}
          </p>
          <p className="text-sm text-text-secondary">最常見心情</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface p-6 sm:p-8 rounded-2xl shadow-card border border-border-color/30 card-hover-lift">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">show_chart</span>
            <h3 className="text-2xl font-bold text-text-primary">心情趨勢</h3>
          </div>
           <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
              <XAxis dataKey="date" stroke="#5F6368" style={{ fontSize: '12px' }} />
              <YAxis domain={[0, moodOrder.length - 1]} stroke="#5F6368" tickFormatter={(value) => getMoodInfo(moodOrder[value]).displayName} style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px',
                  border: '1px solid #E8EAED',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number, name, props) => [props.payload.moodName, '心情']}
              />
              <Bar dataKey="mood" name="心情指數" fill="#7D9AAB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface p-6 sm:p-8 rounded-2xl shadow-card border border-border-color/30 card-hover-lift">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">donut_small</span>
            <h3 className="text-2xl font-bold text-text-primary">心情分佈</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={moodDistribution} dataKey="value" nameKey="displayName" cx="50%" cy="50%" outerRadius={90} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                return (
                  <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="13px" fontWeight="600">
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}>
                {moodDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getMoodInfo(entry.name).color} />
                ))}
              </Pie>
              <Tooltip
                 contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px',
                  border: '1px solid #E8EAED',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};