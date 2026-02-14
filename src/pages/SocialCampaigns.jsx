import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, Calendar, DollarSign, Trash2, Edit, TrendingUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

export default function SocialCampaigns() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  const [campaignData, setCampaignData] = useState({
    name: "",
    objective: "awareness",
    start_date: "",
    end_date: "",
    platforms: "",
    budget: "",
    notes: "",
    status: "planning"
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['socialCampaigns'],
    queryFn: () => base44.entities.SocialCampaign.list('-created_date')
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['mediaAssets'],
    queryFn: () => base44.entities.MediaAsset.list()
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['postDrafts'],
    queryFn: () => base44.entities.PostDraft.list()
  });

  const campaignMutation = useMutation({
    mutationFn: (data) => editingCampaign
      ? base44.entities.SocialCampaign.update(editingCampaign.id, data)
      : base44.entities.SocialCampaign.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialCampaigns'] });
      setShowDialog(false);
      resetForm();
      toast.success(editingCampaign ? "Campaign updated" : "Campaign created");
    }
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (id) => base44.entities.SocialCampaign.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialCampaigns'] });
      toast.success("Campaign deleted");
    }
  });

  const resetForm = () => {
    setCampaignData({
      name: "",
      objective: "awareness",
      start_date: "",
      end_date: "",
      platforms: "",
      budget: "",
      notes: "",
      status: "planning"
    });
    setEditingCampaign(null);
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setCampaignData(campaign);
    setShowDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    campaignMutation.mutate(campaignData);
  };

  const getCampaignStats = (campaignId) => {
    const campaignAssets = assets.filter(a => a.campaign_id === campaignId);
    const campaignPosts = posts.filter(p => p.campaign_id === campaignId);
    return {
      assets: campaignAssets.length,
      posts: campaignPosts.length,
      published: campaignPosts.filter(p => p.status === 'published').length
    };
  };

  const statusColors = {
    planning: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    paused: "bg-orange-100 text-orange-800",
    completed: "bg-blue-100 text-blue-800"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Plan and track your social media campaigns</p>
        </div>
        <Button onClick={() => { resetForm(); setShowDialog(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign) => {
          const stats = getCampaignStats(campaign.id);
          return (
            <Card key={campaign.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{campaign.name}</h3>
                  <Badge className={`${statusColors[campaign.status]} mt-2`}>
                    {campaign.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(campaign)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="capitalize">{campaign.objective}</span>
                </div>
                {campaign.start_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {format(new Date(campaign.start_date), "MMM d")} - {" "}
                      {campaign.end_date ? format(new Date(campaign.end_date), "MMM d, yyyy") : "Ongoing"}
                    </span>
                  </div>
                )}
                {campaign.budget && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>${parseFloat(campaign.budget).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold">{stats.assets}</div>
                  <div className="text-xs text-muted-foreground">Assets</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.posts}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.published}</div>
                  <div className="text-xs text-muted-foreground">Published</div>
                </div>
              </div>

              {campaign.platforms && (
                <div className="mt-4">
                  <Label className="text-xs text-muted-foreground">Platforms:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {campaign.platforms.split(',').map(platform => (
                      <Badge key={platform} variant="outline" className="text-xs">
                        {platform.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {campaigns.length === 0 && (
          <Card className="col-span-full p-12 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground mb-4">Create your first campaign to organize your social media strategy</p>
            <Button onClick={() => { resetForm(); setShowDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </Card>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? "Edit Campaign" : "Create Campaign"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label>Campaign Name *</Label>
                <Input
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                  required
                  placeholder="e.g. Q1 Product Launch"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Objective *</Label>
                  <Select value={campaignData.objective} onValueChange={(v) => setCampaignData({ ...campaignData, objective: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awareness">Awareness</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="traffic">Traffic</SelectItem>
                      <SelectItem value="conversions">Conversions</SelectItem>
                      <SelectItem value="leads">Leads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={campaignData.status} onValueChange={(v) => setCampaignData({ ...campaignData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={campaignData.start_date}
                    onChange={(e) => setCampaignData({ ...campaignData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={campaignData.end_date}
                    onChange={(e) => setCampaignData({ ...campaignData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Platforms</Label>
                <Input
                  value={campaignData.platforms}
                  onChange={(e) => setCampaignData({ ...campaignData, platforms: e.target.value })}
                  placeholder="instagram, facebook, linkedin"
                />
              </div>
              <div>
                <Label>Budget ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={campaignData.budget}
                  onChange={(e) => setCampaignData({ ...campaignData, budget: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={campaignData.notes}
                  onChange={(e) => setCampaignData({ ...campaignData, notes: e.target.value })}
                  rows={3}
                  placeholder="Campaign objectives, target audience, key messages..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={campaignMutation.isPending}>
                {campaignMutation.isPending ? "Saving..." : editingCampaign ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}