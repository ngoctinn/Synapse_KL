"use client"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/shared/ui/accordion"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/shared/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/shared/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"

export function DataDisplayShowcase() {
  return (
    <>
      <section className="border p-4 flex flex-col gap-4">
        <h2>Navigation</h2>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/showcase">Showcase</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Current</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="p-4 border">
            Account content here.
          </TabsContent>
          <TabsContent value="password" className="p-4 border">
            Change password here.
          </TabsContent>
        </Tabs>
      </section>

      <section className="border p-4 flex flex-col gap-4">
        <h2>Data Display</h2>
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description.</CardDescription>
          </CardHeader>
          <CardContent>
            Some main content here.
          </CardContent>
          <CardFooter>
            Card Footer.
          </CardFooter>
        </Card>

        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Accordion Question 1</AccordionTrigger>
            <AccordionContent>
              Accordion Answer 1.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Accordion Question 2</AccordionTrigger>
            <AccordionContent>
              Accordion Answer 2.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header 1</TableHead>
              <TableHead>Header 2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Data A1</TableCell>
              <TableCell>Data A2</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Data B1</TableCell>
              <TableCell>Data B2</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </>
  )
}
