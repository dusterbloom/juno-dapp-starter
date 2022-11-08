import type { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import WalletLoader from "components/WalletLoader";
import { useSigningClient } from "contexts/cosmwasm";
import {
  convertMicroDenomToDenom,
  convertFromMicroDenom,
  convertDenomToMicroDenom,
} from "util/conversion";

const PUBLIC_CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME;
const PUBLIC_FEE_DENOM = process.env.NEXT_PUBLIC_FEE_DENOM || "ubeat" ;
const PUBLIC_STAKING_DENOM = process.env.NEXT_PUBLIC_STAKING_DENOM || "ubeat" ;

const PUBLIC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "wasm13ehuhysn5mqjeaheeuew2gjs785f6k7jm8vfsqg3jhtpkwppcmzq873hl8";



const Home: NextPage = () => {
  const { walletAddress, signingClient } = useSigningClient();
  const [balance, setBalance] = useState("");
  const [isAdmin, setIsAdmin] = useState("");
  const [loadedAt, setLoadedAt] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!signingClient || walletAddress.length === 0) {
      return;
    }
    setError("");
    setSuccess("");

    signingClient
      .getBalance(walletAddress, PUBLIC_STAKING_DENOM)
      .then((response: any) => {
        const { amount, denom }: { amount: number; denom: string } = response;
        setBalance(
          `${convertMicroDenomToDenom(amount)} ${convertFromMicroDenom(denom)}`
        );
        console.log("balance", response)
      })
      .catch((error) => {
        setError(`Error! ${error.message}`);
        console.log("Error signingClient.getBalance(): ", error);
      });

      //  // Get the admin  
      //  const QueryMsg3 = {
      //       get_owner: {addr:walletAddress}
      //       }


    //   // Get the admin
    // signingClient
    // ?.queryContractSmart(PUBLIC_CONTRACT_ADDRESS, QueryMsg3)
    // .then((response: any) => {
    //   console.log("admin", response);
    //   setIsAdmin(response.isadmin);
    //   setLoading(false);
    // })
    // .catch((error) => {
    //   setError(`Error! ${error.message}`);
    //   console.log("Error signingClient.execute(): ", error);
    // });

  


}, [signingClient, walletAddress, loadedAt]);




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
  <div className="mt-3 text-3xl">           
  <Link href="/overview" passHref>
  Overview</Link>
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
  <Link href="/upload2" passHref>
    <a className="p-6 mt-6 text-left border border-secondary hover:border-primary w-96 rounded-xl hover:text-primary focus:text-primary-focus">
      <h3 className="text-2xl font-bold">Record many obligations  &rarr;</h3>
      <p className="mt-4 text-xl">
        Record multiple debts by uploading a file.
      </p>
    </a>
  </Link>
  


  <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 max-w-full sm:w-full">
  <Link href="/upload" passHref>
    <a className="p-6 mt-6 text-left border border-secondary hover:border-primary w-96 rounded-xl hover:text-primary focus:text-primary-focus">
      <h3 className="text-2xl font-bold">Upload an entire Graph &rarr;</h3>
      <p className="mt-4 text-xl">
        Record an entire graph of obligation between accounts by uploading a file.
      </p>
    </a>
  </Link>
  </div>


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
