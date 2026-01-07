import React from 'react';

type Props = {
  ready: boolean;
  data: Array<{ name: number | string; hours: number }>;
  height?: number;
};

const LazyBarChart: React.FC<Props> = ({ ready, data, height = 256 }) => {
  const [mods, setMods] = React.useState<any | null>(null);

  React.useEffect(() => {
    let active = true;
    if (ready && !mods) {
      import('recharts').then((m) => { if (active) setMods(m); });
    }
    return () => { active = false; };
  }, [ready, mods]);

  if (!ready || !mods) return null;

  const { ResponsiveContainer, BarChart, Bar, Cell } = mods;
  const max = Math.max(1, ...data.map((d) => d.hours || 0));
  return (
    <ResponsiveContainer width="100%" height={height} minWidth={1} minHeight={100}>
      <BarChart data={data}>
        <Bar dataKey="hours" radius={[6, 6, 6, 6]} barSize={14}>
          {data.map((entry: any, index: number) => {
            const ratio = Math.max(0.15, Math.min(1, (entry.hours || 0) / max));
            const opacity = 0.25 + 0.65 * ratio;
            return <Cell key={`cell-${index}`} fill="#3b82f6" opacity={opacity} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LazyBarChart;