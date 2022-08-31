// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

contract ETHPool is AccessControl {
    bytes32 public constant TEAM_ROLE = keccak256("TEAM_ROLE");

    struct DepositeData {
        uint256 amount;
        uint256 timestamp;
    }
    address[] private users;
    mapping(address => DepositeData) private _depositedEth;
    mapping(address => uint256) private _rewards;

    uint256 private rewardsRate = 1000000;

    uint256 public _stakingPeriod = 1 seconds;

    event Deposited(address user, uint256 amount);
    event Withdraw(address user, uint256 amount);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(TEAM_ROLE, msg.sender);
    }

    receive() external payable {    
    }

    function getDepositedFund(address user) external view returns(uint256) {
        return _depositedEth[user].amount;
    }

    function getReward(address user) external view returns(uint256) {
        return _rewards[user];
    }

    function depositFund() public payable {
        require(msg.value > 0, "Insufficient Fund");

        if(_depositedEth[msg.sender].amount == 0) {
            users.push(msg.sender);
        }

        _depositedEth[msg.sender].amount += msg.value;
        _depositedEth[msg.sender].timestamp = block.timestamp;

        emit Deposited(msg.sender, msg.value);
    }

    function depositRewards() public onlyRole(TEAM_ROLE) {
        for (uint i = 0; i < users.length; i++) {
            address user = users[i];
            uint256 rewardDays = (block.timestamp - _depositedEth[user].timestamp) / _stakingPeriod;
            uint256 reward = rewardDays * rewardsRate;

            _rewards[user] += reward;
        }
    }

    function addTeamMember(address user) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _setupRole(TEAM_ROLE, user);
    }

    function removeTeamMemeber(address user) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(TEAM_ROLE, user);
    }

    function withdraw() public {
        uint256 deposit = _depositedEth[msg.sender].amount;
        require(deposit > 0, "You don't have anything left to withdraw");

        _depositedEth[msg.sender].amount = 0;
        uint256 reward = _rewards[msg.sender];
        _rewards[msg.sender] = 0;
        
        uint256 valueAmount = deposit + reward;
        
        (bool success, ) = (msg.sender).call{value:valueAmount}("");
        require(success, "Transfer failed");

        emit Withdraw(msg.sender, valueAmount);
    }
}
