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
import { Graph, GraphConfigInterface } from "@cosmograph/cosmos";


const PUBLIC_CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME;
const PUBLIC_STAKING_DENOM = process.env.NEXT_PUBLIC_STAKING_DENOM || "ubeat";
const PUBLIC_FEE_DENOM = process.env.NEXT_PUBLIC_FEE_DENOM || "ubeat";
const PUBLIC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "wasm1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsfg5rpz";

const View: NextPage = () => {

  const { walletAddress, signingClient } = useSigningClient();
  const [balance, setBalance] = useState("");
  const [loadedAt, setLoadedAt] = useState(new Date());
  const [loading, setLoading] = useState(false);


  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [edges, setEdges] = useState<Link[]>([]);
  const [edges2, setEdges2] = useState<Node[]>([]);
  // const [edges, setEdges] = useState([]);
  // const [edges2, setEdges2] = useState([]);

  // const [edges,setEdges] = useState([{ debtor: '', creditor: '' , amount: 0, edge_id: 0, graph_id: 0}]);





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
      // setLoading(false);
      // setSuccess(denom);
    })
    .catch((error) => {
      // setLoading(false);
      setError(`Error! ${error.message}`);
      console.log("Error signingClient.execute(): ", error);
    });

    

}, [signingClient, walletAddress, loadedAt]);


// setResults(fuse.search(value))
          
type Graph = {
  debtor: string;
  creditor: string;
  amount: number;
  edge_id?: number;
  graph_id?: number;
};

type Node = {
    id: 'Graph["edge_id"]';
    name: 'Graph["debtor"]';
    link: 'Graph["amount"]';
};
    
type Link = {
    source: 'Graph["debtor"]';
    target: 'Graph["creditor"]';
    value: 'Graph["amount"]';
};
    

const links: Link[] = edges
const nodes: Node[] = edges2;
// const [results, setResults] = useState();



  // const el = document.getElementById('canvas');
  // console.log(el);

  return (
    <WalletLoader loading={loading}>
      <p className="text-2xl">Your wallet has {balance}</p>

      <h1 className="text-5xl font-bold my-8">
        View obligations
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
                
            </table>
        </div>

      
      
        <div
              {...async () => {

                const cosmograph = await import('@cosmograph/cosmos');
              
                 const canvas = document.querySelector('canvas') as HTMLCanvasElement;
              
                // setCanvas(canvas);
                const config: GraphConfigInterface<Node, Link> = {
                  backgroundColor: "#151515",
                  nodeSize: 10,
                  nodeColor: "#404040",
                  linkWidth: 2,
                  linkColor: "#8C8C8C",
                  linkArrows: true,
                  simulation: {
                    linkDistance: 10,
                    linkSpring: 2,
                    repulsion: 1,
                    gravity: 0.25,
                    decay: 100000
                  },
                }
                // const graph = new cosmograph.Graph(canvas,config);

                const graph = new Graph(canvas, config)
                
                graph.setData(nodes, links,true) 
              
              }}
              


              // {...async (e: { currentTarget: { value: any; }; }) => {
              //   const { value } = e.currentTarget
              //   // Dynamically load fuse.js
              //   const cosmograph = (await import('@cosmograph/cosmos'))
              //   // const fuse = new Fuse(names)

                
              //   // browser code
              //   const canvas = document.querySelector('canvas') as HTMLCanvasElement;
              
              //   // setCanvas(canvas);
              //   const config: GraphConfigInterface<Node, Link> = {
              //     backgroundColor: "#151515",
              //     nodeSize: 10,
              //     nodeColor: "#404040",
              //     linkWidth: 2,
              //     linkColor: "#8C8C8C",
              //     linkArrows: true,
              //     simulation: {
              //       linkDistance: 10,
              //       linkSpring: 2,
              //       repulsion: 1,
              //       gravity: 0.25,
              //       decay: 100000
              //     },
              //   }
              //   // const graph = new cosmograph.Graph(canvas,config);

              //   const graph = new Graph(canvas, config)
                
              //   graph.setData(nodes, links,true) 
            

                
              // }}
            />

            {/* <pre>Results: {JSON.stringify(edges, null, 2)}</pre> */}
            
            <canvas />

    
    

  
      


      <div className="flex flex-col md:flex-row mt-4 text-2xl w-full max-w-xl justify-between">
         
        <button
          className="mt-4 md:mt-0 btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl rounded-full flex-grow"
          // onClick={handleView}
        >
          View obligations
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

export default View;


