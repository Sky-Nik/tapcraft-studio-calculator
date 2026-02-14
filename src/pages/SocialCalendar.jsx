import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Copy, Download, Trash2, ExternalLink } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";

export default function SocialCalendar() {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const [postData, setPostData] = useState({
    platform: "instagram",
    caption: "",
    hashtags: "",
    scheduled_at: "",
    status: "scheduled"
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['postDrafts'],
    queryFn: () => base44.entities.PostDraft.list('-scheduled_at')
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['mediaAssets'],
    queryFn: () => base44.entities.MediaAsset.list()
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['socialAccounts'],
    queryFn: () => base44.entities.SocialAccount.list()
  });

  const postMutation = useMutation({
    mutationFn: (data) => selectedPost
      ? base44.entities.PostDraft.update(selectedPost.id, data)
      : base44.entities.PostDraft.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postDrafts'] });
      setShowPostDialog(false);
      resetForm();
      toast.success(selectedPost ? "Post updated" : "Post scheduled");
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: (id) => base44.entities.PostDraft.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postDrafts'] });
      toast.success("Post deleted");
    }
  });

  const resetForm = () => {
    setPostData({
      platform: "instagram",
      caption: "",
      hashtags: "",
      scheduled_at: "",
      status: "scheduled"
    });
    setSelectedPost(null);
  };

  const handleCreatePost = (date) => {
    setSelectedDate(date);
    setPostData({
      ...postData,
      scheduled_at: format(date, "yyyy-MM-dd'T'HH:mm")
    });
    setShowPostDialog(true);
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setPostData(post);
    setShowPostDialog(true);
  };

  const copyCaption = (post) => {
    const text = `${post.caption}\n\n${post.hashtags || ''}`;
    navigator.clipboard.writeText(text);
    toast.success("Caption copied to clipboard");
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = monthStart.getDay();
  const calendarDays = Array(startDay).fill(null).concat(daysInMonth);

  const getPostsForDay = (date) => {
    return posts.filter(post => {
      if (!post.scheduled_at) return false;
      return isSameDay(parseISO(post.scheduled_at), date);
    });
  };

  const upcomingPosts = posts
    .filter(p => p.scheduled_at && new Date(p.scheduled_at) > new Date() && p.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    .slice(0, 5);

  const platformColors = {
    instagram: "bg-pink-100 text-pink-800 border-pink-300",
    facebook: "bg-blue-100 text-blue-800 border-blue-300",
    linkedin: "bg-blue-100 text-blue-800 border-blue-300",
    tiktok: "bg-gray-100 text-gray-800 border-gray-300",
    youtube: "bg-red-100 text-red-800 border-red-300"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Content Calendar</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage your social media posts</p>
        </div>
        <Button onClick={() => handleCreatePost(new Date())} className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Post
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayPosts = getPostsForDay(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={day.toISOString()}
                  className={`aspect-square border rounded-lg p-2 cursor-pointer hover:bg-accent transition-colors ${
                    !isCurrentMonth ? 'opacity-40' : ''
                  } ${isToday ? 'border-primary border-2' : ''}`}
                  onClick={() => handleCreatePost(day)}
                >
                  <div className="text-sm font-semibold mb-1">{format(day, 'd')}</div>
                  <div className="space-y-1">
                    {dayPosts.slice(0, 2).map(post => (
                      <div
                        key={post.id}
                        className={`text-xs p-1 rounded truncate ${platformColors[post.platform] || 'bg-gray-100'}`}
                        onClick={(e) => { e.stopPropagation(); handleEditPost(post); }}
                      >
                        {post.caption.substring(0, 15)}...
                      </div>
                    ))}
                    {dayPosts.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{dayPosts.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Posts</h3>
          <div className="space-y-3">
            {upcomingPosts.map(post => (
              <div key={post.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleEditPost(post)}>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={platformColors[post.platform]}>
                    {post.platform}
                  </Badge>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(parseISO(post.scheduled_at), "MMM d, h:mm a")}
                  </div>
                </div>
                <p className="text-sm line-clamp-2">{post.caption}</p>
              </div>
            ))}
            {upcomingPosts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming posts</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPost ? "Edit Post" : "Schedule Post"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); postMutation.mutate(postData); }}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Platform *</Label>
                  <Select value={postData.platform} onValueChange={(v) => setPostData({ ...postData, platform: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Schedule Date/Time *</Label>
                  <Input
                    type="datetime-local"
                    value={postData.scheduled_at}
                    onChange={(e) => setPostData({ ...postData, scheduled_at: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Caption *</Label>
                <Textarea
                  value={postData.caption}
                  onChange={(e) => setPostData({ ...postData, caption: e.target.value })}
                  rows={6}
                  required
                  placeholder="Write your post caption..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {postData.caption.length} characters
                </p>
              </div>
              <div>
                <Label>Hashtags</Label>
                <Input
                  value={postData.hashtags}
                  onChange={(e) => setPostData({ ...postData, hashtags: e.target.value })}
                  placeholder="#3dprinting #maker #innovation"
                />
              </div>
              {selectedPost && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => copyCaption(postData)} className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Caption
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      deletePostMutation.mutate(selectedPost.id);
                      setShowPostDialog(false);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPostDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={postMutation.isPending}>
                {postMutation.isPending ? "Saving..." : selectedPost ? "Update" : "Schedule"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}