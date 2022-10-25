import Link from 'next/link'
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


const PUBLIC_CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME;
const PUBLIC_STAKING_DENOM = process.env.NEXT_PUBLIC_STAKING_DENOM || "ubeat";
const PUBLIC_FEE_DENOM = process.env.NEXT_PUBLIC_FEE_DENOM  || "ubeat";
const PUBLIC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "wasm13ehuhysn5mqjeaheeuew2gjs785f6k7jm8vfsqg3jhtpkwppcmzq873hl8";



const Overview: NextPage = () => {

  const { walletAddress, signingClient } = useSigningClient();
  const [balance, setBalance] = useState("");
  const [loadedAt, setLoadedAt] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [totalDebt, setTotalDebt] = useState("");
  const [totalCredit, setTotalCredit] = useState("");
  const [edgesCount, setEdgesCount] = useState("");

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
        // console.log("balance", response)
      })
      .catch((error) => {
        setError(`Error! ${error.message}`);
        console.log("Error signingClient.getBalance(): ", error);
      });



    // Get edges by address - user as creditor
    const QueryMsg3 = {
      get_edges_by_address: {"address": walletAddress}
    }

    signingClient
    ?.queryContractSmart(PUBLIC_CONTRACT_ADDRESS, QueryMsg3)
    .then((response: any) => {
      // console.log("edges", response.edges);
   
      setEdgesCount(response.edges.length);

      setEdges(response.edges);
      setLoading(false);
    })
    .catch((error) => {
      setError(`Error! ${error.message}`);
      console.log("Error signingClient.execute(): ", error);
    });


    //  Get total debt (query with state persisted)
    const QueryMsg2 = {
      get_total_debt_per_address: {"address": walletAddress}
    }


    signingClient
    ?.queryContractSmart(PUBLIC_CONTRACT_ADDRESS, QueryMsg2)
    .then((response: any ) => {

      const { total_debt }: { total_debt: number } = response;
      setTotalDebt(
        `${(total_debt)}`
      );
    
      console.log("totalDebt", response.total_debt);
    
    })
    .catch((error) => {
      setLoading(false);
      setError(`Error! ${error.message}`);
      console.log("Error signingClient.execute(): ", error);
    });
      

    // Get total credit per address 
    const QueryMsg5 = {
      get_total_credit_per_address: {"address": walletAddress}
    }


    signingClient
        ?.queryContractSmart(PUBLIC_CONTRACT_ADDRESS, QueryMsg5)
        .then((response: any ) => {

          const { total_credit }: { total_credit: number } = response;
          setTotalCredit(
            `${(total_credit)}`
          );
        
          console.log("totalCredit", response.total_debt);
        
        })
        .catch((error) => {
          setLoading(false);
          setError(`Error! ${error.message}`);
          console.log("Error signingClient.execute(): ", error);
        });








}, [signingClient, walletAddress, loadedAt,totalDebt]);

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
  
  
 


  // CLEAR Message
  const handleClear = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // const amount = edgeAmount;
    // const baseFee = amount / 100000 ;
    // const dues = baseFee;
      
    // const due: Coin[] = [
    //   {
    //     amount: convertDenomToMicroDenom(dues),
    //     denom: PUBLIC_STAKING_DENOM,
    //   },
    // ];

    // Find savings
    const txMessage = {
      find_savings: {
         
        },
    };
 

  signingClient
    ?.execute(walletAddress, PUBLIC_CONTRACT_ADDRESS, txMessage, "auto")
    .then((resp) => {
      console.log("resp", resp);
      console.log("txHash", resp.transactionHash);
      console.log("Total Debt", resp.logs[0].events[2].attributes[4]);
      console.log("Total Debt cleared", resp.logs[0].events[2].attributes[5]);
      const totalDebt = resp.logs[0].events[2].attributes[3].value ;
      const totalDebtCleared = resp.logs[0].events[2].attributes[5].value;
     
      const message = `Success! The obligations were cleared with the following transaction ${resp.transactionHash}.
      Total debt was ${totalDebt}. Total debt cleared is ${totalDebtCleared}.`
    

      setLoadedAt(new Date());
      setLoading(false);
      setSuccess(message);
    })
    .catch((error) => {
      setLoading(false);
      setError(`Error! ${error.message}`);
      console.log("Error signingClient.execute(): ", error);
    });

  }

  const handleSimulate = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

  // Simulate savings
  const txMessage = {
    simulate_savings: {
       
      },
  };


