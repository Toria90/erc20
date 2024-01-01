pragma solidity ^0.8.20;

import {IERC20} from "./IERC20.sol";

contract ERC20 is IERC20{

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;
    uint8 private _decimals;

    constructor(string memory name, string memory symbol, uint8 decimals){
        _name = name;
        _symbol = symbol;
        _decimals = decimals;
    }

    function name() public view returns (string memory){
        return _name;
    }

    function symbol() public view returns (string memory){
        return _symbol;
    }

    function decimals() public view returns (uint8){
        return _decimals;
    }

    function totalSupply() public view returns (uint256){
        return _totalSupply;
    }

    function balanceOf(address owner) public view returns (uint256){
        return _balances[owner];
    }

    function transfer(address to, uint256 value) public returns (bool){
        _transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool){
        _spendAllowance(from, msg.sender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool){
        _approve(msg.sender, spender, amount);
        return true;
    }

    function allowance(address owner, address spender) public view returns (uint256){
        return _allowances[owner][spender];
    }

    function mint(address account, uint256 amount) public{
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public{
        _burn(account, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "to address shouldn't be zero");
        require(amount != 0, "amount shouldn't be zero");

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "insufficient funds");
        _balances[from] = fromBalance - amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "account shouldn't be zero");
        require(amount != 0, "amount shouldn't be zero");

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "account shouldn't be zero");
        require(amount != 0, "amount shouldn't be zero");

        uint256 accountBalance = _balances[account];
        uint256 burnAmount = amount>accountBalance ? accountBalance : amount;
        _balances[account] = accountBalance - burnAmount;
        _totalSupply -= burnAmount;

        emit Transfer(account, address(0), burnAmount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        require(spender != address(0), "spender address shouldn't be zero");
        require(amount != 0, "amount shouldn't be zero");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _spendAllowance(address owner, address spender, uint256 amount) internal {
        uint256 currentAllowance = allowance(owner, spender);
        require(currentAllowance >= amount, "insufficient allowance funds");
        _approve(owner, spender, currentAllowance - amount);
    }
}