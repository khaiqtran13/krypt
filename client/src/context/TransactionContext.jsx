import React from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return transactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = React.useState("");
  const [formData, setFormData] = React.useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [transactionCount, setTransactionCount] = React.useState(
    localStorage.getItem("transactionCount") || 0
  );

  const checkIfTransactionExists = async () => {
    try {
      if (!ethereum) return console.log("metamask is not installed");

      const tranasactionContract = getEthereumContract();
      const currentTransactionCount =
        await tranasactionContract.getTransactionCount();

      window.localStorage.setItem("transactionCount", currentTransactionCount);
    } catch (error) {
      console.log(error);
      throw new Error("no ethereum object");
    }
  };

  const handleChange = (e, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.value,
    }));
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return console.log("metamask is not installed");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        setCurrentAccount(accounts[0]);

        //   getAllTransactions();
      } else {
        console.log("no authorized account found");
      }

      console.log(accounts);
    } catch (error) {
      console.log(error);
      throw new Error("no ethereum object");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return console.log("metamask is not installed");

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
      throw new Error("no ethereum object");
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return console.log("metamask is not installed");

      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208", // 21000 GWEI
            value: parsedAmount._hex,
          },
        ],
      });

      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );

      setIsLoading(true);
      console.log(`loading - ${transactionHash}`);

      await transactionHash.wait();
      setIsLoading(false);
      console.log(`done - ${transactionHash}`);

      const transactionCount = await transactionContract.getTransactionCount();

      setTransactionCount(transactionCount.toNumber());
    } catch (error) {
      console.log(error);
      throw new Error("no ethereum object");
    }
  };

  React.useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionExists();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        getEthereumContract,
        connectWallet,
        currentAccount,
        sendTransaction,
        formData,
        setFormData,
        handleChange,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
