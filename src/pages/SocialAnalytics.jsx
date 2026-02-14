import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Eye, Heart, MessageCircle, Share2, BarChart3, Calendar } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";

export default function SocialAnalytics() {
  const [dateRange, setDateRange] = React.useState("30");

  const { data: analytics = [] } = useQuery({
    queryKey: ['postAnalytics'],
    queryFn: () => base44.entities.PostAnalytics.list('-last_fetched')
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['postDrafts'],
    queryFn: () => base44.entities.PostDraft.list()
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['socialAccounts'],
    queryFn: () => base44.entities.SocialAccount.list()
  });

  const metrics = useMemo(() => {
    const totalImpressions = analytics.reduce((sum, a) => sum + (a.impressions || 0), 0);
    const totalReach = analytics.reduce((sum, a) => sum + (a.reach || 0), 0);
    const totalEngagement = analytics.reduce((sum, a) => sum + (a.likes || 0) + (a.comments || 0) + (a.shares || 0), 0);
    const avgEngagementRate = analytics.length > 0
      ? analytics.reduce((sum, a) => sum + (a.engagement_rate || 0), 0) / analytics.length
      : 0;

    const platformData = analytics.reduce((acc, a) => {
      if (!acc[a.platform]) {
        acc[a.platform] = { name: a.platform, impressions: 0, engagement: 0 };
      }
      acc[a.platform].impressions += a.impressions || 0;
      acc[a.platform].engagement += (a.likes || 0) + (a.comments || 0) + (a.shares || 0);
      return acc;
    }, {});

    const performanceData = analytics.slice(0, 10).map(a => ({
      name: format(new Date(a.last_fetched || Date.now()), 'MMM d'),
      impressions: a.impressions || 0,
      engagement: ((a.likes || 0) + (a.comments || 0) + (a.shares || 0))
    }));

    const topPosts = analytics
      .sort((a, b) => ((b.likes || 0) + (b.comments || 0) + (b.shares || 0)) - ((a.likes || 0) + (a.comments || 0) + (a.shares || 0)))
      .slice(0, 5);

    return {
      totalImpressions,
      totalReach,
      totalEngagement,
      avgEngagementRate,
      platformData: Object.values(platformData),
      performanceData,
      topPosts
    };
  }, [analytics]);

  const COLORS = ['#1E73FF', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Social Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your social media performance</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.totalImpressions.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Impressions</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.totalReach.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Reach</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-pink-100">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.totalEngagement.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Engagement</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.avgEngagementRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Avg Engagement Rate</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Over Time</h3>
          {metrics.performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="impressions" stroke="#1E73FF" name="Impressions" />
                <Line type="monotone" dataKey="engagement" stroke="#8b5cf6" name="Engagement" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Platform Distribution</h3>
          {metrics.platformData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="impressions"
                >
                  {metrics.platformData.map((entry, index) => (
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
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Posts</h3>
        {metrics.topPosts.length > 0 ? (
          <div className="space-y-3">
            {metrics.topPosts.map((post, index) => {
              const matchingPost = posts.find(p => p.platform_post_id === post.platform_post_id);
              return (
                <div key={post.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{matchingPost?.caption?.substring(0, 60) || "Post"}...</p>
                    <p className="text-sm text-muted-foreground capitalize">{post.platform}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{post.impressions?.toLocaleString() || 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <Heart className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{post.likes?.toLocaleString() || 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{post.comments?.toLocaleString() || 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Comments</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <Share2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{post.shares?.toLocaleString() || 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Shares</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No analytics data available yet</p>
            <p className="text-sm mt-2">Analytics will appear once posts are published and data is synced</p>
          </div>
        )}
      </Card>
    </div>
  );
}