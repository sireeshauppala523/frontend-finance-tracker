import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type CategorySpendChartProps = {
  data: Array<{ category: string; amount: number }>;
};

type IncomeExpenseTrendChartProps = {
  data: Array<{ label: string; income: number; expense: number }>;
};

type ForecastBalanceChartProps = {
  data: Array<{ label: string; balance: number }>;
};

export function CategorySpendChart({ data }: CategorySpendChartProps) {
  return (
    <div className="chart-card">
      <div className="section-title">Spending by category</div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid vertical={false} stroke="#d7dde5" />
          <XAxis dataKey="category" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="amount" radius={[8, 8, 0, 0]} fill="#3d5f8f" barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function IncomeExpenseTrendChart({ data }: IncomeExpenseTrendChartProps) {
  return (
    <div className="chart-card">
      <div className="section-title">Income vs expense trend</div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid vertical={false} stroke="#d7dde5" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Line type="monotone" dataKey="income" stroke="#2f7a5c" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="expense" stroke="#d18b39" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ForecastBalanceChart({ data }: ForecastBalanceChartProps) {
  return (
    <div className="chart-card">
      <div className="section-title">Projected balance</div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid vertical={false} stroke="#d7dde5" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Line type="monotone" dataKey="balance" stroke="#4f7cac" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
