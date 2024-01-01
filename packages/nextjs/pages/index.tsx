import { useState } from "react";
import { useRouter } from "next/router";
import PoolDetails from "./pool/[contractAddress]";

const Home = () => {
  const [contractAddress, setContractAddress] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    // Validate if the contractAddress is valid and exists
    // For simplicity, this example will redirect to the contract page directly
    router.push(`/pool/${contractAddress}`);
  };

  return (
    <div className="container">
      <h1>Welcome to the Pool Explorer</h1>
      <input
        type="text"
        placeholder="Enter contract address"
        value={contractAddress}
        onChange={e => setContractAddress(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default Home;
