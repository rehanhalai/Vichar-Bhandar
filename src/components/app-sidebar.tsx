"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  IconBrain,
  IconCalendar,
  IconDashboard,
  IconBell,
  IconHelp,
  IconSettings,
  IconNotes,
  IconSun,
  IconMoon,
} from "@tabler/icons-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { requestNotificationPermission } from "@/lib/notifications"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Rehan",
    email: "rehan@example.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Thoughts",
      url: "/thoughts",
      icon: IconNotes,
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: IconCalendar,
    },
    {
      title: "Reminders",
      url: "/reminders",
      icon: IconBell,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { theme, setTheme } = useTheme()
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("notificationsEnabled")
    if (saved === "true") setNotificationsEnabled(true)
  }, [])

  const handleNotificationToggle = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false)
      localStorage.setItem("notificationsEnabled", "false")
    } else {
      const granted = await requestNotificationPermission()
      setNotificationsEnabled(granted)
      if (granted) localStorage.setItem("notificationsEnabled", "true")
    }
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<a href="/" />}
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <IconBrain className="size-5" />
              </div>
              <span className="text-base font-semibold">ThoughtDump</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center gap-3 px-2 py-1.5">
                  <Switch
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={handleNotificationToggle}
                  />
                  <Label htmlFor="notifications" className="text-sm cursor-pointer">
                    Reminders
                  </Label>
                </div>
              </SidebarMenuItem>
              {mounted && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    tooltip="Toggle theme"
                  >
                    {theme === "dark" ? (
                      <IconSun className="size-4" />
                    ) : (
                      <IconMoon className="size-4" />
                    )}
                    <span>Theme</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
