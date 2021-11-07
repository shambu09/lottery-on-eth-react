import logo from "./logo.svg";
import "./App.css";

import React from "react";
import { useEffect, useState } from "react";

import { connect, setListeners, removeListeners } from "./web3";
import getContract from "./lottery";

function App() {
	const [isEnabled, setEnable] = useState(false);
	const [web3Con, setweb3Con] = useState(null);
	const [lottery, setlottery] = useState(null);
	const [manager, setManager] = useState(null);

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
			setManager(manager);
		};

		connect().then(({ web3, enabled, error }) => {
			if (enabled) {
				console.log("Connected to Metamask");
				setListeners(handleAccountsChange, handleChainChange);

				setweb3Con((old_web3) => {
					return web3;
				});

				setlottery((old_lottery) => {
					const lottery = getContract(web3);
					_setManager(lottery);
					return lottery;
				});

				setEnable((isEnabled) => {
					return enabled;
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
			<div>
				{isEnabled
					? "Connected to Metamask"
					: "Not Connected to Metamask"}
			</div>
			<h2>Lottery Contract</h2>
			<p>
				This contract is managed by {manager ? manager : "No Manager"}
			</p>
		</div>
	);
}

export default App;
