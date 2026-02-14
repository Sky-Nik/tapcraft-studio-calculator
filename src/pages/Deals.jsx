import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Plus, MoreVertical, Eye, Trash2, DollarSign, Calendar } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const stages = ["New", "Contacted", "Quoted", "Negotiation", "Won", "Lost"];

export default function Deals() {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    contact_id: "",
    stage: "New",
    value: "",
    probability: "50",
    expected_close_date: "",
    owner: "",
    notes: "",
    tags: ""
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list('-created_date')
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list()
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const addMutation = useMutation({
    mutationFn: async (data) => {
      const contact = contacts.find(c => c.id === data.contact_id);
      const dealData = {
        ...data,
        contact_name: contact?.name || "",
        contact_email: contact?.email || ""
      };
      return editingDeal 
        ? base44.entities.Deal.update(editingDeal.id, dealData)
        : base44.entities.Deal.create(dealData);
    },
    onSuccess: async (deal) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setShowAddDialog(false);
      resetForm();
      toast.success(editingDeal ? "Deal updated" : "Deal created");
      
      // Auto-create task when deal is won
      if (deal.stage === "Won" && !editingDeal) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await base44.entities.Task.create({
          title: "Confirm files & production schedule",
          description: `For deal: ${deal.title}`,
          due_date: tomorrow.toISOString().split('T')[0],
          status: "Open",
          priority: "High",
          task_type: "Production",
          related_deal_id: deal.id,
          related_contact_id: deal.contact_id
        });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Deal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success("Deal deleted");
    }
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }) => base44.entities.Deal.update(id, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      contact_id: "",
      stage: "New",
      value: "",
      probability: "50",
      expected_close_date: "",
      owner: "",
      notes: "",
      tags: ""
    });
    setEditingDeal(null);
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setFormData(deal);
    setShowAddDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    const newStage = stages[destination.droppableId];
    
    updateStageMutation.mutate({ id: draggableId, stage: newStage });
  };

  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage] = deals.filter(d => d.stage === stage);
    return acc;
  }, {});

  const stageColors = {
    "New": "border-blue-500",
    "Contacted": "border-purple-500",
    "Quoted": "border-yellow-500",
    "Negotiation": "border-orange-500",
    "Won": "border-green-500",
    "Lost": "border-gray-500"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Deals Pipeline</h1>
          <p className="text-muted-foreground mt-1">Track deals through your sales pipeline</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Deal
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stages.map((stage, stageIndex) => (
            <div key={stage} className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-semibold text-sm">{stage}</h3>
                <Badge variant="outline" className="text-xs">
                  {dealsByStage[stage]?.length || 0}
                </Badge>
              </div>
              
              <Droppable droppableId={String(stageIndex)}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[500px] rounded-lg p-2 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-accent/50' : 'bg-muted/20'
                    }`}
                  >
                    {dealsByStage[stage]?.map((deal, index) => (
                      <Draggable key={deal.id} draggableId={deal.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-4 mb-3 cursor-grab active:cursor-grabbing border-l-4 ${
                              stageColors[deal.stage]
                            } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <h4 className="font-semibold text-sm line-clamp-2">{deal.title}</h4>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <MoreVertical className="w-3 h-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEdit(deal)}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => deleteMutation.mutate(deal.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              
                              <div className="text-xs text-muted-foreground">
                                {deal.contact_name || "No contact"}
                              </div>
                              
                              {deal.value && (
                                <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                                  <DollarSign className="w-3 h-3" />
                                  {parseFloat(deal.value).toFixed(2)}
                                </div>
                              )}
                              
                              {deal.expected_close_date && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(deal.expected_close_date).toLocaleDateString()}
                                </div>
                              )}
                              
                              {deal.probability && (
                                <div className="text-xs text-muted-foreground">
                                  {deal.probability}% probability
                                </div>
                              )}
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingDeal ? "Edit Deal" : "Add New Deal"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2">
                <Label>Deal Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g. Custom 3D printed parts for XYZ Corp"
                />
              </div>
              <div>
                <Label>Contact *</Label>
                <Select value={formData.contact_id} onValueChange={(v) => setFormData({ ...formData, contact_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} ({contact.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stage</Label>
                <Select value={formData.stage} onValueChange={(v) => setFormData({ ...formData, stage: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map(stage => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Deal Value ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Probability (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                />
              </div>
              <div>
                <Label>Expected Close Date</Label>
                <Input
                  type="date"
                  value={formData.expected_close_date}
                  onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Owner</Label>
                <Select value={formData.owner} onValueChange={(v) => setFormData({ ...formData, owner: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.email}>{user.full_name || user.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.stage === "Lost" && (
                <div className="col-span-2">
                  <Label>Lost Reason</Label>
                  <Input
                    value={formData.lost_reason || ""}
                    onChange={(e) => setFormData({ ...formData, lost_reason: e.target.value })}
                    placeholder="e.g. Price too high, went with competitor"
                  />
                </div>
              )}
              <div className="col-span-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g. bulk-order, urgent"
                />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Saving..." : editingDeal ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}