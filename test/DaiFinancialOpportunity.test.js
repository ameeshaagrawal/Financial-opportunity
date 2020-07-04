require("@openzeppelin/test-helpers/configure");
const { expect } = require("chai");
const { expectRevert, BN } = require("@openzeppelin/test-helpers");

const DaiFinancialOpportunityHelper = require("./DaiFinancialOpportunity.helper.js");
const DaiFinancialOpportunity = artifacts.require("DaiFinancialOpportunity");

contract("DaiFinancialOpportunity", (accounts) => {
  const admin = accounts[0];
  const investor = accounts[1];

  describe("DaiFinancialOpportunity", () => {
    beforeEach(async () => {
      this.daiFinancialOpportunityHelper = new DaiFinancialOpportunityHelper(
        admin,
        investor
      );

      const {
        tusdCoin,
        daiCoin,
        daiReserve,
        dsr,
        swapContract,
      } = await this.daiFinancialOpportunityHelper.initScenario();

      this.tusdCoin = tusdCoin;
      this.daiCoin = daiCoin;
      this.daiReserve = daiReserve;
      this.dsr = dsr;
      this.swapContract = swapContract;

      this.daiFinancialOpportunityContract = await DaiFinancialOpportunity.new(
        this.daiCoin.address,
        this.tusdCoin.address,
        this.swapContract.address,
        this.dsr.address,
        {
          from: admin,
        }
      );
    });

    describe("deposit()", () => {
      beforeEach(async () => {
        //approve TUSD token to DaiFinancialOpportunity Contract
        this.tusdBalance = await this.tusdCoin.balanceOf(investor);
        await this.tusdCoin.approve(
          this.daiFinancialOpportunityContract.address,
          this.tusdBalance,
          {
            from: investor,
          }
        );
      });

      it("should deposit the TUSD coins provided by investor", async () => {
        await this.daiFinancialOpportunityContract.deposit(
          investor,
          this.tusdBalance
        );
        const yTUSDBalance = await this.daiFinancialOpportunityContract.balanceOf(
          investor
        );
        const tokenValue = await this.daiFinancialOpportunityContract.tokenValue();
        const expectedYtusd = this.tusdBalance.div(tokenValue);
        expect(yTUSDBalance).to.be.bignumber.equal(expectedYtusd);
      });

      it("should increase total supply of yTUSD coins", async () => {
        const supplyBefore = await this.daiFinancialOpportunityContract.balanceOf(
          investor
        );
        await this.daiFinancialOpportunityContract.deposit(
          investor,
          this.tusdBalance
        );
        const supplyAfter = await this.daiFinancialOpportunityContract.balanceOf(
          investor
        );
        expect(supplyAfter).to.be.bignumber.gt(supplyBefore);
      });
    });

    describe("redeem()", () => {
      beforeEach(async () => {
        //deposit TUSD
        this.tusdBalance = await this.tusdCoin.balanceOf(investor);
        await this.tusdCoin.approve(
          this.daiFinancialOpportunityContract.address,
          this.tusdBalance,
          {
            from: investor,
          }
        );

        await this.daiFinancialOpportunityContract.deposit(
          investor,
          this.tusdBalance
        );

        //increase drip value
        const dripValue = new BN("20000000000000000"); //2%
        await this.dsr.increaseDripValue(dripValue);

        //Interest earned on total balance (100 DAI) = 2 DAI
        //to simulate interest in dsr contract
        await this.daiCoin.mint(
          this.dsr.address,
          new BN("2000000000000000000"),
          {
            from: admin,
          }
        );
      });

      it("should redeem TUSD", async () => {
        const stakedTUSD = await this.daiFinancialOpportunityContract.balanceOf(
          investor
        );
        const initialBalance = await this.tusdCoin.balanceOf(investor);

        await this.daiFinancialOpportunityContract.redeem(investor, stakedTUSD);

        const finalBalance = await this.tusdCoin.balanceOf(investor);
        const stakedTUSDAfter = await this.daiFinancialOpportunityContract.balanceOf(
          investor
        );

        expect(finalBalance).to.be.bignumber.greaterThan(initialBalance);
        expect(stakedTUSDAfter).to.be.bignumber.equal(new BN("0"));
      });

      it("should decrease total supply of yTUSD coins", async () => {
        const stakedTUSD = await this.daiFinancialOpportunityContract.balanceOf(
          investor
        );
        const supplyBefore = await this.daiFinancialOpportunityContract.totalSupply();
        await this.daiFinancialOpportunityContract.redeem(investor, stakedTUSD);
        const supplyAfter = await this.daiFinancialOpportunityContract.totalSupply();
        expect(supplyAfter).to.be.bignumber.lessThan(supplyBefore);
      });

      it("should increase tokenValue", async () => {
        const initialTokenValue = await this.daiFinancialOpportunityContract.tokenValue();

        //redeem function will refresh the tokenValue according to interest earned by DSR
        const stakedTUSD = await this.daiFinancialOpportunityContract.balanceOf(
          investor
        );
        await this.daiFinancialOpportunityContract.redeem(investor, stakedTUSD);

        const finalTokenValue = await this.daiFinancialOpportunityContract.tokenValue();
        expect(finalTokenValue).to.be.bignumber.greaterThan(initialTokenValue);
      });

      it("should revert if not enough TUSD staked", async () => {
        const increasedAmount = new BN("100").add(this.tusdBalance);
        await expectRevert(
          this.daiFinancialOpportunityContract.redeem(
            investor,
            increasedAmount
          ),
          "Not enough TUSD deposited"
        );
      });
    });

    describe("complete scenario", () => {
      it("should deposit and redeem the tusd coin with interest", async () => {
        //approve TUSD token to DaiFinancialOpportunity Contract
        const tusdBalance = await this.tusdCoin.balanceOf(investor);
        await this.tusdCoin.approve(
          this.daiFinancialOpportunityContract.address,
          tusdBalance,
          {
            from: investor,
          }
        );

        //deposit tusd coin to dai financial opportunity
        await this.daiFinancialOpportunityContract.deposit(
          investor,
          tusdBalance
        );

        //Amount of ytusd minted should be tusd/tokenValue()
        const yTUSDBalance = await this.daiFinancialOpportunityContract.balanceOf(
          investor
        );
        let tokenValue = await this.daiFinancialOpportunityContract.tokenValue();

        const expectedYtusd = tusdBalance.div(tokenValue);
        expect(yTUSDBalance).to.be.bignumber.equal(expectedYtusd);

        //After sometime, the interest accrued in dsr at the rate of 2%
        const dripValue = new BN("20000000000000000"); //2%
        await this.dsr.increaseDripValue(dripValue);

        //Interest earned on total balance (100 DAI) = 2 DAI
        //Therefore to simulate interest accumulation, we will mint the interest amount
        await this.daiCoin.mint(
          this.dsr.address,
          new BN("2000000000000000000"),
          {
            from: admin,
          }
        );

        // Redeem staked TUSD with interest
        await this.daiFinancialOpportunityContract.redeem(
          investor,
          yTUSDBalance
        );

        //Redeemed balance should be proportional to interest accrued
        const redeemedTUSDBalance = await this.tusdCoin.balanceOf(investor);

        // depositedTUSD + depositedTUSD*interest = redeemedTUSD
        const expectedTUSD = tusdBalance
          .mul(new BN("2"))
          .div(new BN("100"))
          .add(tusdBalance);

        expect(redeemedTUSDBalance).to.be.bignumber.equal(expectedTUSD);

        //As we redeemed full amount, so yTUSD balance of investor should reduce to 0
        const stakedTUSDAfter = await this.daiFinancialOpportunityContract.balanceOf(
          investor
        );
        expect(stakedTUSDAfter).to.be.bignumber.equal(new BN("0"));
      });
    });
  });
});
