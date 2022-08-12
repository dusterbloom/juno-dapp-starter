import { useState, useEffect, MouseEvent } from "react";
import type { NextPage } from "next";
import { StdFee, Coin } from "@cosmjs/amino";

import WalletLoader from "components/WalletLoader";
import { useSigningClient } from "contexts/cosmwasm";
import {
  convertMicroDenomToDenom,
  convertFromMicroDenom,
  convertDenomToMicroDenom,
} from "util/conversion";

const PUBLIC_CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME;
const PUBLIC_STAKING_DENOM = process.env.NEXT_PUBLIC_STAKING_DENOM || "umlg";
const MALAGA_TESTNET_RPC = process.env.
const PUBLIC_CONTRACT_ADDRESS = "wasm1aee5vz8pat4az3j32tsh004jneehewuq0n5u3j9nh36a0azu4z9smrsdgf"


const Create: NextPage = () => {
  const { walletAddress, signingClient } = useSigningClient();
  const [balance, setBalance] = useState("");
  const [loadedAt, setLoadedAt] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [creditorAddress, setCreditorAddress] = useState("");
  const [edgeAmount, setEdgeAmount] = useState("");
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
  }, [signingClient, walletAddress, loadedAt]);


  const handleSend = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const amount: Coin[] = [
      {
        amount: convertDenomToMicroDenom(sendAmount),
        denom: PUBLIC_STAKING_DENOM,
      },
    ];