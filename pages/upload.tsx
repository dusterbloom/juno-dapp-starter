import Link from 'next/link'
import { useState, useEffect, MouseEvent, useDebugValue, useCallback, CSSProperties } from "react";
import type { NextPage } from "next";
import { StdFee, Coin } from "@cosmjs/amino";
import Dropzone, { useDropzone } from 'react-dropzone';
import WalletLoader from "components/WalletLoader";
import { useSigningClient } from "contexts/cosmwasm";
import {
  convertMicroDenomToDenom,
  convertFromMicroDenom,
  convertDenomToMicroDenom,
  convertToFixedDecimals,
  convertFromDenom,
} from "util/conversion";
import Papa from 'papaparse';

import {
  useCSVReader,
  lightenDarkenColor,
  formatFileSize,
} from 'react-papaparse';


import { text } from "stream/consumers";
import { networkInterfaces, type } from "os";


import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { responseSymbol } from "next/dist/server/web/spec-compliant/fetch-event";
import { stringify } from "querystring";
import { resourceLimits } from 'worker_threads';
// import { Batch, DenomResponse, Addr, Edge, ExecuteMsg, InstantiateMsg, Network, QueryMsg } from "util/ts/Obligatto2.types.js";
// import { Obligatto2Client } from "util/ts/Obligatto2.client";



const PUBLIC_CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME;
const PUBLIC_STAKING_DENOM = process.env.NEXT_PUBLIC_STAKING_DENOM || "ucosm";
const PUBLIC_FEE_DENOM = process.env.NEXT_PUBLIC_FEE_DENOM 
const PUBLIC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "wasm1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsfg5rpz";

const Upload: NextPage = () => {

  const { walletAddress, signingClient } = useSigningClient();
  const [balance, setBalance] = useState("");
  const [loadedAt, setLoadedAt] = useState(new Date());
  const [loading, setLoading] = useState(false);


  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [parsedCsvData, setParsedCsvData] = useState<Graph[]>([]);


  type Graph = {
    debtor: string;
    creditor: string;
    amount: number;
    edge_id?: number;
    graph_id?: number;
  };


  // Adding dropzone

  const parseFile = file => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: results => {
        setParsedCsvData(results.data);
        
      },
    });
  };

   console.log(parsedCsvData);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length) {
      parseFile(acceptedFiles[0]);
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    // Accept?: 'text/csv',
  });


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

}, [signingClient, walletAddress, loadedAt]);

  // UPLOAD Message
  
  
  const handleUpload = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    // setLoading(true);

    const data = parsedCsvData;
    console.log("parsedCsvData", data)
    const txMessage = {
      create_graph: {
        graph: data
        },
    };
    console.log("txmessage", txMessage);


  signingClient
    ?.execute(walletAddress, PUBLIC_CONTRACT_ADDRESS, txMessage, "auto")
    .then((resp) => {
      console.log("resp", resp);

      const message = `Success! The obligations were uploaded with the following transaction ${resp.transactionHash}.`
      
      setSuccess(message);
    })
    .catch((error) => {
      setLoading(false);
      setError(`Error! ${error.message}`);
      console.log("Error signingClient.execute(): ", error);
    });

  }
  

  return (
    <WalletLoader loading={loading}>
      <p className="text-2xl">Your wallet has {balance}</p>

      <h1 className="text-5xl font-bold my-8">
        Upload obligations
      </h1>

      {/* <div className="overflow-x-auto relative shadow-md sm:rounded-lg"> */}
        <div
        {...getRootProps({
          className: `dropzone 
          ${isDragAccept && 'dropzoneAccept'} 
          ${isDragReject && 'dropzoneReject'}`,
        })}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p className="mt-1 md:mt-0 btn btn-secondary btn-small font-semibold hover:text-base-100 text-2xl  flex-grow"
        >Select a CSV file.</p>
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
                        <th scope="col" className="py-3 px-6">
                            <div className="flex items-center">
                                Graph
                                <a href="#"><svg xmlns="http://www.w3.org/2000/svg" className="ml-1 w-3 h-3" aria-hidden="true" fill="currentColor" viewBox="0 0 320 512"><path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z"></path></svg></a>
                            </div>
                        </th>
                        {/* <th scope="col" className="py-3 px-6">
                            <span className="sr-only">Graph</span>
                        </th> */}
                    </tr>
                </thead>      
                <tbody>
           
                 { parsedCsvData.map((e)  => (

                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" >
                   
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
                        <td className="py-4 px-6">
                          {e.graph_id}
                        </td>
                        {/* <td className="py-4 px-6 text-right">
                            <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                        </td> */}
                    </tr>
                  ))}
                
                </tbody>
            </table>
        </div>

    
      <div className="flex flex-col md:flex-row mt-4 text-2xl w-full max-w-xl justify-between">
         
        <button
          className="mt-4 md:mt-0 btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl rounded-full flex-grow"
          onClick={handleUpload}
        >
          Upload obligations
        </button>
        
      
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

)
}

export default Upload;
