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
  return (
    <ResponsiveContainer width="100%" height={height} minWidth={1} minHeight={100}>
      <BarChart data={data}>
        <Bar dataKey="hours" radius={[2, 2, 2, 2]} barSize={8}>
          {data.map((_: any, index: number) => (
            <Cell key={`cell-${index}`} fill="#3b82f6" opacity={0.05} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LazyBarChart;