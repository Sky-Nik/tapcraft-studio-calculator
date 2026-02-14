import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, Instagram, Facebook, Linkedin, Music, Youtube, Plus, Trash2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const platformConfig = {
  instagram: {
    name: "Instagram",
    icon: Instagram,
    color: "from-pink-600 to-purple-600",
    description: "Connect your Instagram Business account"
  },
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "from-blue-600 to-blue-700",
    description: "Connect your Facebook Page"
  },
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "from-blue-700 to-blue-800",
    description: "Connect your LinkedIn organization page"
  },
  tiktok: {
    name: "TikTok",
    icon: Music,
    color: "from-black to-gray-800",
    description: "Connect your TikTok Business account"
  },
  youtube: {
    name: "YouTube",
    icon: Youtube,
    color: "from-red-600 to-red-700",
    description: "Connect your YouTube channel"
  }
};

export default function SocialConnections() {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [accountData, setAccountData] = useState({
    platform: "",
    account_name: "",
    account_id: "",
    status: "connected"
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['socialAccounts'],
    queryFn: () => base44.entities.SocialAccount.list()
  });

  const addAccountMutation = useMutation({
    mutationFn: (data) => base44.entities.SocialAccount.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialAccounts'] });
      setShowAddDialog(false);
      resetForm();
      toast.success("Account connected");
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (id) => base44.entities.SocialAccount.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialAccounts'] });
      toast.success("Account disconnected");
    }
  });

  const resetForm = () => {
    setAccountData({
      platform: "",
      account_name: "",
      account_id: "",
      status: "connected"
    });
    setSelectedPlatform(null);
  };

  const handleConnect = (platform) => {
    setSelectedPlatform(platform);
    setAccountData({ ...accountData, platform });
    setShowAddDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addAccountMutation.mutate(accountData);
  };

  const connectedPlatforms = accounts.map(a => a.platform);
  const availablePlatforms = Object.keys(platformConfig).filter(p => !connectedPlatforms.includes(p));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Platform Connections</h1>
        <p className="text-muted-foreground mt-1">Connect your social media accounts to publish directly</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Connected Accounts ({accounts.length})</h2>
          <div className="space-y-3">
            {accounts.map((account) => {
              const config = platformConfig[account.platform];
              const Icon = config?.icon || Link2;
              const isExpired = account.token_expiry && new Date(account.token_expiry) < new Date();

              return (
                <Card key={account.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${config?.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{account.account_name}</h3>
                        {account.status === 'connected' && !isExpired ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{config?.name}</p>
                      {account.follower_count && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {account.follower_count.toLocaleString()} followers
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={account.status === 'connected' ? 'default' : 'destructive'}>
                        {account.status}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteAccountMutation.mutate(account.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {account.last_sync && (
                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                      Last synced: {format(new Date(account.last_sync), "MMM d, yyyy h:mm a")}
                    </div>
                  )}
                  {isExpired && (
                    <div className="mt-2 p-2 bg-orange-50 rounded text-xs text-orange-800">
                      Token expired - please reconnect this account
                    </div>
                  )}
                </Card>
              );
            })}

            {accounts.length === 0 && (
              <Card className="p-8 text-center">
                <Link2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No accounts connected yet</p>
              </Card>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Available Platforms</h2>
          <div className="space-y-3">
            {availablePlatforms.map((platform) => {
              const config = platformConfig[platform];
              const Icon = config.icon;

              return (
                <Card key={platform} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{config.name}</h3>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                    <Button onClick={() => handleConnect(platform)} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </Card>
              );
            })}

            {availablePlatforms.length === 0 && (
              <Card className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold mb-2">All platforms connected!</h3>
                <p className="text-sm text-muted-foreground">You've connected all available social media platforms</p>
              </Card>
            )}
          </div>

          <Card className="p-4 mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              OAuth Setup Required
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              For full publishing capabilities, you'll need to configure OAuth apps for each platform:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Meta (Instagram + Facebook): Create app at developers.facebook.com</li>
              <li>LinkedIn: Create app at linkedin.com/developers</li>
              <li>YouTube: Enable API at console.cloud.google.com</li>
              <li>TikTok: Apply for developer access at developers.tiktok.com</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">
              Manual connection mode allows you to copy captions and download media for manual posting.
            </p>
          </Card>
        </div>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {platformConfig[selectedPlatform]?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-2">Manual Connection</p>
                <p className="text-muted-foreground text-xs">
                  Enter your account details manually. For OAuth integration, configure API credentials in settings.
                </p>
              </div>
              <div>
                <Label>Account Name *</Label>
                <Input
                  value={accountData.account_name}
                  onChange={(e) => setAccountData({ ...accountData, account_name: e.target.value })}
                  required
                  placeholder="@youraccount or Page Name"
                />
              </div>
              <div>
                <Label>Account ID</Label>
                <Input
                  value={accountData.account_id}
                  onChange={(e) => setAccountData({ ...accountData, account_id: e.target.value })}
                  placeholder="Optional: Platform account ID"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addAccountMutation.isPending}>
                {addAccountMutation.isPending ? "Connecting..." : "Connect"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}