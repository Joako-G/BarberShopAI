import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    {
        variants: {
            variant: {
                default: "bg-[hsl(var(--primary-shadcn))] text-[hsl(var(--primary-foreground))] shadow-xs hover:bg-[hsl(var(--primary-shadcn))]/90",
                secondary: "border border-[hsl(var(--border))] bg-white/80 text-[hsl(var(--secondary-shadcn))] shadow-xs hover:bg-[hsl(var(--muted))]",
                ghost: "text-white/86 hover:bg-white/10 hover:text-white",
                outline: "border border-[hsl(var(--border))] bg-transparent shadow-xs hover:bg-[hsl(var(--muted))]",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                icon: "size-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
