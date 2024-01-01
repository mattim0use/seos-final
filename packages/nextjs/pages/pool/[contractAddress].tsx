import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useContractWrite, useWalletClient } from "wagmi";
import { erc20ABI } from "wagmi";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth/useScaffoldContract";
import { useTransactor } from "~~/hooks/scaffold-eth/useTransactor";

const PoolDetails = () => {
  const router = useRouter();
  const contractAddress = router.query.contractAddress;
  const { data: contract } = useScaffoldContract({ contractName: "FarmMainRegularMinStake", walletClient: null });
  const transact = useTransactor();
  const [positionId, setPositionId] = useState<bigint>(BigInt(0)); // Initialize as bigint, and put initial value
  const [setupIndex, setSetupIndex] = useState<bigint>(BigInt(0)); // Initialize as bingin, and put initial value
  const [amount0, setAmount0] = useState<bigint>(BigInt(0));
  const [amount1, setAmount1] = useState<bigint>(BigInt(0));
  const [positionOwner, setPositionOwner] = useState(""); // Address of position owner
  const [amount0Min, setAmount0Min] = useState<bigint>(BigInt(0));
  const [amount1Min, setAmount1Min] = useState<bigint>(BigInt(0));
  const [removedLiquidity, setRemovedLiquidity] = useState<bigint>(BigInt(0)); // Initial value as empty string or appropriate default
  const burnData = "0x"; // Default value for empty data
  const spender = typeof contractAddress === "string" ? contractAddress : "";
  const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
  const tokenAddress = "0x6100dd79fCAA88420750DceE3F735d168aBcB771"; //this is the ethereans OS contract
  const farmMainAddress = "0x129a261afAAe9Fc9AB9D5107e840560d052Cd97E"; //FarmMainRegularMinStake
  // Max value for unlimited approval

  //Approve function, untested. had to add the erc20abi from wagmi to just get an approval going cause its not inherant in farmregminstake.
  const {
    writeAsync: approveAsync,
    isLoading: isApproveLoading,
    isError: isApproveError,
    error: approveError,
  } = useContractWrite({
    address: tokenAddress, // ERC-20 token contract address
    abi: erc20ABI, // ERC-20 token contract ABI
    functionName: "approve",
    args: [farmMainAddress, MAX_UINT256], // FarmMainRegularMinStake address and max amount to approve
  });

  const handleApprove = async () => {
    if (isApproveLoading) {
      console.log("Transaction is loading");
      return;
    }

    if (isApproveError) {
      console.error("Error in transaction:", approveError);
      return;
    }

    try {
      const transactionResponse = await approveAsync();
      console.log("Transaction successful:", transactionResponse);
    } catch (error) {
      console.error("Error in handleApprove:", error);
    }
  };

  //this bit is for all the data you can read from FarmMainRegularMinStake
  const { data: oneHundredData } = useScaffoldContractRead({
    contractName: "FarmMainRegularMinStake",
    functionName: "ONE_HUNDRED",
  });
  const { data: farmingSetupsCountData } = useScaffoldContractRead({
    contractName: "FarmMainRegularMinStake",
    functionName: "_farmingSetupsCount",
  });
  const { data: farmingSetupsInfoCountData } = useScaffoldContractRead({
    contractName: "FarmMainRegularMinStake",
    functionName: "_farmingSetupsInfoCount",
  });
  const { data: rewardPaidData } = useScaffoldContractRead({
    contractName: "FarmMainRegularMinStake",
    functionName: "_rewardPaid",
    args: [positionId],
  });
  const { data: rewardReceivedData } = useScaffoldContractRead({
    contractName: "FarmMainRegularMinStake",
    functionName: "_rewardReceived",
    args: [positionId],
  });
  const { data: rewardTokenAddressData } = useScaffoldContractRead({
    contractName: "FarmMainRegularMinStake",
    functionName: "_rewardTokenAddress",
  });
  const { data: positionData } = useScaffoldContractRead({
    contractName: "FarmMainRegularMinStake",
    functionName: "position",
    args: [positionId],
  });
  const { data: setupData } = useScaffoldContractRead({
    contractName: "FarmMainRegularMinStake",
    functionName: "setup",
    args: [setupIndex],
  });
  const { data: setupsData } = useScaffoldContractRead({
    contractName: "FarmMainRegularMinStake",
    functionName: "setups",
  });
  const { data: hostData } = useScaffoldContractRead({ contractName: "FarmMainRegularMinStake", functionName: "host" });
  const { data: initializerData } = useScaffoldContractRead({
    contractName: "FarmMainRegularMinStake",
    functionName: "initializer",
  });
  const { data: nonfungiblePositionManagerData } = useScaffoldContractRead({
    contractName: "FarmMainRegularMinStake",
    functionName: "nonfungiblePositionManager",
  });
  const { data: calculateFreeFarmingRewardData } = useScaffoldContractRead({
    contractName: "FarmMainRegularMinStake",
    functionName: "calculateFreeFarmingReward",
    args: [positionId, true],
  });

  //end data reading bit

  const { writeAsync, isMining } = useScaffoldContractWrite({
    contractName: "FarmMainRegularMinStake",
    functionName: "addLiquidity",
    args: [
      positionId,
      {
        setupIndex,
        amount0,
        amount1,
        positionOwner,
        amount0Min,
        amount1Min,
      },
    ],
  });

  //----------------------------------------------------------------

  const handleAddLiquidity = async () => {
    if (isMining || !setupIndex || !amount0 || !amount1 || !positionOwner || !amount0Min || !amount1Min) return;

    try {
      // Convert string values to bigint
      const setupIndexBigInt = BigInt(setupIndex);
      const amount0BigInt = BigInt(amount0);
      const amount1BigInt = BigInt(amount1);
      const amount0MinBigInt = BigInt(amount0Min);
      const amount1MinBigInt = BigInt(amount1Min);

      await writeAsync({
        args: [
          positionId,
          {
            setupIndex: setupIndexBigInt,
            amount0: amount0BigInt,
            amount1: amount1BigInt,
            positionOwner,
            amount0Min: amount0MinBigInt,
            amount1Min: amount1MinBigInt,
          },
        ],
      });

      console.log("Liquidity added successfully");
    } catch (error) {
      console.error("Error in handleAddLiquidity:", error);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (
      isMining ||
      !positionId ||
      typeof removedLiquidity === "undefined" ||
      typeof amount0Min === "undefined" ||
      typeof amount1Min === "undefined"
    )
      return;

    try {
      // Update the args structure to match what addLiquidity expects
      await writeAsync({
        args: [
          positionId,
          {
            setupIndex,
            amount0: removedLiquidity,
            amount1,
            positionOwner,
            amount0Min,
            amount1Min,
          },
        ],
      });

      console.log("Liquidity removed successfully");
    } catch (error) {
      console.error("Error in handleRemoveLiquidity:", error);
    }
  };

  useEffect(() => {
    if (setupData && Array.isArray(setupData) && setupData.length === 2) {
      const [setup, setupInfo] = setupData;

      // Example of setting state based on the setup data
      // Adjust these lines based on the actual structure of your data
      setSetupIndex(BigInt(setup.infoIndex)); // Assuming infoIndex is the correct property

      // Set other state variables based on setup or setupInfo
      // e.g., setAmount0(BigInt(setup.amount0)); // replace 'amount0' with actual property name
      // ...
    }
  }, [setupData]);

  // Render the UI for contract interaction
  return (
    <div className="container">
      <h1>Pool Details: {contractAddress}</h1>
      <p>Position ID: {positionId.toString()}</p>
      <p>Setup Index: {setupIndex.toString()}</p>
      <p>Amount0: {amount0.toString()}</p>
      <p>Amount1: {amount1.toString()}</p>
      <p>Position Owner: {positionOwner}</p>
      <p>Amount0 Minimum: {amount0Min.toString()}</p>
      <p>Amount1 Minimum: {amount1Min.toString()}</p>
      <p>Removed Liquidity: {removedLiquidity.toString()}</p>

      {/* Displaying data from contract reads */}
      <p>ONE_HUNDRED: {oneHundredData ? oneHundredData.toString() : "Loading..."}</p>
      <p>Farming Setups Count: {farmingSetupsCountData ? farmingSetupsCountData.toString() : "Loading..."}</p>
      <p>
        Farming Setups Info Count: {farmingSetupsInfoCountData ? farmingSetupsInfoCountData.toString() : "Loading..."}
      </p>
      <p>Reward Paid: {rewardPaidData ? rewardPaidData.toString() : "Loading..."}</p>
      <p>Reward Received: {rewardReceivedData ? rewardReceivedData.toString() : "Loading..."}</p>
      <p>Reward Token Address: {rewardTokenAddressData}</p>
      <p>Host Data: {hostData}</p>
      <p>Initializer Data: {initializerData}</p>
      <p>Nonfungible Position Manager Data: {nonfungiblePositionManagerData}</p>
      <p>
        Calculate Free Farming Reward Data:{" "}
        {calculateFreeFarmingRewardData ? calculateFreeFarmingRewardData.toString() : "Loading..."}
      </p>

      {/* UI here probably */}
      <button onClick={handleApprove}>Approve</button>
      <button onClick={handleAddLiquidity}>Add Liquidity</button>
      <button onClick={handleRemoveLiquidity}>Remove Liquidity</button>
    </div>
  );
};

export default PoolDetails;
