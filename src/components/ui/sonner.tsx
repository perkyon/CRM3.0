import React, { useEffect } from "react";
import { Toaster as Sonner, ToasterProps, toast } from "sonner@2.0.3";
import { initializeToast } from "../../lib/toast";

const Toaster = ({ ...props }: ToasterProps) => {
  // Initialize toast when component mounts
  useEffect(() => {
    initializeToast(toast);
  }, []);

  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
