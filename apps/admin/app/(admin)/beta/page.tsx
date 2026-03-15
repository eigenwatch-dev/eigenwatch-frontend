"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminBetaMembers,
  addBetaMember,
  removeBetaMember,
  getAdminBetaPerks,
  updateBetaPerk,
  seedBetaPerks,
} from "@/lib/admin-api";
import { BetaMember, BetaPerk } from "@/types/admin.types";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import {
  Plus,
  Trash2,
  FlaskConical,
  Settings,
  Database,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function BetaPage() {
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const [membersPage, setMembersPage] = useState(1);
  const [perksPage, setPerksPage] = useState(1);

  const { data: membersData, isLoading: membersLoading } = useQuery<{
    members: BetaMember[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ["admin-beta-members", membersPage],
    queryFn: () => getAdminBetaMembers({ page: membersPage }) as any,
  });

  const { data: perksData, isLoading: perksLoading } = useQuery<{
    perks: BetaPerk[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ["admin-beta-perks", perksPage],
    queryFn: () => getAdminBetaPerks({ page: perksPage }) as any,
  });

  const members = membersData?.members;
  const perks = perksData?.perks;

  const addMutation = useMutation({
    mutationFn: () => addBetaMember(newEmail, newNotes || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-beta-members"] });
      setAddDialogOpen(false);
      setNewEmail("");
      setNewNotes("");
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeBetaMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-beta-members"] });
    },
  });

  const togglePerkMutation = useMutation({
    mutationFn: ({ key, isActive }: { key: string; isActive: boolean }) =>
      updateBetaPerk(key, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-beta-perks"] });
    },
  });

  const seedMutation = useMutation({
    mutationFn: seedBetaPerks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-beta-perks"] });
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Beta Program</h1>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members" className="gap-2">
            <FlaskConical className="h-4 w-4" /> Members
          </TabsTrigger>
          <TabsTrigger value="perks" className="gap-2">
            <Settings className="h-4 w-4" /> Perks
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {membersData?.total || 0} members
            </p>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Beta Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Input
                      placeholder="Early tester, team member, etc."
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => addMutation.mutate()}
                      disabled={!newEmail || addMutation.isPending}
                    >
                      {addMutation.isPending ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membersLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : members?.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="text-sm">
                          {member.email}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={member.is_active ? "CONFIRMED" : "EXPIRED"}
                            className={member.is_active ? "" : ""}
                          />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {member.notes || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(member.added_at)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeMutation.mutate(member.email)}
                            disabled={removeMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {membersData && membersData.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {membersPage} of {membersData.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMembersPage((p) => Math.max(1, p - 1))}
                  disabled={membersPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setMembersPage((p) =>
                      Math.min(membersData.totalPages, p + 1),
                    )
                  }
                  disabled={membersPage === membersData.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Perks Tab */}
        <TabsContent value="perks" className="mt-4 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              {perks?.length || 0} active/inactive perks
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
            >
              <Database className="h-4 w-4 mr-1" />
              {seedMutation.isPending ? "Seeding..." : "Seed Default Perks"}
            </Button>
          </div>

          {perksLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {perks?.map((perk) => (
                <PerkCard
                  key={perk.id}
                  perk={perk}
                  onToggle={(isActive) =>
                    togglePerkMutation.mutate({ key: perk.key, isActive })
                  }
                  onSave={(data) =>
                    updateBetaPerk(perk.key, data).then(() =>
                      queryClient.invalidateQueries({
                        queryKey: ["admin-beta-perks"],
                      }),
                    )
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PerkCard({
  perk,
  onToggle,
  onSave,
}: {
  perk: BetaPerk;
  onToggle: (isActive: boolean) => void;
  onSave: (data: { description?: string; config?: unknown }) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(perk.description);
  const [configStr, setConfigStr] = useState(
    perk.config ? JSON.stringify(perk.config, null, 2) : "{}",
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      let config;
      try {
        config = JSON.parse(configStr);
      } catch {
        return;
      }
      await onSave({ description, config });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-mono">{perk.key}</CardTitle>
          <Switch checked={perk.is_active} onCheckedChange={onToggle} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {editing ? (
          <>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Config (JSON)</Label>
              <Textarea
                value={configStr}
                onChange={(e) => setConfigStr(e.target.value)}
                className="font-mono text-xs min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{perk.description}</p>
            {perk.config && (
              <pre className="text-xs bg-secondary/50 p-2 rounded-md overflow-x-auto">
                {JSON.stringify(perk.config, null, 2)}
              </pre>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              Edit Config
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
