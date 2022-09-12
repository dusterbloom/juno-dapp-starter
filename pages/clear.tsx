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
  convertFromDenom,
} from "util/conversion";
import { text } from "stream/consumers";
import { networkInterfaces } from "os";


import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { responseSymbol } from "next/dist/server/web/spec-compliant/fetch-event";
import { stringify } from "querystring";
// import { Batch, DenomResponse, Addr, Edge, ExecuteMsg, InstantiateMsg, Network, QueryMsg } from "util/ts/Obligatto2.types.js";
// import { Obligatto2Client } from "util/ts/Obligatto2.client";


const PUBLIC_CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME;
const PUBLIC_STAKING_DENOM = process.env.NEXT_PUBLIC_STAKING_DENOM || "umlg";
const PUBLIC_FEE_DENOM = process.env.NEXT_PUBLIC_FEE_DENOM 
const PUBLIC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "wasm125h6mgvdwqqecje2srhuzhq90vfzs44garve3r7zycvp3rs97gkqw7ny5e";


const Clear: NextPage = () => {
  console.log('clear called')

  const { walletAddress, signingClient } = useSigningClient();
  const [balance, setBalance] = useState("");
  const [loadedAt, setLoadedAt] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [creditorAddress, setCreditorAddress] = useState("");
  const [edgeAmount, setEdgeAmount] = useState(Number);
  const [due, setDue] = useState();
  const [memo, setMemo] = useState("");
  const [denom,setDenom] = useState("");
  const [owner,setOwner] = useState("");
  const [edges,setEdges] = useState([{ debtor: '', creditor: '' , amount: 0, edge_id: 0, graph_id: 0}]);
  

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  // Loads the wallet and converts the balance
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

       // Get all edges 
  const QueryMsg3 = {
    all_edges: {}
  }


// Get all edges
    signingClient
    ?.queryContractSmart(PUBLIC_CONTRACT_ADDRESS, QueryMsg3)
    .then((response: any) => {
      console.log("edges", response.edges);
      setEdges(response.edges)
      // console.log("edges", response);
      // const data = response;
    //  setEdges(`${response}`);
      //  setEdges(
      //   [`${(edge_id)} ${(debtor)} ${(creditor)} ${(amount)} ${(graph_id)}`]
      // );
      setSuccess("");
      setLoading(false);
      // setSuccess(denom);
    })
    .catch((error) => {
      // setLoading(false);
      setError(`Error! ${error.message}`);
      console.log("Error signingClient.execute(): ", error);
    });




}, [signingClient, walletAddress, loadedAt]);

// Get the network denomination
//   const QueryMsg = {
//     get_denom: {}
//   }

//   signingClient
//   ?.queryContractSmart(PUBLIC_CONTRACT_ADDRESS, QueryMsg)
//   .then((response) => {
//     console.log("denom", response.denom);
//     setDenom(`${response.denom}`);
//     //const denomB = $(response.de)
//     // setSuccess(denom);
//   })
//   .catch((error) => {
//     setLoading(false);
//     setError(`Error! ${error.message}`);
//     console.log("Error signingClient.execute(): ", error);
//   });
  
   // Get the network owner
  // const QueryMsg2 = {
  //   get_owner: {}
  // }


  // signingClient
  // ?.queryContractSmart(PUBLIC_CONTRACT_ADDRESS, QueryMsg2)
  // .then((response) => {
  //   console.log("owner", response.owner);
  //   setOwner(`${response.owner}`);
  //   //const denomB = $(response.de)
  //   // setSuccess(denom);
  // })
  // .catch((error) => {
  //   setLoading(false);
  //   setError(`Error! ${error.message}`);
  //   console.log("Error signingClient.execute(): ", error);
  // });
    
 


    
//   const handleCreate = (event: MouseEvent<HTMLElement>) => {
//     event.preventDefault();
//     setError("");
//     setSuccess("");
//     setLoading(true);

//     const amount = edgeAmount;
//     const baseFee = amount / 100000 ;
//     const dues = baseFee;
      
//     const due: Coin[] = [
//       {
//         amount: convertDenomToMicroDenom(dues),
//         denom: PUBLIC_STAKING_DENOM,
//       },
//     ];

//     const txMessage = {
//         create_edge: {
//           creditor: creditorAddress,
//           amount
//         },
//     };
 

//   signingClient
//     ?.execute(walletAddress, PUBLIC_CONTRACT_ADDRESS, txMessage, "auto", memo, due)
//     .then((resp) => {
//       console.log("resp", resp);
//       console.log("txHash", resp.transactionHash)

