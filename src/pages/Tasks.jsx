import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Calendar, Clock, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export default function Tasks() {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    due_time: "",
    assigned_to: "",
    status: "Open",
    priority: "Medium",
    task_type: "Other",
    related_lead_id: "",
    related_contact_id: "",
    related_deal_id: ""
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-due_date')
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
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

  const addMutation = useMutation({
    mutationFn: (data) => editingTask 
      ? base44.entities.Task.update(editingTask.id, data)
      : base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowAddDialog(false);
      resetForm();
      toast.success(editingTask ? "Task updated" : "Task created");
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Task.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      due_date: "",
      due_time: "",
      assigned_to: "",
      status: "Open",
      priority: "Medium",
      task_type: "Other",
      related_lead_id: "",
      related_contact_id: "",
      related_deal_id: ""
    });
    setEditingTask(null);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData(task);
    setShowAddDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const isToday = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate).toDateString() === new Date().toDateString();
  };

  const todayTasks = tasks.filter(t => t.status !== "Done" && t.status !== "Cancelled" && isToday(t.due_date));
  const overdueTasks = tasks.filter(t => t.status !== "Done" && t.status !== "Cancelled" && isOverdue(t.due_date));
  const upcomingTasks = tasks.filter(t => t.status !== "Done" && t.status !== "Cancelled" && !isToday(t.due_date) && !isOverdue(t.due_date));
  const completedTasks = tasks.filter(t => t.status === "Done");

  const priorityColors = {
    "Low": "bg-slate-100 text-slate-800",
    "Medium": "bg-blue-100 text-blue-800",
    "High": "bg-orange-100 text-orange-800",
    "Urgent": "bg-red-100 text-red-800"
  };

  const TaskCard = ({ task }) => (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.status === "Done"}
          onCheckedChange={(checked) => 
            toggleStatusMutation.mutate({ 
              id: task.id, 
              status: checked ? "Done" : "Open" 
            })
          }
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-semibold ${task.status === "Done" ? "line-through text-muted-foreground" : ""}`}>
              {task.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={priorityColors[task.priority]}>
                {task.priority}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}>
                Edit
              </Button>
            </div>
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
          )}
          
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(task.due_date).toLocaleDateString()}
              {task.due_time && ` at ${task.due_time}`}
            </div>
            {task.assigned_to && (
              <div>Assigned to: {task.assigned_to}</div>
            )}
            <Badge variant="outline" className="text-xs">{task.task_type}</Badge>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage your activities and follow-ups</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-100">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overdueTasks.length}</p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todayTasks.length}</p>
              <p className="text-sm text-muted-foreground">Due Today</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedTasks.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today ({todayTasks.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdueTasks.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="space-y-3 mt-6">
          {todayTasks.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No tasks due today
            </Card>
          ) : (
            todayTasks.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </TabsContent>
        
        <TabsContent value="overdue" className="space-y-3 mt-6">
          {overdueTasks.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No overdue tasks
            </Card>
          ) : (
            overdueTasks.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-3 mt-6">
          {upcomingTasks.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No upcoming tasks
            </Card>
          ) : (
            upcomingTasks.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-3 mt-6">
          {completedTasks.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No completed tasks
            </Card>
          ) : (
            completedTasks.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2">
                <Label>Task Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Due Time</Label>
                <Input
                  type="time"
                  value={formData.due_time}
                  onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Task Type</Label>
                <Select value={formData.task_type} onValueChange={(v) => setFormData({ ...formData, task_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assigned To</Label>
                <Select value={formData.assigned_to} onValueChange={(v) => setFormData({ ...formData, assigned_to: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.email}>{user.full_name || user.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Related Lead</Label>
                <Select value={formData.related_lead_id} onValueChange={(v) => setFormData({ ...formData, related_lead_id: v })}>
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
                <Select value={formData.related_contact_id} onValueChange={(v) => setFormData({ ...formData, related_contact_id: v })}>
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
                <Select value={formData.related_deal_id} onValueChange={(v) => setFormData({ ...formData, related_deal_id: v })}>
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
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Saving..." : editingTask ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}