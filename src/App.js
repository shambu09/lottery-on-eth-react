import "./App.css";

import React from "react";
import { useEffect, useState } from "react";

import { connect, setListeners, removeListeners } from "./web3";
import getContract from "./lottery";

function App() {
	const [state, setState] = useState({
		isEnabled: false,
		web3Con: null,
		lottery: null,
		manager: null,
		account: null,
	});

	useEffect(() => {
		const handleAccountsChange = (accounts) => {
			console.log("Accounts Changed");
			window.location.reload();
		};

		const handleChainChange = (chainId) => {
			console.log("Chain Changed");
			window.location.reload();
		};

		const _setManager = async (lottery) => {
			const manager = await lottery.methods.manager().call();
			setState((prevState) => {
				return { ...prevState, manager };
			});
		};

		connect().then(({ accounts, web3, enabled, error }) => {
			if (enabled) {
				console.log("Connected to Metamask");
				setListeners(handleAccountsChange, handleChainChange);

				setState((prevState) => {
					const lottery = getContract(web3);
					_setManager(lottery);
					return {
						...prevState,
						isEnabled: enabled,
						web3Con: web3,
						lottery: lottery,
						account: accounts[0],
					};
				});
			} else {
				console.log("Error connecting to Metamask, Traceback: ");
				console.log(error);
			}
		});

		// Component Cleanup function -> Removes listeners from the metamask provider instance.
		return () => {
			try {
				removeListeners(handleAccountsChange, handleChainChange);
			} catch (e) {
				console.log(
					"Unable To Remove Listeners or No Listners at all, TraceBack: "
				);
				console.log(e);
			}
		};
	}, []);

	return (
		<div className="App">
			<div className="Account-info">
				<div>
					Account :{" "}
					{state.account ? state.account : "Not Initialized"}
				</div>
				<div>
					{state.isEnabled
						? "Connected to Metamask"
						: "Not Connected to Metamask"}
				</div>
			</div>
			<h2>Lottery Contract</h2>
			<p>
				This contract is managed by{" "}
				{state.manager ? state.manager : "No Manager"}
			</p>
		</div>
	);
}

export default App;
