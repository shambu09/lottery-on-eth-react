import Web3 from "web3";

const connect = async () => {
	let enabled = false;
	let error = null;
	let web3 = null;
	let accounts = null;

	try {
		accounts = await window.ethereum.request({
			method: "eth_requestAccounts",
		});
		web3 = new Web3(window.ethereum);
		enabled = true;
	} catch (e) {
		error = e;
	}
	return { accounts, web3, enabled, error };
};

const getWeb3 = () => {
	return new Web3(window.ethereum);
};

const setListeners = (handleAccountsChange, handleChainChange) => {
	window.ethereum.on("accountsChanged", handleAccountsChange);
	window.ethereum.on("chainChanged", handleChainChange);
};

const removeListeners = (handleAccountsChange, handleChainChange) => {
	window.ethereum.removeListener("accountsChanged", handleAccountsChange);
	window.ethereum.removeListener("chainChanged", handleChainChange);
};

export { connect, getWeb3, setListeners, removeListeners };
