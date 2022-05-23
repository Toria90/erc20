pragma solidity ^0.8.0;

import "../ERC20.sol";

contract ERC20Mock is ERC20 {
    constructor(
        string memory name, 
        string memory symbol, 
        uint8 decimals
    )  ERC20(name, symbol, decimals) {
    }
    
    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public {
        _burn(account, amount);
    }
    
    function transferMock(address from, address to, uint256 amount) public {
        _transfer(from, to, amount);
    }

    function approveMock(address owner, address spender, uint256 amount) public {
        _approve(owner, spender, amount);
    }
}
