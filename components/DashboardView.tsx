
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
       <div className="text-center py-20 bg-surface rounded-2xl shadow-card flex flex-col items-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">monitoring</span>
            <p className="text-lg text-text-secondary">目前尚無足夠資料</p>
            <p className="mt-2 text-gray-400">建立一些日記來查看您的心情趨勢</p>
        </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-text-primary mb-6">儀表板</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl shadow-card">
          <h3 className="text-xl font-semibold mb-4 text-text-primary">心情趨勢</h3>
           <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
              <XAxis dataKey="date" stroke="#5F6368" />
              <YAxis domain={[0, moodOrder.length - 1]} stroke="#5F6368" tickFormatter={(value) => getMoodInfo(moodOrder[value]).displayName} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '0.75rem',
                  border: '1px solid #E8EAED',
                }}
                formatter={(value: number, name, props) => [props.payload.moodName, '心情']}
              />
              <Bar dataKey="mood" name="心情指數" fill="#3A82F7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-surface p-6 rounded-2xl shadow-card">
          <h3 className="text-xl font-semibold mb-4 text-text-primary">心情分佈</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={moodDistribution} dataKey="value" nameKey="displayName" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                return (
                  <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="14px">
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
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '0.75rem',
                  border: '1px solid #E8EAED',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};