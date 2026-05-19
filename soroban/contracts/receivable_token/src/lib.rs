#![no_std]
use soroban_sdk::{contract, contractimpl, vec, Env, String, Vec};

#[contract]
pub struct Contract;

// SAC / receivable token (SDD §4) — mint only after off-chain funding gate passes.
// Target: clawback-enabled, AUTH_REQUIRED, invoice metadata ref on-chain.
// Fork: soroban-examples/token · See soroban/CONTRACTS.md
#[contractimpl]
impl Contract {
    pub fn hello(env: Env, to: String) -> Vec<String> {
        vec![&env, String::from_str(&env, "Hello"), to]
    }
}

mod test;
