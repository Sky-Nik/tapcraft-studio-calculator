import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Video, Upload, Search, Grid, List, Download, Trash2, Edit, Eye, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const platformColors = {
  instagram: "bg-pink-500",
  facebook: "bg-blue-600",
  linkedin: "bg-blue-700",
  tiktok: "bg-black",
  youtube: "bg-red-600"
};

export default function SocialLibrary() {
  const queryClient = useQueryClient();
  const [view, setView] = useState("grid");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [uploading, setUploading] = useState(false);

  const [assetData, setAssetData] = useState({
    title: "",
    description: "",
    media_type: "image",
    platform_targets: "",
    tags: "",
    status: "draft"
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['mediaAssets'],
    queryFn: () => base44.entities.MediaAsset.list('-created_date')
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['socialCampaigns'],
    queryFn: () => base44.entities.SocialCampaign.list()
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (id) => base44.entities.MediaAsset.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaAssets'] });
      toast.success("Asset deleted");
    }
  });

  const updateAssetMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MediaAsset.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaAssets'] });
      toast.success("Asset updated");
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const fileType = file.type.startsWith('video/') ? 'video' : 'image';
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

      const newAsset = await base44.entities.MediaAsset.create({
        ...assetData,
        file_url,
        thumbnail_url: fileType === 'image' ? file_url : '',
        media_type: fileType,
        file_size_mb: parseFloat(fileSizeMB)
      });

      queryClient.invalidateQueries({ queryKey: ['mediaAssets'] });
      setShowUploadDialog(false);
      resetForm();
      toast.success("Asset uploaded successfully");
    } catch (error) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setAssetData({
      title: "",
      description: "",
      media_type: "image",
      platform_targets: "",
      tags: "",
      status: "draft"
    });
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = filterPlatform === "all" || asset.platform_targets?.includes(filterPlatform);
    const matchesStatus = filterStatus === "all" || asset.status === filterStatus;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const stats = {
    total: assets.length,
    images: assets.filter(a => a.media_type === 'image').length,
    videos: assets.filter(a => a.media_type === 'video').length,
    approved: assets.filter(a => a.status === 'approved').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Media Library</h1>
          <p className="text-muted-foreground mt-1">Manage your social media assets</p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)} className="gap-2">
          <Upload className="w-4 h-4" />
          Upload Asset
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Assets</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.images}</div>
          <div className="text-sm text-muted-foreground">Images</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.videos}</div>
          <div className="text-sm text-muted-foreground">Videos</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.approved}</div>
          <div className="text-sm text-muted-foreground">Approved</div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant={view === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setView("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setView("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => (
              <Card key={asset.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-muted relative group">
                  {asset.media_type === 'video' ? (
                    <Video className="w-12 h-12 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                  ) : (
                    asset.file_url && (
                      <img
                        src={asset.file_url}
                        alt={asset.title}
                        className="w-full h-full object-cover"
                      />
                    )
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => { setSelectedAsset(asset); setShowPreviewDialog(true); }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => window.open(asset.file_url, '_blank')}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => deleteAssetMutation.mutate(asset.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate">{asset.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {asset.media_type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {asset.status}
                    </Badge>
                  </div>
                  {asset.platform_targets && (
                    <div className="flex gap-1 mt-2">
                      {asset.platform_targets.split(',').slice(0, 3).map(platform => (
                        <div
                          key={platform}
                          className={`w-2 h-2 rounded-full ${platformColors[platform.trim()]}`}
                          title={platform}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAssets.map((asset) => (
              <Card key={asset.id} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                  {asset.media_type === 'video' ? (
                    <Video className="w-6 h-6 text-muted-foreground" />
                  ) : (
                    <Image className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{asset.title}</h3>
                  <p className="text-sm text-muted-foreground">{asset.description}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{asset.media_type}</Badge>
                    <Badge variant="outline">{asset.status}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => { setSelectedAsset(asset); setShowPreviewDialog(true); }}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => window.open(asset.file_url, '_blank')}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteAssetMutation.mutate(asset.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredAssets.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No assets found. Upload your first asset to get started!</p>
          </div>
        )}
      </Card>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Media Asset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>File *</Label>
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported: Images (jpg, png, webp) and Videos (mp4, mov)
              </p>
            </div>
            <div>
              <Label>Title *</Label>
              <Input
                value={assetData.title}
                onChange={(e) => setAssetData({ ...assetData, title: e.target.value })}
                placeholder="e.g. Summer Product Launch"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={assetData.description}
                onChange={(e) => setAssetData({ ...assetData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Platform Targets</Label>
                <Input
                  value={assetData.platform_targets}
                  onChange={(e) => setAssetData({ ...assetData, platform_targets: e.target.value })}
                  placeholder="instagram, facebook, linkedin"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={assetData.status} onValueChange={(v) => setAssetData({ ...assetData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Tags</Label>
              <Input
                value={assetData.tags}
                onChange={(e) => setAssetData({ ...assetData, tags: e.target.value })}
                placeholder="product, 3d-print, promotional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)} disabled={uploading}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedAsset?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              {selectedAsset?.media_type === 'video' ? (
                <video src={selectedAsset?.file_url} controls className="w-full h-full" />
              ) : (
                <img src={selectedAsset?.file_url} alt={selectedAsset?.title} className="max-w-full max-h-full object-contain" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <p className="text-sm">{selectedAsset?.description || "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Tags</Label>
                <p className="text-sm">{selectedAsset?.tags || "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Platforms</Label>
                <p className="text-sm">{selectedAsset?.platform_targets || "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Badge>{selectedAsset?.status}</Badge>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
            <Button onClick={() => window.open(selectedAsset?.file_url, '_blank')}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}