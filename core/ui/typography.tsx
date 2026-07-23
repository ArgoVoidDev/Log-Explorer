import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@core/lib/utils";

const typographyVariants = cva("text-foreground", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight text-balance",
      h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      label:
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

const defaultElement = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  p: "p",
  lead: "p",
  large: "div",
  small: "small",
  muted: "p",
  code: "code",
  label: "label",
} as const;

type TypographyVariant = NonNullable<
  VariantProps<typeof typographyVariants>["variant"]
>;

type TypographyProps = Omit<React.ComponentPropsWithoutRef<"p">, "color"> &
  VariantProps<typeof typographyVariants> & {
    as?: React.ElementType;
  };

function Typography({
  className,
  variant = "p",
  as,
  ...props
}: TypographyProps) {
  const Comp =
    as ?? defaultElement[(variant ?? "p") as TypographyVariant] ?? "p";

  return (
    <Comp
      data-slot="typography"
      data-variant={variant}
      className={cn(typographyVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Typography, typographyVariants };
export type { TypographyProps };
