import { ReactNode } from "react";
import Head from "next/head";
import Nav from "./Nav";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 text-base-content">
      <Head>
        <title>{process.env.NEXT_PUBLIC_SITE_TITLE}</title>
        <meta name="description" content="Developed by CoFi Team @Informal.systems" />
        <link rel="icon" href="/favicon_tiny.ico" />
      </Head>

      <Nav />
      <main className="flex flex-col items-center justify-center w-full flex-1 p-2 md:px-20 text-center">
        {children}
      </main>
      <footer className="flex items-center justify-center w-full h-24 border-t">
        Powered by{" "}
        <a
          className="pl-1 link link-primary link-hover"
          href="https://github.com/cosmos/cosmjs"
        >
          CosmJS
        </a>
        <span className="pl-1"> and</span>
        <a
          className="pl-1 link link-primary link-hover"
          href="https://keplr.app/"
        >
          Keplr
        </a>
        <span className="pl-1"> and</span>
        <a
          className="pl-1 link link-primary link-hover"
          href="https://www.cosmwasm.com/"
        >
          CosmWasm
        </a>
      </footer>
    </div>
  );
}
