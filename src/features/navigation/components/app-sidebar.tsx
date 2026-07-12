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
import { NotificationScheduler } from "@/features/notifications/components/notification-scheduler"

import { NavMain } from "@/features/navigation/components/nav-main"
import { NavSecondary } from "@/features/navigation/components/nav-secondary"
import { NavUser } from "@/features/navigation/components/nav-user"
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
  // navSecondary: [
  //   {
  //     title: "Settings",
  //     url: "#",
  //     icon: IconSettings,
  //   },
  //   {
  //     title: "Get Help",
  //     url: "#",
  //     icon: IconHelp,
  //   },
  // ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

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
              <span className="text-base font-semibold">Vichar no Bhandar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
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
              <SidebarMenuItem>
                <div className="px-2 py-1.5 w-full">
                  <NotificationScheduler />
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
