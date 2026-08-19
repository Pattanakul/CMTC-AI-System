import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ArticlesChart({ data }: { data: Array<{ name: string; count: number }> }) {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='name' />
        <YAxis />
        <Tooltip />
        <Bar dataKey='count' fill='#3b82f6' />
      </BarChart>
    </ResponsiveContainer>
  );
}
