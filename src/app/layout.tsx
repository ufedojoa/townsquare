/* eslint-disable @next/next/no-img-element */
"use client";

import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react"

import "../styles/colors.css";
import "../styles/classes.css";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { EllipsisVerticalIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { ReactNode, useContext, useState } from "react";
import {
  SpacesContextProvider,
  UserSpacesContext,
} from "@/providers/UserSpacesContext";
import normalizeUrl from "normalize-url";
import { ConnectButton, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config as wagmiConfig } from "@/config/wagmi";

const inter = Inter({ subsets: ["latin"] });

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <html lang="en">
      <head>
        <title>TownSquare</title>
      </head>
      <body className={`${inter.className} dark`}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <SpacesContextProvider>
                <div className="flex w-screen overflow-x-hidden relative">
                  <Sidebar
                    isOpen={sidebarOpen}
                    close={() => setSidebarOpen(false)}
                  />
                  <div className="w-screen md:w-auto h-0 min-h-screen grow shrink-0 relative flex flex-col overflow-y-auto">
                    <header className="fx bg-skin-base border-b-2 border-y-skin-alt px-4 lg:px-8 h-24 justify-between top-0 w-full sticky shrink-0 z-50">
                      <button
                        className="md:hidden px-2"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                      >
                        <EllipsisVerticalIcon className="h-5" />
                      </button>
                      <div className="fx gap-3">
                        <Link href="/" className="px-1 h-8 text-xl font-bold">
                          TownSquare
                        </Link>
                      </div>
                      <div className="fx gap-3 relative">
                        <ConnectButton />
                      </div>
                    </header>
                    <main
                      className={`flex-1 w-full max-w-5xl mx-auto ${false ? "" : "p-4 md:p-8 lg:p-16"}`}
                    >
                      {children}
                    </main>
                    <div className="fx justify-center gap-2 mx-4 my-3 text-skin-muted">
                      {process.env.NEXT_APP_GITHUB_URL && (
                        <Link
                          href={process.env.NEXT_APP_GITHUB_URL}
                          className="brightness-button"
                        >
                          <SiGithub /> <span className="ml-2">Github</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </SpacesContextProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
        <Analytics />
      </body>
    </html>
  );
}

type SidebarItemProps = {
  avatar: string | ReactNode;
  label: string;
  href: string;
  isSelected?: boolean;
  className?: string;
};

function SidebarItem({ avatar, label, href, className }: SidebarItemProps) {
  console.log(typeof avatar === "string" && avatar.charCodeAt(0));
  return (
    <div className="h-11 w-full xy">
      <Link href={href}>
        <button
          className={
            (className || "") +
            " h-11 w-11 xy rounded-full border dark:border-skin-foreground border-skin-text-muted hover:border-skin-text overflow-hidden duration-200 "
          }
        >
          {typeof avatar === "string" ? (
            avatar.charCodeAt(0) ? (
              <img
                className="h-full w-full object-cover"
                src={normalizeUrl(avatar)}
                alt={label}
              />
            ) : (
              <p className="text-4xl font-bold text-skin-muted">{label[0]}</p>
            )
          ) : (
            avatar
          )}
        </button>
      </Link>
    </div>
  );
}

function Sidebar({ isOpen, close }: { isOpen?: boolean; close?: () => void }) {
  const { userSpaces } = useContext(UserSpacesContext);
  // const [_, rebuild] = useState({});

  return (
    <div
      className={
        (isOpen ? "w-16" : "w-0") +
        " md:w-20 h-screen grow-0 shrink-0 top-0 sticky border-r border-r-skin-alt py-8 overflow-hidden"
      }
      onClick={() => close?.()}
    >
      <ul className="flex flex-col gap-y-6">
        <li>
          <SidebarItem
            avatar={
              <div className="h-10 w-10 rounded-full bg-slate-300">
                <img
                  src="/logo.jpeg"
                  alt="TownSquare"
                  className="object-cover h-full w-full rounded-full"
                />
              </div>
            }
            label="Home"
            href="/"
            className="border-none"
          />
        </li>
        <li>
          <SidebarItem
            avatar={<PlusIcon className="h-5" />}
            label="Create Organization"
            href="/create"
          />
        </li>
        <span className="w-4/5 h-0.5 bg-skin-alt mx-auto my-2"></span>
        {userSpaces.map((space) => (
          <li key={space.id}>
            <SidebarItem
              avatar={space.avatar}
              label={space.name}
              href={`/space/${space.id}`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
