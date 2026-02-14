import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tantml:react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Mail, Phone, MessageCircle, Copy, Trash2, Edit } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Communications() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("logs");
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  const [logData, setLogData] = useState({
    activity_type: "Email",
    summary: "",
    details: "",
    duration_minutes: "",
    related_lead_id: "",
    related_contact_id: "",
    related_deal_id: ""
  });

  const [templateData, setTemplateData] = useState({
    name: "",
    subject: "",
    body: "",
    category: "General",
    is_active: true
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['activityLogs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date')
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: () => base44.entities.EmailTemplate.list()
  });

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

  const logMutation = useMutation({
    mutationFn: (data) => editingLog
      ? base44.entities.ActivityLog.update(editingLog.id, data)
      : base44.entities.ActivityLog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
      setShowLogDialog(false);
      resetLogForm();
      toast.success(editingLog ? "Log updated" : "Log created");
    }
  });

  const templateMutation = useMutation({
    mutationFn: (data) => editingTemplate
      ? base44.entities.EmailTemplate.update(editingTemplate.id, data)
      : base44.entities.EmailTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      setShowTemplateDialog(false);
      resetTemplateForm();
      toast.success(editingTemplate ? "Template updated" : "Template created");
    }
  });

  const deleteLogMutation = useMutation({
    mutationFn: (id) => base44.entities.ActivityLog.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
      toast.success("Log deleted");
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      toast.success("Template deleted");
    }
  });

  const resetLogForm = () => {
    setLogData({
      activity_type: "Email",
      summary: "",
      details: "",
      duration_minutes: "",
      related_lead_id: "",
      related_contact_id: "",
      related_deal_id: ""
    });
    setEditingLog(null);
  };

  const resetTemplateForm = () => {
    setTemplateData({
      name: "",
      subject: "",
      body: "",
      category: "General",
      is_active: true
    });
    setEditingTemplate(null);
  };

  const handleEditLog = (log) => {
    setEditingLog(log);
    setLogData(log);
    setShowLogDialog(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateData(template);
    setShowTemplateDialog(true);
  };

  const copyTemplate = (template) => {
    const text = `Subject: ${template.subject}\n\n${template.body}`;
    navigator.clipboard.writeText(text);
    toast.success("Template copied to clipboard");
  };

  const activityTypeIcons = {
    "Email": Mail,
    "Call": Phone,
    "WhatsApp": MessageCircle,
    "Meeting": MessageSquare,
    "Quote Sent": Mail,
    "File Received": Mail,
    "Other": MessageSquare
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Communications</h1>
          <p className="text-muted-foreground mt-1">Track interactions and manage email templates</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="logs">Activity Logs ({logs.length})</TabsTrigger>
          <TabsTrigger value="templates">Email Templates ({templates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4 mt-6">
          <div className="flex justify-end">
            <Button onClick={() => { resetLogForm(); setShowLogDialog(true); }} className="gap-2">
              <Plus className="w-4 h-4" />
              Log Activity
            </Button>
          </div>

          <Card className="p-6">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Related To</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No activity logs
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => {
                      const Icon = activityTypeIcons[log.activity_type] || MessageSquare;
                      const relatedEntity = 
                        (log.related_lead_id && leads.find(l => l.id === log.related_lead_id)?.name) ||
                        (log.related_contact_id && contacts.find(c => c.id === log.related_contact_id)?.name) ||
                        (log.related_deal_id && deals.find(d => d.id === log.related_deal_id)?.title) ||
                        "-";
                      
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <Badge variant="outline">{log.activity_type}</Badge>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{log.summary}</TableCell>
                          <TableCell>{relatedEntity}</TableCell>
                          <TableCell>{log.duration_minutes ? `${log.duration_minutes} min` : "-"}</TableCell>
                          <TableCell>{new Date(log.created_date).toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditLog(log)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteLogMutation.mutate(log.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-6">
          <div className="flex justify-end">
            <Button onClick={() => { resetTemplateForm(); setShowTemplateDialog(true); }} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.length === 0 ? (
              <Card className="col-span-2 p-8 text-center text-muted-foreground">
                No email templates
              </Card>
            ) : (
              templates.map((template) => (
                <Card key={template.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <Badge variant="outline" className="mt-1">{template.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyTemplate(template)}
                        title="Copy template"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTemplateMutation.mutate(template.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Subject:</Label>
                      <p className="text-sm font-medium">{template.subject}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Body:</Label>
                      <p className="text-sm text-muted-foreground line-clamp-3">{template.body}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLog ? "Edit Activity Log" : "Log New Activity"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); logMutation.mutate(logData); }}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label>Activity Type *</Label>
                <Select value={logData.activity_type} onValueChange={(v) => setLogData({ ...logData, activity_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Quote Sent">Quote Sent</SelectItem>
                    <SelectItem value="File Received">File Received</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={logData.duration_minutes}
                  onChange={(e) => setLogData({ ...logData, duration_minutes: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Summary *</Label>
                <Input
                  value={logData.summary}
                  onChange={(e) => setLogData({ ...logData, summary: e.target.value })}
                  required
                  placeholder="Brief description of the activity"
                />
              </div>
              <div className="col-span-2">
                <Label>Details</Label>
                <Textarea
                  value={logData.details}
                  onChange={(e) => setLogData({ ...logData, details: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Related Lead</Label>
                <Select value={logData.related_lead_id} onValueChange={(v) => setLogData({ ...logData, related_lead_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {leads.map(lead => (
                      <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Related Contact</Label>
                <Select value={logData.related_contact_id} onValueChange={(v) => setLogData({ ...logData, related_contact_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {contacts.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>{contact.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Related Deal</Label>
                <Select value={logData.related_deal_id} onValueChange={(v) => setLogData({ ...logData, related_deal_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select deal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {deals.map(deal => (
                      <SelectItem key={deal.id} value={deal.id}>{deal.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowLogDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={logMutation.isPending}>
                {logMutation.isPending ? "Saving..." : editingLog ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create Email Template"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); templateMutation.mutate(templateData); }}>
            <div className="space-y-4 py-4">
              <div>
                <Label>Template Name *</Label>
                <Input
                  value={templateData.name}
                  onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                  required
                  placeholder="e.g. Quote Follow-up"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={templateData.category} onValueChange={(v) => setTemplateData({ ...templateData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quote">Quote</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="Delivery">Delivery</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject *</Label>
                <Input
                  value={templateData.subject}
                  onChange={(e) => setTemplateData({ ...templateData, subject: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Body *</Label>
                <Textarea
                  value={templateData.body}
                  onChange={(e) => setTemplateData({ ...templateData, body: e.target.value })}
                  rows={8}
                  required
                  placeholder="Use {name}, {company}, {quote_price} as variables"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={templateMutation.isPending}>
                {templateMutation.isPending ? "Saving..." : editingTemplate ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}