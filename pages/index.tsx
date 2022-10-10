import type { NextPage } from "next";
import Link from "next/link";
import WalletLoader from "components/WalletLoader";
import { useSigningClient } from "contexts/cosmwasm";

const Home: NextPage = () => {
  const { walletAddress } = useSigningClient();


  return (
    <WalletLoader>
      <h1 className="text-6xl font-bold">
        Welcome
        {/* {process.env.NEXT_PUBLIC_HOME_HEADER} ! */}
      </h1>

      <div className="mt-3 text-2xl">
        Your wallet address is:{" "}
        <pre className="font-mono break-all whitespace-pre-wrap">
          {walletAddress}
        </pre>
      </div>
    
    <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 max-w-full sm:w-full">
    <Link href="/create" passHref>
      <a className="p-6 mt-6 text-left border border-secondary hover:border-primary w-96 rounded-xl hover:text-primary focus:text-primary-focus">
        <h3 className="text-2xl font-bold">Record an obligation &rarr;</h3>
        <p className="mt-4 text-xl">
          Record a debt you owe to another wallet.
        </p>
      </a>
    </Link>

    <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 max-w-full sm:w-full">
    <Link href="/upload" passHref>
      <a className="p-6 mt-6 text-left border border-secondary hover:border-primary w-96 rounded-xl hover:text-primary focus:text-primary-focus">
        <h3 className="text-2xl font-bold">Record many obligations  &rarr;</h3>
        <p className="mt-4 text-xl">
          Record multiple obligations between accounts in a single step.
        </p>
      </a>
    </Link>
    
    {/* <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 max-w-full sm:w-full">
        <Link href="/send" passHref>
          <a className="p-6 mt-6 text-left border border-secondary hover:border-primary w-96 rounded-xl hover:text-primary focus:text-primary-focus">
            <h3 className="text-2xl font-bold">Transfer to wallet &rarr;</h3>
            <p className="mt-4 text-xl">
              Execute a transaction to send funds to a wallet or contract address.
            </p>
          </a>
        </Link>
      </div> */}

    <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 max-w-full sm:w-full">
          <Link href="/clear" passHref>
            <a className="p-6 mt-6 text-left border border-secondary hover:border-primary w-96 rounded-xl hover:text-primary focus:text-primary-focus">
              <h3 className="text-2xl font-bold">Find savings &rarr;</h3>
              <p className="mt-4 text-xl">
                See all obligations and find liquidity savings / reset state.
              </p>
            </a>
          </Link>
        </div>
    </div>
    </div>

    </WalletLoader>
    );
  };

export default Home;
