import { useState, useEffect, MouseEvent, useDebugValue, useCallback, CSSProperties } from "react";
import type { NextPage } from "next";
import { StdFee, Coin } from "@cosmjs/amino";
import { useDropzone } from 'react-dropzone';
import WalletLoader from "components/WalletLoader";
import { useSigningClient } from "contexts/cosmwasm";
import {
  convertMicroDenomToDenom,
  convertFromMicroDenom,

} from "util/conversion";
import Papa from 'papaparse';


const PUBLIC_FEE_DENOM = process.env.NEXT_PUBLIC_FEE_DENOM || "ubeat";
const PUBLIC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "wasm13ehuhysn5mqjeaheeuew2gjs785f6k7jm8vfsqg3jhtpkwppcmzq873hl8";

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

  const parseFile = (file: any) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results: any) => {
        setParsedCsvData(results.data);
        
      },
    });
  };

  //  console.log(parsedCsvData);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length) {
      parseFile(acceptedFiles[0]);
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    open,
    acceptedFiles
  } = useDropzone({
    onDrop,
    maxSize: 5242880 
  });



  // Loads the wallet and converts the balance
  useEffect(() => {
    if (!signingClient || walletAddress.length === 0) {
      return;
    }
    setError("");
    setSuccess("");

    signingClient
      .getBalance(walletAddress, PUBLIC_FEE_DENOM)
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
        <div
        {...getRootProps({
          className: `dropzone 
          ${'dropzoneAccept'} 
          ${'dropzoneReject'}`,
        })}
        >
    
        <input {...getInputProps()} />
        {(
          <p className="mt-1 md:mt-0 btn btn-secondary btn-small font-semibold hover:text-base-100 text-2xl  flex-grow"
        >Select a CSV file.</p>
        )}
      </div>

        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        {/* <aside>
          <h4>File ready for upload</h4>
           <ul className='alert alert-success'>{files}</ul>
        </aside> */}
        
        
        <ul className="list-group mt-2">
           {acceptedFiles.length > 0 && acceptedFiles.map(acceptedFile => (
            
                 <li key={acceptedFile.name} className="alert alert-success">
            {acceptedFile.name}     {acceptedFile.type} - {acceptedFile.size} bytes

        </li>
      ))}
        </ul>
        </div>
       
    
      <div className="flex flex-col md:flex-row mt-4 text-2xl w-full max-w-xl justify-between">
         
        <button
          className="mt-4 md:mt-0 btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl rounded-full flex-grow"
          onClick={handleUpload}
        >
          Upload file
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