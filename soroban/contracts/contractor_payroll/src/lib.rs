#![no_std]

//! Track A — pay independent contractors in USDC.
//! Deploy on **Stellar Testnet** first. Do not replace Mainnet `payroll_split`.
//! Employees (Labor Code Art. 102) must use fiat Track B, not this contract.

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, token, Address, Env,
    String, Vec,
};

/// Max payees per batch (keeps fee/budget predictable on Testnet).
pub const MAX_PAYEES: u32 = 25;

#[contractevent]
pub struct ContractorBatchRouted {
    #[topic]
    pub batch_id: String,
    pub payer: Address,
    pub payee_count: u32,
    pub total_amount: i128,
    pub ledger: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BatchRecord {
    pub payer: Address,
    pub payee_count: u32,
    pub total_amount: i128,
    pub ledger: u32,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Usdc,
    Initialized,
    Batch(String),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    BatchNotFound = 3,
    AlreadyRouted = 4,
    InvalidAmount = 5,
    EmptyBatch = 6,
    TooManyPayees = 7,
    LengthMismatch = 8,
}

#[contract]
pub struct ContractorPayroll;

#[contractimpl]
impl ContractorPayroll {
    /// One-time setup. `usdc` is the SAC address for Circle USDC (or Testnet stand-in).
    pub fn initialize(env: Env, admin: Address, usdc: Address) -> Result<(), Error> {
        admin.require_auth();
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Usdc, &usdc);
        env.storage().instance().set(&DataKey::Initialized, &true);
        Ok(())
    }

    /// Preview total USDC for parallel wallet/amount vectors (whole units / stroops — caller convention).
    pub fn quote_batch(
        env: Env,
        wallets: Vec<Address>,
        amounts: Vec<i128>,
    ) -> Result<i128, Error> {
        Self::require_init(&env)?;
        Self::validate_payees(&wallets, &amounts)?;
        Ok(Self::sum_amounts(&amounts))
    }

    /// Payer authorizes; transfers USDC to each contractor wallet. One route per `batch_id`.
    pub fn route_batch(
        env: Env,
        payer: Address,
        batch_id: String,
        wallets: Vec<Address>,
        amounts: Vec<i128>,
    ) -> Result<BatchRecord, Error> {
        Self::require_init(&env)?;
        payer.require_auth();

        let batch_key = DataKey::Batch(batch_id.clone());
        if env.storage().instance().has(&batch_key) {
            return Err(Error::AlreadyRouted);
        }

        Self::validate_payees(&wallets, &amounts)?;
        let total = Self::sum_amounts(&amounts);
        let usdc: Address = env.storage().instance().get(&DataKey::Usdc).unwrap();
        let token = token::Client::new(&env, &usdc);

        let n = wallets.len();
        for i in 0..n {
            let wallet = wallets.get(i).unwrap();
            let amount = amounts.get(i).unwrap();
            token.transfer(&payer, &wallet, &amount);
        }

        let record = BatchRecord {
            payer: payer.clone(),
            payee_count: n,
            total_amount: total,
            ledger: env.ledger().sequence(),
        };
        env.storage().instance().set(&batch_key, &record);

        ContractorBatchRouted {
            batch_id: batch_id.clone(),
            payer: payer.clone(),
            payee_count: n,
            total_amount: total,
            ledger: record.ledger,
        }
        .publish(&env);

        Ok(record)
    }

    pub fn get_batch(env: Env, batch_id: String) -> Result<BatchRecord, Error> {
        Self::require_init(&env)?;
        env.storage()
            .instance()
            .get(&DataKey::Batch(batch_id))
            .ok_or(Error::BatchNotFound)
    }
}

impl ContractorPayroll {
    fn require_init(env: &Env) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Initialized) {
            Ok(())
        } else {
            Err(Error::NotInitialized)
        }
    }

    fn validate_payees(wallets: &Vec<Address>, amounts: &Vec<i128>) -> Result<(), Error> {
        let n = wallets.len();
        if n == 0 {
            return Err(Error::EmptyBatch);
        }
        if n != amounts.len() {
            return Err(Error::LengthMismatch);
        }
        if n > MAX_PAYEES {
            return Err(Error::TooManyPayees);
        }
        for i in 0..n {
            let amount = amounts.get(i).unwrap();
            if amount <= 0 {
                return Err(Error::InvalidAmount);
            }
        }
        Ok(())
    }

    fn sum_amounts(amounts: &Vec<i128>) -> i128 {
        let mut total: i128 = 0;
        for i in 0..amounts.len() {
            total = total.saturating_add(amounts.get(i).unwrap());
        }
        total
    }
}

mod test;
