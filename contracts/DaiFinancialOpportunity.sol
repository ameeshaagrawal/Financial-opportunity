// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import { Dai, TrueUSD } from "./StableCoins.sol";
import { FinancialOpportunity } from "./FinancialOpportunity.sol";
import { DaiPot, DSRMock } from "./DSR.sol";
import { SwapContract, SwapContractMock } from "./SwapContract.sol";
import { SafeMath } from "./SafeMath.sol";

/**
 * @title Dai Financial Opportunity
 * @dev Pool TUSD deposits to earn interest using DSR
 *
 * When a user wants to deposit TrueUSD** the contract will exchange 
 * the TUSD for Dai using Uniswap, and then deposit DAI into a DSR.
 *
 * When a user wants to redeem their stake for TrueUSD the contract will 
 * withdraw DAI from a DSR, then swap the DAI for TrueUSD using Uniswap.

 * Implement the 4 functions from FinancialOpportunity in a new contract: 
 * deposit(), redeem(), tokenValue(), and totalSupply(). 
 * 
 * Make sure to read the documentation in FinaicialOpportunity.sol carefully 
 * to make sure you understand the purpose of each of these functions. 
 *
 * Note: the contract mocks are untested and might require modifications!
 *
**/
contract DaiFinancialOpportunity is FinancialOpportunity {
    using SafeMath for uint256;

    Dai dai;
    TrueUSD tusd;

    DSRMock dsr;
    SwapContractMock swapContract;

    constructor(
        address daiAddress,
        address tusdAddress,
        address swapContractAddress,
        address dsrAddress
    ) public {
        //Token Address
        dai = Dai(daiAddress);
        tusd = TrueUSD(tusdAddress);

        dsr = DSRMock(dsrAddress);
        swapContract = SwapContractMock(swapContractAddress);

        //Initial TUSD/yTUSD ratio
        _tokenValue = 10**18;
    }

    mapping(address => uint256) private _balances;

    uint256 private _totalSupply;
    uint256 private _tokenValue;

    function name() public pure returns (string memory) {
        return "stakedTUSD";
    }

    function symbol() public pure returns (string memory) {
        return "yTUSD";
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Requirements
     *
     * - `to` cannot be the zero address.
     */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "yTUSD: mint to the zero address");
        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Requirements
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "yTUSD: burn from the zero address");
        _balances[account] = _balances[account].sub(
            amount,
            "yTUSD: burn amount exceeds balance"
        );
        _totalSupply = _totalSupply.sub(amount);
    }

    /**
     * @dev Returns total supply of yTUSD in this contract
     *
     * @return total supply of yTUSD in this contract
     **/
    function totalSupply() external override view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Exchange rate between TUSD and yTUSD
     *
     * tokenValue should never decrease
     *
     * @return TUSD / yTUSD price ratio
     */
    function tokenValue() public override view returns (uint256) {
        return _tokenValue;
    }

    /**
     * @dev deposits TrueUSD and returns yTUSD minted
     *
     * We can think of deposit as a minting function which
     * will increase totalSupply of yTUSD based on the deposit
     *
     * @param from account to transferFrom
     * @param amount amount in TUSD to deposit
     * @return yTUSD minted from this deposit
     */
    function deposit(address from, uint256 amount)
        external
        override
        returns (uint256)
    {
        require(
            tusd.transferFrom(from, address(this), amount),
            "Error in transferring TUSD"
        );
        tusd.approve(address(swapContract), amount);

        //DAI bought
        swapContract.swapTUSDforDAI(amount);

        _tokenValue = dsr.drip();

        //get the amount of yTUSD
        uint256 stakedTUSD = amount.div(_tokenValue);

        //deposit DAI to dsr
        dai.approve(address(dsr), amount);
        dsr.join(amount);

        //mint yTUSD
        _mint(from, stakedTUSD);
        return stakedTUSD;
    }

    /**
     * @dev Redeem yTUSD for TUSD and withdraw to account
     *
     * This function should use tokenValue to calculate
     * how much TUSD is owed. This function should burn yTUSD
     * after redemption
     *
     * This function must return value in TUSD
     *
     * @param to account to transfer TUSD for
     * @param amount amount in TUSD to withdraw from finOp
     * @return TUSD amount returned from this transaction
     */
    function redeem(address to, uint256 amount)
        external
        override
        returns (uint256)
    {
        require(balanceOf(to) >= amount, "Not enough TUSD deposited");

        // Update tokenValue (proportional to interest accumulated)
        _tokenValue = dsr.drip();

        //Get equivalent TUSD for staked amount given
        uint256 tusdAmount = amount.mul(_tokenValue);

        //exit dsr
        dsr.exit(tusdAmount);

        //swap it for tusd
        dai.approve(address(swapContract), tusdAmount);

        swapContract.swapDAIforTUSD(tusdAmount);

        //burn yTUSD
        _burn(to, amount);

        //transfer tusd
        tusd.transfer(to, tusdAmount);
        return tusdAmount;
    }
}
