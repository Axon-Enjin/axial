#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, token, Address, Env,
    String,
};

/// Emitted after a successful `execute_advance` (indexed by invoice for oracle subscription).
#[contractevent]
pub struct SwapExecuted {
    #[topic]
    pub invoice_id: String,
    pub msme: Address,
    pub funder: Address,
    pub face_amount: i128,
    pub advance_amount: i128,
    pub reserve_amount: i128,
    pub ledger: u32,
}

const MAX_BPS: u32 = 10_000;
const DEFAULT_ADVANCE_BPS: u32 = 8_500;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SwapRecord {
    pub msme: Address,
    pub funder: Address,
    pub face_amount: i128,
    pub advance_amount: i128,
    pub reserve_amount: i128,
    pub ledger: u32,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Usdc,
    AdvanceBps,
    Initialized,
    Swap(String),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    SwapNotFound = 3,
    AlreadySwapped = 4,
    InvalidAmount = 5,
    InvalidBps = 6,
}

#[contract]
pub struct AxialSwap;

#[contractimpl]
impl AxialSwap {
    /// One-time setup: USDC token contract address + advance rate in basis points (8500 = 85%).
    pub fn initialize(
        env: Env,
        admin: Address,
        usdc: Address,
        advance_bps: u32,
    ) -> Result<(), Error> {
        admin.require_auth();
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(Error::AlreadyInitialized);
        }
        if advance_bps == 0 || advance_bps > MAX_BPS {
            return Err(Error::InvalidBps);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Usdc, &usdc);
        env.storage().instance().set(&DataKey::AdvanceBps, &advance_bps);
        env.storage().instance().set(&DataKey::Initialized, &true);
        Ok(())
    }

    pub fn advance_bps(env: Env) -> Result<u32, Error> {
        Self::require_init(&env)?;
        Ok(env
            .storage()
            .instance()
            .get(&DataKey::AdvanceBps)
            .unwrap_or(DEFAULT_ADVANCE_BPS))
    }

    /// Returns (advance_usdc, reserve_usdc) for a face amount in token stroops.
    pub fn quote(env: Env, face_amount: i128) -> Result<(i128, i128), Error> {
        Self::require_init(&env)?;
        if face_amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        let bps = Self::advance_bps(env.clone())? as i128;
        let advance = face_amount * bps / (MAX_BPS as i128);
        let reserve = face_amount - advance;
        Ok((advance, reserve))
    }

    /// Funder authorizes; USDC advance is transferred to the MSME. One swap per invoice_id.
    pub fn execute_advance(
        env: Env,
        funder: Address,
        msme: Address,
        invoice_id: String,
        face_amount: i128,
    ) -> Result<SwapRecord, Error> {
        Self::require_init(&env)?;
        funder.require_auth();

        let swap_key = DataKey::Swap(invoice_id.clone());
        if env.storage().instance().has(&swap_key) {
            return Err(Error::AlreadySwapped);
        }

        let (advance, reserve) = Self::quote(env.clone(), face_amount)?;
        let usdc: Address = env.storage().instance().get(&DataKey::Usdc).unwrap();
        let token = token::Client::new(&env, &usdc);
        token.transfer(&funder, &msme, &advance);

        let record = SwapRecord {
            msme: msme.clone(),
            funder: funder.clone(),
            face_amount,
            advance_amount: advance,
            reserve_amount: reserve,
            ledger: env.ledger().sequence(),
        };

        env.storage().instance().set(&swap_key, &record);

        SwapExecuted {
            invoice_id: invoice_id.clone(),
            msme: record.msme.clone(),
            funder: record.funder.clone(),
            face_amount: record.face_amount,
            advance_amount: record.advance_amount,
            reserve_amount: record.reserve_amount,
            ledger: record.ledger,
        }
        .publish(&env);

        Ok(record)
    }

    pub fn get_swap(env: Env, invoice_id: String) -> Result<SwapRecord, Error> {
        Self::require_init(&env)?;
        env.storage()
            .instance()
            .get(&DataKey::Swap(invoice_id))
            .ok_or(Error::SwapNotFound)
    }
}

impl AxialSwap {
    fn require_init(env: &Env) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Initialized) {
            Ok(())
        } else {
            Err(Error::NotInitialized)
        }
    }
}

mod test;