signingClient
  ?.execute(walletAddress, PUBLIC_CONTRACT_ADDRESS, txMessage, "auto")
  .then((resp) => {
    console.log("resp", resp);
    console.log("txHash", resp.transactionHash);
    console.log("Total Debt", resp.logs[0].events[2].attributes[4]);
    console.log("Total Debt cleared", resp.logs[0].events[2].attributes[5]);
    const totalDebt = resp.logs[0].events[2].attributes[4].value ;
    const totalDebtCleared = resp.logs[0].events[2].attributes[5].value;
   
    const message = `The simulation was recorded with the following transaction ${resp.transactionHash}.
    Total debt was ${totalDebt}. Total debt that can be cleared is ${totalDebtCleared}.`

    setLoadedAt(new Date());
    setLoading(false);
    setSuccess(message);
  })
  .catch((error) => {
    setLoading(false);
    setError(`Error! ${error.message}`);
    console.log("Error signingClient.execute(): ", error);
  });

}

    // RESET Message
  const handleReset = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const txMessage = {
      reset: {         
        },
    };
 

  signingClient
    ?.execute(walletAddress, PUBLIC_CONTRACT_ADDRESS, txMessage, "auto")
    .then((resp) => {
      console.log("resp", resp);
      console.log("txHash", resp.transactionHash)

      const message = `Success! All obligations were deleted with the following transaction ${resp.transactionHash}.`;

      setLoadedAt(new Date());
      setLoading(false);
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
      {/* <p className="text-2xl">Your wallet has {balance}</p> */}

      <h1 className="text-5xl font-bold my-8">
        My obligations
      </h1>
      <p className="text-2xl font-bold my-8">
       Total Debt: {totalDebt} / Total Credit: {totalCredit} / Obligations: {edgesCount}
      </p>


      {/* <div className="flex flex-col md:flex-row mt-4 text-2xl w-full max-w-xl justify-between">
         
        <button
          className="mt-4 md:mt-0 btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl rounded-full flex-grow"
          onClick={handleSimulate}
        >
          Run simulation
        </button>

        <button
          className="mt-4 md:mt-0 btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl rounded-full flex-grow"
          onClick={handleClear}
        >
          Find liquidity savings
        </button>
        </div>

        

        <div className="flex flex-col md:flex-row mt-4 text-2xl w-full max-w-xl justify-between">
        <button
          className="mt-4 md:mt-0 btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl rounded-full flex-grow"
          onClick={handleReset}
        >
          Reset contract state
        </button>

        
      
      </div>
       */}

      
  

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
                        {/* <th scope="col" className="py-3 px-6">
                            <span className="sr-only">Edit</span>
                        </th> */}
                    </tr>
                </thead>
                <tbody>
                {/* //map each array element to the right table cell */}
                  {edges.map((e,index) => 
                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                   
                      
                        <td className="py-4 px-6">
                        {e.edge_id}
                        </td>
                        
                        <td className="py-4 px-6">
                           { e.debtor }
                        </td>
                        <td className="py-4 px-6">
                            {e.creditor}
                        </td>
                        <td className="py-4 px-6">
                          {e.amount}
                        </td>
                        {/* <td className="py-4 px-6 text-right">
                            <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                        </td> */}
                    </tr>
                  )}
                </tbody>
            </table>
        </div>
    </WalletLoader>

    


  );
};

export default Overview;

export {}