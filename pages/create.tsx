import { useState, useEffect, MouseEvent, useDebugValue } from "react";
import type { NextPage } from "next";
import { StdFee, Coin } from "@cosmjs/amino";

import WalletLoader from "components/WalletLoader";
import { useSigningClient } from "contexts/cosmwasm";
import {
  convertMicroDenomToDenom,
  convertFromMicroDenom,
  convertDenomToMicroDenom,
  convertToFixedDecimals,
} from "util/conversion";
import { text } from "stream/consumers";
import { networkInterfaces } from "os";


import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
// import { Batch, DenomResponse, Addr, Edge, ExecuteMsg, InstantiateMsg, Network, QueryMsg } from "util/ts/Obligatto2.types.js";
// import { Obligatto2Client } from "util/ts/Obligatto2.client";


const PUBLIC_CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME;
const PUBLIC_STAKING_DENOM = process.env.NEXT_PUBLIC_STAKING_DENOM || "umlg";
const PUBLIC_FEE_DENOM = process.env.NEXT_PUBLIC_FEE_DENOM 
const PUBLIC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "wasm1aee5vz8pat4az3j32tsh004jneehewuq0n5u3j9nh36a0azu4z9smrsdgf";


const Create: NextPage = () => {
  const { walletAddress, signingClient } = useSigningClient();
  const [balance, setBalance] = useState("");
  const [loadedAt, setLoadedAt] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [creditorAddress, setCreditorAddress] = useState("");
  const [edgeAmount, setEdgeAmount] = useState(Number);
  const [due, setDue] = useState();
  const [memo, setMemo] = useState("");
  const [denom,setDenom] = useState("");


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
      })
      .catch((error) => {
        setError(`Error! ${error.message}`);
        console.log("Error signingClient.getBalance(): ", error);
      });
      const QueryMsg = {
        get_denom: {}
      }
   
      signingClient
      ?.queryContractSmart(PUBLIC_CONTRACT_ADDRESS, QueryMsg)
      .then((response) => {
        console.log("denom", response);
        setDenom(response);
        
       
      })
      .catch((error) => {
        setLoading(false);
        setError(`Error! ${error.message}`);
        console.log("Error signingClient.execute(): ", error);
      });
  

  }, [signingClient, walletAddress, loadedAt]);


    
  const handleCreate = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const amount = edgeAmount;
    const baseFee = amount / 1000000 ;
    const dues = baseFee;
      
    const due: Coin[] = [
      {
        amount: convertDenomToMicroDenom(dues),
        denom: PUBLIC_STAKING_DENOM,
      },
    ];

    const txMessage = {
        create_edge: {
          creditor: creditorAddress,
          amount
        },
    };

  signingClient
    ?.execute(walletAddress, PUBLIC_CONTRACT_ADDRESS, txMessage, "auto", memo, due)
    .then((resp) => {
      console.log("resp", resp);
      console.log("txHash", resp.transactionHash)

      const message = `Success! You recorded a obligation of  ${edgeAmount}  to ${creditorAddress} with the following transaction ${resp.transactionHash}.`;

      setLoadedAt(new Date());
      setLoading(false);
      setEdgeAmount(Number);
      setMemo("");
      // setDue(due);
      setSuccess(message);
    })
    .catch((error) => {
      setLoading(false);
      setError(`Error! ${error.message}`);
      console.log("Error signingClient.execute(): ", error);
    });
};
return (
    <WalletLoader loading={loading}>
      <p className="text-2xl">Your wallet has {balance}</p>

      <h1 className="text-5xl font-bold my-8">
        Record an obligation to pay
      </h1>

      <div className="flex w-full max-w-xl">
        <input
          type="text"
          id="creditor-address"
          className="input input-bordered focus:input-primary input-lg rounded-full flex-grow font-mono text-center text-lg"
          placeholder={`${PUBLIC_CHAIN_NAME} creditor wallet address...`}
          onChange={(event) => setCreditorAddress(event.target.value)}
          value={creditorAddress}
        />
      </div>

      <div className="flex flex-col md:flex-row mt-4 text-2xl w-full max-w-xl justify-between">

        <div className="relative rounded-full shadow-sm md:mr-2">
          <input
            type="number"
            id="edge-amount"
            className="input input-bordered focus:input-primary input-lg w-full pr-24 rounded-full text-center font-mono text-lg"
            placeholder={"What you owe..."}
            onChange={(event) => setEdgeAmount(event.target.valueAsNumber)}
            value={edgeAmount}
          />
           <span className="absolute top-0 right-0 bottom-0 px-4 py-5 rounded-r-full bg-secondary text-base-100 text-sm">
           {denom}

          </span>
        </div>

         
        
        <button
          className="mt-4 md:mt-0 btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl rounded-full flex-grow"
          onClick={handleCreate}
        >
          CREATE
        </button>
      
      </div>
      
      <div className="flex w-full max-w-xl md:flex-row mt-4">
          <input
            type="text"
            id="memo"
            className="input input-bordered focus:input-primary input-lg w-full pr-24 rounded-full text-center font-mono text-lg "
            placeholder="memo..."
            onChange={(event) => setMemo(event.target.value)}
            value={memo}
          />
        </div>

      <div className="mt-4 flex flex-col w-full max-w-xl">
        {success.length > 0 && (
          <div className="alert alert-success">
            <div className="flex-1 items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="flex-shrink-0 w-6 h-6 mx-2 stroke-current flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                ></path>
              </svg>
              <label    className="flex-grow break-all">{success}</label>
            </div>
          </div>
        )}
        {error.length > 0 && (
          <div className="alert alert-error">
            <div className="flex-1 items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="w-6 h-6 mx-2 stroke-current flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                ></path>
              </svg>
              <label className="flex-grow break-all">{error}</label>
            </div>
          </div>
        )}
      </div>
    </WalletLoader>
  );
};

export default Create;

export {}