import "./App.css";

import React from "react";
import { useEffect, useState } from "react";

import { connect, setListeners, removeListeners } from "./web3";
import Web3 from "web3";
import getContract from "./lottery";

function App() {
	const [state, setState] = useState({
		isEnabled: false,
		web3Con: null,
		lottery: null,
		manager: null,
		account: null,
		balance: "",
		players: [],
		value: "",
		message: "",
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

		const _setContractDetails = async (lottery, web3) => {
			const manager = await lottery.methods.manager().call();
			const balance = await web3.eth.getBalance(lottery.options.address);
			const players = await lottery.methods.getPlayers().call();

			setState((prevState) => {
				return { ...prevState, manager, balance, players };
			});
		};

		connect().then(({ accounts, web3, enabled, error }) => {
			if (enabled) {
				console.log("Connected to Metamask");
				setListeners(handleAccountsChange, handleChainChange);

				setState((prevState) => {
					const lottery = getContract(web3);
					_setContractDetails(lottery, web3);
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

	const onSubmit = async (event) => {
		event.preventDefault();

		const account = state.account;

		setState((prevState) => {
			return {
				...prevState,
				message: "Waiting on transaction success...",
			};
		});

		try {
			await state.lottery.methods.Enter().send({
				from: account,
				value: Web3.utils.toWei(state.value, "ether"),
			});

			const balance = await state.web3Con.eth.getBalance(
				state.lottery.options.address
			);
			const players = await state.lottery.methods.getPlayers().call();

			setState((prevState) => {
				return {
					...prevState,
					players,
					message: "You have been entered!",
					balance: balance,
				};
			});
		} catch (e) {
			console.log("Error: ");
			console.log(e);
		}
	};

	const onPickWinner = async (event) => {
		event.preventDefault();

		const account = state.account;

		setState((prevState) => {
			return {
				...prevState,
				message: "Waiting on transaction success...",
			};
		});

		try {
			await state.lottery.methods.pickWinner().send({
				from: account,
			});

			setState((prevState) => {
				return {
					...prevState,
					message: "A winner has been picked!",
				};
			});
		} catch (e) {
			console.log("Error: ");
			console.log(e);
		}
	};

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
			<div className="Contract">
				<h2>Lottery Contract</h2>

				<div className="Contract-details">
					<p>
						This contract is managed by{" "}
						{state.manager ? state.manager : "No Manager"}
					</p>
					<p>
						There are currently {state.players.length} people
						entered, competing to win{" "}
						{Web3.utils.fromWei(state.balance, "ether")} ether !
					</p>
					<hr />
					<form onSubmit={onSubmit}>
						<h3>Want to try your luck?</h3>
						<div className="input">
							<label>Amount of ether to enter : </label>
							<input
								value={state.value}
								onChange={(e) =>
									setState((prevState) => {
										return {
											...prevState,
											value: e.target.value,
										};
									})
								}
							/>
						</div>
						<button className="btn">Enter</button>
					</form>
					{state.manager &&
					state.account &&
					state.manager.toLowerCase() ===
						state.account.toLowerCase() ? (
						<>
							<hr />
							<div>
								<h4>Time to pick a winner?</h4>
								<button onClick={onPickWinner}>
									Pick Winner
								</button>
							</div>
							<hr />
						</>
					) : (
						<hr />
					)}
					<h1>{state.message}</h1>
				</div>
			</div>
		</div>
	);
}

export default App;