//       const message = `Success! You recorded an obligation to pay ${edgeAmount} ${denom} to ${creditorAddress} with the following transaction ${resp.transactionHash}.`;

//       setLoadedAt(new Date());
//       setLoading(false);
//       setEdgeAmount(Number);
//       setMemo("");
//       // setDue(due);
//       setSuccess(message);
//     })
//     .catch((error) => {
//       setLoading(false);
//       setError(`Error! ${error.message}`);
//       console.log("Error signingClient.execute(): ", error);
//     });
// };

return (
    <WalletLoader loading={loading}>
      <p className="text-2xl">Your wallet has {balance}</p>

      <h1 className="text-5xl font-bold my-8">
        All obligations
      </h1>

        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                    <th scope="col" className="py-3 px-6">
                            <div className="flex items-center">
                              Id
                                <a href="#"><svg xmlns="http://www.w3.org/2000/svg" className="ml-1 w-3 h-3" aria-hidden="true" fill="currentColor" viewBox="0 0 320 512"><path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z"></path></svg></a>
                            </div>
                        </th>  
                    <th scope="col" className="py-3 px-6">
                            <div className="flex items-center">
                                Debtor
                                <a href="#"><svg xmlns="http://www.w3.org/2000/svg" className="ml-1 w-3 h-3" aria-hidden="true" fill="currentColor" viewBox="0 0 320 512"><path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z"></path></svg></a>
                            </div>
                        </th>
                        <th scope="col" className="py-3 px-6">
                            <div className="flex items-center">
                                Creditor
                                <a href="#"><svg xmlns="http://www.w3.org/2000/svg" className="ml-1 w-3 h-3" aria-hidden="true" fill="currentColor" viewBox="0 0 320 512"><path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z"></path></svg></a>
                            </div>
                        </th>
                        <th scope="col" className="py-3 px-6">
                            <div className="flex items-center">
                                Amount
                                <a href="#"><svg xmlns="http://www.w3.org/2000/svg" className="ml-1 w-3 h-3" aria-hidden="true" fill="currentColor" viewBox="0 0 320 512"><path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z"></path></svg></a>
                            </div>
                        </th>
                        <th scope="col" className="py-3 px-6">
                            <span className="sr-only">Edit</span>
                        </th>
                    </tr>
                </thead>
                <tbody>

                  {edges.map(e => 
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        {/* <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            Apple MacBook Pro 17"
                        </th> */}
                        <th scope="row" className="py-4 px-6">
                        <td className="py-4 px-6">
                        {e.edge_id}
                        </td>
                        </th>
                        <td className="py-4 px-6">
                           { e.debtor }
                        </td>
                        <td className="py-4 px-6">
                            {e.creditor}
                        </td>
                        <td className="py-4 px-6">
                          {e.amount}
                        </td>
                        <td className="py-4 px-6 text-right">
                            <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                        </td>
                    </tr>
                  )}
                </tbody>
            </table>
        </div>



      <div className="flex w-full max-w-xl">
        {/* <input
          type="text"
          id="creditor-address"
          className="input input-bordered focus:input-primary input-lg rounded-full flex-grow font-mono text-center text-lg"
          // placeholder={`${PUBLIC_CHAIN_NAME} creditor address...`}
          placeholder={`Creditor address`}

          onChange={(event) => setCreditorAddress(event.target.value)}
          value={creditorAddress}
        /> */}


      </div>

      <div className="flex w-full max-w-xl md:flex-row mt-4">
          <input
            type="text"
            id="memo"
            className="input input-bordered focus:input-primary input-lg w-full pr-24 rounded-full text-center font-mono text-lg "
            placeholder="Public transaction memo"
            onChange={(event) => setMemo(event.target.value)}
            value={memo}
          />
        </div>

      <div className="flex flex-col md:flex-row mt-4 text-2xl w-full max-w-xl justify-between">

        {/* <div className="relative rounded-full shadow-sm md:mr-2">
          <input
            type="number"
            id="edge-amount"
            className="input input-bordered focus:input-primary input-lg w-full pr-24 rounded-full text-center font-mono text-lg"
            placeholder={"Amount owed"}
            onChange={(event) => setEdgeAmount(event.target.valueAsNumber)}
            value={edgeAmount}
          />
           <span className="absolute top-0 right-0 bottom-0 px-4 py-5 rounded-r-full bg-secondary text-base-100 text-sm">
           {denom.toUpperCase()}

          </span>
        </div> */}

         
        
        {/* <button
          className="mt-4 md:mt-0 btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl rounded-full flex-grow"
          onClick={handleClear}
        >
          GO
        </button> */}
      
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

export default Clear;

export {}