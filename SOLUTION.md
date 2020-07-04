# TrustToken Solidity Challenge 

The solution simulate the interest earning with the TUSD deposited by user.

## Approach

The TUSD coins deposited by user are first swapped to DAI. Here as TUSD and DAI are stable coins backed by USD thus it is assumed that their market price ratio will be 1:1.

The amount of yTUSD tokens minted will be 1:1 initially. With time, the ratio will change proportional to interest accrued in DSR contract which is represented by `chi`.

 > `tokenValue = (DAImarketPrice/TUSDmarketPrice) * chi`

Thus with time, tokenValue, which is the ratio of TUSD/yTUSD, will always increase.

The tokenValue is updated on every deposit and redeem as we update the interest with drip() function.

## Setup

> Install dependencies with `npm install`

**To compile contracts**

> `truffle compile`

**To run the tests**

> `npm run test`

This will generate gas report for the function calls which can be found at `./gas-report`




