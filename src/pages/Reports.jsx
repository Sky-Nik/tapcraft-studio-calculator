import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign, Target, Activity } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Reports() {
  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list()
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list()
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list()
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.Quote.list()
  });

  const metrics = useMemo(() => {
    const leadsBySource = leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {});

    const dealsByStage = deals.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {});

    const wonDeals = deals.filter(d => d.stage === "Won");
    const totalDealsValue = wonDeals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);
    const conversionRate = leads.length > 0 ? ((wonDeals.length / leads.length) * 100).toFixed(1) : 0;

    const quotesPerWeek = quotes.reduce((acc, quote) => {
      const week = new Date(quote.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[week] = (acc[week] || 0) + 1;
      return acc;
    }, {});

    const leadSourceData = Object.entries(leadsBySource).map(([name, value]) => ({ name, value }));
    const dealStageData = Object.entries(dealsByStage).map(([name, value]) => ({ name, value }));
    const quotesData = Object.entries(quotesPerWeek).slice(-7).map(([name, value]) => ({ name, value }));

    return {
      totalLeads: leads.length,
      totalContacts: contacts.length,
      totalDeals: deals.length,
      wonDeals: wonDeals.length,
      totalRevenue: totalDealsValue,
      conversionRate,
      leadSourceData,
      dealStageData,
      quotesData
    };
  }, [leads, contacts, deals, quotes]);

  const COLORS = ['#1E73FF', '#0056D6', '#4A9AFF', '#7AB8FF', '#A3CEFF', '#CCE5FF'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">CRM Reports</h1>
        <p className="text-muted-foreground mt-1">Analytics and insights for your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.totalLeads}</p>
              <p className="text-sm text-muted-foreground">Total Leads</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.totalContacts}</p>
              <p className="text-sm text-muted-foreground">Total Contacts</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.wonDeals}</p>
              <p className="text-sm text-muted-foreground">Won Deals</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-yellow-100">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-100">
              <Target className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-indigo-100">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.totalDeals}</p>
              <p className="text-sm text-muted-foreground">Total Deals</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Leads by Source</h3>
          {metrics.leadSourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.leadSourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.leadSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Deals by Stage</h3>
          {metrics.dealStageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.dealStageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1E73FF" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Quotes Created (Last 7 Days)</h3>
          {metrics.quotesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.quotesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#1E73FF" name="Quotes" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}