"use client"

import { cn } from "@/shared/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/shared/ui/navigation-menu"
import { Info } from "lucide-react"
import * as React from "react"

export function PortalNav() {
  return (
    <div className="flex items-center justify-between py-4 container">
      <div className="font-bold text-xl tracking-tight">SYNAPSE SPA</div>

      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Dịch vụ</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      href="/"
                    >
                      <Info className="h-6 w-6" />
                      <div className="mb-2 mt-4 text-lg font-medium">
                        Liệu trình Feature
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Khám phá các gói trị liệu chuyên sâu mới nhất.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                <ListItem href="/services/massage" title="Massage Trị Liệu">
                  Thư giãn sâu với kỹ thuật viên lành nghề.
                </ListItem>
                <ListItem href="/services/skincare" title="Chăm Sóc Da">
                  Liệu pháp facial cao cấp.
                </ListItem>
                <ListItem href="/services/packages" title="Combo Tiết Kiệm">
                   Gói dịch vụ ưu đãi cho thành viên.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/booking" className={navigationMenuTriggerStyle()}>
              Đặt Lịch
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/about" className={navigationMenuTriggerStyle()}>
              Về Chúng Tôi
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex items-center gap-4 text-sm font-medium">
        <a href="/login">Đăng nhập</a>
        <a href="/register" className="px-4 py-2 bg-primary text-primary-foreground rounded-md transition-colors hover:bg-primary/90">
          Đăng ký
        </a>
      </div>
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
