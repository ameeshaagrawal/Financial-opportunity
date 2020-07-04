# TrustToken Solidity Challenge ⛓ ⚔️ 

Our goal at TrustToken is to make financial freedom as accessible as the internet. To accomplish this, we have built an open system of smart contracts which allows users to earn interest through defi opportunities. The problem today is going to apply some key concepts & code we use in practice.

We expect this question to take around 3-4 hours, but you can take as much time as you like. We know this is a challenging problem- if you don’t finish the whole thing, please submit as much as you have. We encourage you to create examples & write tests to show how your solution works, but this is not required.

If you complete this problem and send it to hello@trusttoken.com and we will guarantee you an interview for our Solidity Engineer position!

## Problem

We want you to build a financial opportunity which uses Dai Savings Rate to earn interest for TrueUSD deposits.

We have an interface called FinancialOpportunity which represents a defi opportunity. Please read through the documentation in FinancialOpportunity.sol to understand how we expect this interface to be used. The easiest way to think of FinancialOpportunity is like an ERC-20 token that represents a share of a pool and increases in value over time as the pool accrues interest. Understanding the FinancialOpportunity interface is crucial to  solving this problem, so be sure to read the documentation carefully.

**When a user wants to deposit TrueUSD** the contract will exchange the TUSD for Dai using Uniswap, and then deposit DAI into a DSR.

**When a user wants to redeem their stake for TrueUSD** the contract will withdraw DAI from a DSR, then swap the DAI for TrueUSD using Uniswap.

Implement the 4 functions from FinancialOpportunity in a new contract: deposit(), redeem(), tokenValue(), and totalSupply(). Make sure to read the documentation in FinaicialOpportunity.sol carefully to make sure you understand the interface for each of these functions. 

The DaiFinancialOpportunity works as follows:

**deposit()** -> deposit TUSD to enter the pool
1. TrueUSD is transferred to the contract
2. TrueUSD is exchanged for Dai
3. Dai is deposited into the DSR
4. Calculate the value of stake (yTUSD) created by this transaction
5. Update total yTUSD supply
6. Return the amount of stake created by this transaction

**redeem()** -> redeem pool stake for TUSD
1. Calculate the TUSD value of account stake (yTUSD)
2. Dai is withdrawn from the DaiPot
3. Dai is exchanged for TUSD
4. TUSD is transferred to account
5. Update total yTUSD supply
6. Return the TUSD value of redeemed stake

**tokenValue()** -> return the value of yTUSD (stake) in TUSD

**totalSupply()** -> return the total supply of yTUSD in the contract

## Getting started

Please implement your solution in DaiFinancialOpportunity.sol. We have provided a template for you to get started. We have also provided some mock contracts to help you mock interacting with Dai and Uniswap:

DaiPotMock.sol - Mock DSR contract with functions to simulate earning interest
UniswapMock.sol - Mock Uniswap contract with functions to exchange DAI for TUSD

- How the solution is implemented is up to you
- You can use any dev environment you prefer
- You can use any version of solidity (we use 0.6.0 in the examples but you can change this)
- You may use the provided contract mocks, create your own mocks, or use real implementations of the mocks (Uniswap, DSR, ERC20)
- You can use any standard library or contract, for convenience we have included OpenZeppelin’s SafeMath library & ERC20 contract

### Requirements:
- The contract must compile
- You must deploy the contract on a testnet and verify it. When you submit your solution, please include a link to the deployed contract.

### Bonus
- Code is well-documented & explained
- Clean syntax & concise variable naming
- Efficient gas usage
- Clear instructions on setup + compilation of contracts
- Unit testing & examples


# Good luck 🍀👍 
