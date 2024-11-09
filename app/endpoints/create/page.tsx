import CreateForm from "@/components/groups/endpoints/create-form";
import { Header } from "@/components/parts/header";
import { PageWrapper } from "@/components/parts/page-wrapper";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Icon from "@/public/icon.svg";
import { Home } from "lucide-react";
import Image from "next/image";

const pageData = {
  name: "New Endpoint",
  title: "Create an Endpoint",
  description: "Create a new endpoint.",
};

export default async function Page() {
  return (
    <>
      <Breadcrumb className="h-[67.63px] bg-muted/50 rounded-lg border flex items-center justify-between p-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home size={20} />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/endpoints">Endpoints</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="px-2 py-1 bg-accent rounded-sm">
              {pageData?.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
        <Image
          className="hover:animate-spin dark:invert"
          src={Icon}
          width={24}
          height={24}
          alt="Trident Icon"
        />
      </Breadcrumb>
      <PageWrapper>
        <Header title={pageData?.title}>{pageData?.description}</Header>
        <div className="max-w-2xl">
          <CreateForm />
        </div>
      </PageWrapper>
    </>
  );
}
