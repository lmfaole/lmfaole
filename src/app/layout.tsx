import "../styles/globals.scss";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Jøkul Blog",
  description: "A blog created with Jøkul designsystem",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body className="jkl">
        {children}
      </body>
    </html>
  );
}
