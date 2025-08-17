"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Languages, Moon, Sun, Bell, Shield } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LanguageSelector } from "@/components/ui/language-selector"
import { useUIStore } from "@/lib/store"
import { useTheme } from "next-themes"
import { useTranslation } from "@/lib/i18n"
export default function SettingsPage() {
  const { language } = useUIStore()
  const { theme, setTheme } = useTheme()
  const t = useTranslation(language)
  return (
    <DashboardLayout title={t.settings} description="Manage your application preferences and settings">
      <div className="space-y-6">
        {}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              {t.language}
            </CardTitle>
            <CardDescription>Choose your preferred language for the application interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Interface Language</Label>
                <div className="text-sm text-muted-foreground">
                  Select the language for menus, buttons, and messages
                </div>
              </div>
              <LanguageSelector />
            </div>
          </CardContent>
        </Card>
        {}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of your application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Theme</Label>
                <div className="text-sm text-muted-foreground">Choose between light and dark mode</div>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        {}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Task Reminders</Label>
                <div className="text-sm text-muted-foreground">Get notified about upcoming task deadlines</div>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Notifications</Label>
                <div className="text-sm text-muted-foreground">Receive email updates about task assignments</div>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Weekly Reports</Label>
                <div className="text-sm text-muted-foreground">Get weekly summary reports via email</div>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
        {}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Manage your privacy and security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Profile Visibility</Label>
                <div className="text-sm text-muted-foreground">Allow other users to see your profile information</div>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Activity Status</Label>
                <div className="text-sm text-muted-foreground">Show when you're online and active</div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
