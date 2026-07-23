"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { cn } from "@core/lib/utils";
import { Button } from "@core/ui/button";

function Modal({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="modal" {...props} />;
}

function ModalTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="modal-trigger" {...props} />;
}

function ModalPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="modal-portal" {...props} />;
}

function ModalClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="modal-close" {...props} />;
}

function ModalOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="modal-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function ModalContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
}) {
  return (
    <ModalPortal>
      <ModalOverlay />
      <DialogPrimitive.Popup
        data-slot="modal-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            data-slot="modal-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Popup>
    </ModalPortal>
  );
}

function ModalHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function ModalFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="modal-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton ? (
        <DialogPrimitive.Close
          render={<Button variant="outline" />}
        >
          Close
        </DialogPrimitive.Close>
      ) : null}
    </div>
  );
}

function ModalTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="modal-title"
      className={cn("text-base leading-none font-medium", className)}
      {...props}
    />
  );
}

function ModalDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="modal-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  ModalTrigger,
};
