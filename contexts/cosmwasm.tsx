import { createContext, useContext, ReactNode } from "react";
import {
  useSigningCosmWasmClient,
  ISigningCosmWasmClientContext,
} from "hooks/cosmwasm";

let CosmWasmContext: any;
let { Provider } = (CosmWasmContext =
  createContext<ISigningCosmWasmClientContext>({
    walletAddress: "",
    signingClient: null,
    loading: false,
    error: null,
    connectWallet: () => {},
    disconnect: () => {},
    contractAddress: "wasm1vuxslzss23m6cm0r4k3xuzgmrjzlecd9ajr8gm9esp7phamzv90sg8erp4",
  }));

export const useSigningClient = (): ISigningCosmWasmClientContext =>
  useContext(CosmWasmContext);

export const SigningCosmWasmProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const value = useSigningCosmWasmClient();
  return <Provider value={value}>{children}</Provider>;
};
