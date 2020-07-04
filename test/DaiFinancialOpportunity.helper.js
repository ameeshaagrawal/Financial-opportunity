const { BN } = require("@openzeppelin/test-helpers");

const TUSDCoin = artifacts.require("TrueUSD");
const DaiCoin = artifacts.require("Dai");
const DSR = artifacts.require("DSRMock");
const SwapContract = artifacts.require("SwapContractMock");

class DaiFinancialOpportunityHelper {
  constructor(_admin, _investor) {
    this.admin = _admin;
    this.investor = _investor;
  }

  async initScenario() {
    await this.deployContracts();

    await this.mintCoins();

    return {
      tusdCoin: this.tusdCoin,
      daiCoin: this.daiCoin,
      daiReserve: this.daiReserve,
      dsr: this.dsr,
      swapContract: this.swapContract,
    };
  }

  async deployContracts() {
    this.tusdCoin = await TUSDCoin.new({
      from: this.admin,
    });

    this.daiCoin = await DaiCoin.new({
      from: this.admin,
    });

    this.dsr = await DSR.new(this.daiCoin.address, {
      from: this.admin,
    });

    this.swapContract = await SwapContract.new(
      this.daiCoin.address,
      this.tusdCoin.address,
      {
        from: this.admin,
      }
    );
  }

  async mintCoins() {
    //Mint TUSD & DAI tokens to swap contract (1:1 ratio)
    await this.tusdCoin.mint(
      this.swapContract.address,
      new BN("1000000000000000000000000"),
      {
        from: this.admin,
      }
    );

    await this.daiCoin.mint(
      this.swapContract.address,
      new BN("1000000000000000000000000"),
      {
        from: this.admin,
      }
    );

    //Mint TUSD tokens to investor (100 tokens)
    await this.tusdCoin.mint(this.investor, new BN("100000000000000000000"), {
      from: this.admin,
    });
  }
}

module.exports = DaiFinancialOpportunityHelper;
