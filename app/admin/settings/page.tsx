'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { getSystemSettings, updateSystemSettings } from '@/lib/firestore/admin';
import type { SystemSettings } from '@/lib/firestore/types';
import { useAuth } from '@/components/auth/auth-provider';
import { Loader2, Save, ShieldAlert, Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function AdminSettingsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [settings, setSettings] = React.useState<SystemSettings>({
        maintenanceMode: false,
        allowNewRegistrations: true,
        maxUploadSizeMB: 10,
        restrictedFileTypes: ['.exe', '.dll', '.sh', '.bat'],
        updatedAt: {} as any, // Placeholder
        updatedBy: '',
    });

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getSystemSettings();
                if (data) {
                    setSettings(data);
                }
            } catch (error) {
                toast.error('Failed to load system settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await updateSystemSettings(settings, user.uid);
            toast.success('System settings updated successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <p className="text-muted-foreground">Manage global configuration and controls.</p>
            </div>

            <div className="grid gap-6">
                {/* Critical Controls */}
                <Card className="border-red-200 dark:border-red-900/50 bg-red-50/10">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <ShieldAlert className="w-5 h-5" />
                            <CardTitle>Critical Controls</CardTitle>
                        </div>
                        <CardDescription>Actions here affect the entire platform availability.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <div className="space-y-0.5">
                                <Label className="text-base">Maintenance Mode</Label>
                                <p className="text-sm text-muted-foreground">
                                    Control whether new users can sign up.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={!settings.allowNewRegistrations ? "secondary" : "outline"} className={!settings.allowNewRegistrations ? "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200" : "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"}>
                                    {!settings.allowNewRegistrations ? "PAUSED" : "OPEN"}
                                </Badge>
                                <Button
                                    variant={!settings.allowNewRegistrations ? "outline" : "secondary"}
                                    size="sm"
                                    onClick={() => setSettings(prev => ({ ...prev, allowNewRegistrations: !prev.allowNewRegistrations }))}
                                >
                                    {!settings.allowNewRegistrations ? "Resume Signups" : "Pause Signups"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Content Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle>Content & Limits</CardTitle>
                        <CardDescription>Configure upload limits and file restrictions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="maxSize">Max Upload Size (MB)</Label>
                            <Input
                                id="maxSize"
                                type="number"
                                value={settings.maxUploadSizeMB}
                                onChange={(e) => setSettings(prev => ({ ...prev, maxUploadSizeMB: parseInt(e.target.value) || 0 }))}
                                className="max-w-[200px]"
                            />
                            <p className="text-xs text-muted-foreground">Applies to all new file uploads.</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="restrictedTypes">Restricted File Extensions</Label>
                            <Input
                                id="restrictedTypes"
                                value={settings.restrictedFileTypes.join(', ')}
                                onChange={(e) => setSettings(prev => ({ ...prev, restrictedFileTypes: e.target.value.split(',').map(s => s.trim()) }))}
                                placeholder=".exe, .bat, .sh"
                            />
                            <p className="text-xs text-muted-foreground">Comma-separated list of extensions to block during steganography encoding.</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving} size="lg">
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
