okay welcome back to seos ez farms trial number 3 (or 4?) heres what i've done so far:
(for convinience, this is the active pool we're using for testing data and stuff. CA: 0x129a261afAAe9Fc9AB9D5107e840560d052Cd97E )

----created pool>[contractAddress.tsx]
this is basically a router page, for whatever address gets put into the input section of index.tsx. When someone looks for a pool, it will route them to .com/pool/whatever the contract addy is

---changed index.tsx
this is just like a simple form field for taking in pool Contract addresses.

---contracts/FarmMainRegularMinStake
okay so i put in the old contract verbatim here, and deployed it to goerli. I did this just to autopopulate deployedContracts.ts and keep from a bunch of errors in [contractAddress].tsx

---packages/hardhat/deploy/00_deploy_your_contract.ts
I just changed YourContract to FarmMainRegularMinStake, so it deploys properly

---packages/nextjs/scaffold.config.ts
I just changed the versions that hardhat was using for solidity to match what i would need to deploy farmmainregularminstake. 


CURRENTLY:

I'm working in [contractAddress].tsx and index.tsx to make sure i can get every peice of data from FarmMainRegularMinStake, and the routerflow works as we want it to. Once i've gotten all the readonly and other data from that, I can organize it into something pretty and work on the Approve/Add/Remove portion of the ez farm page. There are some type errors and some bigint errors for like positionID and stuff. 