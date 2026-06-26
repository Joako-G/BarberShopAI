import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
    return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
    return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
    return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
    return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
    className,
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
    return (
        <SheetPrimitive.Overlay
            data-slot="sheet-overlay"
            className={cn(
                "fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
                className
            )}
            {...props}
        />
    );
}

function SheetContent({
    className,
    children,
    side = "right",
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
    side?: "top" | "right" | "bottom" | "left";
}) {
    return (
        <SheetPortal>
            <SheetOverlay />
            <SheetPrimitive.Content
                data-slot="sheet-content"
                className={cn(
                    "fixed z-50 flex flex-col gap-4 bg-[#23344f] text-white shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
                    side === "right" &&
                        "inset-y-0 right-0 h-full w-80 max-w-[86vw] border-l border-white/10 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
                    side === "left" &&
                        "inset-y-0 left-0 h-full w-80 max-w-[86vw] border-r border-white/10 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
                    side === "top" &&
                        "inset-x-0 top-0 h-auto border-b border-white/10 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
                    side === "bottom" &&
                        "inset-x-0 bottom-0 h-auto border-t border-white/10 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
                    className
                )}
                {...props}
            >
                {children}
                <SheetPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-white/70 opacity-90 transition-opacity hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 disabled:pointer-events-none">
                    <XIcon className="size-5" />
                    <span className="sr-only">Cerrar</span>
                </SheetPrimitive.Close>
            </SheetPrimitive.Content>
        </SheetPortal>
    );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sheet-header"
            className={cn("flex flex-col gap-1.5 p-6", className)}
            {...props}
        />
    );
}

function SheetTitle({
    className,
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
    return (
        <SheetPrimitive.Title
            data-slot="sheet-title"
            className={cn("font-semibold text-white", className)}
            {...props}
        />
    );
}

function SheetDescription({
    className,
    ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
    return (
        <SheetPrimitive.Description
            data-slot="sheet-description"
            className={cn("text-sm text-white/60", className)}
            {...props}
        />
    );
}

export {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
};
